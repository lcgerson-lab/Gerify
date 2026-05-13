import { useState, useEffect, useRef } from 'react';
import { formatTime } from '../utils/format';

export default function Player({ currentTrack, onNext, onPrev, isPlaying, setIsPlaying, playerRef, playlists, onAddTrackToPlaylist, onCreatePlaylist }) {
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(80);
  const [isMuted, setIsMuted] = useState(false);
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState(false);
  const [showSaveMenu, setShowSaveMenu] = useState(false);
  const [newPlName, setNewPlName] = useState('');
  const saveMenuRef = useRef(null);
  const progressInterval = useRef(null);

  useEffect(() => {
    if (isPlaying) {
      progressInterval.current = setInterval(() => {
        if (playerRef.current?.getCurrentTime) {
          setProgress(playerRef.current.getCurrentTime());
          setDuration(playerRef.current.getDuration());
        }
      }, 500);
    } else {
      clearInterval(progressInterval.current);
    }
    return () => clearInterval(progressInterval.current);
  }, [isPlaying, playerRef]);

  useEffect(() => {
    const handler = (e) => {
      if (saveMenuRef.current && !saveMenuRef.current.contains(e.target)) setShowSaveMenu(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  if (!currentTrack) {
    return (
      <div style={{ height: 90, background: "#0f0f0f", borderTop: "1px solid #1a1a1a", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span style={{ color: "#3a3a3a", fontFamily: "'DM Sans', sans-serif", fontSize: 14 }}>Busca una canción para empezar ✦</span>
      </div>
    );
  }

  const pct = duration > 0 ? (progress / duration) * 100 : 0;

  const handleSaveTo = (playlistId) => {
    onAddTrackToPlaylist(playlistId, currentTrack);
    setShowSaveMenu(false);
  };

  const handleCreateAndSave = () => {
    if (!newPlName.trim()) return;
    const id = onCreatePlaylist(newPlName.trim());
    onAddTrackToPlaylist(id, currentTrack);
    setNewPlName('');
    setShowSaveMenu(false);
  };

  return (
    <div style={{ height: 90, background: "#0f0f0f", borderTop: "1px solid #1a1a1a", display: "flex", alignItems: "center", padding: "0 24px", gap: 24, position: "relative" }}>
      {/* Track info */}
      <div style={{ display: "flex", alignItems: "center", gap: 14, width: 260, flexShrink: 0 }}>
        <img src={currentTrack.snippet.thumbnails.default.url} alt="" style={{ width: 56, height: 42, borderRadius: 6, objectFit: "cover" }} />
        <div style={{ minWidth: 0 }}>
          <div style={{ color: "#fff", fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{currentTrack.snippet.title}</div>
          <div style={{ color: "#8a8a8a", fontFamily: "'DM Sans', sans-serif", fontSize: 12 }}>{currentTrack.snippet.channelTitle}</div>
        </div>
        {/* Save to playlist */}
        <div ref={saveMenuRef} style={{ position: "relative", flexShrink: 0 }}>
          <button onClick={() => setShowSaveMenu(v => !v)} style={{ background: "none", border: "none", color: showSaveMenu ? "#00e5a0" : "#8a8a8a", cursor: "pointer", fontSize: 16 }}>♡</button>
          {showSaveMenu && (
            <div style={{ position: "absolute", bottom: 36, left: 0, background: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: 10, padding: 12, minWidth: 200, zIndex: 100, boxShadow: "0 8px 32px rgba(0,0,0,0.6)" }}>
              <p style={{ color: "#8a8a8a", fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", marginBottom: 8 }}>Guardar en</p>
              {playlists.map(pl => (
                <button key={pl.id} onClick={() => handleSaveTo(pl.id)} style={{ display: "block", width: "100%", textAlign: "left", padding: "7px 10px", background: "transparent", border: "none", borderRadius: 6, color: "#ccc", fontFamily: "'DM Sans', sans-serif", fontSize: 13, cursor: "pointer" }}
                  onMouseEnter={e => e.currentTarget.style.background = "#2a2a2a"}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                >{pl.name}</button>
              ))}
              <div style={{ borderTop: "1px solid #2a2a2a", marginTop: 8, paddingTop: 8, display: "flex", gap: 6 }}>
                <input value={newPlName} onChange={e => setNewPlName(e.target.value)} onKeyDown={e => e.key === "Enter" && handleCreateAndSave()} placeholder="Nueva playlist..." style={{ flex: 1, background: "#0a0a0a", border: "1px solid #3a3a3a", borderRadius: 6, padding: "6px 8px", color: "#fff", fontFamily: "'DM Sans', sans-serif", fontSize: 12, outline: "none" }} />
                <button onClick={handleCreateAndSave} style={{ background: "#00e5a0", border: "none", borderRadius: 6, padding: "6px 10px", color: "#0a0a0a", fontWeight: 700, fontSize: 12, cursor: "pointer" }}>+</button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Controls */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <button onClick={() => setShuffle(!shuffle)} style={{ background: "none", border: "none", color: shuffle ? "#00e5a0" : "#8a8a8a", cursor: "pointer", fontSize: 16 }}>⇄</button>
          <button onClick={onPrev} style={{ background: "none", border: "none", color: "#ccc", cursor: "pointer", fontSize: 20 }}
            onMouseEnter={e => e.currentTarget.style.color = "#fff"}
            onMouseLeave={e => e.currentTarget.style.color = "#ccc"}
          >⏮</button>
          <button onClick={() => setIsPlaying(!isPlaying)} style={{ width: 40, height: 40, borderRadius: "50%", background: "#fff", border: "none", cursor: "pointer", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center" }}
            onMouseEnter={e => e.currentTarget.style.background = "#00e5a0"}
            onMouseLeave={e => e.currentTarget.style.background = "#fff"}
          >{isPlaying ? "⏸" : "▶"}</button>
          <button onClick={onNext} style={{ background: "none", border: "none", color: "#ccc", cursor: "pointer", fontSize: 20 }}
            onMouseEnter={e => e.currentTarget.style.color = "#fff"}
            onMouseLeave={e => e.currentTarget.style.color = "#ccc"}
          >⏭</button>
          <button onClick={() => setRepeat(!repeat)} style={{ background: "none", border: "none", color: repeat ? "#00e5a0" : "#8a8a8a", cursor: "pointer", fontSize: 16 }}>↺</button>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, width: "100%" }}>
          <span style={{ color: "#8a8a8a", fontFamily: "'DM Sans', sans-serif", fontSize: 11, width: 36, textAlign: "right" }}>{formatTime(progress)}</span>
          <div style={{ flex: 1, height: 4, background: "#2a2a2a", borderRadius: 2, cursor: "pointer" }}
            onClick={e => {
              const rect = e.currentTarget.getBoundingClientRect();
              const pct = (e.clientX - rect.left) / rect.width;
              if (playerRef.current?.seekTo) playerRef.current.seekTo(pct * duration);
            }}
          >
            <div style={{ height: "100%", width: `${pct}%`, background: "#00e5a0", borderRadius: 2 }} />
          </div>
          <span style={{ color: "#8a8a8a", fontFamily: "'DM Sans', sans-serif", fontSize: 11, width: 36 }}>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Volume */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, width: 180, flexShrink: 0, justifyContent: "flex-end" }}>
        <button onClick={() => setIsMuted(!isMuted)} style={{ background: "none", border: "none", color: "#8a8a8a", cursor: "pointer", fontSize: 16 }}>
          {isMuted ? "🔇" : "🔊"}
        </button>
        <input type="range" min="0" max="100" value={isMuted ? 0 : volume}
          onChange={e => {
            setVolume(+e.target.value);
            if (playerRef.current?.setVolume) playerRef.current.setVolume(+e.target.value);
          }}
          style={{ width: 100, accentColor: "#00e5a0", cursor: "pointer" }}
        />
      </div>
    </div>
  );
}
