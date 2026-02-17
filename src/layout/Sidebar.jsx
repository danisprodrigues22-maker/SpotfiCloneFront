import { Link } from "react-router-dom";

export default function Sidebar() {
  return (
    <div
      style={{
        width: 220,
        background: "#121212",
        color: "white",
        padding: 20,
        height: "100vh",
      }}
    >
      <h2 style={{ marginBottom: 30 }}>Lions Music</h2>

      <nav style={{ display: "flex", flexDirection: "column", gap: 15 }}>
        <Link to="/app" style={{ color: "white", textDecoration: "none" }}>
          Home
        </Link>

        <Link to="/app/browse" style={{ color: "white", textDecoration: "none" }}>
          Buscar
        </Link>

        <Link to="/app/library" style={{ color: "white", textDecoration: "none" }}>
          Biblioteca
        </Link>
      </nav>
    </div>
  );
}
