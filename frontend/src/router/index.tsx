import { createBrowserRouter } from "react-router-dom"
import { ROUTES } from "./routes"
import LandingPage from "../pages/LandingPage";
import LoginPage from "../pages/LoginPage";
import LobbyPage from "../pages/LobbyPage";
import GamePage from "../pages/GamePage";
export const router = createBrowserRouter([
  {
    path: ROUTES.LANDING,
    element: <LandingPage />
  },
  {
    path: ROUTES.LOGIN,
    element: <LoginPage />
  },
  {
    path: ROUTES.LOBBY,
    element: <LobbyPage />
  },
  {
    path: ROUTES.GAME,
    element: <GamePage />
  }
])
