// src/pages/Login.jsx
import { useState, useContext } from "react";
import { AuthContext } from "../contexts/AuthContext";
import AuthLayout from "../layout/AuthLayout";

export default function Login() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [msg, setMsg] = useState("");
  const { login } = useContext(AuthContext);

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      await login(email, senha);
    } catch (err) {
      setMsg(err.response?.data?.message || "Erro ao logar");
    }
  }

  return (
    <AuthLayout>
      <form onSubmit={handleSubmit} style={{ background: "#fff", padding: "2rem", borderRadius: 8, minWidth: 300 }}>
        <h2>Login</h2>
        <input placeholder="Email" value={email} onChange={(e)=>setEmail(e.target.value)} style={{ width: "100%", marginBottom: ".8rem", padding: ".6rem" }} />
        <input type="password" placeholder="Senha" value={senha} onChange={(e)=>setSenha(e.target.value)} style={{ width: "100%", marginBottom: "1rem", padding: ".6rem" }} />
        <button type="submit">Entrar</button>
        {msg && <p style={{ marginTop: "1rem" }}>{msg}</p>}
      </form>
    </AuthLayout>
  );
}
