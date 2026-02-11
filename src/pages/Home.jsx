import AuthLayout from "../layout/AuthLayout";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const nav = useNavigate();
  return (
    <AuthLayout>
      <div style={{ background: "#fff", padding: 24, borderRadius: 8 }}>
        <h1>Bem-vindo ao SpotfyClone</h1>
        <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
          <button onClick={() => nav("/login")} style={{ padding: "8px 12px" }}>
            Entrar
          </button>
          <button onClick={() => nav("/register")} style={{ padding: "8px 12px" }}>
            Registrar
          </button>
        </div>
      </div>
    </AuthLayout>
  );
}
