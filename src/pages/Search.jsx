import { useEffect, useState, useContext } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../services/api";
import SongGrid from "../components/SongGrid";
import { PlayerContext } from "../contexts/PlayerContext";

export default function Search() {
  const [params] = useSearchParams();
  const query = params.get("q") || "";

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const { loadPlaylist } = useContext(PlayerContext);

  useEffect(() => {
    if (!query) {
      setResults([]);
      return;
    }

    const timeout = setTimeout(async () => {
      try {
        setLoading(true);

        const { data } = await api.get(
          "/songs/search?q=" + encodeURIComponent(query)
        );

        setResults(data.songs || []);
      } catch (err) {
        console.error("Erro na busca", err);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timeout);
  }, [query]);

  function handlePlay(index) {
    loadPlaylist(results, index);
  }

  if (!query) {
    return <div style={{ padding: 30 }}>Digite algo para buscar</div>;
  }

  if (loading) {
    return <div style={{ padding: 30 }}>Buscando...</div>;
  }

  if (!results.length) {
    return <div style={{ padding: 30 }}>Nenhuma música encontrada</div>;
  }

  return (
    <div style={{ padding: 30 }}>
      <h2>Resultados para "{query}"</h2>

      <SongGrid songs={results} onPlay={handlePlay} />
    </div>
  );
}