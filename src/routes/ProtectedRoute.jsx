import { useContext } from "react";
import { AuthContext } from "../contexts/AuthContext";
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }) {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return <div>Carregando...</div>; // 🔥 espera restaurar sessão
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
