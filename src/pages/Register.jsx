import { useState, useContext } from "react";
import AuthLayout from "../layout/AuthLayout";
import api from "../services/api";
import { AuthContext } from "../contexts/AuthContext";

export default function Register() {
  const { login } = useContext(AuthContext);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setMsg("");

    try {
      console.log("REGISTER ENVIANDO:", { name, email, password });

      // 1️⃣ cria usuário
      await api.post("/auth/register", {
        name,
        email,
        password,
      });

      console.log("USUÁRIO CRIADO, FAZENDO LOGIN...");

      // 2️⃣ login real
      const response = await api.post("/auth/login", {
        email,
        password,
      });

      console.log("LOGIN RESPONSE:", response.data);

      // ⚠️ IMPORTANTE: vamos pegar exatamente o que vem
      const user = response.data.user;
      const token = response.data.token;

      if (!user || !token) {
        console.error("USER OU TOKEN NÃO VEIO:", response.data);
        setMsg("Erro interno ao logar automaticamente.");
        return;
      }

      // 3️⃣ salva sessão
      login(user, token);

    } catch (err) {
      console.error("ERRO REGISTER:", err.response?.data || err.message);
      setMsg(err.response?.data?.message || "Erro ao criar usuário");
    }
  }

  return (
    <AuthLayout>
      <form
        onSubmit={handleSubmit}
        style={{
          background: "#fff",
          padding: "2rem",
          borderRadius: 8,
          minWidth: 300
        }}
      >
        <h2>Registrar</h2>

        <input
          placeholder="Nome"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{ width: "100%", marginBottom: ".8rem", padding: ".6rem" }}
        />

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ width: "100%", marginBottom: ".8rem", padding: ".6rem" }}
        />

        <input
          type="password"
          placeholder="Senha"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ width: "100%", marginBottom: "1rem", padding: ".6rem" }}
        />

        <button type="submit">Criar conta</button>

        {msg && (
          <p style={{ marginTop: "1rem", color: "red" }}>
            {msg}
          </p>
        )}
      </form>
    </AuthLayout>
  );
}
