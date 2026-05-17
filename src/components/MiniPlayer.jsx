import Icon from './Icon';
import Cover from './Cover';

export default function MiniPlayer({ currentTrack, isPlaying, setIsPlaying, onNext, onExpand, liked, onToggleLike }) {
  if (!currentTrack) return null;
  const isLiked = liked?.has(currentTrack.id?.videoId);

  return (
    <div onClick={onExpand} style={{
      position: 'fixed',
      bottom: 'calc(64px + env(safe-area-inset-bottom))',
      left: 8, right: 8,
      background: 'var(--surface)',
      borderRadius: 14,
      padding: '10px 12px',
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      zIndex: 90,
      boxShadow: '0 -2px 20px rgba(0,0,0,0.5)',
      border: '1px solid var(--line)',
      cursor: 'pointer',
    }}>
      <Cover item={currentTrack} size="xs" />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{currentTrack.snippet.title}</div>
        <div style={{ color: 'var(--text-mute)', fontSize: 11, marginTop: 2 }}>{currentTrack.snippet.channelTitle}</div>
      </div>
      <button onClick={e => { e.stopPropagation(); onToggleLike?.(currentTrack); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: isLiked ? 'var(--green)' : 'var(--text-mute)', display: 'flex', padding: 8, minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center' }}>
        <Icon name={isLiked ? 'heart-fill' : 'heart'} size={18} color="currentColor" />
      </button>
      <button onClick={e => { e.stopPropagation(); setIsPlaying(p => !p); }} style={{ background: 'none', border: 'none', color: 'var(--text)', cursor: 'pointer', display: 'flex', padding: 8, minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center' }}>
        <Icon name={isPlaying ? 'pause' : 'play'} size={22} color="currentColor" />
      </button>
      <button onClick={e => { e.stopPropagation(); onNext(); }} style={{ background: 'none', border: 'none', color: 'var(--text-mute)', cursor: 'pointer', display: 'flex', padding: 8, minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center' }}>
        <Icon name="next" size={22} color="currentColor" />
      </button>
    </div>
  );
}
