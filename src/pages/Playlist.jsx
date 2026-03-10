import { useEffect, useMemo, useState, useContext } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../services/api";
import EmptyState from "../components/EmptyState";
import { PlayerContext } from "../contexts/PlayerContext";
import { LikesContext } from "../contexts/LikesContext";

export default function Playlist() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [playlist, setPlaylist] = useState(null);
  const [loading, setLoading] = useState(true);

  // edição
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [msg, setMsg] = useState("");

  const { loadPlaylist, current } = useContext(PlayerContext);
  const { unlike, refreshLikes } = useContext(LikesContext);

  const baseHost = useMemo(
    () => import.meta.env.VITE_API_URL || "http://localhost:4200",
    []
  );

  async function fetchPlaylist() {
  try {
    const { data } = await api.get(`/playlists/${id}`);
    setPlaylist(data);

    // prepara campos de edição
    setEditName(data?.name || "");
    setEditDescription(data?.description || "");
  } catch (e) {
    const status = e?.response?.status;

    if (status === 401) {
      // o interceptor do axios já te manda pro login,
      // mas deixo por segurança caso algo mude
      navigate("/login", { replace: true });
      return;
    }

    if (status === 403) {
      alert("Você não tem permissão para acessar essa playlist.");
      navigate("/app/playlists", { replace: true });
      return;
    }

    console.log("Erro ao carregar playlist", e?.response?.data || e?.message);
  } finally {
    setLoading(false);
  }
}

  useEffect(() => {
    fetchPlaylist();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (loading) return <div>Carregando...</div>;
  if (!playlist) return <div>Playlist não encontrada.</div>;

  const songs = playlist.songs?.map((it) => it.song).filter(Boolean) || [];
  const isLikedSongs = playlist.name === "Liked Songs";

  function handlePlay() {
    if (songs.length === 0) return;
    loadPlaylist(songs, 0);
  }

  function coverOf(song) {
  const url = song?.coverUrl || "/uploads/covers/default.jpg";

  if (url.startsWith("http")) {
    return `${baseHost}/covers/proxy?url=${encodeURIComponent(url)}`;
  }

  return `${baseHost}${url}`;
}

  async function handleRemoveSong(songId) {
    try {
      if (isLikedSongs) {
        await unlike(songId);
        await refreshLikes();
      } else {
        await api.delete(`/playlists/${playlist._id}/songs/${songId}`);
      }
      await fetchPlaylist();
    } catch (e) {
      console.log("Erro ao remover música", e?.response?.data || e?.message);
    }
  }

  async function handleSaveEdit() {
    setMsg("");
    const name = editName.trim();
    const description = editDescription.trim();

    if (!name) {
      setMsg("Nome é obrigatório.");
      return;
    }

    try {
      const { data } = await api.put(`/playlists/${playlist._id}`, {
        name,
        description,
        isPublic: false,
      });
      setPlaylist(data);
      setIsEditing(false);
      setMsg("");
    } catch (e) {
      setMsg(e?.response?.data?.message || "Erro ao salvar alterações");
    }
  }

  async function handleDeletePlaylist() {
    if (isLikedSongs) return;

    const ok = window.confirm("Tem certeza que deseja excluir esta playlist?");
    if (!ok) return;

    try {
      await api.delete(`/playlists/${playlist._id}`);
      navigate("/app/playlists", { replace: true });
    } catch (e) {
      alert(e?.response?.data?.message || "Erro ao excluir playlist");
    }
  }

  return (
    <div>
      {/* Cabeçalho */}
      <div style={{ display: "flex", gap: 18, alignItems: "end", marginBottom: 18 }}>
        <div
          style={{
            width: 160,
            height: 160,
            borderRadius: 12,
            background:
              "linear-gradient(135deg, rgba(0,255,0,0.15), rgba(0,0,0,0.25))",
            display: "grid",
            placeItems: "center",
            fontSize: 42,
          }}
        >
          {isLikedSongs ? "💚" : "🎵"}
        </div>

        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 12, opacity: 0.8 }}>PLAYLIST</div>

          {!isEditing ? (
            <>
              <div style={{ fontSize: 34, fontWeight: 900, lineHeight: 1.1 }}>
                {playlist.name}
              </div>
              <div style={{ opacity: 0.8, marginTop: 8 }}>
                {playlist.description || "—"}
              </div>
            </>
          ) : (
            <div style={{ display: "grid", gap: 10, maxWidth: 520, marginTop: 6 }}>
              <input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Nome da playlist"
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: 10,
                  border: "1px solid rgba(255,255,255,0.12)",
                  background: "#121212",
                  color: "white",
                  outline: "none",
                }}
              />
              <input
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                placeholder="Descrição"
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: 10,
                  border: "1px solid rgba(255,255,255,0.12)",
                  background: "#121212",
                  color: "white",
                  outline: "none",
                }}
              />
              {msg && <div style={{ color: "salmon", fontSize: 13 }}>{msg}</div>}
              <div style={{ display: "flex", gap: 10 }}>
                <button
                  onClick={handleSaveEdit}
                  style={{
                    padding: "10px 14px",
                    borderRadius: 999,
                    border: "none",
                    cursor: "pointer",
                    fontWeight: 800,
                  }}
                >
                  Salvar
                </button>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setEditName(playlist.name || "");
                    setEditDescription(playlist.description || "");
                    setMsg("");
                  }}
                  style={{
                    padding: "10px 14px",
                    borderRadius: 999,
                    border: "1px solid rgba(255,255,255,0.18)",
                    background: "transparent",
                    color: "white",
                    cursor: "pointer",
                    fontWeight: 800,
                  }}
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}

          <div style={{ opacity: 0.8, marginTop: 6, fontSize: 13 }}>
            {playlist.owner?.name || "Você"} • {songs.length} música(s)
          </div>

          <div style={{ marginTop: 14, display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button
              onClick={handlePlay}
              disabled={songs.length === 0}
              style={{
                padding: "10px 16px",
                borderRadius: 999,
                border: "none",
                cursor: songs.length === 0 ? "not-allowed" : "pointer",
                fontWeight: 800,
              }}
            >
              ▶ Play
            </button>

            {!isLikedSongs && !isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                style={{
                  padding: "10px 14px",
                  borderRadius: 999,
                  border: "1px solid rgba(255,255,255,0.18)",
                  background: "transparent",
                  color: "white",
                  cursor: "pointer",
                  fontWeight: 800,
                }}
              >
                ✏️ Editar
              </button>
            )}

            {!isLikedSongs && (
              <button
                onClick={handleDeletePlaylist}
                style={{
                  padding: "10px 14px",
                  borderRadius: 999,
                  border: "1px solid rgba(255,255,255,0.18)",
                  background: "transparent",
                  color: "white",
                  cursor: "pointer",
                  fontWeight: 800,
                }}
              >
                🗑 Excluir
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Lista */}
      {songs.length === 0 ? (
<EmptyState
  icon="🎵"
  title="Playlist vazia"
  description="Adicione músicas para começar a curtir."
/>      ) : (
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "40px 52px 1fr 1fr 90px",
              gap: 12,
              padding: "10px 6px",
              fontSize: 12,
              opacity: 0.7,
            }}
          >
            <div>#</div>
            <div></div>
            <div>Título</div>
            <div>Artista</div>
            <div style={{ textAlign: "right" }}>Ações</div>
          </div>

          {songs.map((song, idx) => {
            const isCurrent = current?._id === song._id;

            return (
              <div
                key={song._id}
                onClick={() => loadPlaylist(songs, idx)}
                style={{
                  display: "grid",
                  gridTemplateColumns: "40px 52px 1fr 1fr 90px",
                  gap: 12,
                  alignItems: "center",
                  padding: "10px 6px",
                  cursor: "pointer",
                  background: isCurrent ? "#2a2a2a" : "transparent",
                  borderRadius: 10,
                  marginBottom: 4,
                }}
              >
                <div style={{ opacity: 0.8 }}>{idx + 1}</div>

                <img
                  src={coverOf(song)}
                  alt={song.title}
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 8,
                    objectFit: "cover",
                    background: "#333",
                  }}
                  onError={(e) => {
                    e.currentTarget.src = `${baseHost}/uploads/covers/default.jpg`;
                  }}
                />

                <div style={{ fontWeight: 700 }}>{song.title}</div>
                <div style={{ opacity: 0.8 }}>{song.artist}</div>

                <div style={{ textAlign: "right" }}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveSong(song._id);
                    }}
                    style={{
                      background: "transparent",
                      border: "none",
                      cursor: "pointer",
                      fontSize: 18,
                    }}
                    title={isLikedSongs ? "Descurtir" : "Remover da playlist"}
                  >
                    {isLikedSongs ? "💚" : "🗑️"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}