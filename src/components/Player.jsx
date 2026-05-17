import { useState, useRef } from 'react';
import Icon from './Icon';
import Cover from './Cover';
import { formatTime } from '../utils/format';

function SaveMenu({ track, playlists, onAddTrackToPlaylist, onCreatePlaylist, onClose }) {
  const [newName, setNewName] = useState('');
  const handleCreate = () => {
    if (!newName.trim()) return;
    const id = onCreatePlaylist(newName.trim());
    onAddTrackToPlaylist(id, track);
    onClose();
  };
  return (
    <div style={{ position: 'absolute', bottom: 40, left: 0, background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 10, padding: 12, minWidth: 200, zIndex: 200, boxShadow: '0 8px 32px rgba(0,0,0,0.6)' }}>
      <p style={{ color: 'var(--text-mute)', fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8 }}>Guardar en</p>
      {playlists.length === 0 && <p style={{ color: 'var(--text-dim)', fontSize: 12, marginBottom: 8 }}>Sin playlists aún</p>}
      {playlists.map(pl => (
        <button key={pl.id} onClick={() => { onAddTrackToPlaylist(pl.id, track); onClose(); }} style={{ display: 'block', width: '100%', textAlign: 'left', padding: '7px 10px', background: 'transparent', border: 'none', borderRadius: 6, color: 'var(--text-mute)', fontSize: 13, cursor: 'pointer' }}
          onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-2)'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        >{pl.name}</button>
      ))}
      <div style={{ borderTop: '1px solid var(--line)', marginTop: 8, paddingTop: 8, display: 'flex', gap: 6 }}>
        <input value={newName} onChange={e => setNewName(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleCreate()} placeholder="Nueva playlist..." style={{ flex: 1, background: 'var(--bg)', border: '1px solid var(--surface-3)', borderRadius: 6, padding: '6px 8px', color: 'var(--text)', fontSize: 12, outline: 'none', fontFamily: 'inherit' }} />
        <button onClick={handleCreate} style={{ background: 'var(--green)', border: 'none', borderRadius: 6, padding: '6px 10px', color: '#0a0a0a', fontWeight: 700, fontSize: 12, cursor: 'pointer' }}>+</button>
      </div>
    </div>
  );
}

export default function Player({
  currentTrack, isPlaying, setIsPlaying,
  progress, duration, seek,
  volume, setVolume, muted, setMuted,
  shuffle, setShuffle, repeat, setRepeat,
  liked, onToggleLike,
  onNext, onPrev,
  playlists, onAddTrackToPlaylist, onCreatePlaylist,
  onExpand, onShowQueue, showQueue,
}) {
  const [showSave, setShowSave] = useState(false);
  const saveRef = useRef(null);
  const pct = duration > 0 ? (progress / duration) * 100 : 0;
  const isLiked = currentTrack ? liked.has(currentTrack.id?.videoId) : false;

  const cycleRepeat = () => setRepeat(r => r === 'off' ? 'all' : r === 'all' ? 'one' : 'off');

  if (!currentTrack) {
    return (
      <div style={{ height: 88, background: 'var(--bg-2)', borderTop: '1px solid var(--line)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ color: 'var(--text-dim)', fontSize: 14 }}>Busca una canción para empezar ✦</span>
      </div>
    );
  }

  return (
    <div style={{ height: 88, background: 'var(--bg-2)', borderTop: '1px solid var(--line)', display: 'flex', alignItems: 'center', padding: '0 16px', gap: 8, position: 'relative' }}>

      {/* Left: track info */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, width: 280, flexShrink: 0 }}>
        <Cover item={currentTrack} size="sm" style={{ cursor: 'pointer' }} />
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{currentTrack.snippet.title}</div>
          <div style={{ fontSize: 12, color: 'var(--text-mute)', marginTop: 2 }}>{currentTrack.snippet.channelTitle}</div>
        </div>
        <div ref={saveRef} style={{ position: 'relative', flexShrink: 0 }}>
          <button onClick={() => setShowSave(v => !v)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: isLiked ? 'var(--green)' : 'var(--text-mute)', padding: 6, display: 'flex' }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--green)'}
            onMouseLeave={e => e.currentTarget.style.color = isLiked ? 'var(--green)' : 'var(--text-mute)'}
          >
            <Icon name={isLiked ? 'heart-fill' : 'heart'} size={18} color="currentColor" />
          </button>
          {showSave && (
            <SaveMenu track={currentTrack} playlists={playlists} onAddTrackToPlaylist={onAddTrackToPlaylist} onCreatePlaylist={onCreatePlaylist} onClose={() => setShowSave(false)} />
          )}
        </div>
      </div>

      {/* Center: controls + progress */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <button onClick={() => setShuffle(s => !s)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: shuffle ? 'var(--green)' : 'var(--text-mute)', padding: 4, display: 'flex' }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--text)'}
            onMouseLeave={e => e.currentTarget.style.color = shuffle ? 'var(--green)' : 'var(--text-mute)'}
          ><Icon name="shuffle" size={18} /></button>
          <button onClick={onPrev} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-mute)', padding: 4, display: 'flex' }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--text)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-mute)'}
          ><Icon name="prev" size={22} /></button>
          <button onClick={() => setIsPlaying(p => !p)} style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--text)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'transform 0.1s, background 0.1s' }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--green)'}
            onMouseLeave={e => e.currentTarget.style.background = 'var(--text)'}
          ><Icon name={isPlaying ? 'pause' : 'play'} size={18} color="#0a0a0a" /></button>
          <button onClick={onNext} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-mute)', padding: 4, display: 'flex' }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--text)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-mute)'}
          ><Icon name="next" size={22} /></button>
          <button onClick={cycleRepeat} style={{ background: 'none', border: 'none', cursor: 'pointer', color: repeat !== 'off' ? 'var(--green)' : 'var(--text-mute)', padding: 4, display: 'flex' }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--text)'}
            onMouseLeave={e => e.currentTarget.style.color = repeat !== 'off' ? 'var(--green)' : 'var(--text-mute)'}
          ><Icon name={repeat === 'one' ? 'repeat-one' : 'repeat'} size={18} /></button>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', maxWidth: 480 }}>
          <span style={{ color: 'var(--text-dim)', fontSize: 11, width: 34, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{formatTime(progress)}</span>
          <div style={{ flex: 1, height: 4, background: 'var(--surface-2)', borderRadius: 2, cursor: 'pointer', position: 'relative' }}
            onClick={e => {
              const rect = e.currentTarget.getBoundingClientRect();
              seek((e.clientX - rect.left) / rect.width * duration);
            }}
            onMouseEnter={e => e.currentTarget.firstChild.style.background = 'var(--green)'}
            onMouseLeave={e => e.currentTarget.firstChild.style.background = 'var(--green-2)'}
          >
            <div style={{ height: '100%', width: `${pct}%`, background: 'var(--green-2)', borderRadius: 2, transition: 'background 0.1s' }} />
          </div>
          <span style={{ color: 'var(--text-dim)', fontSize: 11, width: 34, fontVariantNumeric: 'tabular-nums' }}>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Right: volume + extras */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, width: 220, flexShrink: 0, justifyContent: 'flex-end' }}>
        <button onClick={onShowQueue} style={{ background: 'none', border: 'none', cursor: 'pointer', color: showQueue ? 'var(--green)' : 'var(--text-mute)', padding: 4, display: 'flex' }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--text)'}
          onMouseLeave={e => e.currentTarget.style.color = showQueue ? 'var(--green)' : 'var(--text-mute)'}
        ><Icon name="queue" size={18} /></button>
        <button onClick={() => setMuted(m => !m)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-mute)', padding: 4, display: 'flex' }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--text)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--text-mute)'}
        ><Icon name={muted ? 'volume-mute' : 'volume'} size={18} /></button>
        <input type="range" min="0" max="100" value={muted ? 0 : volume}
          onChange={e => { setVolume(+e.target.value); if (muted) setMuted(false); }}
          style={{ width: 80, cursor: 'pointer' }}
        />
        <button onClick={onExpand} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-mute)', padding: 4, display: 'flex' }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--text)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--text-mute)'}
        ><Icon name="expand" size={18} /></button>
      </div>
    </div>
  );
}
