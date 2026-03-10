import { useContext, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";
import "./Topbar.css";

export default function Topbar() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const [search, setSearch] = useState("");

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  function handleSearch(e) {
    if (e.key === "Enter" && search.trim()) {
      navigate(`/app/search?q=${encodeURIComponent(search.trim())}`);
    }
  }

  // 🔎 busca disponível em todas páginas do app
  const showSearch = location.pathname.startsWith("/app");

  return (
    <header className="topbar">
      <div className="topbar-left">

        <div className="nav-buttons">
          <button
            className="nav-btn"
            onClick={() => navigate(-1)}
            title="Voltar"
            type="button"
          >
            ←
          </button>

          <button
            className="nav-btn"
            onClick={() => navigate(1)}
            title="Avançar"
            type="button"
          >
            →
          </button>
        </div>

        {showSearch && (
          <div className="search">
            <span className="search-icon">🔍</span>

            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={handleSearch}
              placeholder="Buscar músicas ou artistas"
            />
          </div>
        )}
      </div>

      <div className="topbar-right">
        <div className="user-pill" title={user?.email}>
          <span className="user-dot" />
          <span className="user-name">
            {user?.name || user?.email}
          </span>
        </div>

        <button
          className="logout-btn"
          onClick={handleLogout}
          type="button"
        >
          Sair
        </button>
      </div>
    </header>
  );
}