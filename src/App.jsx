import { Routes, Route, Navigate } from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";

import AppLayout from "./layout/AppLayout";
import AppHome from "./pages/AppHome";
import Songs from "./pages/Songs";
import Library from "./pages/Library";
import Playlist from "./pages/Playlist";
import Playlists from "./pages/Playlists";

import ProtectedRoute from "./routes/ProtectedRoute";

export default function App() {
  const hasToken = !!localStorage.getItem("token");

  return (
    <Routes>
      {/* padrão: se logado vai pro app, senão vai pro login */}
      <Route
        path="/"
        element={hasToken ? <Navigate to="/app" replace /> : <Navigate to="/login" replace />}
      />

      {/* (opcional) manter Home acessível */}
      <Route path="/home" element={<Home />} />

      {/* públicas */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* área autenticada */}
      <Route
        path="/app"
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AppHome />} />
        <Route path="browse" element={<Songs />} />

        {/* opção 1: manter Biblioteca */}
        <Route path="library" element={<Library />} />

        {/* playlists */}
        <Route path="playlists" element={<Playlists />} />
        <Route path="playlist/:id" element={<Playlist />} />
      </Route>

      {/* fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}