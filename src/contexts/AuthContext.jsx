import { createContext, useEffect, useState } from "react";
import api from "../services/api";
export const AuthContext = createContext();
export function AuthProvider({ children }) {
const [user, setUser] = useState(null);
const [loading, setLoading] = useState(true);
useEffect(() => {
  async function loadUser() {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (!token) {
      setLoading(false);
      return;
    }

    // 👇 hidrata instantaneamente
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem("user");
      }
    }

    try {
      const { data } = await api.get("/auth/me");
      setUser(data.user);
      localStorage.setItem("user", JSON.stringify(data.user)); // mantém atualizado
    } catch (error) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  loadUser();
}, []);

19.
20.
21.
5
async function login(a, b) {
  // login com email e senha
  if (typeof a === "string" && typeof b === "string") {
    const email = a;
    const password = b;

    const { data } = await api.post("/auth/login", { email, password });

    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user)); // 👈 salva user

    setUser(data.user);
    return data;
  }

  // login com user e token já prontos
  const userData = a;
  const token = b;

  if (userData && token) {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(userData)); // 👈 salva user

    setUser(userData);
    return { user: userData, token };
  }

  throw new Error("Invalid args for login");
}

function logout() {
localStorage.removeItem("token");
localStorage.removeItem("user");
setUser(null);
}
return (
<AuthContext.Provider value={{ user, login, logout, loading }}>
{children}
</AuthContext.Provider>
);
}