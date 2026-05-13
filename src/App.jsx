import { useState, useRef, useCallback } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Player from './components/Player';
import MiniPlayer from './components/MiniPlayer';
import BottomNav from './components/BottomNav';
import YouTubePlayer from './components/YouTubePlayer';
import GerifyLogo from './components/GerifyLogo';
import HomeView from './views/HomeView';
import SearchView from './views/SearchView';
import LibraryView from './views/LibraryView';
import { useLocalStorage } from './hooks/useLocalStorage';
import { useIsMobile } from './hooks/useIsMobile';
import { PLAYLIST_COLORS } from './constants';

function AppLayout() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const isMobile = useIsMobile();

  const [currentTrack, setCurrentTrack] = useState(null);
  const [queue, setQueue] = useLocalStorage('gerify_queue', []);
  const [history, setHistory] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playlists, setPlaylists] = useLocalStorage('gerify_playlists', []);
  const playerRef = useRef(null);

  const playTrack = useCallback((track) => {
    setCurrentTrack(prev => {
      if (prev) setHistory(h => [prev, ...h.slice(0, 19)]);
      return track;
    });
    setIsPlaying(true);
    setQueue(q => q.filter(t => t.id.videoId !== track.id.videoId));
  }, [setQueue]);

  const handleNext = useCallback(() => {
    setQueue(q => {
      if (q.length === 0) return q;
      const [next, ...rest] = q;
      setCurrentTrack(prev => {
        if (prev) setHistory(h => [prev, ...h.slice(0, 19)]);
        return next;
      });
      setIsPlaying(true);
      return rest;
    });
  }, [setQueue]);

  const handlePrev = useCallback(() => {
    setHistory(h => {
      if (h.length === 0) return h;
      const [prev, ...rest] = h;
      setCurrentTrack(cur => {
        if (cur) setQueue(q => [cur, ...q]);
        return prev;
      });
      setIsPlaying(true);
      return rest;
    });
  }, [setQueue]);

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
      pl.id === playlistId
        ? { ...pl, tracks: pl.tracks.filter((_, i) => i !== trackIndex) }
        : pl
    ));
  }, [setPlaylists]);

  // Padding inferior en móvil para que el scroll no quede bajo el mini-player + bottom nav
  const mobilePad = currentTrack
    ? 'calc(160px + env(safe-area-inset-bottom))'
    : 'calc(80px + env(safe-area-inset-bottom))';

  const topLinks = [['/', 'Inicio'], ['/search', 'Buscar'], ['/library', 'Biblioteca']];

  const contentRoutes = (
    <Routes>
      <Route path="/" element={
        <HomeView
          playlists={playlists}
          onPlayPlaylist={(pl) => { if (pl.tracks?.length) { playTrack(pl.tracks[0]); } else { navigate('/search'); } }}
          bottomPad={isMobile ? mobilePad : undefined}
        />
      } />
      <Route path="/search" element={
        <SearchView
          onPlayTrack={playTrack}
          setQueue={setQueue}
          playlists={playlists}
          onAddTrackToPlaylist={addTrackToPlaylist}
          onCreatePlaylist={createPlaylist}
          bottomPad={isMobile ? mobilePad : undefined}
        />
      } />
      <Route path="/library" element={
        <LibraryView
          queue={queue}
          currentTrack={currentTrack}
          onPlayTrack={playTrack}
          onRemoveFromQueue={removeFromQueue}
          playlists={playlists}
          onCreatePlaylist={createPlaylist}
          onDeletePlaylist={deletePlaylist}
          onAddTrackToPlaylist={addTrackToPlaylist}
          onRemoveTrackFromPlaylist={removeTrackFromPlaylist}
          bottomPad={isMobile ? mobilePad : undefined}
        />
      } />
    </Routes>
  );

  return (
    <>
      <style>{`
        * { margin: 0; padding: 0; box-sizing: border-box; scrollbar-width: thin; scrollbar-color: #2a2a2a #121212; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #121212; }
        ::-webkit-scrollbar-thumb { background: #2a2a2a; border-radius: 3px; }
        input[type=range] { height: 4px; }
        button { -webkit-tap-highlight-color: transparent; }
      `}</style>
      <div style={{
        display: 'flex', flexDirection: 'column',
        height: '100dvh', background: '#121212',
        color: '#fff', fontFamily: "'DM Sans', sans-serif",
        overflow: 'hidden',
        paddingTop: isMobile ? 'env(safe-area-inset-top)' : 0,
      }}>
        {isMobile ? (
          /* ── MÓVIL ── */
          <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '14px 20px 10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
              <GerifyLogo />
              <div style={{
                width: 34, height: 34, borderRadius: '50%', background: '#00e5a0',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 700, color: '#0a0a0a',
              }}>G</div>
            </div>
            <div style={{ flex: 1, overflow: 'hidden' }}>{contentRoutes}</div>
          </div>
        ) : (
          /* ── DESKTOP ── */
          <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
            <Sidebar
              playlists={playlists}
              onPlayPlaylist={(pl) => { if (pl.tracks?.length) { playTrack(pl.tracks[0]); navigate('/library'); } }}
            />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: '#121212' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 32px', borderBottom: '1px solid #1a1a1a', flexShrink: 0 }}>
                <div style={{ display: 'flex', gap: 8 }}>
                  {topLinks.map(([path, label]) => (
                    <button key={path} onClick={() => navigate(path)} style={{
                      background: pathname === path ? '#1a1a1a' : 'transparent',
                      border: 'none', borderRadius: 6, padding: '8px 18px',
                      color: pathname === path ? '#fff' : '#8a8a8a',
                      fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 600, cursor: 'pointer',
                    }}>{label}</button>
                  ))}
                </div>
                <div style={{ background: '#00e5a0', borderRadius: 20, padding: '8px 18px', fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 700, color: '#0a0a0a' }}>GER</div>
              </div>
              <div style={{ flex: 1, overflow: 'hidden' }}>{contentRoutes}</div>
            </div>
          </div>
        )}

        {/* Player: mini en móvil, completo en desktop */}
        {isMobile ? (
          <>
            <MiniPlayer currentTrack={currentTrack} isPlaying={isPlaying} setIsPlaying={setIsPlaying} onNext={handleNext} />
            <BottomNav onCreatePlaylist={createPlaylist} />
          </>
        ) : (
          <Player
            currentTrack={currentTrack}
            onNext={handleNext}
            onPrev={handlePrev}
            isPlaying={isPlaying}
            setIsPlaying={setIsPlaying}
            playerRef={playerRef}
            playlists={playlists}
            onAddTrackToPlaylist={addTrackToPlaylist}
            onCreatePlaylist={createPlaylist}
          />
        )}

        {currentTrack && (
          <YouTubePlayer
            videoId={currentTrack.id.videoId}
            isPlaying={isPlaying}
            setIsPlaying={setIsPlaying}
            onEnded={handleNext}
            playerRef={playerRef}
          />
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
