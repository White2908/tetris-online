package models

type RoomStatus string

const (
	RoomStatusWaiting RoomStatus = "waiting"
	RoomStatusPlaying RoomStatus = "playing"
)

type Room struct {
	ID         string     `json:"id"`
	Name       string     `json:"name"`
	Players    []string   `json:"players"`
	MaxPlayers int        `json:"maxPlayers"`
	Status     RoomStatus `json:"status"`
	Host       string     `json:"host"`
}
