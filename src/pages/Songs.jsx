import { useEffect, useMemo, useState, useContext } from "react";
import api from "../services/api";
import { PlayerContext } from "../contexts/PlayerContext";
import { LikesContext } from "../contexts/LikesContext";

export default function Songs() {
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);

  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  // playlists do usuário (para dropdown)
  const [playlists, setPlaylists] = useState([]);
  const [openMenuSongId, setOpenMenuSongId] = useState(null);
  const [toast, setToast] = useState("");

  const { playTrack, current } = useContext(PlayerContext);
  const { likedIds, like, unlike } = useContext(LikesContext);

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

  // carregar playlists (para o menu)
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    async function fetchPlaylists() {
      try {
        const { data } = await api.get("/playlists");
        const list = Array.isArray(data) ? data : (data.playlists || []);

        // filtra para mostrar só playlists do usuário logado (quando possível)
        const rawUser = localStorage.getItem("user");
        const user = rawUser ? JSON.parse(rawUser) : null;

        const onlyMine =
          user?._id
            ? list.filter((p) => p.owner?._id === user._id)
            : list;

        setPlaylists(onlyMine);
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
      setToast("Adicionada à playlist ✅");
    } catch (e) {
      const msg = e?.response?.data?.message || "Erro ao adicionar";
      // se já estiver na playlist, backend pode retornar 400 "Song already in playlist"
      setToast(msg);
    } finally {
      setOpenMenuSongId(null);
      setTimeout(() => setToast(""), 1800);
    }
  }

  if (loading) return <div>Carregando músicas...</div>;

  return (
    <div onClick={() => setOpenMenuSongId(null)}>
      {/* toast simples */}
      {toast && (
        <div
          style={{
            position: "fixed",
            bottom: 90,
            left: "50%",
            transform: "translateX(-50%)",
            background: "#181818",
            border: "1px solid rgba(255,255,255,0.08)",
            padding: "10px 14px",
            borderRadius: 999,
            zIndex: 9999,
            fontWeight: 700,
          }}
        >
          {toast}
        </div>
      )}

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

      {filtered.length === 0 && <p>Nenhuma música encontrada.</p>}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 20 }}>
        {filtered.map((song) => {
          const isCurrent = current?._id === song._id;
          const liked = likedIds.has(song._id);

          return (
            <div
              key={song._id}
              onClick={(e) => {
                // se menu estiver aberto, evita clique “atrás”
                if (openMenuSongId) return;
                playTrack(song, filtered);
              }}
              style={{
                background: isCurrent ? "#2a2a2a" : "#181818",
                padding: 16,
                borderRadius: 10,
                cursor: "pointer",
                border: isCurrent ? "1px solid #555" : "1px solid transparent",
                position: "relative",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                {/* botão + menu playlist */}
                <div style={{ position: "relative" }}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenMenuSongId((prev) => (prev === song._id ? null : song._id));
                    }}
                    style={{ background: "transparent", border: "none", cursor: "pointer", fontSize: 18 }}
                    title="Adicionar à playlist"
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
                      <div style={{ fontSize: 12, opacity: 0.8, padding: "6px 8px" }}>
                        Adicionar em:
                      </div>

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

                {/* like */}
                <button
                  onClick={async (e) => {
                    e.stopPropagation();
                    try {
                      if (liked) await unlike(song._id);
                      else await like(song._id);
                    } catch {
                      console.log("Erro ao curtir/descurtir");
                    }
                  }}
                  style={{ background: "transparent", border: "none", cursor: "pointer", fontSize: 18 }}
                  title={liked ? "Descurtir" : "Curtir"}
                >
                  {liked ? "💚" : "🤍"}
                </button>
              </div>

              <img
                src={
                  song.coverUrl?.startsWith("http")
                    ? song.coverUrl
                    : `${import.meta.env.VITE_API_URL || "http://localhost:4200"}${song.coverUrl || "/uploads/covers/default.jpg"}`
                }
                alt={song.title}
                style={{
                  width: "100%",
                  height: 140,
                  objectFit: "cover",
                  borderRadius: 8,
                  marginBottom: 10,
                  background: "#333",
                }}
                onError={(e) => {
                  e.currentTarget.src = `${import.meta.env.VITE_API_URL || "http://localhost:4200"}/uploads/covers/default.jpg`;
                }}
              />

              <div style={{ fontWeight: 700 }}>{song.title}</div>
              <div style={{ fontSize: 13, opacity: 0.75 }}>{song.artist}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}