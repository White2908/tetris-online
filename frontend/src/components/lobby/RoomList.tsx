import type { Room } from "../../types/lobby";
import RoomCard from "./RoomCard";

interface RoomListProps {
  rooms: Room[];
  onJoinRoom: (room: Room) => void;
}

export default function RoomList({ rooms, onJoinRoom }: RoomListProps) {
  return (
    <div>
      <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-cyan-500" />
        Available Rooms
      </h2>
      {rooms.length === 0 ? (
        <div className="rounded-xl border border-slate-700 bg-slate-900/50 p-12 text-center text-slate-500">
          No rooms available. Create one to start playing!
        </div>
      ) : (
        <div className="grid gap-4">
          {rooms.map((room) => (
            <RoomCard key={room.id} room={room} onJoin={onJoinRoom} />
          ))}
        </div>
      )}
    </div>
  );
}
