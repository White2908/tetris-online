import { useEffect, useState } from "react";

const ROWS = 20;
const COLS = 10;
const TICK_MS = 260;
const FLASH_TICKS = 2;

type Cell = [number, number];
type PieceType = "I" | "O" | "T" | "S" | "Z" | "J" | "L";
type Board = (string | null)[][];

interface Piece {
  type: PieceType;
  cells: Cell[];
  color: string;
  row: number;
  col: number;
  targetCol: number;
  width: number;
  height: number;
}

interface GameState {
  board: Board;
  piece: Piece;
  clearingRows: number[];
  flashCountdown: number;
  score: number;
  lines: number;
  level: number;
}

const SHAPES: Record<PieceType, Cell[][]> = {
  I: [[[0, 0], [0, 1], [0, 2], [0, 3]], [[0, 0], [1, 0], [2, 0], [3, 0]]],
  O: [[[0, 0], [0, 1], [1, 0], [1, 1]]],
  T: [[[0, 0], [0, 1], [0, 2], [1, 1]], [[0, 1], [1, 0], [1, 1], [2, 1]]],
  S: [[[0, 1], [0, 2], [1, 0], [1, 1]], [[0, 0], [1, 0], [1, 1], [2, 1]]],
  Z: [[[0, 0], [0, 1], [1, 1], [1, 2]], [[0, 1], [1, 0], [1, 1], [2, 0]]],
  J: [[[0, 0], [1, 0], [1, 1], [1, 2]], [[0, 0], [0, 1], [1, 0], [2, 0]]],
  L: [[[0, 2], [1, 0], [1, 1], [1, 2]], [[0, 0], [1, 0], [2, 0], [2, 1]]],
};

const COLORS: Record<PieceType, string> = {
  I: "#31e0e6",
  O: "#f6cf4a",
  T: "#b285f0",
  S: "#57d68d",
  Z: "#f26d80",
  J: "#5b8ff2",
  L: "#f5984f",
};

// I appears 3x more often than the rest so it triggers a lot.
const SPAWN_POOL: PieceType[] = ["I", "I", "I", "O", "T", "S", "Z", "J", "L"];

function emptyBoard(): Board {
  return Array.from({ length: ROWS }, () => Array(COLS).fill(null));
}

function collides(board: Board, cells: Cell[], row: number, col: number): boolean {
  return cells.some(([dr, dc]) => {
    const r = row + dr;
    const c = col + dc;
    return c < 0 || c >= COLS || r >= ROWS || (r >= 0 && !!board[r][c]);
  });
}

function spawnPiece(board: Board): Piece {
  const type = SPAWN_POOL[Math.floor(Math.random() * SPAWN_POOL.length)];
  const orientations = SHAPES[type];
  const cells = orientations[Math.floor(Math.random() * orientations.length)];
  const width = Math.max(...cells.map((c) => c[1])) + 1;
  const height = Math.max(...cells.map((c) => c[0])) + 1;

  let bestCol = 0;
  let bestScore = Infinity;
  for (let c = 0; c <= COLS - width; c++) {
    let maxH = 0;
    for (let dc = 0; dc < width; dc++) {
      let h = 0;
      for (let r = 0; r < ROWS; r++) {
        if (board[r][c + dc]) {
          h = ROWS - r;
          break;
        }
      }
      maxH = Math.max(maxH, h);
    }
    const score = maxH + Math.random() * 1.4;
    if (score < bestScore) {
      bestScore = score;
      bestCol = c;
    }
  }

  return {
    type,
    cells,
    color: COLORS[type],
    row: -height,
    col: Math.floor(Math.random() * (COLS - width + 1)),
    targetCol: bestCol,
    width,
    height,
  };
}

function step(game: GameState) {
  if (game.flashCountdown > 0) {
    game.flashCountdown -= 1;
    if (game.flashCountdown === 0) {
      game.board = game.board.filter((_, r) => !game.clearingRows.includes(r));
      while (game.board.length < ROWS) game.board.unshift(Array(COLS).fill(null));
      game.clearingRows = [];
      game.piece = spawnPiece(game.board);
    }
    return;
  }

  const p = game.piece;
  if (p.col < p.targetCol && !collides(game.board, p.cells, p.row, p.col + 1)) p.col += 1;
  else if (p.col > p.targetCol && !collides(game.board, p.cells, p.row, p.col - 1)) p.col -= 1;

  const nextRow = p.row + 1;
  if (!collides(game.board, p.cells, nextRow, p.col)) {
    p.row = nextRow;
    return;
  }

  let topLockedRow = ROWS;
  for (const [dr, dc] of p.cells) {
    const r = p.row + dr;
    const c = p.col + dc;
    if (r >= 0) {
      game.board[r][c] = p.color;
      topLockedRow = Math.min(topLockedRow, r);
    }
  }

  const fullRows: number[] = [];
  game.board.forEach((row, r) => {
    if (row.every((cell) => cell)) fullRows.push(r);
  });

  if (fullRows.length > 0) {
    game.clearingRows = fullRows;
    game.flashCountdown = FLASH_TICKS;
    game.lines += fullRows.length;
    game.score += fullRows.length * 100 * game.level;
    game.level = 1 + Math.floor(game.lines / 10);
  } else if (topLockedRow <= 1) {
    game.board = emptyBoard();
    game.piece = spawnPiece(game.board);
    game.score = 0;
    game.lines = 0;
    game.level = 1;
  } else {
    game.piece = spawnPiece(game.board);
  }
}

function createInitialGame(): GameState {
  const board = emptyBoard();
  return {
    board,
    piece: spawnPiece(board),
    clearingRows: [],
    flashCountdown: 0,
    score: 0,
    lines: 0,
    level: 1,
  };
}

export default function TetrisHeroDemo() {
  const [game, setGame] = useState<GameState>(createInitialGame);

  useEffect(() => {
    const id = setInterval(() => {
      setGame((prev) => {
        const next: GameState = { ...prev };
        step(next);
        return next;
      });
    }, TICK_MS);
    return () => clearInterval(id);
  }, []);

  const { board, piece, clearingRows, flashCountdown} = game;
  const display: Board = board.map((row) => [...row]);
  if (flashCountdown === 0) {
    for (const [dr, dc] of piece.cells) {
      const r = piece.row + dr;
      const c = piece.col + dc;
      if (r >= 0 && r < ROWS) display[r][c] = piece.color;
    }
  }

  return (
    <div className="flex justify-center bg-neutral-950 p-8">
      <div className="rounded-lg bg-neutral-900 p-3 shadow-2xl ring-1 ring-white/10">
        <div className="flex flex-col gap-0.5">
          {display.map((row, r) => (
            <div
              key={r}
              className={`flex gap-0.5 rounded transition-colors duration-150 ${
                clearingRows.includes(r) ? "bg-white/90" : ""
              }`}
            >
              {row.map((color, c) => (
                <div
                  key={c}
                  className={`h-4 w-4 rounded-sm transition-colors duration-150 ${
                    color ? "shadow-[0_0_8px_-1px_currentColor] ring-1 ring-white/25" : "bg-neutral-800"
                  }`}
                  style={color ? { backgroundColor: color, color } : undefined}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
