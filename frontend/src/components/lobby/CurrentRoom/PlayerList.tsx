import type { Player } from "../../../types/lobby";

interface PlayerListProps {
  players: Player[];
  username: string;
  isHost: boolean;
  gameStarting: boolean;
  onToggleReady: () => void;
  onStartGame: () => void;
}

export default function PlayerList({
  players,
  username,
  isHost,
  gameStarting,
  onToggleReady,
  onStartGame,
}: PlayerListProps) {
  return (
    <div className="rounded-xl border border-slate-700 bg-slate-900/50 p-6">
      <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
        Players in Room
        {isHost && <span className="text-xs text-cyan-400">(Host)</span>}
      </h2>
      <div className="space-y-3">
        {players.map((player) => (
          <div
            key={player.id}
            className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50 border border-slate-700"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-400 font-bold">
                {player.name[0].toUpperCase()}
              </div>
              <div>
                <p className="font-medium flex items-center gap-2">
                  {player.name}
                  {player.isHost && (
                    <span className="text-xs px-1.5 py-0.5 rounded bg-yellow-500/20 text-yellow-400">HOST</span>
                  )}
                </p>
                <p className="text-xs text-slate-400">{player.ready ? "Ready" : "Not Ready"}</p>
              </div>
            </div>
            {player.name === username && !player.isHost && (
              <button
                onClick={onToggleReady}
                className={`rounded-lg px-3 py-1 text-sm font-medium transition ${
                  player.ready
                    ? "bg-green-500/20 text-green-400 hover:bg-green-500/30"
                    : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                }`}
              >
                {player.ready ? "Ready ✓" : "Ready"}
              </button>
            )}
          </div>
        ))}
      </div>
      {isHost && (
        <button
          onClick={onStartGame}
          disabled={gameStarting || players.some((p) => !p.ready && !p.isHost)}
          className="mt-6 w-full rounded-lg bg-cyan-500 px-4 py-3 font-semibold text-slate-950 hover:bg-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {gameStarting ? "Starting Game..." : "Start Game"}
        </button>
      )}
    </div>
  );
}
