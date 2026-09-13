package engine

type Piece struct {
	ShapeType PieceType
	Shape     [][]bool
	X         int
	Y         int
}
type PieceType int

const (
	I PieceType = iota
	O
	J
	L
	S
	T
	Z
)

func NewPiece(shapeType PieceType, shape [][]bool, x int, y int) Piece {
	return Piece{
		ShapeType: shapeType,
		Shape:     shape,
		X:         x,
		Y:         y,
	}
}

func (piece *Piece) Rotation(board Board) {
	rotated := make([][]bool, len(piece.Shape))

	for y := range rotated {
		rotated[y] = make([]bool, len(piece.Shape))
	}

	for y := 0; y < len(piece.Shape); y++ {
		for x := 0; x < len(piece.Shape); x++ {
			rotated[x][len(piece.Shape)-1-y] = piece.Shape[y][x]
		}
	}

	original := piece.Shape
	piece.Shape = rotated

	if CheckCollision(&board, piece) {
		piece.Shape = original
	}
}

func (piece *Piece) MoveDown(board Board) bool {
	piece.Y++

	if CheckCollision(&board, piece) {
		piece.Y--
		return false
	}

	return true
}

func (piece *Piece) MoveLeft(board Board) bool {
	piece.X--

	if CheckCollision(&board, piece) {
		piece.X++
		return false
	}

	return true
}

func (piece *Piece) MoveRight(board Board) bool {
	piece.X++

	if CheckCollision(&board, piece) {
		piece.X--
		return false
	}

	return true
}
