import { useEffect, useMemo, useState, useContext } from "react";
import api from "../services/api";
import { PlayerContext } from "../contexts/PlayerContext";

export default function Songs() {
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  const { playTrack, current } = useContext(PlayerContext);

  useEffect(() => {
    async function fetchSongs() {
      try {
        const { data } = await api.get("/songs");
        setSongs(data.songs || data);
      } catch (error) {
        console.log("Erro ao carregar músicas");
      } finally {
        setLoading(false);
      }
    }

    fetchSongs();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return songs;

    return songs.filter((s) => {
      const t = (s.title || "").toLowerCase();
      const a = (s.artist || "").toLowerCase();
      return t.includes(q) || a.includes(q);
    });
  }, [songs, query]);

  if (loading) return <div>Carregando músicas...</div>;

  return (
    <div>
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

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
          gap: 20,
        }}
      >
        {filtered.map((song) => {
          const isCurrent = current?._id === song._id;

          return (
            <div
              key={song._id}
              onClick={() => playTrack(song, filtered)}
              style={{
                background: isCurrent ? "#2a2a2a" : "#181818",
                padding: 16,
                borderRadius: 10,
                cursor: "pointer",
                border: isCurrent ? "1px solid #555" : "1px solid transparent",
                transition: "0.2s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#282828")}
              onMouseLeave={(e) => (e.currentTarget.style.background = isCurrent ? "#2a2a2a" : "#181818")}
            >
              <div
                style={{
                  width: "100%",
                  height: 140,
                  background: "#333",
                  borderRadius: 8,
                  marginBottom: 10,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 26,
                }}
              >
                🎵
              </div>

              <div style={{ fontWeight: 700, marginBottom: 4, lineHeight: 1.2 }}>
                {song.title}
              </div>
              <div style={{ fontSize: 13, opacity: 0.75 }}>{song.artist}</div>

              {isCurrent && (
                <div style={{ marginTop: 10, fontSize: 12, opacity: 0.9 }}>
                  Tocando agora ✅
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
