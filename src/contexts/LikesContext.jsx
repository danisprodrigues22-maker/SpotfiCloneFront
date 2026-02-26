import { createContext, useCallback, useEffect, useMemo, useState } from "react";
import api from "../services/api";

export const LikesContext = createContext();

export function LikesProvider({ children }) {
  const [likedIds, setLikedIds] = useState(new Set());
  const [loadingLikes, setLoadingLikes] = useState(true);

  const refreshLikes = useCallback(async () => {
    const token = localStorage.getItem("token");

    // ✅ sem token = usuário deslogado => não chama API
    if (!token) {
      setLikedIds(new Set());
      setLoadingLikes(false);
      return;
    }

    try {
      const { data } = await api.get("/users/me/likes");
      setLikedIds(new Set((data.songs || []).map((s) => s._id)));
    } catch {
      setLikedIds(new Set());
    } finally {
      setLoadingLikes(false);
    }
  }, []);

  useEffect(() => {
    refreshLikes();
  }, [refreshLikes]);

  const like = useCallback(async (songId) => {
    await api.post(`/users/me/likes/${songId}`);
    setLikedIds((prev) => {
      const next = new Set(prev);
      next.add(songId);
      return next;
    });
  }, []);

  const unlike = useCallback(async (songId) => {
    await api.delete(`/users/me/likes/${songId}`);
    setLikedIds((prev) => {
      const next = new Set(prev);
      next.delete(songId);
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({
      likedIds,
      loadingLikes,
      refreshLikes,
      like,
      unlike,
      isLiked: (id) => likedIds.has(id),
    }),
    [likedIds, loadingLikes, refreshLikes, like, unlike]
  );

  return <LikesContext.Provider value={value}>{children}</LikesContext.Provider>;
}