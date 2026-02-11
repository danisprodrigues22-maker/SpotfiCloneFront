import { useContext } from "react";
import { AuthContext } from "../contexts/AuthContext";

export default function AppPage() {
  const { user, logout } = useContext(AuthContext);

  return (
    <div style={{ padding: 24 }}>
      <h1>SpotfyClone</h1>
      <p>Bem-vindo, {user?.name || user?.email}</p>
      <p>Esta é a página principal (placeholder).</p>
      <button onClick={() => logout()}>Sair</button>
    </div>
  );
}
