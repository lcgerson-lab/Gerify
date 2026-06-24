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
import { useIndexedDB } from './hooks/useIndexedDB';
import { useIsMobile } from './hooks/useIsMobile';
import { PLAYLIST_COLORS, YT_API_KEY } from './constants';

const vid = (t) => t?.id?.videoId;

function shuffleArray(a) {
  const s = [...a];
  for (let i = s.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [s[i], s[j]] = [s[j], s[i]];
  }
  return s;
}

// Spotify-style "smart shuffle": avoids two songs from the same artist back to back
function smartShuffle(tracks) {
  const byArtist = {};
  for (const t of shuffleArray(tracks)) {
    const a = t.snippet?.channelTitle || '?';
    (byArtist[a] = byArtist[a] || []).push(t);
  }
  let groups = Object.values(byArtist);
  const result = [];
  let last = null;
  while (result.length < tracks.length) {
    groups = groups.filter(g => g.length > 0);
    if (!groups.length) break;
    groups.sort((a, b) => b.length - a.length);
    const pick = groups.find(g => g[0].snippet?.channelTitle !== last) || groups[0];
    const t = pick.shift();
    result.push(t);
    last = t.snippet?.channelTitle;
  }
  return result;
}

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
  // Two-tier queue (Spotify model): manual queue (highest priority) + context queue (current source)
  const [manualQueue, setManualQueue] = useLocalStorage('gerify_manual_queue', []);
  const [contextQueue, setContextQueue] = useLocalStorage('gerify_context_queue', []);
  const [contextOriginal, setContextOriginal] = useLocalStorage('gerify_context_original', []);
  const [contextLabel, setContextLabel] = useLocalStorage('gerify_context_label', '');
  const [history, setHistory] = useLocalStorage('gerify_history', []);
  const [isPlaying, setIsPlaying] = useState(false);

  // Player state (lifted from Player.jsx)
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useLocalStorage('gerify_volume', 80);
  const [muted, setMuted] = useState(false);
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState('off'); // 'off' | 'all' | 'one'
  const [autoplay] = useLocalStorage('gerify_autoplay', true);

  // UI state
  const [expanded, setExpanded] = useState(false);
  const [showQueue, setShowQueue] = useState(false);

  // Library
  const [playlists, setPlaylists] = useIndexedDB('gerify_playlists', []);
  const [liked, setLiked] = useLocalStorage('gerify_liked', []);
  const likedIds = useMemo(() => new Set(liked.map(vid).filter(Boolean)), [liked]);

  // Combined queue for display (manual first, then current source)
  const queue = useMemo(() => [...manualQueue, ...contextQueue], [manualQueue, contextQueue]);

  // Latest state mirror so stable callbacks (and the YT onEnded closure) never go stale
  const stateRef = useRef({});
  stateRef.current = { manualQueue, contextQueue, contextOriginal, history, currentTrack, shuffle, repeat, autoplay, progress, volume, muted };

  // Progress polling + MediaSession position
  useEffect(() => {
    if (!isPlaying) return;
    const id = setInterval(() => {
      if (playerRef.current?.getCurrentTime) {
        const cur = playerRef.current.getCurrentTime();
        const dur = playerRef.current.getDuration();
        if (!isNaN(cur) && cur >= 0) setProgress(cur);
        if (!isNaN(dur) && dur > 0) setDuration(dur);
        if ('mediaSession' in navigator && dur > 0) {
          try { navigator.mediaSession.setPositionState({ duration: dur, position: Math.min(cur, dur) }); } catch {}
        }
      }
    }, 500);
    return () => clearInterval(id);
  }, [isPlaying]);

  // Volume sync to player
  useEffect(() => {
    if (playerRef.current?.setVolume) playerRef.current.setVolume(muted ? 0 : volume);
  }, [volume, muted]);

  const advanceTo = useCallback((track) => {
    setCurrentTrack(prev => {
      if (prev && vid(prev) !== vid(track)) setHistory(h => [prev, ...h.slice(0, 49)]);
      return track;
    });
    setIsPlaying(true);
    setProgress(0);
    setDuration(0);
  }, [setHistory]);

  // Autoplay: fetch related tracks (same artist) when both queues are exhausted
  const fetchRelated = useCallback(async (seed) => {
    try {
      const q = seed.snippet?.channelTitle || seed.snippet?.title;
      const res = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(q)}&type=video&videoCategoryId=10&maxResults=25&key=${YT_API_KEY}`);
      const data = await res.json();
      if (data.error || !data.items) return [];
      const s = stateRef.current;
      const seen = new Set([vid(seed), vid(s.currentTrack), ...s.history.map(vid)].filter(Boolean));
      return data.items.filter(it => it.id?.videoId && !seen.has(it.id.videoId)).slice(0, 20);
    } catch {
      return [];
    }
  }, []);

  // Single source of truth for "play next track". Stable (reads stateRef), so the
  // YouTube onEnded closure stays correct even though it is captured once.
  const handleNext = useCallback(async () => {
    const s = stateRef.current;
    // 1. Manual queue (highest priority)
    if (s.manualQueue.length) {
      const [next, ...rest] = s.manualQueue;
      setManualQueue(rest);
      advanceTo(next);
      return;
    }
    // 2. Current source (playlist / album / search)
    if (s.contextQueue.length) {
      const [next, ...rest] = s.contextQueue;
      setContextQueue(rest);
      advanceTo(next);
      return;
    }
    // 3. Repeat all → restart the source
    if (s.repeat === 'all' && s.contextOriginal.length) {
      const seq = s.shuffle ? smartShuffle(s.contextOriginal) : s.contextOriginal;
      const [next, ...rest] = seq;
      setContextQueue(rest);
      advanceTo(next);
      return;
    }
    // 4. Autoplay recommendations
    if (s.autoplay && s.currentTrack) {
      const related = await fetchRelated(s.currentTrack);
      if (related.length) {
        const [next, ...rest] = related;
        setContextOriginal(related);
        setContextLabel('Autoplay');
        setContextQueue(rest);
        advanceTo(next);
        return;
      }
    }
    // 5. Nothing left
    setIsPlaying(false);
  }, [advanceTo, fetchRelated, setManualQueue, setContextQueue, setContextOriginal, setContextLabel]);

  const handlePrev = useCallback(() => {
    if (stateRef.current.progress > 3 && playerRef.current?.seekTo) {
      playerRef.current.seekTo(0);
      setProgress(0);
      return;
    }
    const h = stateRef.current.history;
    if (!h.length) {
      if (playerRef.current?.seekTo) playerRef.current.seekTo(0);
      setProgress(0);
      return;
    }
    const [prev, ...rest] = h;
    setHistory(rest);
    setCurrentTrack(cur => {
      if (cur) setContextQueue(q => [cur, ...q]);
      return prev;
    });
    setIsPlaying(true);
    setProgress(0);
    setDuration(0);
  }, [setHistory, setContextQueue]);

  const handleEnded = useCallback(() => {
    if (stateRef.current.repeat === 'one') {
      if (playerRef.current?.seekTo) playerRef.current.seekTo(0);
      setIsPlaying(true);
    } else {
      handleNext();
    }
  }, [handleNext]);

  const toggleLike = useCallback((track) => {
    const id = vid(track);
    if (!id) return;
    setLiked(l => l.some(t => vid(t) === id) ? l.filter(t => vid(t) !== id) : [...l, track]);
  }, [setLiked]);

  // Play a single track. Optionally set a playback context (the list it belongs to)
  // so playback continues through that list afterwards.
  const playTrack = useCallback((track, contextList, label) => {
    advanceTo(track);
    setManualQueue(q => q.filter(t => vid(t) !== vid(track)));
    if (Array.isArray(contextList) && contextList.length) {
      const idx = contextList.findIndex(t => vid(t) === vid(track));
      let rest = idx >= 0 ? contextList.slice(idx + 1) : contextList;
      if (stateRef.current.shuffle) rest = smartShuffle(rest);
      setContextQueue(rest);
      setContextOriginal(contextList);
      setContextLabel(label || '');
    } else {
      setContextQueue(q => q.filter(t => vid(t) !== vid(track)));
    }
  }, [advanceTo, setManualQueue, setContextQueue, setContextOriginal, setContextLabel]);

  // Play a whole playlist/album: first track now, the rest become the context source.
  const playPlaylist = useCallback((pl) => {
    if (!pl.tracks?.length) return;
    const ordered = stateRef.current.shuffle ? smartShuffle(pl.tracks) : pl.tracks;
    const [first, ...rest] = ordered;
    advanceTo(first);
    setManualQueue(q => q.filter(t => vid(t) !== vid(first)));
    setContextQueue(rest);
    setContextOriginal(pl.tracks);
    setContextLabel(pl.name || 'Playlist');
  }, [advanceTo, setManualQueue, setContextQueue, setContextOriginal, setContextLabel]);

  // "Add to queue" → manual queue (plays before the rest of the source)
  const addToQueue = useCallback((track) => {
    setManualQueue(q => q.some(t => vid(t) === vid(track)) ? q : [...q, track]);
  }, [setManualQueue]);

  // Remove from the combined queue (maps index back to manual vs context)
  const removeFromQueue = useCallback((index) => {
    const ml = stateRef.current.manualQueue.length;
    if (index < ml) setManualQueue(q => q.filter((_, i) => i !== index));
    else setContextQueue(q => q.filter((_, i) => i !== index - ml));
  }, [setManualQueue, setContextQueue]);

  // Shuffle toggle: reorders the remaining source (Spotify generates a sequence)
  const toggleShuffle = useCallback(() => {
    const s = stateRef.current;
    const on = !s.shuffle;
    setShuffle(on);
    if (on) {
      setContextQueue(q => smartShuffle(q));
    } else {
      const played = new Set([vid(s.currentTrack), ...s.history.map(vid)].filter(Boolean));
      setContextQueue(s.contextOriginal.filter(t => !played.has(vid(t))));
    }
  }, [setShuffle, setContextQueue]);

  // MediaSession: lock-screen / notification controls + metadata
  useEffect(() => {
    if (!('mediaSession' in navigator) || !currentTrack) return;
    const thumb = currentTrack.snippet?.thumbnails || {};
    const art = thumb.high?.url || thumb.medium?.url || thumb.default?.url;
    try {
      navigator.mediaSession.metadata = new window.MediaMetadata({
        title: currentTrack.snippet?.title || '',
        artist: currentTrack.snippet?.channelTitle || '',
        album: 'Gerify',
        artwork: art ? [{ src: art, sizes: '512x512', type: 'image/jpeg' }] : [],
      });
      navigator.mediaSession.setActionHandler('play', () => setIsPlaying(true));
      navigator.mediaSession.setActionHandler('pause', () => setIsPlaying(false));
      navigator.mediaSession.setActionHandler('nexttrack', () => handleNext());
      navigator.mediaSession.setActionHandler('previoustrack', () => handlePrev());
      navigator.mediaSession.setActionHandler('seekto', (e) => {
        if (e.seekTime != null && playerRef.current?.seekTo) { playerRef.current.seekTo(e.seekTime); setProgress(e.seekTime); }
      });
    } catch {}
  }, [currentTrack, handleNext, handlePrev]);

  useEffect(() => {
    if ('mediaSession' in navigator) navigator.mediaSession.playbackState = isPlaying ? 'playing' : 'paused';
  }, [isPlaying]);

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
    shuffle, setShuffle: toggleShuffle, repeat, setRepeat,
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
    onPlayTrack: playTrack, onPlayPlaylist: playPlaylist, onAddToQueue: addToQueue, liked, likedIds, onToggleLike: toggleLike,
    queue, currentTrack, onRemoveFromQueue: removeFromQueue, history, contextLabel,
  };

  const contentRoutes = (
    <Routes>
      <Route path="/" element={
        <HomeView {...viewProps}
          onPlayPlaylist={(pl) => pl.tracks?.length ? playPlaylist(pl) : navigate('/search')}
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
              onPlayPlaylist={(pl) => { if (pl.tracks?.length) { playPlaylist(pl); navigate('/library'); } }}
            />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
                <div style={{ flex: 1, overflow: 'hidden' }}>{contentRoutes}</div>
                {showQueue && (
                  <div style={{ width: 340, background: 'var(--bg-2)', borderLeft: '1px solid var(--line)', overflow: 'hidden', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
                    <div style={{ padding: '20px 20px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--line)', flexShrink: 0 }}>
                      <div>
                        <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 16 }}>Cola</span>
                        {contextLabel && <div style={{ fontSize: 11, color: 'var(--text-mute)', marginTop: 2 }}>Fuente: {contextLabel}</div>}
                      </div>
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
            volume={muted ? 0 : volume}
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
