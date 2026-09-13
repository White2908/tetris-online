package controller

import "github.com/White2908/tetris-online/backend/internal/models"

type RoomController struct {
	rooms map[string]*models.Room
}

func NewRoomController() *RoomController {
	return &RoomController{
		rooms: make(map[string]*models.Room),
	}
}

func (c *RoomController) CreateRoom(id, name, host string) *models.Room {
	room := &models.Room{
		ID:         id,
		Name:       name,
		Players:    []string{host},
		MaxPlayers: 4,
		Status:     models.RoomStatusWaiting,
		Host:       host,
	}
	c.rooms[id] = room
	return room
}

func (c *RoomController) GetRoom(id string) (*models.Room, bool) {
	r, ok := c.rooms[id]
	return r, ok
}

func (c *RoomController) ListRooms() []*models.Room {
	list := make([]*models.Room, 0, len(c.rooms))
	for _, r := range c.rooms {
		list = append(list, r)
	}
	return list
}

func (c *RoomController) JoinRoom(roomID, player string) bool {
	room, ok := c.rooms[roomID]
	if !ok {
		return false
	}
	if len(room.Players) >= room.MaxPlayers {
		return false
	}
	if room.Status == models.RoomStatusPlaying {
		return false
	}
	for _, p := range room.Players {
		if p == player {
			return true
		}
	}
	room.Players = append(room.Players, player)
	return true
}

func (c *RoomController) LeaveRoom(roomID, player string) bool {
	room, ok := c.rooms[roomID]
	if !ok {
		return false
	}
	for i, p := range room.Players {
		if p == player {
			room.Players = append(room.Players[:i], room.Players[i+1:]...)
			if room.Host == player && len(room.Players) > 0 {
				room.Host = room.Players[0]
			}
			if len(room.Players) == 0 {
				delete(c.rooms, roomID)
			}
			return true
		}
	}
	return false
}
