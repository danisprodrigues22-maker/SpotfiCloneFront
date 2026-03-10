import { FastAverageColor } from "fast-average-color";
import { createContext, useMemo, useState, useEffect, useRef } from "react";


export const PlayerContext = createContext();

const LS_PLAYER_KEY = "LIONS_PLAYER_STATE_V1";
const baseHost = import.meta.env.VITE_API_URL || "http://localhost:4200";

// salva só o mínimo possível (leve)
function minimizeTrack(t) {
  if (!t) return null;
  return {
    _id: t._id,
    title: t.title,
    artist: t.artist,
    coverUrl: t.coverUrl,
    audioUrl: t.audioUrl,
    streamUrl: t.streamUrl,
    url: t.url,
    duration: t.duration,
  };
}

function safeParse(json) {
  try {
    return JSON.parse(json);
  } catch {
    return null;
  }
}
function hashString(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function colorFromSeed(seed) {
  // gera um HSL agradável e estável (sempre o mesmo para a mesma música)
  const h = seed % 360;
  const s = 58;
  const l = 42;
  return `hsl(${h} ${s}% ${l}%)`;
}

function clamp(n, min, max) {
  return Math.max(min, Math.min(n, max));
}

function isValidOrder(order, len) {
  if (!Array.isArray(order) || order.length !== len) return false;
  const s = new Set(order);
  if (s.size !== len) return false;
  for (const x of order) {
    if (typeof x !== "number" || x < 0 || x >= len) return false;
  }
  return true;
}

function buildOrder(length) {
  return Array.from({ length }, (_, i) => i);
}

function buildShuffledOrder(length, currentIndex) {
  const arr = buildOrder(length).filter((i) => i !== currentIndex);
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return [currentIndex, ...arr];
}

function buildShuffledOrderNewCycle(length, avoidFirstIndex) {
  const arr = buildOrder(length);
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  if (arr.length > 1 && arr[0] === avoidFirstIndex) {
    const j = 1 + Math.floor(Math.random() * (arr.length - 1));
    [arr[0], arr[j]] = [arr[j], arr[0]];
  }
  return arr;
}

export function PlayerProvider({ children }) {
  const [state, setState] = useState({
    playlist: [],
    order: [],
    orderPos: 0,
    isPlaying: false,
    shuffleOn: false,
    repeatMode: "off",
  });

  // ✅ flag para evitar efeitos colaterais (ex: inflar plays) durante restore
  const [isRestoring, setIsRestoring] = useState(true);
  const isRestoringRef = useRef(true);

  const [themeColor, setThemeColor] = useState("#121212");
  const colorCache = useRef({});
  const fac = useRef(new FastAverageColor());

  const playlist = state.playlist;

  // ✅ currentIndex safe (evita current null se order/orderPos/playlist vierem ruins)
  const rawIndex =
    state.order.length > 0 && typeof state.orderPos === "number"
      ? state.order[state.orderPos]
      : null;

  let safeIndex = null;

  if (
    rawIndex !== null &&
    typeof rawIndex === "number" &&
    rawIndex >= 0 &&
    rawIndex < playlist.length &&
    playlist[rawIndex]
  ) {
    safeIndex = rawIndex;
  } else if (Array.isArray(playlist) && playlist.length > 0) {
    const firstValid = playlist.findIndex((t) => t && t._id);
    safeIndex = firstValid >= 0 ? firstValid : null;
  }

  const currentIndex = safeIndex;

  const current =
    currentIndex !== null && playlist[currentIndex] ? playlist[currentIndex] : null;

  // ✅ RESTORE DO STATE (boot)
  useEffect(() => {
    const raw = localStorage.getItem(LS_PLAYER_KEY);
    const saved = raw ? safeParse(raw) : null;

    if (!saved || !Array.isArray(saved.playlist) || saved.playlist.length === 0) {
      isRestoringRef.current = false;
      setIsRestoring(false);
      return;
    }

    const restoredPlaylist = saved.playlist;
    const len = restoredPlaylist.length;

    const shuffleOn = !!saved.shuffleOn;
    const repeatMode =
      saved.repeatMode === "all" || saved.repeatMode === "one" ? saved.repeatMode : "off";

    // tenta localizar música atual pelo _id
    let curIdx = -1;
    if (saved.currentTrackId) {
      curIdx = restoredPlaylist.findIndex((t) => t?._id === saved.currentTrackId);
    }

    let order = Array.isArray(saved.order) ? saved.order : [];
    let orderPos = typeof saved.orderPos === "number" ? saved.orderPos : 0;

    if (!isValidOrder(order, len)) {
      const safeStart = curIdx >= 0 ? curIdx : 0;
      order = shuffleOn ? buildShuffledOrder(len, safeStart) : buildOrder(len);
      orderPos = shuffleOn ? 0 : safeStart;
    } else {
      orderPos = clamp(orderPos, 0, order.length - 1);

      if (curIdx >= 0) {
        const pos = order.indexOf(curIdx);
        if (pos >= 0) orderPos = pos;
      }
    }

    // ✅ Fallback final: garantir que orderPos aponta para uma faixa existente
    const pointsToValidTrack =
      order.length > 0 &&
      typeof orderPos === "number" &&
      orderPos >= 0 &&
      orderPos < order.length &&
      restoredPlaylist?.[order[orderPos]];

    if (!pointsToValidTrack) {
      const firstValidIndex = restoredPlaylist.findIndex((t) => t && t._id);
      if (firstValidIndex >= 0) {
        order = shuffleOn ? buildShuffledOrder(len, firstValidIndex) : buildOrder(len);
        orderPos = shuffleOn ? 0 : firstValidIndex;
      } else {
        isRestoringRef.current = false;
        setIsRestoring(false);
        return;
      }
    }

    setState((prev) => ({
      ...prev,
      playlist: restoredPlaylist,
      order,
      orderPos,
      shuffleOn,
      repeatMode,
      isPlaying: !!saved.isPlaying,
    }));

    isRestoringRef.current = false;
    setIsRestoring(false);
  }, []);

    // 🎨 CALCULAR COR MÉDIA DA CAPA
  useEffect(() => {
    let cancelled = false;
    let objectUrl = null;

    async function run() {
      if (!current?.coverUrl) {
        setThemeColor("#121212");
        return;
      }

      const isExternal = current.coverUrl.startsWith("http");

const rawUrl = isExternal
  ? `${baseHost}/covers/proxy?url=${encodeURIComponent(current.coverUrl)}`
  : `${baseHost}${current.coverUrl}`;

      // cache
      if (colorCache.current[rawUrl]) {
        setThemeColor(colorCache.current[rawUrl]);
        return;
      }

      try {
        // capa local do seu backend (uploads) → podemos calcular de verdade
        const token = localStorage.getItem("token");

        const res = await fetch(rawUrl, {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });

        if (!res.ok) throw new Error("cover fetch failed");

        const blob = await res.blob();
        objectUrl = URL.createObjectURL(blob);

        const img = new Image();
        img.src = objectUrl;

        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
        });

        const color = await fac.current.getColorAsync(img, { algorithm: "simple" });
        const rgb = color.rgb;

        colorCache.current[rawUrl] = rgb;

        if (!cancelled) setThemeColor(rgb);
      } catch {
        // fallback estável mesmo se falhar com capa local
        const seed = hashString(String(current._id || rawUrl));
        const fallback = colorFromSeed(seed);
        colorCache.current[rawUrl] = fallback;
        if (!cancelled) setThemeColor(fallback);
      } finally {
        if (objectUrl) URL.revokeObjectURL(objectUrl);
      }
    }

    run();

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [current, baseHost]);

  function loadPlaylist(tracks, startIndex = 0) {
    setState((prev) => {
      const len = tracks.length;
      if (len === 0) {
        return {
          ...prev,
          playlist: [],
          order: [],
          orderPos: 0,
          isPlaying: false,
        };
      }

      const safeStart = Math.max(0, Math.min(startIndex, len - 1));

      const order = prev.shuffleOn ? buildShuffledOrder(len, safeStart) : buildOrder(len);
      const orderPos = prev.shuffleOn ? 0 : safeStart;

      return {
        ...prev,
        playlist: tracks,
        order,
        orderPos,
        isPlaying: true,
      };
    });
  }

  function playTrack(track, tracks = []) {
    if (tracks.length > 0) {
      const idx = tracks.findIndex((t) => t._id === track._id);
      loadPlaylist(tracks, idx >= 0 ? idx : 0);
    } else {
      loadPlaylist([track], 0);
    }
  }

  function togglePlay() {
    setState((prev) => ({ ...prev, isPlaying: !prev.isPlaying }));
  }

  function toggleShuffle() {
    setState((prev) => {
      const len = prev.playlist.length;
      const hasCurrent = prev.order.length > 0 && prev.order[prev.orderPos] !== undefined;

      const nextShuffleOn = !prev.shuffleOn;

      if (!len || !hasCurrent) {
        return { ...prev, shuffleOn: nextShuffleOn };
      }

      const curIdx = prev.order[prev.orderPos];

      const nextOrder = nextShuffleOn ? buildShuffledOrder(len, curIdx) : buildOrder(len);
      const nextOrderPos = nextShuffleOn ? 0 : curIdx;

      return {
        ...prev,
        shuffleOn: nextShuffleOn,
        order: nextOrder,
        orderPos: nextOrderPos,
      };
    });
  }

  function toggleRepeat() {
    setState((prev) => {
      const next =
        prev.repeatMode === "off"
          ? "all"
          : prev.repeatMode === "all"
          ? "one"
          : "off";
      return { ...prev, repeatMode: next };
    });
  }

  function next() {
    setState((prev) => {
      const len = prev.playlist.length;
      if (!len || prev.order.length === 0) return prev;

      const curIdx = prev.order[prev.orderPos];

      if (prev.repeatMode === "one") {
        return { ...prev, isPlaying: true };
      }

      const isLast = prev.orderPos >= prev.order.length - 1;

      if (isLast) {
        if (prev.repeatMode === "all") {
          if (prev.shuffleOn) {
            const newOrder = buildShuffledOrderNewCycle(len, curIdx);
            return {
              ...prev,
              order: newOrder,
              orderPos: 0,
              isPlaying: true,
            };
          }
          return {
            ...prev,
            order: buildOrder(len),
            orderPos: 0,
            isPlaying: true,
          };
        }
        return prev;
      }

      return { ...prev, orderPos: prev.orderPos + 1, isPlaying: true };
    });
  }

  function previous() {
    setState((prev) => {
      if (!prev.playlist.length || prev.order.length === 0) return prev;
      if (prev.orderPos <= 0) return prev;
      return { ...prev, orderPos: prev.orderPos - 1, isPlaying: true };
    });
  }

  // ✅ PERSISTÊNCIA (sempre que mudar algo relevante)
  useEffect(() => {
    if (isRestoring) return;

    // ✅ NÃO sobrescrever o último estado válido com snapshot vazio
    if (!Array.isArray(state.playlist) || state.playlist.length === 0) return;

    const len = state.playlist.length;

    const orderOk = isValidOrder(state.order, len);
    const safeOrder = orderOk ? state.order : buildOrder(len);

    const safeOrderPos = clamp(
      typeof state.orderPos === "number" ? state.orderPos : 0,
      0,
      safeOrder.length - 1
    );

    const idx = safeOrder[safeOrderPos];
    const currentTrackId = state.playlist?.[idx]?._id || null;

    const snapshot = {
      playlist: state.playlist.map(minimizeTrack),
      order: safeOrder,
      orderPos: safeOrderPos,
      shuffleOn: !!state.shuffleOn,
      repeatMode:
        state.repeatMode === "all" || state.repeatMode === "one" ? state.repeatMode : "off",
      isPlaying: !!state.isPlaying,
      currentTrackId,
      updatedAt: Date.now(),
    };

    localStorage.setItem(LS_PLAYER_KEY, JSON.stringify(snapshot));
  }, [
    isRestoring,
    state.playlist,
    state.order,
    state.orderPos,
    state.shuffleOn,
    state.repeatMode,
    state.isPlaying,
  ]);

function getQueue() {
  if (!state.playlist.length || !state.order.length) return [];

  return state.order.map((playlistIndex, index) => ({
    track: state.playlist[playlistIndex],
    playlistIndex,
    isCurrent: index === state.orderPos,
    index,
  }));
}

function queueNext(track) {
  setState((prev) => {

    let playlist = [...prev.playlist];
    let order = [...prev.order];

    let idx = playlist.findIndex((t) => t._id === track._id);

    if (idx === -1) {
      playlist.push(track);
      idx = playlist.length - 1;
    }

    const existingPos = order.indexOf(idx);

    if (existingPos !== -1) {
      order.splice(existingPos, 1);
    }

    order.splice(prev.orderPos + 1, 0, idx);

    return {
      ...prev,
      playlist,
      order
    };

  });
}

function removeFromQueue(orderIndex) {
  setState((prev) => {

    if (orderIndex === prev.orderPos) return prev;

    const newOrder = [...prev.order];
    newOrder.splice(orderIndex, 1);

    let newOrderPos = prev.orderPos;

    if (orderIndex < prev.orderPos) {
      newOrderPos -= 1;
    }

    return {
      ...prev,
      order: newOrder,
      orderPos: newOrderPos
    };
  });
}

function moveQueueItem(from, to) {
  setState((prev) => {
    const newOrder = [...prev.order];

    if (
      from === to ||
      from < 0 ||
      to < 0 ||
      from >= newOrder.length ||
      to >= newOrder.length
    ) {
      return prev;
    }

    const [moved] = newOrder.splice(from, 1);
    newOrder.splice(to, 0, moved);

    let newOrderPos = prev.orderPos;

    if (from === prev.orderPos) {
      newOrderPos = to;
    } else if (from < prev.orderPos && to >= prev.orderPos) {
      newOrderPos -= 1;
    } else if (from > prev.orderPos && to <= prev.orderPos) {
      newOrderPos += 1;
    }

    return {
      ...prev,
      order: newOrder,
      orderPos: newOrderPos,
    };
  });
}

  const value = useMemo(
  () => ({
    playlist: state.playlist,
    current,
    currentIndex,
    isPlaying: state.isPlaying,

    playTrack,
    loadPlaylist,
    togglePlay,
    next,
    previous,

    shuffleOn: state.shuffleOn,
    toggleShuffle,
    repeatMode: state.repeatMode,
    toggleRepeat,

    themeColor,

    getQueue,
    queueNext,
    removeFromQueue,
    moveQueueItem,

    isRestoring,
  }),
  [state, current, currentIndex, themeColor, isRestoring]
);

  return <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>;
}