import { useEffect, useMemo, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { PlayerContext } from "../contexts/PlayerContext";

export default function Library() {
  const [likedPlaylist, setLikedPlaylist] = useState(null);
  const [myPlaylists, setMyPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  const { loadPlaylist } = useContext(PlayerContext);

  const me = useMemo(() => {
    try {
      const raw = localStorage.getItem("user");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }, []);

  async function fetchAll() {
    try {
      const [likedRes, playlistsRes] = await Promise.all([
        api.get("/playlists/me/liked"),
        api.get("/playlists"),
      ]);

      setLikedPlaylist(likedRes.data);

      const list = Array.isArray(playlistsRes.data)
        ? playlistsRes.data
        : (playlistsRes.data.playlists || []);

      // mostra só as minhas (se possível)
      const onlyMine = me?._id ? list.filter((p) => p.owner?._id === me._id) : list;

      setMyPlaylists(onlyMine);
    } catch (e) {
      console.log("Erro ao carregar biblioteca", e?.response?.data || e?.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) return <div>Carregando...</div>;

  const likedSongs =
    likedPlaylist?.songs?.map((it) => it.song).filter(Boolean) || [];
  const likedId = likedPlaylist?._id;

  function handlePlayLiked() {
    if (likedSongs.length === 0) return;
    loadPlaylist(likedSongs, 0);
  }

  return (
    <div>
      <h2 style={{ marginBottom: 18 }}>Sua Biblioteca</h2>

      {/* Curtidas */}
      <div
        style={{
          display: "flex",
          gap: 16,
          alignItems: "center",
          padding: 16,
          borderRadius: 12,
          background: "#181818",
          border: "1px solid rgba(255,255,255,0.06)",
          cursor: likedId ? "pointer" : "default",
          marginBottom: 18,
        }}
        onClick={() => likedId && navigate(`/app/playlist/${likedId}`)}
      >
        <div
          style={{
            width: 72,
            height: 72,
            borderRadius: 10,
            background:
              "linear-gradient(135deg, rgba(0,255,0,0.15), rgba(0,0,0,0.2))",
            display: "grid",
            placeItems: "center",
            fontSize: 28,
          }}
        >
          💚
        </div>

        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 800, fontSize: 18 }}>
            {likedPlaylist?.name || "Liked Songs"}
          </div>
          <div style={{ opacity: 0.75, fontSize: 13, marginTop: 4 }}>
            {likedPlaylist?.description || "Suas músicas curtidas"}
          </div>
          <div style={{ opacity: 0.75, fontSize: 13, marginTop: 4 }}>
            {likedSongs.length} música(s)
          </div>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            handlePlayLiked();
          }}
          disabled={likedSongs.length === 0}
          style={{
            padding: "10px 14px",
            borderRadius: 999,
            border: "none",
            cursor: likedSongs.length === 0 ? "not-allowed" : "pointer",
            fontWeight: 800,
          }}
        >
          ▶ Play
        </button>
      </div>

      {/* Minhas playlists */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <h3 style={{ margin: 0 }}>Minhas Playlists</h3>
        <button
          onClick={() => navigate("/app/playlists")}
          style={{
            padding: "8px 12px",
            borderRadius: 999,
            border: "1px solid rgba(255,255,255,0.18)",
            background: "transparent",
            color: "white",
            cursor: "pointer",
            fontWeight: 800,
          }}
        >
          Ver tudo
        </button>
      </div>

      {myPlaylists.length === 0 ? (
        <p style={{ opacity: 0.8 }}>Você ainda não criou playlists.</p>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
            gap: 16,
          }}
        >
          {myPlaylists.map((p) => (
            <div
              key={p._id}
              onClick={() => navigate(`/app/playlist/${p._id}`)}
              style={{
                background: "#181818",
                border: "1px solid rgba(255,255,255,0.06)",
                borderRadius: 12,
                padding: 14,
                cursor: "pointer",
              }}
            >
              <div style={{ fontWeight: 900, marginBottom: 6 }}>{p.name}</div>
              <div style={{ opacity: 0.75, fontSize: 13, minHeight: 34 }}>
                {p.description || "Sem descrição"}
              </div>
              <div style={{ opacity: 0.7, fontSize: 12, marginTop: 8 }}>
                {p.songs?.length ? `${p.songs.length} música(s)` : "0 música(s)"}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}