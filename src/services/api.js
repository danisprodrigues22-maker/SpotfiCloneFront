import axios from "axios";

const baseURL = import.meta.env.VITE_API_URL || "http://localhost:4200";

const api = axios.create({
  baseURL: `${baseURL}/api`,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const currentPath = window.location.pathname;

    if (status === 401) {
      const hadToken = !!localStorage.getItem("token");

      // limpa sempre
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      // ✅ só redireciona se realmente "estava logado"
      // e se não estiver já em login/register
      if (
        hadToken &&
        currentPath !== "/login" &&
        currentPath !== "/register"
      ) {
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

export default api;