import { useContext, useState } from "react";
import { PlayerContext } from "../contexts/PlayerContext";
import "./QueuePanel.css";

const baseHost = import.meta.env.VITE_API_URL || "http://localhost:4200";

function coverOf(song) {
  if (!song?.coverUrl) {
    return `${baseHost}/uploads/covers/default.jpg`;
  }

  if (song.coverUrl.startsWith("http")) {
    return `${baseHost}/covers/proxy?url=${encodeURIComponent(song.coverUrl)}`;
  }

  return `${baseHost}${song.coverUrl}`;
}

export default function QueuePanel({ onClose }) {
  const { getQueue, removeFromQueue, moveQueueItem } = useContext(PlayerContext);

  const [draggedIndex, setDraggedIndex] = useState(null);
  const [overIndex, setOverIndex] = useState(null);

  const queue = getQueue();
  const current = queue.find((q) => q.isCurrent);
const currentIndex = queue.find((q) => q.isCurrent)?.index ?? 0;
const nextTracks = queue.filter((q) => q.index > currentIndex);
  function handleDragStart(index) {
    setDraggedIndex(index);
  }

  function handleDragOver(e, index) {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    setOverIndex(index);
  }

  function handleDrop(index) {
    if (draggedIndex === null || draggedIndex === index) {
      setDraggedIndex(null);
      setOverIndex(null);
      return;
    }

    moveQueueItem(draggedIndex, index);

    setDraggedIndex(null);
    setOverIndex(null);
  }

  function handleDragEnd() {
    setDraggedIndex(null);
    setOverIndex(null);
  }

  return (
    <div className="queue-panel">
      <div className="queue-header">
        <h3>Fila</h3>
        <button className="queue-close" onClick={onClose}>✕</button>
      </div>

      {current && (
        <>
          <div className="queue-section-title">Agora tocando</div>

          <div className="queue-item playing">
            <span className="queue-playing-icon">▶</span>

            <img
              src={coverOf(current.track)}
              alt={current.track.title}
              onError={(e) => {
                e.currentTarget.src = `${baseHost}/uploads/covers/default.jpg`;
              }}
            />

            <div className="queue-text">
              <div className="queue-title">{current.track.title}</div>
              <div className="queue-artist">{current.track.artist}</div>
            </div>
          </div>
        </>
      )}

      <div className="queue-section-title">Próximas</div>

      {nextTracks.length === 0 && (
        <p className="queue-empty">Nenhuma música na fila</p>
      )}

      {nextTracks.map((item) => (
        <div
          key={item.index}
          className={`queue-item draggable ${
            overIndex === item.index ? "drag-over" : ""
          } ${draggedIndex === item.index ? "dragging" : ""}`}
          draggable
          onDragStart={() => handleDragStart(item.index)}
          onDragOver={(e) => handleDragOver(e, item.index)}
          onDrop={() => handleDrop(item.index)}
          onDragEnd={handleDragEnd}
        >
          <span className="queue-drag-handle">☰</span>

          <img
            src={coverOf(item.track)}
            alt={item.track.title}
            onError={(e) => {
              e.currentTarget.src = `${baseHost}/uploads/covers/default.jpg`;
            }}
          />

          <div className="queue-text">
            <div className="queue-title">{item.track.title}</div>
            <div className="queue-artist">{item.track.artist}</div>
          </div>

          <button
            className="queue-remove"
            onClick={() => removeFromQueue(item.index)}
          >
            Remover
          </button>
        </div>
      ))}
    </div>
  );
}