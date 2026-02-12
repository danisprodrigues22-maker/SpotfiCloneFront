import { NavLink } from "react-router-dom";

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="brand">SpotfyClone</div>

      <nav className="nav">
        <NavLink to="/app" end className={({isActive}) => isActive ? "active" : ""}>Início</NavLink>
        <NavLink to="/app/browse" className={({isActive}) => isActive ? "active" : ""}>Buscar</NavLink>
        <NavLink to="/app/library" className={({isActive}) => isActive ? "active" : ""}>Sua Biblioteca</NavLink>
      </nav>

      <div className="playlists">
        <p className="small">Playlists</p>
        <ul>
          <li>Minha Playlist 1</li>
          <li>Minha Playlist 2</li>
        </ul>
      </div>
    </aside>
  );
}
