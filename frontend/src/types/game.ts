export type ServerBoard = {
  Width: number;
  Height: number;
  Grid: boolean[][];
};

export type ServerPiece = {
  ShapeType: number;
  Shape: boolean[][];
  X: number;
  Y: number;
};

export type ServerGame = {
  board: ServerBoard;
  currentPiece: ServerPiece | null;
  score: number;
  status: "waiting" | "playing" | "finished";
};

export type LocationState = {
  roomId?: string;
  mode?: "single" | "multi";
  players?: import("./lobby").Player[];
};
