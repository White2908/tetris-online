package models

import "time"

type ChatMessage struct {
	ID        string    `json:"id"`
	RoomID    string    `json:"roomId"`
	Player    string    `json:"player"`
	Text      string    `json:"text"`
	Timestamp time.Time `json:"timestamp"`
}
