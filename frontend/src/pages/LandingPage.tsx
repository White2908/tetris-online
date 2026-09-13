import { useNavigate } from "react-router-dom";
import { ROUTES } from "../router/routes";
import TetrisHeroDemo from "../components/TetrisDemo";

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      <header className="border-b border-neutral-900">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <button
            onClick={() => navigate(ROUTES.LANDING)}
            className="text-xl font-bold tracking-tight"
          >
            TETRIS<span className="text-cyan-400">ONLINE</span>
          </button>

          <nav className="flex items-center gap-3">
            <button
              onClick={() => navigate(ROUTES.LOGIN)}
              className="px-4 py-2 text-sm text-neutral-400 transition hover:text-white"
            >
              Login
            </button>

            <button
              onClick={() => navigate(ROUTES.REGISTER)}
              className="rounded-lg bg-cyan-500 px-5 py-2 text-sm font-semibold text-neutral-950 transition hover:bg-cyan-400"
            >
              Register
            </button>
          </nav>
        </div>
      </header>

      <main>
        <section className="flex w-full items-center justify-center gap-12 py-20 md:grid-cols-2 md:py-28">
          <div>
            <div className="w-full flex items-start">
              <div className="mb-5 inline-flex rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1 text-sm text-cyan-400">
                Multiplayer Tetris
              </div>
            </div>


            <p className="mt-6 max-w-lg text-lg text-start text-neutral-400">
              Experience classic Tetris with real-time multiplayer battles.
              Challenge your friends, survive the stack, and become the best.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <button
                onClick={() => navigate(ROUTES.REGISTER)}
                className="rounded-lg bg-cyan-500 px-7 py-3.5 font-semibold text-neutral-950 transition hover:bg-cyan-400"
              >
                Start Playing
              </button>
            </div>
          </div>

          <div className="flex justify-center">
            <TetrisHeroDemo />
          </div>
        </section>

        {/* Features */}
        <section className="border-y border-neutral-900 bg-neutral-950">
          <div className="mx-auto max-w-7xl px-6 py-20">
            <div className="mb-12 text-center">
              <p className="text-sm font-medium uppercase tracking-widest text-cyan-400">
                Features
              </p>

              <h2 className="mt-2 text-3xl font-bold">
                Built for competitive play
              </h2>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              <Feature
                title="Real-time Multiplayer"
                description="Play against other players with real-time game synchronization."
              />

              <Feature
                title="Competitive Ranking"
                description="Climb the leaderboard and prove your skills against other players."
              />

              <Feature
                title="Fast & Responsive"
                description="A lightweight game experience designed for smooth gameplay."
              />
            </div>
          </div>
        </section>

        <section className="px-6 py-24 text-center">
          <p className="text-sm uppercase tracking-widest text-cyan-400">
            Ready?
          </p>

          <h2 className="mt-3 text-4xl font-black">
            Your next match starts here.
          </h2>

          <p className="mx-auto mt-4 max-w-md text-neutral-400">
            Create an account and start playing Tetris Online.
          </p>

          <button
            onClick={() => navigate(ROUTES.REGISTER)}
            className="mt-8 rounded-lg bg-cyan-500 px-8 py-4 font-semibold text-neutral-950 transition hover:bg-cyan-400"
          >
            Create Account
          </button>
        </section>
      </main>

      <footer className="border-t border-neutral-900">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-6 py-8 text-sm text-neutral-500 sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 TetrisOnline</p>

          <p>Built for multiplayer Tetris</p>
        </div>
      </footer>
    </div>
  );
}

function Feature({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-6 transition hover:border-neutral-700">
      <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-400">
        ◆
      </div>

      <h3 className="text-lg font-semibold">{title}</h3>

      <p className="mt-2 text-sm leading-relaxed text-neutral-400">
        {description}
      </p>
    </div>
  );
}
