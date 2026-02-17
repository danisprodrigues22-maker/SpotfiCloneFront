import { createContext, useState } from "react";

export const PlayerContext = createContext();

export function PlayerProvider({ children }) {
  const [playlist, setPlaylist] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const current = currentIndex !== null ? playlist[currentIndex] : null;

  function loadPlaylist(tracks, startIndex = 0) {
    setPlaylist(tracks);
    setCurrentIndex(startIndex);
    setIsPlaying(true);
  }

  function playTrack(track, tracks = []) {
    if (tracks.length > 0) {
      loadPlaylist(tracks, tracks.findIndex(t => t._id === track._id));
    } else {
      setPlaylist([track]);
      setCurrentIndex(0);
    }
    setIsPlaying(true);
  }

  function togglePlay() {
    setIsPlaying(prev => !prev);
  }

  function next() {
    if (currentIndex < playlist.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setIsPlaying(true);
    }
  }

  function previous() {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      setIsPlaying(true);
    }
  }

  return (
    <PlayerContext.Provider
      value={{
        playlist,
        current,
        currentIndex,
        isPlaying,
        playTrack,
        togglePlay,
        next,
        previous,
        loadPlaylist
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
}
