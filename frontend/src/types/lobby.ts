export interface Room {
  id: string;
  name: string;
  players: string[];
  maxPlayers: number;
  status: "waiting" | "playing";
  host: string;
}

export interface Player {
  id: string;
  name: string;
  isHost: boolean;
  ready: boolean;
}

export interface ChatMessage {
  id: string;
  player: string;
  text: string;
  timestamp: Date;
}
