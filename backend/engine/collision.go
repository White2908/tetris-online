package engine

func CheckCollision(board *Board, piece *Piece) bool {
	for y, row := range piece.Shape {
		for x, cell := range row {
			if !cell {
				continue
			}

			boardX := piece.X + x
			boardY := piece.Y + y

			if boardX < 0 || boardX >= board.Width {
				return true
			}

			if boardY < 0 || boardY >= board.Height {
				return true
			}

			if board.Grid[boardY][boardX] {
				return true
			}
		}
	}
	return false
}
