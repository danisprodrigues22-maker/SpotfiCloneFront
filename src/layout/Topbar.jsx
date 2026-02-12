import { useContext } from "react";
import { AuthContext } from "../contexts/AuthContext";

export default function Topbar() {
  const { user } = useContext(AuthContext);

  return (
    <header className="topbar">
      <div className="search-placeholder">🔍 Buscar</div>
      <div className="user-info">
        <span>{user?.name || user?.email}</span>
      </div>
    </header>
  );
}
