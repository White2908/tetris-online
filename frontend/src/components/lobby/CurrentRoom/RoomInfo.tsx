import type { Room } from "../../../types/lobby";

interface RoomInfoProps {
  room: Room;
}

export default function RoomInfo({ room }: RoomInfoProps) {
  return (
    <div className="rounded-xl border border-slate-700 bg-slate-900/50 p-4">
      <h3 className="font-semibold mb-4">Room Info</h3>
      <div className="space-y-3 text-sm">
        <div className="flex justify-between">
          <span className="text-slate-400">Room ID</span>
          <span className="font-mono text-cyan-400">{room.id}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">Max Players</span>
          <span>{room.maxPlayers}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">Status</span>
          <span className="text-green-400 capitalize">{room.status}</span>
        </div>
        <div className="pt-3 border-t border-slate-700">
          <button
            onClick={() => navigator.clipboard.writeText(room.id)}
            className="w-full rounded-lg border border-slate-600 py-2 text-sm hover:bg-slate-800"
          >
            Copy Room ID
          </button>
        </div>
      </div>
    </div>
  );
}
