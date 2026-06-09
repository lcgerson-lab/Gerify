import { useState } from 'react';
import { useIsMobile } from '../hooks/useIsMobile';
import Icon from '../components/Icon';
import Cover from '../components/Cover';

function PlaylistDetail({ pl, onPlayTrack, onRemoveTrack, onDelete }) {
  return (
    <div style={{ background: 'var(--bg)', borderRadius: 12, padding: 14, marginTop: 6, border: '1px solid var(--line)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <span style={{ color: 'var(--text-mute)', fontSize: 13 }}>{pl.tracks.length} canción{pl.tracks.length !== 1 ? 'es' : ''}</span>
        <button onClick={onDelete} style={{ background: 'transparent', border: '1px solid oklch(0.35 0.10 20)', borderRadius: 6, padding: '6px 12px', color: 'oklch(0.70 0.12 20)', fontFamily: 'inherit', fontSize: 12, cursor: 'pointer', minHeight: 34 }}>Eliminar</button>
      </div>
      {pl.tracks.length === 0 ? (
        <p style={{ color: 'var(--text-dim)', fontSize: 13, textAlign: 'center', padding: '14px 0' }}>Sin canciones. Añade desde Buscar ♡</p>
      ) : (
        pl.tracks.map((track, i) => (
          <TrackRow key={i} track={track}
            actions={
              <>
                <button onClick={() => onPlayTrack(track, pl.tracks, pl.name)} style={{ background: 'var(--green)', border: 'none', borderRadius: 20, padding: '7px 13px', color: '#0a0a0a', fontWeight: 800, cursor: 'pointer', fontSize: 12, minHeight: 40 }}>▶</button>
                <button onClick={() => onRemoveTrack(i)} style={{ background: 'transparent', border: '1px solid var(--surface-3)', borderRadius: 20, padding: '7px 10px', color: 'var(--text-mute)', cursor: 'pointer', fontSize: 12, minHeight: 40 }}>✕</button>
              </>
            }
          />
        ))
      )}
    </div>
  );
}

function TrackRow({ track, actions }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '9px 0', borderBottom: '1px solid var(--line)', minHeight: 54 }}>
      <Cover item={track} size="xs" />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{track.snippet.title}</div>
        <div style={{ color: 'var(--text-mute)', fontSize: 12, marginTop: 2 }}>{track.snippet.channelTitle}</div>
      </div>
      {actions && <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>{actions}</div>}
    </div>
  );
}

const TABS = [
  { id: 'playlists', label: 'Playlists', icon: 'library' },
  { id: 'liked', label: 'Favoritos', icon: 'heart' },
  { id: 'history', label: 'Historial', icon: 'history' },
  { id: 'queue', label: 'Cola', icon: 'queue' },
];

export default function LibraryView({
  queue, currentTrack, onPlayTrack, onRemoveFromQueue,
  playlists, onCreatePlaylist, onDeletePlaylist, onAddTrackToPlaylist, onRemoveTrackFromPlaylist,
  liked, onToggleLike, history, onPlayPlaylist,
  bottomPad,
}) {
  const isMobile = useIsMobile();
  const [tab, setTab] = useState('playlists');
  const [newName, setNewName] = useState('');
  const [expanded, setExpanded] = useState(null);

  const handleCreate = () => {
    if (!newName.trim()) return;
    onCreatePlaylist(newName.trim());
    setNewName('');
  };

  const pad = isMobile ? '16px' : '32px';

  return (
    <div style={{ padding: `24px ${pad} 0`, overflowY: 'auto', height: '100%', paddingBottom: bottomPad || pad }}>
      <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: isMobile ? 22 : 28, fontWeight: 900, marginBottom: 20 }}>Biblioteca</h1>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 24, borderBottom: '1px solid var(--line)', overflowX: 'auto' }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            display: 'flex', alignItems: 'center', gap: 6, padding: '10px 14px',
            background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit',
            fontSize: 13, fontWeight: 700, whiteSpace: 'nowrap',
            color: tab === t.id ? 'var(--text)' : 'var(--text-mute)',
            borderBottom: tab === t.id ? '2px solid var(--green)' : '2px solid transparent',
            marginBottom: -1, transition: 'color 0.1s',
          }}>
            <Icon name={t.icon} size={16} color="currentColor" />
            {t.label}
          </button>
        ))}
      </div>

      {/* Playlists tab */}
      {tab === 'playlists' && (
        <div>
          {!isMobile && (
            <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
              <input value={newName} onChange={e => setNewName(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleCreate()} placeholder="Nombre de playlist..."
                style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 8, padding: '10px 14px', color: 'var(--text)', fontFamily: 'inherit', fontSize: 13, outline: 'none', width: 240 }}
              />
              <button onClick={handleCreate} style={{ background: 'var(--green)', border: 'none', borderRadius: 8, padding: '10px 18px', color: '#0a0a0a', fontWeight: 800, fontFamily: 'inherit', cursor: 'pointer', fontSize: 13 }}>+ Crear</button>
            </div>
          )}
          {isMobile && (
            <p style={{ color: 'var(--text-dim)', fontSize: 13, marginBottom: 16 }}>Toca "+" en la barra inferior para crear playlists</p>
          )}
          {playlists.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <div style={{ fontSize: 40, marginBottom: 12, opacity: 0.15 }}><Icon name="library" size={48} color="var(--text)" /></div>
              <p style={{ color: 'var(--text-dim)', fontSize: 14 }}>Crea tu primera playlist y añade canciones desde Buscar</p>
            </div>
          ) : (
            playlists.map(pl => (
              <div key={pl.id} style={{ marginBottom: 6 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 14px', background: 'var(--surface)', borderRadius: 10, cursor: 'pointer', minHeight: 62, transition: 'background 0.1s' }}
                  onClick={() => setExpanded(expanded === pl.id ? null : pl.id)}
                  onMouseEnter={e => { if (!isMobile) e.currentTarget.style.background = 'var(--surface-2)'; }}
                  onMouseLeave={e => { if (!isMobile) e.currentTarget.style.background = 'var(--surface)'; }}
                >
                  <Cover seed={pl.id} hue={195} size="xs" style={{ width: 40, height: 40 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 700 }}>{pl.name}</div>
                    <div style={{ color: 'var(--text-mute)', fontSize: 12, marginTop: 2 }}>{pl.tracks.length} canciones</div>
                  </div>
                  {pl.tracks.length > 0 && (
                    <button onClick={e => { e.stopPropagation(); onPlayPlaylist ? onPlayPlaylist(pl) : onPlayTrack(pl.tracks[0]); }} style={{ background: 'var(--green)', border: 'none', borderRadius: 20, padding: '8px 14px', color: '#0a0a0a', fontWeight: 800, cursor: 'pointer', fontSize: 12, minHeight: 40, flexShrink: 0 }}>▶</button>
                  )}
                  <span style={{ color: 'var(--text-dim)', fontSize: 14, flexShrink: 0 }}>{expanded === pl.id ? '▴' : '▾'}</span>
                </div>
                {expanded === pl.id && (
                  <PlaylistDetail pl={pl} onPlayTrack={onPlayTrack}
                    onRemoveTrack={(i) => onRemoveTrackFromPlaylist(pl.id, i)}
                    onDelete={() => { onDeletePlaylist(pl.id); setExpanded(null); }}
                  />
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* Liked/Favoritos tab */}
      {tab === 'liked' && (
        <div>
          {!liked?.length ? (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <div style={{ marginBottom: 12, opacity: 0.2 }}><Icon name="heart" size={48} color="var(--text)" /></div>
              <p style={{ color: 'var(--text-dim)', fontSize: 14 }}>Toca ♡ en una canción para añadirla a favoritos</p>
            </div>
          ) : (
            liked.map((track, i) => (
              <TrackRow key={i} track={track}
                actions={
                  <>
                    <button onClick={() => onPlayTrack(track, liked, 'Favoritos')} style={{ background: 'var(--green)', border: 'none', borderRadius: 20, padding: '7px 13px', color: '#0a0a0a', fontWeight: 800, cursor: 'pointer', fontSize: 12, minHeight: 40 }}>▶</button>
                    <button onClick={() => onToggleLike?.(track)} style={{ background: 'transparent', border: 'none', color: 'var(--green)', cursor: 'pointer', padding: '7px 10px', display: 'flex', alignItems: 'center', minHeight: 40 }}>
                      <Icon name="heart-fill" size={18} color="var(--green)" />
                    </button>
                  </>
                }
              />
            ))
          )}
        </div>
      )}

      {/* History tab */}
      {tab === 'history' && (
        <div>
          {!history?.length ? (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <div style={{ marginBottom: 12, opacity: 0.2 }}><Icon name="history" size={48} color="var(--text)" /></div>
              <p style={{ color: 'var(--text-dim)', fontSize: 14 }}>El historial aparecerá aquí</p>
            </div>
          ) : (
            history.map((track, i) => (
              <TrackRow key={i} track={track}
                actions={
                  <button onClick={() => onPlayTrack(track)} style={{ background: 'var(--green)', border: 'none', borderRadius: 20, padding: '7px 13px', color: '#0a0a0a', fontWeight: 800, cursor: 'pointer', fontSize: 12, minHeight: 40 }}>▶</button>
                }
              />
            ))
          )}
        </div>
      )}

      {/* Queue tab */}
      {tab === 'queue' && (
        <div>
          {currentTrack && (
            <div style={{ marginBottom: 20 }}>
              <p style={{ color: 'var(--green)', fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 10 }}>Reproduciendo</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, background: 'var(--surface)', borderRadius: 10, padding: '12px 14px', border: '1px solid var(--green)33' }}>
                <Cover item={currentTrack} size="xs" />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{currentTrack.snippet.title}</div>
                  <div style={{ color: 'var(--green)', fontSize: 12, marginTop: 2 }}>{currentTrack.snippet.channelTitle}</div>
                </div>
              </div>
            </div>
          )}
          <p style={{ color: 'var(--text-mute)', fontSize: 13, marginBottom: 14 }}>{queue.length} {queue.length === 1 ? 'canción' : 'canciones'} en cola</p>
          {queue.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px 0' }}>
              <div style={{ marginBottom: 12, opacity: 0.2 }}><Icon name="queue" size={40} color="var(--text)" /></div>
              <p style={{ color: 'var(--text-dim)', fontSize: 14 }}>La cola está vacía</p>
            </div>
          ) : (
            queue.map((item, i) => (
              <TrackRow key={i} track={item}
                actions={
                  <>
                    <button onClick={() => onPlayTrack(item)} style={{ background: 'var(--green)', border: 'none', borderRadius: 20, padding: '7px 13px', color: '#0a0a0a', fontWeight: 800, cursor: 'pointer', fontSize: 12, minHeight: 40 }}>▶</button>
                    <button onClick={() => onRemoveFromQueue(i)} style={{ background: 'transparent', border: '1px solid var(--surface-3)', borderRadius: 20, padding: '7px 10px', color: 'var(--text-mute)', cursor: 'pointer', fontSize: 12, minHeight: 40 }}>✕</button>
                  </>
                }
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}
