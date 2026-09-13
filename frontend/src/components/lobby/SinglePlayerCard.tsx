interface SinglePlayerCardProps {
  onPlay: () => void;
}

export default function SinglePlayerCard({ onPlay }: SinglePlayerCardProps) {
  return (
    <div className="rounded-xl border border-cyan-500/30 bg-gradient-to-br from-cyan-500/10 via-slate-900/50 to-slate-900/50 p-5 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-cyan-500 flex items-center justify-center text-slate-950">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2L14.5 8.5L21 9L16 14L17.5 21L12 17.5L6.5 21L8 14L3 9L9.5 8.5L12 2Z" />
          </svg>
        </div>
        <div>
          <h3 className="font-bold text-lg">Single Player</h3>
          <p className="text-sm text-slate-400">Practice at your own pace — no waiting for others</p>
        </div>
      </div>
      <button
        onClick={onPlay}
        className="rounded-lg bg-cyan-500 px-6 py-2.5 text-sm font-bold text-slate-950 hover:bg-cyan-400 transition whitespace-nowrap"
      >
        Play Now →
      </button>
    </div>
  );
}
