package controller

import (
	"fmt"
	"sync"
	"time"

	"github.com/White2908/tetris-online/backend/internal/models"
)

type ChatController struct {
	mu       sync.Mutex
	messages map[string][]models.ChatMessage
}

func NewChatController() *ChatController {
	return &ChatController{
		messages: make(map[string][]models.ChatMessage),
	}
}

func (c *ChatController) Add(msg models.ChatMessage) models.ChatMessage {
	if msg.ID == "" {
		msg.ID = fmt.Sprintf("%d", time.Now().UnixNano())
	}
	if msg.Timestamp.IsZero() {
		msg.Timestamp = time.Now().UTC()
	}
	if msg.RoomID == "global" {
		msg.RoomID = ""
	}
	c.mu.Lock()
	c.messages[msg.RoomID] = append(c.messages[msg.RoomID], msg)
	c.mu.Unlock()
	return msg
}

func (c *ChatController) GetHistory(roomID string) []models.ChatMessage {
	if roomID == "global" {
		roomID = ""
	}
	c.mu.Lock()
	defer c.mu.Unlock()
	list := c.messages[roomID]
	out := make([]models.ChatMessage, len(list))
	copy(out, list)
	return out
}

func (c *ChatController) ClearRoom(roomID string) {
	c.mu.Lock()
	delete(c.messages, roomID)
	c.mu.Unlock()
}
