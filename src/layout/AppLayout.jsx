import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Player from "./Player";
import Topbar from "./Topbar";
import "./AppLayout.css";
import { PlayerProvider } from "../contexts/PlayerContext";
export default function AppLayout() {
return (
<PlayerProvider>
<div className="app-layout">
<Sidebar />
<div className="app-main">
<Topbar />
<main className="app-content">
<Outlet />
</main>
7
<Player />
</div>
</div>
</PlayerProvider>
);
}