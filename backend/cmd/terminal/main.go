package main

import (
	"fmt"
	"math/rand/v2"
	"os"
	"os/exec"
	"time"

	"github.com/White2908/tetris-online/backend/engine"
	"github.com/eiannone/keyboard"
)

type Input int

const (
	InputLeft Input = iota
	InputRight
	InputDown
	InputRotate
)

func printBoard(board engine.Board, piece engine.Piece) {
	// Top border
	fmt.Print("╔")
	for x := 0; x < board.Width; x++ {
		fmt.Print("══")
	}
	fmt.Println("╗")

	// Board
	for y := 0; y < board.Height; y++ {
		fmt.Print("║")

		for x := 0; x < board.Width; x++ {

			// Piece đang rơi
			pieceX := x - piece.X
			pieceY := y - piece.Y

			if pieceY >= 0 &&
				pieceY < len(piece.Shape) &&
				pieceX >= 0 &&
				pieceX < len(piece.Shape[0]) &&
				piece.Shape[pieceY][pieceX] {

				fmt.Print("▓▓")
				continue
			}

			// Piece đã lock
			if board.Grid[y][x] {
				fmt.Print("██")
				continue
			}

			// Empty cell
			fmt.Print("░░")
		}

		fmt.Println("║")
	}

	// Bottom border
	fmt.Print("╚")
	for x := 0; x < board.Width; x++ {
		fmt.Print("══")
	}
	fmt.Println("╝")
}

func ClearTerminal() {
	var cmd *exec.Cmd
	cmd = exec.Command("cmd", "/c", "cls")
	cmd.Stdout = os.Stdout
	cmd.Run()
}

func main() {
	inputChan := make(chan Input, 1)

	board := engine.NewBoard(10, 20)

	piece := engine.NewPiece(
		engine.T,
		engine.PieceShapes[engine.PieceType(rand.IntN(5))],
		4,
		0,
	)

	score := 0

	go func() {
		if err := keyboard.Open(); err != nil {
			panic(err)
		}
		defer keyboard.Close()

		for {
			char, _, err := keyboard.GetKey()
			if err != nil {
				return
			}

			switch char {
			case 'a':
				inputChan <- InputLeft

			case 'd':
				inputChan <- InputRight

			case 's':
				inputChan <- InputDown

			case 'w':
				inputChan <- InputRotate

			default:
				continue
			}
		}
	}()

	ticker := time.NewTicker(400 * time.Millisecond)
	defer ticker.Stop()

	for {
		select {
		case input := <-inputChan:

			switch input {
			case InputLeft:
				piece.MoveLeft(board)

			case InputRight:
				piece.MoveRight(board)

			case InputDown:
				piece.MoveDown(board)

			case InputRotate:
				piece.Rotation(board)
			}
		case <-ticker.C:
			if !piece.MoveDown(board) {
				board.LockPiece(&piece)
				score += 100 * board.ClearLines()
				status := board.GameOver()

				if status == false {
					fmt.Printf("Game Over: %d", score)
					return
				}

				pieceType := engine.PieceType(rand.IntN(7))

				piece = engine.NewPiece(
					pieceType,
					engine.PieceShapes[pieceType],
					4,
					0,
				)
			}
		}

		ClearTerminal()
		printBoard(board, piece)
	}
}
