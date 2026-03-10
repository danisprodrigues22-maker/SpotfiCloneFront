import "./SongGrid.css";

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

export default function SongGrid({ songs, onPlay }) {
  return (
    <div className="song-grid">
      {songs.map((song, index) => (
        <div
  key={song._id}
  className="card-hover"
  onClick={() => onPlay(index)}
  style={{
    background: "#181818",
    padding: 14,
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.06)",
    cursor: "pointer",
    position: "relative"
  }}
>

  <img
    src={coverOf(song)}
    alt={song.title}
    className="song-cover"
  />

  <div className="song-info">
    <div className="song-title">{song.title}</div>
    <div className="song-artist">{song.artist}</div>
  </div>

  <div
    className="play-overlay"
    onClick={(e) => {
      e.stopPropagation();
      onPlay(index);
    }}
  >
    ▶
  </div>

</div>
      ))}
    </div>
  );
}