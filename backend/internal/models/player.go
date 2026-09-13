package models

type Player struct {
	ID     string `json:"id"`
	Name   string `json:"name"`
	IsHost bool   `json:"isHost"`
	Ready  bool   `json:"ready"`
}
