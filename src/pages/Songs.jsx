import { useEffect, useMemo, useState, useContext } from "react";
import api from "../services/api";
import EmptyState from "../components/EmptyState";
import { PlayerContext } from "../contexts/PlayerContext";
import { LikesContext } from "../contexts/LikesContext";
import { ToastContext } from "../contexts/ToastContext";

const baseHost = import.meta.env.VITE_API_URL || "http://localhost:4200";

function coverOf(song) {
  if (!song?.coverUrl) {
    return `${baseHost}/uploads/covers/default.jpg`;
  }

  if (song.coverUrl.startsWith("http")) {
    return `${baseHost}/covers/proxy?url=${encodeURIComponent(song.coverUrl)}`;
  }

  return `${baseHost}${song.coverUrl}`;
}

export default function Songs() {
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);

  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  const [playlists, setPlaylists] = useState([]);
  const [openMenuSongId, setOpenMenuSongId] = useState(null);

  const { playTrack, current, queueNext } = useContext(PlayerContext);
  const { likedIds, like, unlike } = useContext(LikesContext);
  const { showToast } = useContext(ToastContext);

  // debounce busca
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(t);
  }, [query]);

  // carregar músicas
  useEffect(() => {
    async function fetchSongs() {
      try {
        const { data } = await api.get("/songs");
        setSongs(data.songs || data);
      } catch {
        console.log("Erro ao carregar músicas");
      } finally {
        setLoading(false);
      }
    }
    fetchSongs();
  }, []);

  // carregar playlists
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    async function fetchPlaylists() {
      try {
        const { data } = await api.get("/playlists/me");
        const list = Array.isArray(data) ? data : data.playlists || [];
        setPlaylists(list);
      } catch {
        setPlaylists([]);
      }
    }

    fetchPlaylists();
  }, []);

  const filtered = useMemo(() => {
    const q = debouncedQuery.trim().toLowerCase();
    if (!q) return songs;

    return songs.filter((s) => {
      const t = (s.title || "").toLowerCase();
      const a = (s.artist || "").toLowerCase();
      return t.includes(q) || a.includes(q);
    });
  }, [songs, debouncedQuery]);

  async function addToPlaylist(playlistId, songId) {
    try {
      await api.post(`/playlists/${playlistId}/songs`, { songId });
      showToast("Adicionada à playlist ✅");
    } catch (e) {
      const msg = e?.response?.data?.message || "Erro ao adicionar";
      showToast(msg);
    } finally {
      setOpenMenuSongId(null);
    }
  }

  if (loading) return <div>Carregando músicas...</div>;

  return (
    <div onClick={() => setOpenMenuSongId(null)}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
        <h2 style={{ margin: 0 }}>Buscar</h2>

        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar por título ou artista..."
          style={{
            flex: 1,
            maxWidth: 420,
            padding: "10px 12px",
            borderRadius: 8,
            border: "1px solid #333",
            background: "#121212",
            color: "white",
          }}
        />
      </div>

      {filtered.length === 0 && (
        <EmptyState
          icon="🔎"
          title="Nenhuma música encontrada"
          description="Tente buscar por outro nome ou artista."
        />
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
          gap: 20,
        }}
      >
        {filtered.map((song) => {
          const isCurrent = current?._id === song._id;
          const liked = likedIds.has(song._id);

          return (
            <div
              key={song._id}
              className="card-hover"
              onClick={() => playTrack(song, filtered)}
              style={{
                background: isCurrent ? "#2a2a2a" : "#181818",
                padding: 16,
                borderRadius: 10,
                cursor: "pointer",
                border: isCurrent ? "1px solid #555" : "1px solid transparent",
                position: "relative",
              }}
            >
              {/* MENU SUPERIOR */}
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <div style={{ position: "relative" }}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenMenuSongId((prev) => (prev === song._id ? null : song._id));
                    }}
                    style={{
                      background: "transparent",
                      border: "none",
                      cursor: "pointer",
                      fontSize: 18,
                    }}
                  >
                    ➕
                  </button>

                  {openMenuSongId === song._id && (
                    <div
                      onClick={(e) => e.stopPropagation()}
                      style={{
                        position: "absolute",
                        top: 28,
                        left: 0,
                        background: "#121212",
                        border: "1px solid rgba(255,255,255,0.10)",
                        borderRadius: 12,
                        padding: 8,
                        minWidth: 180,
                        zIndex: 50,
                      }}
                    >
                      <button
                        onClick={() => {
                          queueNext(song);
                          showToast("Adicionada à fila 🎧");
                          setOpenMenuSongId(null);
                        }}
                        style={{
                          width: "100%",
                          textAlign: "left",
                          padding: "8px 10px",
                          borderRadius: 10,
                          border: "none",
                          background: "transparent",
                          color: "white",
                          cursor: "pointer",
                          fontWeight: 600,
                        }}
                      >
                        🎧 Adicionar à fila
                      </button>

                      <div
                        style={{
                          height: 1,
                          background: "rgba(255,255,255,0.08)",
                          margin: "6px 0",
                        }}
                      />

                      {playlists.length === 0 ? (
                        <div style={{ padding: "6px 8px", opacity: 0.75, fontSize: 13 }}>
                          Você ainda não criou playlists.
                        </div>
                      ) : (
                        playlists.map((p) => (
                          <button
                            key={p._id}
                            onClick={() => addToPlaylist(p._id, song._id)}
                            style={{
                              width: "100%",
                              textAlign: "left",
                              padding: "8px 10px",
                              borderRadius: 10,
                              border: "none",
                              background: "transparent",
                              color: "white",
                              cursor: "pointer",
                            }}
                          >
                            {p.name}
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>

                <button
                  onClick={async (e) => {
                    e.stopPropagation();
                    try {
                      if (liked) {
                        await unlike(song._id);
                        showToast("Removida das curtidas");
                      } else {
                        await like(song._id);
                        showToast("Adicionada às curtidas 💚");
                      }
                    } catch {
                      showToast("Erro ao curtir");
                    }
                  }}
                  style={{
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                    fontSize: 18,
                  }}
                >
                  {liked ? "💚" : "🤍"}
                </button>
              </div>

              {/* CAPA */}
              <img
                src={coverOf(song)}
                alt={song.title}
                style={{
                  width: "100%",
                  height: 140,
                  objectFit: "cover",
                  borderRadius: 8,
                  marginBottom: 10,
                  background: "#333",
                }}
              />

              {/* PLAY HOVER */}
              <div
                className="play-overlay"
                onClick={(e) => {
                  e.stopPropagation();
                  playTrack(song, filtered);
                }}
              >
                ▶
              </div>

              <div style={{ fontWeight: 700 }}>{song.title}</div>
              <div style={{ fontSize: 13, opacity: 0.75 }}>{song.artist}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}