import { ROUTES } from "../../router/routes";
import { useNavigate } from "react-router-dom";

type LobbyHeaderProps =
  | {
      variant: "lobby";
      username: string;
      onUsernameChange: (v: string) => void;
    }
  | {
      variant: "room";
      username: string;
      onUsernameChange: (v: string) => void;
      roomName: string;
      playerCount: string;
      onLeave: () => void;
    };

export default function LobbyHeader(props: LobbyHeaderProps) {
  const navigate = useNavigate();

  if (props.variant === "room") {
    return (
      <header className="border-b border-slate-800">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={props.onLeave}
              className="rounded-lg border border-slate-600 px-3 py-2 text-sm hover:bg-slate-800"
            >
              ← Leave
            </button>
            <h1 className="text-xl font-bold">Room: {props.roomName}</h1>
            <span className="px-2 py-0.5 rounded text-xs bg-green-500/20 text-green-400">
              {props.playerCount}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <input
              type="text"
              value={props.username}
              onChange={(e) => props.onUsernameChange(e.target.value)}
              className="rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-sm w-40 outline-none focus:border-cyan-500"
            />
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="border-b border-slate-800">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <button
          onClick={() => navigate(ROUTES.LANDING)}
          className="text-xl font-bold tracking-tight"
        >
          TETRIS<span className="text-cyan-400">ONLINE</span>
        </button>
        <div className="flex items-center gap-4">
          <input
            type="text"
            value={props.username}
            onChange={(e) => props.onUsernameChange(e.target.value)}
            className="rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-sm w-40 outline-none focus:border-cyan-500"
            placeholder="Username"
          />
          <span className="text-sm text-slate-400">Lobby</span>
        </div>
      </div>
    </header>
  );
}
