import { useState } from 'react';
import Icon from './Icon';
import Cover from './Cover';
import { formatTime } from '../utils/format';
import { useIsMobile } from '../hooks/useIsMobile';

export default function ExpandedPlayer({
  currentTrack, isPlaying, setIsPlaying,
  progress, duration, seek,
  volume, setVolume, muted, setMuted,
  shuffle, setShuffle, repeat, setRepeat,
  liked, onToggleLike,
  onNext, onPrev,
  playlists, onAddTrackToPlaylist, onCreatePlaylist,
  onCollapse,
  queue, history,
}) {
  const [tab, setTab] = useState('queue');
  const isMobile = useIsMobile();
  const pct = duration > 0 ? (progress / duration) * 100 : 0;
  const isLiked = currentTrack ? liked.has(currentTrack.id?.videoId) : false;
  const cycleRepeat = () => setRepeat(r => r === 'off' ? 'all' : r === 'all' ? 'one' : 'off');

  if (!currentTrack) return null;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      display: 'flex',
      background: 'var(--bg)',
      animation: 'fadeIn 200ms ease',
    }}>
      <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }`}</style>

      {/* Left: main player */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '32px 48px', gap: 32, minWidth: 0 }}>

        {/* Top bar */}
        <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button onClick={onCollapse} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-mute)', display: 'flex', padding: 8 }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--text)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-mute)'}
          ><Icon name="minimize" size={22} /></button>
          <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 16 }}>Ahora suena</span>
          <div style={{ width: 38 }} />
        </div>

        {/* Artwork */}
        <Cover item={currentTrack} size="lg" style={{ boxShadow: '0 24px 64px rgba(0,0,0,0.6)' }} />

        {/* Track info + like */}
        <div style={{ width: '100%', maxWidth: 440, display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 20, fontWeight: 800, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{currentTrack.snippet.title}</div>
            <div style={{ fontSize: 14, color: 'var(--text-mute)', marginTop: 4 }}>{currentTrack.snippet.channelTitle}</div>
          </div>
          <button onClick={() => onToggleLike(currentTrack)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: isLiked ? 'var(--green)' : 'var(--text-mute)', display: 'flex', padding: 8, flexShrink: 0 }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--green)'}
            onMouseLeave={e => e.currentTarget.style.color = isLiked ? 'var(--green)' : 'var(--text-mute)'}
          ><Icon name={isLiked ? 'heart-fill' : 'heart'} size={24} color="currentColor" /></button>
        </div>

        {/* Progress */}
        <div style={{ width: '100%', maxWidth: 440 }}>
          <div style={{ height: 4, background: 'var(--surface-2)', borderRadius: 2, cursor: 'pointer', marginBottom: 8 }}
            onClick={e => { const r = e.currentTarget.getBoundingClientRect(); seek((e.clientX - r.left) / r.width * duration); }}
          >
            <div style={{ height: '100%', width: `${pct}%`, background: 'var(--green)', borderRadius: 2 }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-dim)', fontSize: 12, fontVariantNumeric: 'tabular-nums' }}>{formatTime(progress)}</span>
            <span style={{ color: 'var(--text-dim)', fontSize: 12, fontVariantNumeric: 'tabular-nums' }}>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 24, width: '100%', maxWidth: 440, justifyContent: 'center' }}>
          <button onClick={() => setShuffle(s => !s)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: shuffle ? 'var(--green)' : 'var(--text-mute)', padding: 8, display: 'flex' }}>
            <Icon name="shuffle" size={22} color="currentColor" />
          </button>
          <button onClick={onPrev} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-mute)', padding: 8, display: 'flex' }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--text)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-mute)'}
          ><Icon name="prev" size={30} /></button>
          <button onClick={() => setIsPlaying(p => !p)} style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--text)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'transform 0.1s, background 0.15s' }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.05)'; e.currentTarget.style.background = 'var(--green)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.background = 'var(--text)'; }}
          ><Icon name={isPlaying ? 'pause' : 'play'} size={28} color="#0a0a0a" /></button>
          <button onClick={onNext} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-mute)', padding: 8, display: 'flex' }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--text)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-mute)'}
          ><Icon name="next" size={30} /></button>
          <button onClick={cycleRepeat} style={{ background: 'none', border: 'none', cursor: 'pointer', color: repeat !== 'off' ? 'var(--green)' : 'var(--text-mute)', padding: 8, display: 'flex' }}>
            <Icon name={repeat === 'one' ? 'repeat-one' : 'repeat'} size={22} color="currentColor" />
          </button>
        </div>

        {/* Volume */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', maxWidth: 440 }}>
          <button onClick={() => setMuted(m => !m)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-mute)', display: 'flex', padding: 4 }}>
            <Icon name={muted ? 'volume-mute' : 'volume'} size={20} />
          </button>
          <input type="range" min="0" max="100" value={muted ? 0 : volume}
            onChange={e => { setVolume(+e.target.value); if (muted) setMuted(false); }}
            style={{ flex: 1, cursor: 'pointer' }}
          />
        </div>
      </div>

      {/* Right panel: queue / history — desktop only */}
      {!isMobile && <div style={{ width: 380, background: 'var(--bg-2)', borderLeft: '1px solid var(--line)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--line)', flexShrink: 0 }}>
          {[['queue', 'Cola'], ['history', 'Historial']].map(([key, label]) => (
            <button key={key} onClick={() => setTab(key)} style={{
              flex: 1, padding: '16px 0', background: 'none', border: 'none', cursor: 'pointer',
              color: tab === key ? 'var(--text)' : 'var(--text-mute)',
              fontFamily: 'inherit', fontSize: 13, fontWeight: 700,
              borderBottom: tab === key ? '2px solid var(--green)' : '2px solid transparent',
              transition: 'color 0.15s',
            }}>{label}</button>
          ))}
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: 16 }}>
          {tab === 'queue' && (
            queue.length === 0
              ? <p style={{ color: 'var(--text-dim)', fontSize: 13, textAlign: 'center', padding: '32px 0' }}>Cola vacía</p>
              : queue.map((item, i) => (
                <TrackRow key={i} item={item} index={i} />
              ))
          )}
          {tab === 'history' && (
            history.length === 0
              ? <p style={{ color: 'var(--text-dim)', fontSize: 13, textAlign: 'center', padding: '32px 0' }}>Sin historial</p>
              : history.map((item, i) => (
                <TrackRow key={i} item={item} index={i} dimmed />
              ))
          )}
        </div>
      </div>}
    </div>
  );
}

function TrackRow({ item, dimmed }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 4px', borderRadius: 8 }}
      onMouseEnter={e => e.currentTarget.style.background = 'var(--surface)'}
      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
    >
      <img src={item.snippet.thumbnails.default.url} alt="" style={{ width: 44, height: 33, borderRadius: 4, objectFit: 'cover', flexShrink: 0, opacity: dimmed ? 0.6 : 1 }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: dimmed ? 'var(--text-mute)' : 'var(--text)' }}>{item.snippet.title}</div>
        <div style={{ fontSize: 11, color: 'var(--text-dim)' }}>{item.snippet.channelTitle}</div>
      </div>
    </div>
  );
}
