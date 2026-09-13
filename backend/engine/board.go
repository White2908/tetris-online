package engine

type Board struct {
	Width  int
	Height int
	Grid   [][]bool
}

func NewBoard(width int, height int) Board {
	grid := make([][]bool, height)

	for i := 0; i < height; i++ {
		grid[i] = make([]bool, width)
	}

	board := Board{
		Width:  width,
		Height: height,
		Grid:   grid,
	}

	return board
}

func (board *Board) LockPiece(piece *Piece) {
	for y, row := range piece.Shape {
		for x, cell := range row {
			if !cell {
				continue
			}
			boardX := piece.X + x
			boardY := piece.Y + y

			board.Grid[boardY][boardX] = true
		}
	}
}

func (board *Board) ClearLines() int {
	cleared := 0

	for y := board.Height - 1; y >= 0; y-- {
		full := true
		for x := 0; x < board.Width; x++ {
			if !board.Grid[y][x] {
				full = false
				break
			}
		}

		if !full {
			continue
		}

		for row := y; row > 0; row-- {
			board.Grid[row] = board.Grid[row-1]
		}

		board.Grid[0] = make([]bool, board.Width)

		cleared++
		y++
	}

	return cleared
}

func (board *Board) GameOver() bool {
	for x := 0; x < board.Width; x++ {
		if board.Grid[0][x] {
			return false
		}
	}

	return true
}
