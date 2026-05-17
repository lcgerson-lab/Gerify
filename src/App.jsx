import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Player from './components/Player';
import MiniPlayer from './components/MiniPlayer';
import BottomNav from './components/BottomNav';
import YouTubePlayer from './components/YouTubePlayer';
import ExpandedPlayer from './components/ExpandedPlayer';
import HomeView from './views/HomeView';
import SearchView from './views/SearchView';
import LibraryView from './views/LibraryView';
import { useLocalStorage } from './hooks/useLocalStorage';
import { useIsMobile } from './hooks/useIsMobile';
import { PLAYLIST_COLORS } from './constants';

const CSS_VARS = `
  :root {
    --bg: oklch(0.14 0.01 240);
    --bg-2: oklch(0.18 0.01 240);
    --surface: oklch(0.21 0.01 240);
    --surface-2: oklch(0.26 0.01 240);
    --surface-3: oklch(0.32 0.01 240);
    --line: oklch(0.30 0.01 240 / 0.6);
    --text: oklch(0.97 0 0);
    --text-mute: oklch(0.70 0.01 240);
    --text-dim: oklch(0.55 0.01 240);
    --green: oklch(0.78 0.17 155);
    --green-2: oklch(0.68 0.16 158);
  }
  * { margin: 0; padding: 0; box-sizing: border-box; scrollbar-width: thin; scrollbar-color: var(--surface-2) var(--bg); }
  ::-webkit-scrollbar { width: 6px; }
  ::-webkit-scrollbar-track { background: var(--bg); }
  ::-webkit-scrollbar-thumb { background: var(--surface-2); border-radius: 3px; }
  button { -webkit-tap-highlight-color: transparent; }
  input[type=range] { height: 4px; accent-color: var(--green); }
  body { font-family: 'Manrope', sans-serif; background: var(--bg); color: var(--text); }
`;

function AppLayout() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const isMobile = useIsMobile();
  const playerRef = useRef(null);

  // Playback
  const [currentTrack, setCurrentTrack] = useState(null);
  const [queue, setQueue] = useLocalStorage('gerify_queue', []);
  const [history, setHistory] = useLocalStorage('gerify_history', []);
  const [isPlaying, setIsPlaying] = useState(false);

  // Player state (lifted from Player.jsx)
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useLocalStorage('gerify_volume', 80);
  const [muted, setMuted] = useState(false);
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState('off'); // 'off' | 'all' | 'one'

  // UI state
  const [expanded, setExpanded] = useState(false);
  const [showQueue, setShowQueue] = useState(false);

  // Library
  const [playlists, setPlaylists] = useLocalStorage('gerify_playlists', []);
  const [liked, setLiked] = useLocalStorage('gerify_liked', []);
  const likedIds = useMemo(() => new Set(liked.map(i => i.id?.videoId).filter(Boolean)), [liked]);

  // Progress polling
  useEffect(() => {
    if (!isPlaying) return;
    const id = setInterval(() => {
      if (playerRef.current?.getCurrentTime) {
        const cur = playerRef.current.getCurrentTime();
        const dur = playerRef.current.getDuration();
        if (!isNaN(cur) && cur >= 0) setProgress(cur);
        if (!isNaN(dur) && dur > 0) setDuration(dur);
      }
    }, 500);
    return () => clearInterval(id);
  }, [isPlaying]);

  // Volume sync to player
  useEffect(() => {
    if (playerRef.current?.setVolume) playerRef.current.setVolume(muted ? 0 : volume);
  }, [volume, muted]);

  const toggleLike = useCallback((track) => {
    const vid = track?.id?.videoId;
    if (!vid) return;
    setLiked(l =>
      l.some(t => t.id?.videoId === vid) ? l.filter(t => t.id?.videoId !== vid) : [...l, track]
    );
  }, [setLiked]);

  const playTrack = useCallback((track) => {
    setCurrentTrack(prev => {
      if (prev) setHistory(h => [prev, ...h.slice(0, 49)]);
      return track;
    });
    setIsPlaying(true);
    setProgress(0);
    setDuration(0);
    setQueue(q => q.filter(t => t.id.videoId !== track.id.videoId));
  }, [setQueue]);

  const handleNext = useCallback(() => {
    setQueue(q => {
      if (q.length === 0) {
        if (repeat === 'all' || repeat === 'one') {
          setIsPlaying(true);
          if (playerRef.current?.seekTo) playerRef.current.seekTo(0);
        } else {
          setIsPlaying(false);
        }
        return q;
      }
      const [next, ...rest] = shuffle
        ? (() => { const s = [...q]; const ri = Math.floor(Math.random() * s.length); const [n] = s.splice(ri, 1); return [n, ...s]; })()
        : q;
      setCurrentTrack(prev => {
        if (prev) setHistory(h => [prev, ...h.slice(0, 49)]);
        return next;
      });
      setIsPlaying(true);
      setProgress(0);
      setDuration(0);
      return rest;
    });
  }, [setQueue, shuffle, repeat]);

  const handlePrev = useCallback(() => {
    if (progress > 3 && playerRef.current?.seekTo) {
      playerRef.current.seekTo(0);
      setProgress(0);
      return;
    }
    setHistory(h => {
      if (h.length === 0) return h;
      const [prev, ...rest] = h;
      setCurrentTrack(cur => {
        if (cur) setQueue(q => [cur, ...q]);
        return prev;
      });
      setIsPlaying(true);
      setProgress(0);
      setDuration(0);
      return rest;
    });
  }, [setQueue, progress]);

  const handleEnded = useCallback(() => {
    if (repeat === 'one') {
      if (playerRef.current?.seekTo) playerRef.current.seekTo(0);
      setIsPlaying(true);
    } else {
      handleNext();
    }
  }, [handleNext, repeat]);

  const removeFromQueue = useCallback((index) => {
    setQueue(q => q.filter((_, i) => i !== index));
  }, [setQueue]);

  const createPlaylist = useCallback((name) => {
    const color = PLAYLIST_COLORS[Math.floor(Math.random() * PLAYLIST_COLORS.length)];
    const newPl = { id: Date.now().toString(), name, color, tracks: [] };
    setPlaylists(p => [...p, newPl]);
    return newPl.id;
  }, [setPlaylists]);

  const deletePlaylist = useCallback((id) => {
    setPlaylists(p => p.filter(pl => pl.id !== id));
  }, [setPlaylists]);

  const addTrackToPlaylist = useCallback((playlistId, track) => {
    setPlaylists(p => p.map(pl =>
      pl.id === playlistId && !pl.tracks.some(t => t.id.videoId === track.id.videoId)
        ? { ...pl, tracks: [...pl.tracks, track] }
        : pl
    ));
  }, [setPlaylists]);

  const removeTrackFromPlaylist = useCallback((playlistId, trackIndex) => {
    setPlaylists(p => p.map(pl =>
      pl.id === playlistId ? { ...pl, tracks: pl.tracks.filter((_, i) => i !== trackIndex) } : pl
    ));
  }, [setPlaylists]);

  const seek = useCallback((sec) => {
    if (playerRef.current?.seekTo) playerRef.current.seekTo(sec);
    setProgress(sec);
  }, []);

  // Shared player props
  const playerProps = {
    currentTrack, isPlaying, setIsPlaying,
    progress, duration, seek,
    volume, setVolume, muted, setMuted,
    shuffle, setShuffle, repeat, setRepeat,
    liked: likedIds, onToggleLike: toggleLike,
    onNext: handleNext, onPrev: handlePrev,
    playlists, onAddTrackToPlaylist: addTrackToPlaylist, onCreatePlaylist: createPlaylist,
    onExpand: () => setExpanded(true),
    onCollapse: () => setExpanded(false),
    onShowQueue: () => setShowQueue(v => !v),
    showQueue,
    playerRef,
  };

  const mobilePad = currentTrack
    ? 'calc(160px + env(safe-area-inset-bottom))'
    : 'calc(80px + env(safe-area-inset-bottom))';

  const viewProps = {
    playlists, onCreatePlaylist: createPlaylist, onDeletePlaylist: deletePlaylist,
    onAddTrackToPlaylist: addTrackToPlaylist, onRemoveTrackFromPlaylist: removeTrackFromPlaylist,
    onPlayTrack: playTrack, setQueue, liked, likedIds, onToggleLike: toggleLike,
    queue, currentTrack, onRemoveFromQueue: removeFromQueue, history,
  };

  const contentRoutes = (
    <Routes>
      <Route path="/" element={
        <HomeView {...viewProps}
          onPlayPlaylist={(pl) => { if (pl.tracks?.length) playTrack(pl.tracks[0]); else navigate('/search'); }}
          bottomPad={isMobile ? mobilePad : undefined}
        />
      } />
      <Route path="/search" element={
        <SearchView {...viewProps} bottomPad={isMobile ? mobilePad : undefined} />
      } />
      <Route path="/library" element={
        <LibraryView {...viewProps} bottomPad={isMobile ? mobilePad : undefined} />
      } />
    </Routes>
  );

  return (
    <>
      <style>{CSS_VARS}</style>
      <div style={{
        display: 'flex', flexDirection: 'column',
        height: '100dvh', background: 'var(--bg)',
        color: 'var(--text)', fontFamily: "'Manrope', sans-serif",
        overflow: 'hidden',
        paddingTop: isMobile ? 'env(safe-area-inset-top)' : 0,
      }}>
        {isMobile ? (
          <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '14px 20px 10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
              <span style={{ fontFamily: "'Syne', sans-serif", fontSize: 20, fontWeight: 900, color: 'var(--green)' }}>Gerify</span>
              <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'var(--green)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 800, color: '#0a0a0a' }}>G</div>
            </div>
            <div style={{ flex: 1, overflow: 'hidden' }}>{contentRoutes}</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
            <Sidebar playlists={playlists} pathname={pathname} navigate={navigate}
              onPlayPlaylist={(pl) => { if (pl.tracks?.length) { playTrack(pl.tracks[0]); navigate('/library'); } }}
            />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
                <div style={{ flex: 1, overflow: 'hidden' }}>{contentRoutes}</div>
                {showQueue && (
                  <div style={{ width: 340, background: 'var(--bg-2)', borderLeft: '1px solid var(--line)', overflow: 'hidden', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
                    <div style={{ padding: '20px 20px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--line)', flexShrink: 0 }}>
                      <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 16 }}>Cola</span>
                      <button onClick={() => setShowQueue(false)} style={{ background: 'none', border: 'none', color: 'var(--text-mute)', cursor: 'pointer', fontSize: 18, padding: 4 }}>✕</button>
                    </div>
                    <div style={{ flex: 1, overflowY: 'auto', padding: '12px 12px' }}>
                      {currentTrack && (
                        <div style={{ marginBottom: 16 }}>
                          <p style={{ color: 'var(--green)', fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8 }}>Reproduciendo</p>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'var(--surface)', borderRadius: 8, padding: '10px 12px', border: '1px solid var(--green)33' }}>
                            <img src={currentTrack.snippet.thumbnails.default.url} alt="" style={{ width: 44, height: 33, borderRadius: 4, objectFit: 'cover', flexShrink: 0 }} />
                            <div style={{ minWidth: 0 }}>
                              <div style={{ fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{currentTrack.snippet.title}</div>
                              <div style={{ fontSize: 12, color: 'var(--text-mute)' }}>{currentTrack.snippet.channelTitle}</div>
                            </div>
                          </div>
                        </div>
                      )}
                      {queue.length === 0 ? (
                        <p style={{ color: 'var(--text-dim)', fontSize: 13, textAlign: 'center', padding: '24px 0' }}>Cola vacía</p>
                      ) : (
                        queue.map((item, i) => (
                          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 4px', borderRadius: 6 }}
                            onMouseEnter={e => e.currentTarget.style.background = 'var(--surface)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                          >
                            <span style={{ color: 'var(--text-dim)', fontSize: 12, width: 16, textAlign: 'center', flexShrink: 0 }}>{i + 1}</span>
                            <img src={item.snippet.thumbnails.default.url} alt="" style={{ width: 40, height: 30, borderRadius: 4, objectFit: 'cover', flexShrink: 0 }} />
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontSize: 12, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.snippet.title}</div>
                              <div style={{ fontSize: 11, color: 'var(--text-mute)' }}>{item.snippet.channelTitle}</div>
                            </div>
                            <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                              <button onClick={() => playTrack(item)} style={{ background: 'var(--green)', border: 'none', borderRadius: 16, padding: '5px 10px', color: '#0a0a0a', fontWeight: 700, fontSize: 11, cursor: 'pointer' }}>▶</button>
                              <button onClick={() => removeFromQueue(i)} style={{ background: 'none', border: '1px solid var(--surface-3)', borderRadius: 16, padding: '5px 8px', color: 'var(--text-mute)', cursor: 'pointer', fontSize: 11 }}>✕</button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Player bar */}
        {isMobile ? (
          <>
            <MiniPlayer {...playerProps} onExpand={() => setExpanded(true)} />
            <BottomNav onCreatePlaylist={createPlaylist} />
          </>
        ) : (
          <Player {...playerProps} />
        )}

        {currentTrack && (
          <YouTubePlayer
            videoId={currentTrack.id.videoId}
            isPlaying={isPlaying}
            setIsPlaying={setIsPlaying}
            onEnded={handleEnded}
            playerRef={playerRef}
          />
        )}

        {/* Full-screen expanded player */}
        {expanded && currentTrack && (
          <ExpandedPlayer {...playerProps} queue={queue} history={history} />
        )}
      </div>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppLayout />
    </BrowserRouter>
  );
}
