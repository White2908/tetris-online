package controller

import (
	"math/rand/v2"
	"sync"

	"github.com/White2908/tetris-online/backend/engine"
	"github.com/White2908/tetris-online/backend/internal/models"
)

type GameController struct {
	mu    sync.RWMutex
	games map[string]*models.Game
}

func NewGameController() *GameController {
	return &GameController{
		games: make(map[string]*models.Game),
	}
}

func spawnRandomPiece() engine.Piece {
	t := engine.AllPieceTypes[rand.IntN(len(engine.AllPieceTypes))]
	shape := engine.PieceShapes[t]
	return engine.NewPiece(t, shape, 4, 0)
}

func (c *GameController) CreateGame(id string) *models.Game {
	board := engine.NewBoard(10, 20)
	piece := spawnRandomPiece()
	game := &models.Game{
		Board:        &board,
		CurrentPiece: &piece,
		Score:        0,
		Status:       models.GameStatusPlaying,
	}
	c.mu.Lock()
	c.games[id] = game
	c.mu.Unlock()
	return game
}

func (c *RoomController) StartGame(roomID, playerID string) bool {
	room, ok := c.rooms[roomID]
	if !ok {
		return false
	}

	if room.Host != playerID {
		return false
	}

	if room.Status == models.RoomStatusPlaying {
		return false
	}

	if len(room.Players) < 2 {
		return false
	}

	room.Status = models.RoomStatusPlaying

	return true
}

func (c *GameController) GetGame(id string) (*models.Game, bool) {
	c.mu.RLock()
	g, ok := c.games[id]
	c.mu.RUnlock()
	return g, ok
}

func (c *GameController) DeleteGame(id string) {
	c.mu.Lock()
	delete(c.games, id)
	c.mu.Unlock()
}

func (c *GameController) MoveLeft(id string) bool {
	c.mu.RLock()
	g, ok := c.games[id]
	c.mu.RUnlock()
	if !ok || g.CurrentPiece == nil || g.Board == nil {
		return false
	}
	g.Mu.Lock()
	defer g.Mu.Unlock()
	if g.Status != models.GameStatusPlaying {
		return false
	}
	return g.CurrentPiece.MoveLeft(*g.Board)
}

func (c *GameController) MoveRight(id string) bool {
	c.mu.RLock()
	g, ok := c.games[id]
	c.mu.RUnlock()
	if !ok || g.CurrentPiece == nil || g.Board == nil {
		return false
	}
	g.Mu.Lock()
	defer g.Mu.Unlock()
	if g.Status != models.GameStatusPlaying {
		return false
	}
	return g.CurrentPiece.MoveRight(*g.Board)
}

// MoveDown tries to move piece down; if blocked it locks, clears lines, checks game over and spawns new piece.
// Returns true if piece moved, false if locked/spawned.
func (c *GameController) MoveDown(id string) bool {
	c.mu.RLock()
	g, ok := c.games[id]
	c.mu.RUnlock()
	if !ok || g.CurrentPiece == nil || g.Board == nil {
		return false
	}
	g.Mu.Lock()
	defer g.Mu.Unlock()
	if g.Status != models.GameStatusPlaying {
		return false
	}
	moved := g.CurrentPiece.MoveDown(*g.Board)
	if !moved {
		g.Board.LockPiece(g.CurrentPiece)
		cleared := g.Board.ClearLines()
		g.Score += 100 * cleared
		if !g.Board.GameOver() {
			g.Status = models.GameStatusFinished
			return false
		}
		newPiece := spawnRandomPiece()
		g.CurrentPiece = &newPiece
		if engine.CheckCollision(g.Board, g.CurrentPiece) {
			g.Status = models.GameStatusFinished
		}
	}
	return moved
}

// Tick is the auto-gravity step, identical to terminal ticker.C case.
// It is intended to be called by a time.Ticker loop like backend/cmd/terminal/main.go:124.
func (c *GameController) Tick(id string) bool {
	c.mu.RLock()
	g, ok := c.games[id]
	c.mu.RUnlock()
	if !ok || g.CurrentPiece == nil || g.Board == nil {
		return false
	}
	g.Mu.Lock()
	defer g.Mu.Unlock()
	if g.Status != models.GameStatusPlaying {
		return false
	}
	if !g.CurrentPiece.MoveDown(*g.Board) {
		g.Board.LockPiece(g.CurrentPiece)
		g.Score += 100 * g.Board.ClearLines()
		if !g.Board.GameOver() {
			g.Status = models.GameStatusFinished
			return false
		}
		newPiece := spawnRandomPiece()
		g.CurrentPiece = &newPiece
		if engine.CheckCollision(g.Board, g.CurrentPiece) {
			g.Status = models.GameStatusFinished
			return false
		}
	}
	return true
}

func (c *GameController) Rotate(id string) {
	c.mu.RLock()
	g, ok := c.games[id]
	c.mu.RUnlock()
	if !ok || g.CurrentPiece == nil || g.Board == nil {
		return
	}
	g.Mu.Lock()
	defer g.Mu.Unlock()
	if g.Status != models.GameStatusPlaying {
		return
	}
	g.CurrentPiece.Rotation(*g.Board)
}
