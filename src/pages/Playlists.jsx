import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

export default function Playlists() {
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [msg, setMsg] = useState("");

  const navigate = useNavigate();

  const me = useMemo(() => {
    try {
      const raw = localStorage.getItem("user");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }, []);

  async function fetchPlaylists() {
    try {
      const { data } = await api.get("/playlists");
      const list = Array.isArray(data) ? data : (data.playlists || []);

      // ✅ mostra só as playlists do usuário logado (se possível)
      const onlyMine = me?._id ? list.filter((p) => p.owner?._id === me._id) : list;

      setPlaylists(onlyMine);
    } catch (e) {
      console.log("Erro ao carregar playlists", e?.response?.data || e?.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchPlaylists();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleCreate(e) {
    e.preventDefault();
    setMsg("");

    const trimmed = name.trim();
    if (!trimmed) {
      setMsg("Digite um nome para a playlist.");
      return;
    }

    try {
      const { data } = await api.post("/playlists", {
        name: trimmed,
        description: description.trim(),
        isPublic: false,
      });

      setName("");
      setDescription("");
      setMsg("");

      // ✅ atualiza lista e abre a playlist criada
      await fetchPlaylists();
      navigate(`/app/playlist/${data._id}`);
    } catch (e) {
      setMsg(e?.response?.data?.message || "Erro ao criar playlist");
    }
  }

  async function handleDelete(e, playlistId) {
    e.stopPropagation();
    const ok = window.confirm("Excluir esta playlist?");
    if (!ok) return;

    try {
      await api.delete(`/playlists/${playlistId}`);
      await fetchPlaylists();
    } catch (err) {
      alert(err?.response?.data?.message || "Erro ao excluir playlist");
    }
  }

  if (loading) return <div>Carregando...</div>;

  return (
    <div>
      <h2 style={{ marginBottom: 14 }}>Minhas Playlists</h2>

      <form
        onSubmit={handleCreate}
        style={{
          background: "#181818",
          border: "1px solid rgba(255,255,255,0.06)",
          borderRadius: 12,
          padding: 16,
          marginBottom: 18,
          display: "grid",
          gap: 10,
          maxWidth: 520,
        }}
      >
        <div style={{ fontWeight: 800 }}>Criar playlist</div>

        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
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
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Descrição (opcional)"
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

        <button
          type="submit"
          style={{
            padding: "10px 14px",
            borderRadius: 999,
            border: "none",
            cursor: "pointer",
            fontWeight: 800,
            width: "fit-content",
          }}
        >
          + Criar
        </button>
      </form>

      {playlists.length === 0 ? (
        <p style={{ opacity: 0.8 }}>Você ainda não criou nenhuma playlist.</p>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
            gap: 16,
          }}
        >
          {playlists.map((p) => (
            <div
              key={p._id}
              onClick={() => navigate(`/app/playlist/${p._id}`)}
              style={{
                background: "#181818",
                border: "1px solid rgba(255,255,255,0.06)",
                borderRadius: 12,
                padding: 14,
                cursor: "pointer",
                position: "relative",
              }}
            >
              <button
                onClick={(e) => handleDelete(e, p._id)}
                title="Excluir"
                style={{
                  position: "absolute",
                  top: 10,
                  right: 10,
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  fontSize: 16,
                  opacity: 0.9,
                }}
              >
                🗑️
              </button>

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