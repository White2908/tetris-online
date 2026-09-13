import type { Room } from "../../types/lobby";

interface RoomCardProps {
  room: Room;
  onJoin: (room: Room) => void;
}

export default function RoomCard({ room, onJoin }: RoomCardProps) {
  return (
    <button
      onClick={() => onJoin(room)}
      disabled={room.status === "playing" || room.players.length >= room.maxPlayers}
      className="rounded-xl border border-slate-700 bg-slate-900/50 p-4 transition hover:border-cyan-500/50 disabled:opacity-50 disabled:cursor-not-allowed text-left"
    >
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold">{room.name}</h3>
          <p className="text-sm text-slate-400">Host: {room.host}</p>
        </div>
        <div className="flex items-center gap-4 text-sm text-slate-400">
          <span>
            {room.players.length}/{room.maxPlayers}
          </span>
          <span
            className={`px-2 py-0.5 rounded text-xs ${
              room.status === "waiting" ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"
            }`}
          >
            {room.status}
          </span>
        </div>
      </div>
    </button>
  );
}
