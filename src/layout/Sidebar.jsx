import { Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../services/api";

export default function Sidebar() {
  const location = useLocation();
  const [likedId, setLikedId] = useState(null);

  const isActiveExact = (path) => location.pathname === path;
  const isActiveStartsWith = (path) => location.pathname.startsWith(path);

  useEffect(() => {
    // só tenta buscar se estiver logado
    const token = localStorage.getItem("token");
    if (!token) return;

    async function fetchLiked() {
      try {
        const { data } = await api.get("/playlists/me/liked");
        setLikedId(data?._id || null);
      } catch {
        setLikedId(null);
      }
    }

    fetchLiked();
  }, []);

  const linkStyle = (active) => ({
    color: "white",
    textDecoration: "none",
    padding: "10px 12px",
    borderRadius: 10,
    background: active ? "rgba(255,255,255,0.10)" : "transparent",
    fontWeight: active ? 800 : 600,
    display: "flex",
    alignItems: "center",
    gap: 10,
  });

  return (
    <div
      style={{
        width: 220,
        background: "#121212",
        color: "white",
        padding: 20,
        height: "100vh",
        borderRight: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <h2 style={{ marginBottom: 22 }}>Lions Music</h2>

      <nav style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <Link to="/app" style={linkStyle(isActiveExact("/app"))}>
          <span>🏠</span> Home
        </Link>

        <Link to="/app/browse" style={linkStyle(isActiveExact("/app/browse"))}>
          <span>🔎</span> Buscar
        </Link>

        {/* opção 1: Biblioteca continua */}
        <Link to="/app/library" style={linkStyle(isActiveExact("/app/library"))}>
          <span>📚</span> Biblioteca
        </Link>

        {/* Minhas Playlists */}
        <Link to="/app/playlists" style={linkStyle(isActiveExact("/app/playlists"))}>
          <span>🎶</span> Playlists
        </Link>

        {/* Curtidas destacado */}
        <Link
          to={likedId ? `/app/playlist/${likedId}` : "/app/library"}
          style={linkStyle(isActiveStartsWith("/app/playlist/"))}
        >
          <span>💚</span> Curtidas
        </Link>
      </nav>
    </div>
  );
}