import { useEffect, useState, useContext, useMemo } from "react";
import api from "../services/api";
import { PlayerContext } from "../contexts/PlayerContext";
import SkeletonCard from "../components/SkeletonCard";

export default function AppHome() {
  const [recent, setRecent] = useState([]);
  const [topSongs, setTopSongs] = useState([]);
  const [myTop, setMyTop] = useState([]);

  const [loadingRecent, setLoadingRecent] = useState(true);
  const [loadingTop, setLoadingTop] = useState(true);
  const [loadingMyTop, setLoadingMyTop] = useState(true);

  const { loadPlaylist } = useContext(PlayerContext);

  const baseHost = useMemo(
    () => import.meta.env.VITE_API_URL || "http://localhost:4200",
    []
  );

  // 🔥 Recentemente tocadas
  useEffect(() => {
    async function fetchRecent() {
      try {
        const { data } = await api.get("/users/me/recent");
        setRecent(data.songs || []);
      } catch {
        setRecent([]);
      } finally {
        setLoadingRecent(false);
      }
    }

    fetchRecent();
  }, []);

  // 🔥 Mais tocadas (GLOBAL)
  useEffect(() => {
    async function fetchTop() {
      try {
        const { data } = await api.get("/songs/top?limit=10");
        setTopSongs(data.songs || []);
      } catch {
        setTopSongs([]);
      } finally {
        setLoadingTop(false);
      }
    }

    fetchTop();
  }, []);

  // 🎯 Suas mais tocadas (INDIVIDUAL)
  useEffect(() => {
    async function fetchMyTop() {
      try {
        const { data } = await api.get("/users/me/top");
        setMyTop(data.songs || []);
      } catch {
        setMyTop([]);
      } finally {
        setLoadingMyTop(false);
      }
    }

    fetchMyTop();
  }, []);

  return (
    <div>
      <h2 style={{ marginBottom: 24 }}>Início</h2>

      {/* ============================= */}
      {/* RECENTEMENTE TOCADAS */}
      {/* ============================= */}

      <h3 style={{ marginBottom: 12 }}>Tocadas recentemente</h3>

      {loadingRecent ? (
        <GridSkeleton />
      ) : recent.length === 0 ? (
        <p style={{ opacity: 0.8 }}>
          Você ainda não tocou nenhuma música.
        </p>
      ) : (
        <SongGrid songs={recent.slice(0, 16)} loadPlaylist={loadPlaylist} baseHost={baseHost} />
      )}

      {/* ============================= */}
      {/* MAIS TOCADAS (GLOBAL) */}
      {/* ============================= */}

      <h3 style={{ marginTop: 40, marginBottom: 12 }}>
        🔥 Mais tocadas
      </h3>

      {loadingTop ? (
        <GridSkeleton />
      ) : topSongs.length === 0 ? (
        <p style={{ opacity: 0.8 }}>
          Nenhuma música foi tocada ainda.
        </p>
      ) : (
        <SongGrid songs={topSongs} loadPlaylist={loadPlaylist} />
      )}

      {/* ============================= */}
      {/* SUAS MAIS TOCADAS */}
      {/* ============================= */}

      <h3 style={{ marginTop: 40, marginBottom: 12 }}>
        🎯 Suas mais tocadas
      </h3>

      {loadingMyTop ? (
        <GridSkeleton />
      ) : myTop.length === 0 ? (
        <p style={{ opacity: 0.8 }}>
          Ouça mais músicas para gerar seu ranking pessoal.
        </p>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
            gap: 16,
          }}
        >
          {myTop.map((song, index) => (
            <div
              key={song._id}
              className="card-hover"
              onClick={() => loadPlaylist(myTop, index)}
              style={{
                background: "#181818",
                padding: 14,
                borderRadius: 12,
                border: "1px solid rgba(255,255,255,0.06)",
                cursor: "pointer",
                position: "relative",
              }}
            >
              <div style={{ fontWeight: 800 }}>{song.title}</div>
              <div style={{ fontSize: 13, opacity: 0.75 }}>
                {song.artist}
              </div>
              <div style={{ fontSize: 12, opacity: 0.6, marginTop: 6 }}>
                🔁 {song.count} plays
              </div>

              <div
                className="play-overlay"
                onClick={(e) => {
                  e.stopPropagation();
                  loadPlaylist(myTop, index);
                }}
              >
                ▶
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ============================= */
/* COMPONENTES AUXILIARES */
/* ============================= */

function GridSkeleton() {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
        gap: 16,
      }}
    >
      {Array.from({ length: 6 }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

function SongGrid({ songs, loadPlaylist, baseHost }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
        gap: 16,
      }}
    >
      {songs.map((song, index) => (
        <div
          key={song._id}
          className="card-hover"
          onClick={() => loadPlaylist(songs, index)}
          style={{
            background: "#181818",
            padding: 14,
            borderRadius: 12,
            border: "1px solid rgba(255,255,255,0.06)",
            cursor: "pointer",
            position: "relative",
          }}
        >
          {baseHost && (
            <img
              src={
                song.coverUrl?.startsWith("http")
                  ? song.coverUrl
                  : `${baseHost}${song.coverUrl || "/uploads/covers/default.jpg"}`
              }
              alt={song.title}
              style={{
                width: "100%",
                height: 120,
                objectFit: "cover",
                borderRadius: 8,
                marginBottom: 8,
                background: "#333",
              }}
            />
          )}

          <div style={{ fontWeight: 800 }}>{song.title}</div>
          <div style={{ fontSize: 13, opacity: 0.75 }}>
            {song.artist}
          </div>

          {song.plays !== undefined && (
            <div style={{ fontSize: 12, opacity: 0.6, marginTop: 6 }}>
              ▶ {song.plays} plays
            </div>
          )}

          <div
            className="play-overlay"
            onClick={(e) => {
              e.stopPropagation();
              loadPlaylist(songs, index);
            }}
          >
            ▶
          </div>
        </div>
      ))}
    </div>
  );
}