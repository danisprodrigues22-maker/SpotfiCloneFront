import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Player from "./Player";
import Topbar from "./Topbar";
import { useContext, useEffect, useRef, useState } from "react";
import { PlayerContext, PlayerProvider } from "../contexts/PlayerContext";
import { ToastProvider } from "../contexts/ToastContext";
import "./AppLayout.css";

const DEFAULT_COLOR = "#121212";

function buildBackground(color) {
  const topColor = color || DEFAULT_COLOR;

  return `
    linear-gradient(180deg, ${topColor} 0%, rgba(18, 18, 18, 0.96) 58%, #121212 100%),
    radial-gradient(1200px 600px at 20% 0%, rgba(255, 255, 255, 0.07), transparent 60%),
    radial-gradient(900px 500px at 80% 0%, rgba(255, 255, 255, 0.05), transparent 55%)
  `;
}

function LayoutContent() {
  const { themeColor } = useContext(PlayerContext);

  const [bgA, setBgA] = useState(DEFAULT_COLOR);
  const [bgB, setBgB] = useState(DEFAULT_COLOR);
  const [activeLayer, setActiveLayer] = useState("a");

  const firstRenderRef = useRef(true);
  const rafRef = useRef(null);

  useEffect(() => {
    const nextColor = themeColor || DEFAULT_COLOR;

    const currentVisibleColor = activeLayer === "a" ? bgA : bgB;
    if (currentVisibleColor === nextColor) return;

    if (firstRenderRef.current) {
      setBgA(nextColor);
      setBgB(nextColor);
      firstRenderRef.current = false;
      return;
    }

    const hiddenLayer = activeLayer === "a" ? "b" : "a";

    if (hiddenLayer === "a") {
      setBgA(nextColor);
    } else {
      setBgB(nextColor);
    }

    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }

    rafRef.current = requestAnimationFrame(() => {
      setActiveLayer(hiddenLayer);
    });

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [themeColor, activeLayer, bgA, bgB]);

  return (
    <div className="app-layout">
      <div
        className={`app-layout-bg ${activeLayer === "a" ? "is-visible" : ""}`}
        style={{ background: buildBackground(bgA) }}
      />
      <div
        className={`app-layout-bg ${activeLayer === "b" ? "is-visible" : ""}`}
        style={{ background: buildBackground(bgB) }}
      />

      <div className="app-layout-shell">
        <Sidebar />

        <div className="app-main">
          <Topbar />

          <main className="app-content">
            <Outlet />
          </main>

          <Player />
        </div>
      </div>
    </div>
  );
}

export default function AppLayout() {
  return (
    <PlayerProvider>
      <ToastProvider>
        <LayoutContent />
      </ToastProvider>
    </PlayerProvider>
  );
}