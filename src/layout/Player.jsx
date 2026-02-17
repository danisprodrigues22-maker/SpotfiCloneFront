import { useContext, useEffect, useRef, useState } from "react";
import { PlayerContext } from "../contexts/PlayerContext";

export default function Player() {
  const { current, isPlaying, togglePlay, next, previous } =
    useContext(PlayerContext);

  const audioRef = useRef(null);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);

  const [volume, setVolume] = useState(0.8);
  const [muted, setMuted] = useState(false);

  useEffect(() => {
    if (!audioRef.current || !current) return;

    const audio = audioRef.current;

    audio.src = `http://localhost:4200${current.audioUrl}`;
    audio.currentTime = 0;

    // aplica volume/mute ao trocar faixa
    audio.volume = volume;
    audio.muted = muted;

    setProgress(0);
    setDuration(0);

    audio.play().catch(() => {});

    audio.onloadedmetadata = () => {
      setDuration(audio.duration || 0);
    };

    audio.ontimeupdate = () => {
      setProgress(audio.currentTime);
    };

    audio.onended = () => {
      next();
    };

    return () => {
      audio.pause();
    };
  }, [current]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !current) return;

    if (isPlaying) audio.play().catch(() => {});
    else audio.pause();
  }, [isPlaying, current]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = volume;
  }, [volume]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.muted = muted;
  }, [muted]);

  function handleSeek(e) {
    const audio = audioRef.current;
    const value = Number(e.target.value);
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
        {/* Info (capa + texto) */}
<div style={{ minWidth: 260, display: "flex", alignItems: "center", gap: 12 }}>
  <div
    style={{
      width: 54,
      height: 54,
      borderRadius: 8,
      background: "#333",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: 22,
      flexShrink: 0,
    }}
    title="Capa (placeholder)"
  >
    🎵
  </div>

  <div style={{ minWidth: 0 }}>
    <div
      style={{
        fontWeight: 700,
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
        maxWidth: 180,
      }}
      title={current.title}
    >
      {current.title}
    </div>

    <div
      style={{
        fontSize: 12,
        opacity: 0.75,
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
        maxWidth: 180,
      }}
      title={current.artist}
    >
      {current.artist}
    </div>
  </div>
</div>


        {/* Controles */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8, flex: 1 }}>
          <div style={{ display: "flex", justifyContent: "center", gap: 10 }}>
            <button onClick={previous}>⏮</button>
            <button onClick={togglePlay}>{isPlaying ? "⏸" : "▶"}</button>
            <button onClick={next}>⏭</button>
          </div>

          {/* Progresso */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 12, width: 44, textAlign: "right", opacity: 0.8 }}>
              {formatTime(progress)}
            </span>

            <input
              type="range"
              min="0"
              max={duration || 0}
              value={progress}
              onChange={handleSeek}
              style={{ width: "100%" }}
            />

            <span style={{ fontSize: 12, width: 44, opacity: 0.8 }}>
              {formatTime(duration)}
            </span>
          </div>
        </div>

        {/* Volume */}
        <div style={{ minWidth: 200, display: "flex", alignItems: "center", gap: 10, justifyContent: "flex-end" }}>
          <button onClick={() => setMuted((m) => !m)} title="Mute">
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
            style={{ width: 120 }}
          />
        </div>
      </div>
    </div>
  );
}
