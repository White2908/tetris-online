import { useNavigate } from "react-router-dom";
import { ROUTES } from "../router/routes";

export default function LoginPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#050b1b] text-white">
      <div className="mx-auto grid min-h-screen max-w-5xl items-center gap-16 px-6 md:grid-cols-2">
        {/* Left */}
        <div className="hidden md:block">
          <h1 className="text-4xl font-bold">
            Play Tetris,
            <br />
            <span className="text-blue-500">Anytime, Anywhere</span>
          </h1>

          <p className="mt-4 max-w-md text-slate-400">
            Challenge yourself and compete with players around the world.
          </p>
        </div>

        {/* Login */}
        <div className="rounded-xl border border-slate-700 bg-slate-900/50 p-8">
          {/* Tabs */}
          <div className="mb-8 flex border-b border-slate-700">
            <button className="w-1/2 border-b-2 border-blue-500 pb-4 font-semibold">
              Login
            </button>

            <button
              onClick={() => navigate(ROUTES.REGISTER)}
              className="w-1/2 pb-4 text-slate-500 hover:text-white"
            >
              Register
            </button>
          </div>

          <h2 className="text-2xl font-bold">Welcome back!</h2>

          <p className="mt-2 text-slate-400">
            Log in to your account to continue
          </p>

          <form className="mt-8 space-y-4">
            <input
              type="text"
              placeholder="Username or Email"
              className="w-full rounded-lg border border-slate-700 bg-transparent px-4 py-3 outline-none focus:border-blue-500"
            />

            <input
              type="password"
              placeholder="Password"
              className="w-full rounded-lg border border-slate-700 bg-transparent px-4 py-3 outline-none focus:border-blue-500"
            />

            <div className="flex justify-between text-sm text-slate-400">
              <label className="flex gap-2">
                <input type="checkbox" />
                Remember me
              </label>

              <button type="button" className="text-blue-400">
                Forgot password?
              </button>
            </div>

            <button
              onClick={() => navigate(ROUTES.LOBBY)}
              className="w-full rounded-lg bg-blue-600 py-3 font-semibold hover:bg-blue-500"
            >
              Login →
            </button>
          </form>

          <div className="my-6 flex items-center gap-3 text-sm text-slate-500">
            <div className="h-px flex-1 bg-slate-700" />
            or
            <div className="h-px flex-1 bg-slate-700" />
          </div>

          <button className="w-full rounded-lg border border-slate-600 py-3 hover:bg-slate-800">
            Continue with Google
          </button>

          <p className="mt-6 text-center text-sm text-slate-500">
            Don't have an account?{" "}
            <button
              onClick={() => navigate(ROUTES.REGISTER)}
              className="text-blue-400"
            >
              Register
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
