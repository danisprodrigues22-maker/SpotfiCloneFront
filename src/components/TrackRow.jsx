import { useContext } from "react";
import { PlayerContext } from "../contexts/PlayerContext";

export default function TrackRow({ track, index, fullList }) {
  const { current, isPlaying, loadPlaylist } =
    useContext(PlayerContext);

  const isCurrent = current?._id === track._id;

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        padding: "10px",
        borderBottom: "1px solid rgba(255,255,255,0.05)",
        background: isCurrent ? "rgba(30,215,96,0.08)" : "transparent",
      }}
    >
      <div>
        <strong>{track.title}</strong>
        <div style={{ fontSize: 13, opacity: 0.6 }}>
          {track.artist}
        </div>
      </div>

      <button
        onClick={() => loadPlaylist(fullList, index)}
        style={{
          padding: "6px 12px",
          cursor: "pointer",
        }}
      >
        {isCurrent && isPlaying ? "Pause" : "Play"}
      </button>
    </div>
  );
}
