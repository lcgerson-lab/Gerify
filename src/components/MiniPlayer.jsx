export default function MiniPlayer({ currentTrack, isPlaying, setIsPlaying, onNext }) {
  if (!currentTrack) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: 'calc(64px + env(safe-area-inset-bottom))',
      left: 8, right: 8,
      background: '#1a1a1a',
      borderRadius: 14,
      padding: '10px 12px',
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      zIndex: 90,
      boxShadow: '0 -2px 20px rgba(0,0,0,0.5)',
      border: '1px solid #2a2a2a',
    }}>
      <img
        src={currentTrack.snippet.thumbnails.default.url}
        alt=""
        style={{ width: 44, height: 33, borderRadius: 6, objectFit: 'cover', flexShrink: 0 }}
      />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          color: '#fff', fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 600,
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>{currentTrack.snippet.title}</div>
        <div style={{ color: '#8a8a8a', fontFamily: "'DM Sans', sans-serif", fontSize: 11 }}>
          {currentTrack.snippet.channelTitle}
        </div>
      </div>
      <button
        onClick={() => setIsPlaying(!isPlaying)}
        style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontSize: 26, padding: '4px 8px', minWidth: 44, minHeight: 44, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        {isPlaying ? '⏸' : '▶'}
      </button>
      <button
        onClick={onNext}
        style={{ background: 'none', border: 'none', color: '#8a8a8a', cursor: 'pointer', fontSize: 22, padding: '4px 8px', minWidth: 44, minHeight: 44, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        ⏭
      </button>
    </div>
  );
}
