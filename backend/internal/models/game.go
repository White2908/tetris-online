package models

import (
	"sync"

	"github.com/White2908/tetris-online/backend/engine"
)

type GameStatus string

const (
	GameStatusWaiting  GameStatus = "waiting"
	GameStatusPlaying  GameStatus = "playing"
	GameStatusFinished GameStatus = "finished"
)

type Game struct {
	Board        *engine.Board `json:"board"`
	CurrentPiece *engine.Piece `json:"currentPiece"`
	Score        int           `json:"score"`
	Status       GameStatus    `json:"status"`
	Mu           sync.Mutex    `json:"-"`
}
