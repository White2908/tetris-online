/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState, useCallback, useMemo, useId } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ROUTES } from "../router/routes";
import { useSocket } from "../hooks/useSocket";

import type { ServerGame, LocationState } from "../types/game";

const ROWS = 20;
const COLS = 10;

const PIECE_COLOR = "#00f5ff";
const BOARD_COLOR = "#0f172a";

export default function GamePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState | null;
  const isSingle = state?.mode === "single";
  const singleId = useId();
  const roomId = useMemo(() => state?.roomId ?? (isSingle ? `single-${singleId}` : "game-1"), [state?.roomId, isSingle, singleId]);
  const playerId = localStorage.getItem("username") ?? "guest";

  const { isConnected, lastMessage, sendMessage } = useSocket({ autoConnect: true });

  const [game, setGame] = useState<ServerGame | null>(null);
  const [paused, setPaused] = useState(false);

  // handle incoming messages
  useEffect(() => {
    if (!lastMessage) return;
    if (lastMessage.type === "game_state") {
      setGame(lastMessage.payload as ServerGame);
    } else if (lastMessage.type === "game_started") {
      const p = lastMessage.payload as { game: ServerGame } | ServerGame;
      const g = (p as { game: ServerGame }).game ?? (p as ServerGame);
      setGame(g);
    }
  }, [lastMessage]);

  // for single-player: create fresh game on mount (simple, per-session id)
  useEffect(() => {
    if (!isSingle || !isConnected) return;
    sendMessage({ type: "start_game", roomId, playerId, payload: {} });
  }, [isSingle, isConnected, roomId, playerId, sendMessage]);

  // fetch initial state once connected (for multi, where game already started in lobby)
  useEffect(() => {
    if (!isConnected) return;
    if (game) return;
    if (isSingle) return; // single already triggered start_game above
    const t = setTimeout(() => {
      sendMessage({
        type: "move",
        roomId,
        playerId,
        payload: { gameId: roomId, action: "left" },
      });
      setTimeout(() => {
        sendMessage({
          type: "move",
          roomId,
          playerId,
          payload: { gameId: roomId, action: "right" },
        });
      }, 50);
    }, 200);
    return () => clearTimeout(t);
  }, [isConnected, game, roomId, playerId, sendMessage, isSingle]);

  const sendMove = useCallback(
    (action: "left" | "right" | "down" | "rotate") => {
      if (paused) return;
      if (game?.status === "finished") return;
      sendMessage({
        type: "move",
        roomId,
        playerId,
        payload: { gameId: roomId, action },
      });
    },
    [paused, game?.status, roomId, playerId, sendMessage],
  );

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code === "ArrowLeft" || e.code === "KeyA") {
        e.preventDefault();
        sendMove("left");
      } else if (e.code === "ArrowRight" || e.code === "KeyD") {
        e.preventDefault();
        sendMove("right");
      } else if (e.code === "ArrowDown" || e.code === "KeyS") {
        e.preventDefault();
        sendMove("down");
      } else if (e.code === "ArrowUp" || e.code === "KeyW") {
        e.preventDefault();
        sendMove("rotate");
      } else if (e.code === "Space") {
        e.preventDefault();
        // hard drop = spam down until lock (simple)
        for (let i = 0; i < ROWS; i++) sendMove("down");
      } else if (e.code === "Escape") {
        setPaused((p) => !p);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [sendMove]);

  const gameOver = game?.status === "finished";

  // build display board from server state
  const displayBoard: (string | null)[][] = (() => {
    const board: (string | null)[][] = Array.from({ length: ROWS }, () =>
      Array(COLS).fill(null),
    );
    if (!game?.board?.Grid) return board;
    for (let r = 0; r < Math.min(ROWS, game.board.Grid.length); r++) {
      for (let c = 0; c < Math.min(COLS, game.board.Grid[r].length); c++) {
        if (game.board.Grid[r][c]) board[r][c] = BOARD_COLOR;
      }
    }
    if (game.currentPiece?.Shape) {
      const { Shape, X, Y } = game.currentPiece;
      for (let y = 0; y < Shape.length; y++) {
        for (let x = 0; x < Shape[y].length; x++) {
          if (!Shape[y][x]) continue;
          const br = Y + y;
          const bc = X + x;
          if (br >= 0 && br < ROWS && bc >= 0 && bc < COLS) {
            board[br][bc] = PIECE_COLOR;
          }
        }
      }
    }
    return board;
  })();

  return (
    <div className="min-h-screen bg-[#050b1b] text-white" tabIndex={0}>
      <header className="border-b border-slate-800">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <button
            onClick={() => navigate(ROUTES.LOBBY)}
            className="rounded-lg border border-slate-600 px-3 py-2 text-sm hover:bg-slate-800"
          >
            ← Lobby
          </button>
          <h1 className="text-xl font-bold">
            TETRIS<span className="text-cyan-400">ONLINE</span>
          </h1>
          <div className="flex items-center gap-3">
            <span
              className={`h-2 w-2 rounded-full ${isConnected ? "bg-emerald-400" : "bg-red-400"}`}
            />
            <span className="text-xs text-slate-400">
              {isConnected ? "connected" : "connecting..."}
            </span>
            <span className="text-xs text-slate-500 hidden sm:inline">
              {roomId}
            </span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-6">
        <div className="grid gap-6 lg:grid-cols-[1fr_220px]">
          <div className="flex justify-center">
            <div
              className="rounded-lg bg-slate-900 p-3 shadow-2xl ring-1 ring-white/10"
              style={{ width: `${COLS * 24 + 14}px` }}
            >
              <div className="flex flex-col gap-0.5">
                {displayBoard.map((row, r) => (
                  <div key={r} className="flex gap-0.5">
                    {row.map((color, c) => (
                      <div
                        key={c}
                        className={`h-5 w-5 rounded-sm ${color ? "shadow-[0_0_8px_-1px_currentColor] ring-1 ring-white/25" : "bg-slate-800"}`}
                        style={color ? { backgroundColor: color } : undefined}
                      />
                    ))}
                  </div>
                ))}
              </div>
              {!game && (
                <div className="mt-3 text-center text-sm text-slate-400">
                  {isConnected ? "Loading game..." : "Connecting to server..."}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-xl border border-slate-700 bg-slate-900/50 p-4 space-y-3">
              <div className="flex justify-between">
                <span className="text-slate-400">SCORE</span>
                <span className="font-mono text-cyan-400 text-xl">
                  {game?.score ?? 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">STATUS</span>
                <span className="font-mono text-cyan-400 text-sm">
                  {game?.status ?? "loading"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">ROOM</span>
                <span className="font-mono text-xs text-slate-300 truncate max-w-[120px]">
                  {roomId}
                </span>
              </div>
            </div>

            <div className="rounded-xl border border-slate-700 bg-slate-900/50 p-4 text-sm text-slate-400">
              <h4 className="font-semibold text-white mb-2">Controls (WS)</h4>
              <div className="space-y-1 font-mono text-xs">
                <div className="flex justify-between">
                  <span>← / A</span>
                  <span>left</span>
                </div>
                <div className="flex justify-between">
                  <span>→ / D</span>
                  <span>right</span>
                </div>
                <div className="flex justify-between">
                  <span>↓ / S</span>
                  <span>down</span>
                </div>
                <div className="flex justify-between">
                  <span>↑ / W</span>
                  <span>rotate</span>
                </div>
                <div className="flex justify-between">
                  <span>Space</span>
                  <span>hard drop</span>
                </div>
                <div className="flex justify-between">
                  <span>ESC</span>
                  <span>pause (local)</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                sendMessage({
                  type: "move",
                  roomId,
                  playerId,
                  payload: { gameId: roomId, action: "down" },
                });
              }}
              className="w-full rounded-lg bg-slate-800 py-2 text-sm hover:bg-slate-700"
            >
              Refresh (down)
            </button>
          </div>
        </div>
      </main>

      {(paused || gameOver) && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="text-center bg-slate-900 rounded-xl border border-slate-700 p-8 max-w-md mx-4">
            {gameOver ? (
              <>
                <h2 className="text-3xl font-bold text-red-400 mb-4">GAME OVER</h2>
                <p className="text-xl mb-6">
                  Final Score: <span className="text-cyan-400">{game?.score ?? 0}</span>
                </p>
                <button
                  onClick={() => {
                    setGame(null);
                    setPaused(false);
                    sendMessage({ type: "start_game", roomId, playerId, payload: {} });
                  }}
                  className="rounded-lg bg-cyan-500 px-6 py-3 font-semibold text-slate-950 hover:bg-cyan-400 mr-3"
                >
                  Play Again
                </button>
                <button
                  onClick={() => navigate(ROUTES.LOBBY)}
                  className="rounded-lg border border-slate-600 px-6 py-3 font-semibold hover:bg-slate-800"
                >
                  Back to Lobby
                </button>
              </>
            ) : (
              <>
                <h2 className="text-3xl font-bold text-cyan-400 mb-4">PAUSED</h2>
                <p className="mb-6 text-slate-400">Press ESC to resume</p>
                <button
                  onClick={() => setPaused(false)}
                  className="rounded-lg bg-cyan-500 px-6 py-3 font-semibold text-slate-950 hover:bg-cyan-400"
                >
                  Resume
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
