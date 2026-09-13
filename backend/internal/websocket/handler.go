package websocket

import (
	"encoding/json"
	"net/http"
	"strings"
	"sync"
	"time"

	"github.com/White2908/tetris-online/backend/internal/controller"
	"github.com/White2908/tetris-online/backend/internal/models"
	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool { return true },
}

type Handler struct {
	rooms *controller.RoomController
	games *controller.GameController
	chats *controller.ChatController

	mu      sync.Mutex
	clients map[string]map[*websocket.Conn]bool // roomID -> conns
	loops   map[string]chan struct{}            // roomID -> stop channel for ticker loop
}

func NewHandler(rooms *controller.RoomController, games *controller.GameController, chats *controller.ChatController) *Handler {
	return &Handler{
		rooms:   rooms,
		games:   games,
		chats:   chats,
		clients: make(map[string]map[*websocket.Conn]bool),
		loops:   make(map[string]chan struct{}),
	}
}

type Message struct {
	Type     string          `json:"type"`
	RoomID   string          `json:"roomId,omitempty"`
	PlayerID string          `json:"playerId,omitempty"`
	Payload  json.RawMessage `json:"payload,omitempty"`
}

func (h *Handler) ServeWS(w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		return
	}
	defer func() {
		h.removeConn(conn)
		conn.Close()
	}()

	for {
		_, data, err := conn.ReadMessage()
		if err != nil {
			break
		}
		var msg Message
		if err := json.Unmarshal(data, &msg); err != nil {
			_ = conn.WriteJSON(Message{Type: "error"})
			continue
		}
		// register conn to room for broadcast (like terminal loop registers inputChan)
		if msg.RoomID != "" {
			h.addClient(msg.RoomID, conn)
		}
		if msg.Type == "chat" || msg.Type == "get_history" {
			// ensure global chat clients are registered under "" as well
			roomID := msg.RoomID
			if roomID == "global" {
				roomID = ""
			}
			if roomID == "" {
				h.addClient("", conn)
			}
		}
		reply := h.handle(msg)
		_ = conn.WriteJSON(reply)
		// broadcast to all clients in room after move/start/chat for multiplayer sync
		if reply.Type == "game_state" || reply.Type == "game_started" || reply.Type == "chat" {
			h.broadcast(reply.RoomID, reply)
		}
	}
}

func (h *Handler) addClient(roomID string, conn *websocket.Conn) {
	h.mu.Lock()
	defer h.mu.Unlock()
	if h.clients[roomID] == nil {
		h.clients[roomID] = make(map[*websocket.Conn]bool)
	}
	h.clients[roomID][conn] = true
}

func (h *Handler) removeConn(conn *websocket.Conn) {
	h.mu.Lock()
	defer h.mu.Unlock()
	for roomID, conns := range h.clients {
		delete(conns, conn)
		if len(conns) == 0 {
			delete(h.clients, roomID)
		}
	}
}

func (h *Handler) broadcast(roomID string, msg Message) {
	h.mu.Lock()
	conns := h.clients[roomID]
	// copy to avoid holding lock during write
	targets := make([]*websocket.Conn, 0, len(conns))
	for c := range conns {
		targets = append(targets, c)
	}
	h.mu.Unlock()
	for _, c := range targets {
		_ = c.WriteJSON(msg)
	}
}

func (h *Handler) startAutoLoop(roomID string) {
	h.mu.Lock()
	if _, exists := h.loops[roomID]; exists {
		h.mu.Unlock()
		return
	}
	stop := make(chan struct{})
	h.loops[roomID] = stop
	h.mu.Unlock()

	go func() {
		// mirror terminal: ticker := time.NewTicker(400 * time.Millisecond)
		ticker := time.NewTicker(400 * time.Millisecond)
		defer ticker.Stop()
		for {
			select {
			case <-ticker.C:
				// auto move down — same logic as terminal's case <-ticker.C: if !piece.MoveDown(board) { Lock/Clear/GameOver/Spawn }
				h.games.Tick(roomID)
				if g, ok := h.games.GetGame(roomID); ok {
					// broadcast state each tick so frontend gravity is server-authoritative
					h.broadcast(roomID, Message{Type: "game_state", RoomID: roomID, Payload: mustMarshal(g)})
					if g.Status == models.GameStatusFinished {
						h.stopAutoLoop(roomID)
						return
					}
				} else {
					h.stopAutoLoop(roomID)
					return
				}
			case <-stop:
				return
			}
		}
	}()
}

func (h *Handler) stopAutoLoop(roomID string) {
	h.mu.Lock()
	defer h.mu.Unlock()
	if ch, ok := h.loops[roomID]; ok {
		close(ch)
		delete(h.loops, roomID)
	}
}

func (h *Handler) handle(msg Message) Message {
	switch msg.Type {
	case "create_room":
		var p struct {
			ID   string `json:"id"`
			Name string `json:"name"`
			Host string `json:"host"`
		}
		_ = json.Unmarshal(msg.Payload, &p)
		if p.Host == "" {
			p.Host = msg.PlayerID
		}
		room := h.rooms.CreateRoom(p.ID, p.Name, p.Host)
		return Message{Type: "room_created", RoomID: room.ID, Payload: mustMarshal(room)}

	case "join_room":
		_ = h.rooms.JoinRoom(msg.RoomID, msg.PlayerID)
		room, _ := h.rooms.GetRoom(msg.RoomID)
		return Message{Type: "joined", RoomID: msg.RoomID, Payload: mustMarshal(room)}

	case "leave_room":
		_ = h.rooms.LeaveRoom(msg.RoomID, msg.PlayerID)
		// if room empty, stop loop
		if _, ok := h.rooms.GetRoom(msg.RoomID); !ok {
			h.stopAutoLoop(msg.RoomID)
			h.games.DeleteGame(msg.RoomID)
			if h.chats != nil {
				h.chats.ClearRoom(msg.RoomID)
			}
		}
		return Message{Type: "left", RoomID: msg.RoomID}

	case "start_game":
		room, ok := h.rooms.GetRoom(msg.RoomID)
		if !ok {
			// allow single-player or ad-hoc rooms to auto-create (simple)
			if msg.RoomID == "game-1" || strings.HasPrefix(msg.RoomID, "single-") {
				room = h.rooms.CreateRoom(msg.RoomID, "Single", msg.PlayerID)
			} else {
				return Message{Type: "error", Payload: mustMarshal("room not found")}
			}
		}
		if room.Host != "" && msg.PlayerID != "" && room.Host != msg.PlayerID {
			// allow single-player rooms to be started by anyone
			if !strings.HasPrefix(msg.RoomID, "single-") && msg.RoomID != "game-1" {
				return Message{Type: "error", Payload: mustMarshal("only host can start")}
			}
		}
		room.Status = models.RoomStatusPlaying
		h.stopAutoLoop(msg.RoomID)
		game := h.games.CreateGame(msg.RoomID)
		// start gravity loop like terminal main.go ticker loop
		h.startAutoLoop(msg.RoomID)
		return Message{Type: "game_started", RoomID: msg.RoomID, Payload: mustMarshal(map[string]any{"room": room, "game": game})}

	case "move":
		var p struct {
			GameID string `json:"gameId"`
			Action string `json:"action"`
		}
		_ = json.Unmarshal(msg.Payload, &p)
		if p.GameID == "" {
			p.GameID = msg.RoomID
		}
		switch p.Action {
		case "left":
			h.games.MoveLeft(p.GameID)
		case "right":
			h.games.MoveRight(p.GameID)
		case "down":
			h.games.MoveDown(p.GameID)
		case "rotate":
			h.games.Rotate(p.GameID)
		}
		g, _ := h.games.GetGame(p.GameID)
		if g != nil && g.Status == models.GameStatusFinished {
			h.stopAutoLoop(p.GameID)
		}
		return Message{Type: "game_state", RoomID: p.GameID, Payload: mustMarshal(g)}

	case "chat":
		var p struct {
			Text   string `json:"text"`
			Player string `json:"player"`
			RoomID string `json:"roomId"`
		}
		_ = json.Unmarshal(msg.Payload, &p)
		text := strings.TrimSpace(p.Text)
		if text == "" {
			return Message{Type: "error", Payload: mustMarshal("empty message")}
		}
		if len(text) > 500 {
			text = text[:500]
		}
		roomID := p.RoomID
		if roomID == "" {
			roomID = msg.RoomID
		}
		if roomID == "global" {
			roomID = ""
		}
		player := msg.PlayerID
		if player == "" {
			player = p.Player
		}
		if player == "" {
			player = "Anonymous"
		}
		if h.chats == nil {
			return Message{Type: "error", Payload: mustMarshal("chat not available")}
		}
		cm := h.chats.Add(models.ChatMessage{
			RoomID: roomID,
			Player: player,
			Text:   text,
		})
		return Message{Type: "chat", RoomID: roomID, PlayerID: player, Payload: mustMarshal(cm)}

	case "get_history":
		var p struct {
			RoomID string `json:"roomId"`
		}
		_ = json.Unmarshal(msg.Payload, &p)
		roomID := p.RoomID
		if roomID == "" {
			roomID = msg.RoomID
		}
		if roomID == "global" {
			roomID = ""
		}
		if h.chats == nil {
			return Message{Type: "chat_history", RoomID: roomID, Payload: mustMarshal([]models.ChatMessage{})}
		}
		history := h.chats.GetHistory(roomID)
		return Message{Type: "chat_history", RoomID: roomID, Payload: mustMarshal(history)}

	default:
		return Message{Type: "error"}
	}
}

func mustMarshal(v any) json.RawMessage {
	b, _ := json.Marshal(v)
	return b
}
