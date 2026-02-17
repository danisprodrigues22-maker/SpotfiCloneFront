import { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";
import { AuthContext } from "../contexts/AuthContext";
import AuthLayout from "../layout/AuthLayout";

export default function Register() {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setMsg("");

    try {
      // cria conta
      await api.post("/auth/register", { name, email, password });

      // loga automaticamente
      await login(email, password);

      // vai direto para o app
      navigate("/app", { replace: true });
    } catch (err) {
      setMsg(err.response?.data?.message || "Erro ao registrar");
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
        <h2>Criar conta</h2>

        <input
          placeholder="Nome"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={inputStyle}
        />

        <input
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

        {msg && <p style={{ color: "salmon" }}>{msg}</p>}

        <button type="submit" style={buttonStyle}>
          Cadastrar
        </button>

        <p style={{ fontSize: 13, opacity: 0.8 }}>
          Já tem conta? <Link to="/login">Entrar</Link>
        </p>
      </form>
    </AuthLayout>
  );
}
