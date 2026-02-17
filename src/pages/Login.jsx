import { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";
import AuthLayout from "../layout/AuthLayout";

export default function Login() {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    try {
      await login(email, password);
      navigate("/app", { replace: true });
    } catch (err) {
      setError("Credenciais inválidas");
    }
  }

  const inputStyle = {
    width: "100%",
    padding: "10px 12px",
    borderRadius: 10,
    border: "1px solid rgba(255,255,255,0.12)",
    background: "#121212",
    color: "white",
    outline: "none",
  };

  const buttonStyle = {
    width: "100%",
    padding: "10px 12px",
    borderRadius: 999,
    border: "none",
    background: "#1db954",
    color: "black",
    fontWeight: 800,
    cursor: "pointer",
  };

  return (
    <AuthLayout>
      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", flexDirection: "column", gap: 12 }}
      >
        <h2>Entrar</h2>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={inputStyle}
        />

        <input
          type="password"
          placeholder="Senha"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={inputStyle}
        />

        {error && <p style={{ color: "salmon" }}>{error}</p>}

        <button type="submit" style={buttonStyle}>
          Entrar
        </button>

        <p style={{ fontSize: 13, opacity: 0.8 }}>
          Não tem conta? <Link to="/register">Criar conta</Link>
        </p>
      </form>
    </AuthLayout>
  );
}
