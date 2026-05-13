import { useState } from 'react';
import { useIsMobile } from '../hooks/useIsMobile';

function PlaylistDetail({ pl, onPlayTrack, onRemoveTrack, onDelete }) {
  return (
    <div style={{ background: '#0d0d0d', borderRadius: 12, padding: 16, marginTop: 6, border: '1px solid #1a1a1a' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <span style={{ color: '#8a8a8a', fontFamily: "'DM Sans', sans-serif", fontSize: 13 }}>
          {pl.tracks.length} canción{pl.tracks.length !== 1 ? 'es' : ''}
        </span>
        <button onClick={onDelete} style={{ background: 'transparent', border: '1px solid #3a2a2a', borderRadius: 6, padding: '6px 12px', color: '#ff6666', fontFamily: "'DM Sans', sans-serif", fontSize: 12, cursor: 'pointer', minHeight: 36 }}>
          Eliminar
        </button>
      </div>
      {pl.tracks.length === 0 ? (
        <p style={{ color: '#5a5a5a', fontFamily: "'DM Sans', sans-serif", fontSize: 13, textAlign: 'center', padding: '16px 0' }}>
          Sin canciones. Añade desde Buscar usando ♡
        </p>
      ) : (
        pl.tracks.map((track, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid #1a1a1a', minHeight: 56 }}>
            <img src={track.snippet.thumbnails.default.url} alt="" style={{ width: 44, height: 33, borderRadius: 4, objectFit: 'cover', flexShrink: 0 }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ color: '#fff', fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{track.snippet.title}</div>
              <div style={{ color: '#8a8a8a', fontFamily: "'DM Sans', sans-serif", fontSize: 12 }}>{track.snippet.channelTitle}</div>
            </div>
            <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
              <button onClick={() => onPlayTrack(track)} style={{ background: '#00e5a0', border: 'none', borderRadius: 20, padding: '8px 14px', color: '#0a0a0a', fontWeight: 700, fontFamily: "'DM Sans', sans-serif", cursor: 'pointer', fontSize: 12, minHeight: 44 }}>▶</button>
              <button onClick={() => onRemoveTrack(i)} style={{ background: 'transparent', border: '1px solid #3a3a3a', borderRadius: 20, padding: '8px 10px', color: '#8a8a8a', fontFamily: "'DM Sans', sans-serif", cursor: 'pointer', fontSize: 12, minHeight: 44 }}>✕</button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

export default function LibraryView({ queue, currentTrack, onPlayTrack, onRemoveFromQueue, playlists, onCreatePlaylist, onDeletePlaylist, onRemoveTrackFromPlaylist, bottomPad }) {
  const isMobile = useIsMobile();
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
      {/* Mis Playlists */}
      <div style={{ marginBottom: 40 }}>
        <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: isMobile ? 22 : 28, fontWeight: 800, color: '#fff', marginBottom: 16 }}>
          Mis Playlists
        </h1>

        {/* Crear playlist inline */}
        {!isMobile && (
          <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
            <input
              value={newName}
              onChange={e => setNewName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleCreate()}
              placeholder="Nombre de playlist..."
              style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 8, padding: '10px 14px', color: '#fff', fontFamily: "'DM Sans', sans-serif", fontSize: 13, outline: 'none', width: 240 }}
            />
            <button onClick={handleCreate} style={{ background: '#00e5a0', border: 'none', borderRadius: 8, padding: '10px 18px', color: '#0a0a0a', fontWeight: 700, fontFamily: "'DM Sans', sans-serif", cursor: 'pointer', fontSize: 13 }}>
              + Crear
            </button>
          </div>
        )}

        {isMobile && (
          <p style={{ color: '#6a6a6a', fontFamily: "'DM Sans', sans-serif", fontSize: 13, marginBottom: 16 }}>
            Toca "Crear" en la barra inferior para añadir playlists
          </p>
        )}

        {playlists.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '32px 0' }}>
            <div style={{ fontSize: 40, marginBottom: 12, opacity: 0.2 }}>♫</div>
            <p style={{ color: '#5a5a5a', fontFamily: "'DM Sans', sans-serif", fontSize: 14 }}>Crea tu primera playlist y añade canciones desde Buscar</p>
          </div>
        ) : (
          playlists.map(pl => (
            <div key={pl.id} style={{ marginBottom: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 14px', background: '#1a1a1a', borderRadius: 10, cursor: 'pointer', minHeight: 64 }}
                onClick={() => setExpanded(expanded === pl.id ? null : pl.id)}
                onMouseEnter={e => { if (!isMobile) e.currentTarget.style.background = '#222'; }}
                onMouseLeave={e => { if (!isMobile) e.currentTarget.style.background = '#1a1a1a'; }}
              >
                <span style={{ width: 40, height: 40, borderRadius: 6, background: pl.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>♫</span>
                <div style={{ flex: 1 }}>
                  <div style={{ color: '#fff', fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 600 }}>{pl.name}</div>
                  <div style={{ color: '#8a8a8a', fontFamily: "'DM Sans', sans-serif", fontSize: 12 }}>{pl.tracks.length} canciones</div>
                </div>
                {pl.tracks.length > 0 && (
                  <button onClick={e => { e.stopPropagation(); onPlayTrack(pl.tracks[0]); }} style={{ background: '#00e5a0', border: 'none', borderRadius: 20, padding: '8px 14px', color: '#0a0a0a', fontWeight: 700, fontFamily: "'DM Sans', sans-serif", cursor: 'pointer', fontSize: 12, minHeight: 44, flexShrink: 0 }}>▶</button>
                )}
                <span style={{ color: '#5a5a5a', fontSize: 16, flexShrink: 0 }}>{expanded === pl.id ? '▴' : '▾'}</span>
              </div>
              {expanded === pl.id && (
                <PlaylistDetail
                  pl={pl}
                  onPlayTrack={onPlayTrack}
                  onRemoveTrack={(i) => onRemoveTrackFromPlaylist(pl.id, i)}
                  onDelete={() => { onDeletePlaylist(pl.id); setExpanded(null); }}
                />
              )}
            </div>
          ))
        )}
      </div>

      {/* Cola */}
      <div>
        <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: isMobile ? 18 : 20, fontWeight: 700, color: '#fff', marginBottom: 6 }}>Cola</h2>
        <p style={{ color: '#8a8a8a', fontFamily: "'DM Sans', sans-serif", fontSize: 13, marginBottom: 18 }}>
          {queue.length} {queue.length === 1 ? 'canción' : 'canciones'}
        </p>

        {currentTrack && (
          <div style={{ marginBottom: 20 }}>
            <p style={{ color: '#00e5a0', fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 10 }}>Reproduciendo</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, background: '#0d1f17', borderRadius: 10, padding: '12px 14px', border: '1px solid #00e5a030' }}>
              <img src={currentTrack.snippet.thumbnails.default.url} alt="" style={{ width: 48, height: 36, borderRadius: 6, objectFit: 'cover' }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ color: '#fff', fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{currentTrack.snippet.title}</div>
                <div style={{ color: '#00e5a0', fontFamily: "'DM Sans', sans-serif", fontSize: 12 }}>{currentTrack.snippet.channelTitle}</div>
              </div>
            </div>
          </div>
        )}

        {queue.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '32px 0' }}>
            <div style={{ fontSize: 36, marginBottom: 12, opacity: 0.2 }}>♫</div>
            <p style={{ color: '#5a5a5a', fontFamily: "'DM Sans', sans-serif", fontSize: 14 }}>La cola está vacía</p>
          </div>
        ) : (
          queue.map((item, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 4px', borderRadius: 8, minHeight: 56 }}
              onMouseEnter={e => { if (!isMobile) e.currentTarget.style.background = '#1a1a1a'; }}
              onMouseLeave={e => { if (!isMobile) e.currentTarget.style.background = 'transparent'; }}
            >
              <img src={item.snippet.thumbnails.default.url} alt="" style={{ width: 48, height: 36, borderRadius: 4, objectFit: 'cover', flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ color: '#fff', fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.snippet.title}</div>
                <div style={{ color: '#8a8a8a', fontFamily: "'DM Sans', sans-serif", fontSize: 12 }}>{item.snippet.channelTitle}</div>
              </div>
              <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                <button onClick={() => onPlayTrack(item)} style={{ background: '#00e5a0', border: 'none', borderRadius: 20, padding: '8px 14px', color: '#0a0a0a', fontWeight: 700, fontFamily: "'DM Sans', sans-serif", cursor: 'pointer', fontSize: 12, minHeight: 44 }}>▶</button>
                <button onClick={() => onRemoveFromQueue(i)} style={{ background: 'transparent', border: '1px solid #3a3a3a', borderRadius: 20, padding: '8px 10px', color: '#8a8a8a', fontFamily: "'DM Sans', sans-serif", cursor: 'pointer', fontSize: 12, minHeight: 44 }}>✕</button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
