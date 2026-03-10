import { useContext, useEffect, useRef, useState } from "react";
import { PlayerContext } from "../contexts/PlayerContext";
import api from "../services/api";
import QueuePanel from "../components/QueuePanel";

const baseHost = import.meta.env.VITE_API_URL || "http://localhost:4200";

const LS_AUDIO_KEY = "LIONS_AUDIO_STATE_V1";

function safeParse(json) {
  try {
    return JSON.parse(json);
  } catch {
    return null;
  }
}

function clamp(n, min, max) {
  return Math.max(min, Math.min(n, max));
}

export default function Player() {
  const {
    current,
    isPlaying,
    togglePlay,
    next,
    previous,
    shuffleOn,
    toggleShuffle,
    repeatMode,
    toggleRepeat,
    isRestoring,
  } = useContext(PlayerContext);

  const [showQueue, setShowQueue] = useState(false);

  const [animateCover, setAnimateCover] = useState(false);

  const audioRef = useRef(null);
  const skipRegisterPlayRef = useRef(true);

  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);

  const [volume, setVolume] = useState(0.8);
  const [muted, setMuted] = useState(false);

  // carregar volume salvo
  useEffect(() => {
    const saved = safeParse(localStorage.getItem(LS_AUDIO_KEY));
    if (!saved) return;

    if (typeof saved.volume === "number") setVolume(clamp(saved.volume, 0, 1));
    if (typeof saved.muted === "boolean") setMuted(saved.muted);
  }, []);

  useEffect(() => {
    skipRegisterPlayRef.current = !!isRestoring;
  }, [isRestoring]);

  useEffect(() => {
    if (!audioRef.current || !current) return;

    const audio = audioRef.current;

    if (current.audioUrl) {
      audio.src = `${baseHost}${current.audioUrl}`;
    }

    audio.volume = volume;
    audio.muted = muted;

    setProgress(0);
    setDuration(0);

    const onLoadedMetadata = () => {
      setDuration(audio.duration || 0);

      if (isPlaying) audio.play().catch(() => {});
      else audio.pause();
    };

    const onTimeUpdate = () => {
      setProgress(audio.currentTime || 0);
    };

    audio.addEventListener("loadedmetadata", onLoadedMetadata);
    audio.addEventListener("timeupdate", onTimeUpdate);

    return () => {
      audio.removeEventListener("loadedmetadata", onLoadedMetadata);
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.pause();
    };
  }, [current?._id]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !current) return;

    if (isPlaying) audio.play().catch(() => {});
    else audio.pause();
  }, [isPlaying, current?._id]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onEnded = () => {
      if (repeatMode === "one") {
        audio.currentTime = 0;
        audio.play().catch(() => {});
        return;
      }
      next();
    };

    audio.addEventListener("ended", onEnded);
    return () => audio.removeEventListener("ended", onEnded);
  }, [repeatMode, next]);

  // registrar play no backend
  useEffect(() => {
    if (!current?._id) return;

    if (skipRegisterPlayRef.current) {
      skipRegisterPlayRef.current = false;
      return;
    }

    async function registerPlay() {
      try {
        await api.patch(`/songs/${current._id}/play`);
      } catch {}

      try {
        await api.post(`/users/me/recent/${current._id}`);
      } catch {}
    }

    registerPlay();
  }, [current?._id]);

  useEffect(() => {
  if (!current) return;

  setAnimateCover(true);

  const t = setTimeout(() => {
    setAnimateCover(false);
  }, 250);

  return () => clearTimeout(t);

}, [current?._id]);

  // salvar volume
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.volume = volume;

    const saved = safeParse(localStorage.getItem(LS_AUDIO_KEY)) || {};
    localStorage.setItem(
      LS_AUDIO_KEY,
      JSON.stringify({
        ...saved,
        volume,
        muted,
        updatedAt: Date.now(),
      })
    );
  }, [volume]);

  // salvar mute
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.muted = muted;

    const saved = safeParse(localStorage.getItem(LS_AUDIO_KEY)) || {};
    localStorage.setItem(
      LS_AUDIO_KEY,
      JSON.stringify({
        ...saved,
        volume,
        muted,
        updatedAt: Date.now(),
      })
    );
  }, [muted]);

  function handleSeek(e) {
    const audio = audioRef.current;
    const value = Number(e.target.value);
    if (!audio) return;

    audio.currentTime = value;
    setProgress(value);
  }

  function formatTime(time) {
    if (!time) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60)
      .toString()
      .padStart(2, "0");
    return `${minutes}:${seconds}`;
  }

  if (!current) return null;

  return (
    <div className="player">
      <audio ref={audioRef} />

      <div style={{ display: "flex", justifyContent: "space-between", gap: 16, alignItems: "center" }}>
        
        {/* INFO */}
        <div style={{ minWidth: 260, display: "flex", alignItems: "center", gap: 12 }}>
          <img
  className={`player-cover ${animateCover ? "cover-change" : ""}`}
            src={
              current.coverUrl?.startsWith("http")
                ? current.coverUrl
                : `${baseHost}${current.coverUrl || "/uploads/covers/default.jpg"}`
            }
            alt={current.title}
            style={{
              width: 54,
              height: 54,
              borderRadius: 8,
              objectFit: "cover",
              background: "#333",
              flexShrink: 0,
            }}
            onError={(e) => {
              e.currentTarget.src = `${baseHost}/uploads/covers/default.jpg`;
            }}
          />

          <div style={{ minWidth: 0 }}>
            <div style={{ fontWeight: 700, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 180 }}>
              {current.title}
            </div>

            <div style={{ fontSize: 12, opacity: 0.75 }}>
              {current.artist}
            </div>
          </div>
        </div>

        {/* CONTROLES */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8, flex: 1 }}>
          <div style={{ display: "flex", justifyContent: "center", gap: 10 }}>
            <button onClick={toggleShuffle} style={{ opacity: shuffleOn ? 1 : 0.6 }}>🔀</button>
            <button onClick={toggleRepeat}>{repeatMode === "one" ? "🔂" : "🔁"}</button>
            <button onClick={previous}>⏮</button>
            <button onClick={togglePlay}>{isPlaying ? "⏸" : "▶"}</button>
            <button onClick={next}>⏭</button>

            <button onClick={() => setShowQueue(true)} title="Queue">
              📜
            </button>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 12, width: 44 }}>{formatTime(progress)}</span>

            <input
              type="range"
              min="0"
              max={duration || 0}
              value={progress}
              onChange={handleSeek}
              style={{ width: "100%" }}
            />

            <span style={{ fontSize: 12, width: 44 }}>
              {formatTime(duration)}
            </span>
          </div>
        </div>

        {/* VOLUME */}
        <div style={{ minWidth: 200, display: "flex", alignItems: "center", gap: 10, justifyContent: "flex-end" }}>
          <button onClick={() => setMuted((m) => !m)}>
            {muted || volume === 0 ? "🔇" : volume < 0.5 ? "🔉" : "🔊"}
          </button>

          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={muted ? 0 : volume}
            onChange={(e) => {
              const v = Number(e.target.value);
              setVolume(v);
              if (v > 0 && muted) setMuted(false);
            }}
          />
        </div>
      </div>

      {showQueue && (
        <QueuePanel onClose={() => setShowQueue(false)} />
      )}
    </div>
  );
}