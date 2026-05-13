import { useState } from 'react';
import { useIsMobile } from '../hooks/useIsMobile';
import { YT_API_KEY, SEARCH_SUGGESTIONS } from '../constants';

const QUALITY_KEYWORDS = ['official audio', 'audio oficial', 'lyrics', 'official lyric', 'letra oficial', 'lyric video'];

function rankResults(items) {
  return [...items].sort((a, b) => {
    const aQ = QUALITY_KEYWORDS.some(k => a.snippet.title.toLowerCase().includes(k)) ? -1 : 0;
    const bQ = QUALITY_KEYWORDS.some(k => b.snippet.title.toLowerCase().includes(k)) ? -1 : 0;
    return aQ - bQ;
  });
}

function SaveMenu({ track, playlists, onAddTrackToPlaylist, onCreatePlaylist, onClose }) {
  const [newName, setNewName] = useState('');

  const handleCreate = () => {
    if (!newName.trim()) return;
    const id = onCreatePlaylist(newName.trim());
    onAddTrackToPlaylist(id, track);
    onClose();
  };

  return (
    <div style={{ position: 'absolute', top: 40, right: 0, background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 10, padding: 12, minWidth: 200, zIndex: 100, boxShadow: '0 8px 32px rgba(0,0,0,0.6)' }}>
      <p style={{ color: '#8a8a8a', fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8 }}>Guardar en</p>
      {playlists.length === 0 && (
        <p style={{ color: '#5a5a5a', fontFamily: "'DM Sans', sans-serif", fontSize: 12, marginBottom: 8 }}>Sin playlists aún</p>
      )}
      {playlists.map(pl => (
        <button key={pl.id} onClick={() => { onAddTrackToPlaylist(pl.id, track); onClose(); }} style={{
          display: 'block', width: '100%', textAlign: 'left', padding: '7px 10px',
          background: 'transparent', border: 'none', borderRadius: 6,
          color: '#ccc', fontFamily: "'DM Sans', sans-serif", fontSize: 13, cursor: 'pointer',
        }}
          onMouseEnter={e => e.currentTarget.style.background = '#2a2a2a'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        >{pl.name}</button>
      ))}
      <div style={{ borderTop: '1px solid #2a2a2a', marginTop: 8, paddingTop: 8, display: 'flex', gap: 6 }}>
        <input value={newName} onChange={e => setNewName(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleCreate()} placeholder="Nueva playlist..." style={{ flex: 1, background: '#0a0a0a', border: '1px solid #3a3a3a', borderRadius: 6, padding: '6px 8px', color: '#fff', fontFamily: "'DM Sans', sans-serif", fontSize: 12, outline: 'none' }} />
        <button onClick={handleCreate} style={{ background: '#00e5a0', border: 'none', borderRadius: 6, padding: '6px 10px', color: '#0a0a0a', fontWeight: 700, fontSize: 12, cursor: 'pointer' }}>+</button>
      </div>
    </div>
  );
}

export default function SearchView({ onPlayTrack, setQueue, playlists, onAddTrackToPlaylist, onCreatePlaylist, bottomPad }) {
  const isMobile = useIsMobile();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [savingFor, setSavingFor] = useState(null);

  const search = async (q) => {
    if (!q.trim()) return;
    setLoading(true);
    setError('');
    setSavingFor(null);
    try {
      const res = await fetch(
        `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(q + ' official audio OR lyrics')}&type=video&videoCategoryId=10&maxResults=20&key=${YT_API_KEY}`
      );
      const data = await res.json();
      if (data.error) {
        setError('API key inválida o sin quota. Reemplaza YT_API_KEY en src/constants.js');
        setResults([]);
      } else {
        setResults(rankResults(data.items || []));
      }
    } catch {
      setError('Error de red.');
    }
    setLoading(false);
  };

  const pad = isMobile ? '16px' : '32px';

  return (
    <div style={{ padding: `24px ${pad} 0`, overflowY: 'auto', height: '100%', paddingBottom: bottomPad || pad }} onClick={() => setSavingFor(null)}>
      <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: isMobile ? 22 : 28, fontWeight: 800, color: '#fff', marginBottom: 20 }}>Buscar</h1>

      {/* Barra de búsqueda */}
      <div style={{ position: 'relative', marginBottom: 28 }}>
        <span style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: '#8a8a8a', fontSize: 18 }}>⊙</span>
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && search(query)}
          placeholder="¿Qué quieres escuchar?"
          style={{
            width: '100%', padding: isMobile ? '16px 16px 16px 48px' : '14px 130px 14px 48px',
            borderRadius: 32, border: 'none', background: '#1a1a1a', color: '#fff',
            fontSize: 15, fontFamily: "'DM Sans', sans-serif", outline: 'none', boxSizing: 'border-box',
          }}
        />
        {!isMobile && (
          <button onClick={() => search(query)} style={{
            position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)',
            background: '#00e5a0', border: 'none', borderRadius: 24, padding: '8px 20px',
            color: '#0a0a0a', fontWeight: 700, fontFamily: "'DM Sans', sans-serif", cursor: 'pointer', fontSize: 13,
          }}>Buscar</button>
        )}
        {isMobile && (
          <button onClick={() => search(query)} style={{
            position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
            background: '#00e5a0', border: 'none', borderRadius: 20, padding: '8px 14px',
            color: '#0a0a0a', fontWeight: 700, fontFamily: "'DM Sans', sans-serif", cursor: 'pointer', fontSize: 12,
          }}>▶</button>
        )}
      </div>

      {/* Sugerencias */}
      {!results.length && !loading && !error && (
        <div>
          <p style={{ color: '#8a8a8a', fontFamily: "'DM Sans', sans-serif", marginBottom: 14, fontSize: 13 }}>Búsquedas populares</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {SEARCH_SUGGESTIONS.map(s => (
              <button key={s} onClick={() => { setQuery(s); search(s); }} style={{
                padding: isMobile ? '10px 16px' : '10px 20px', borderRadius: 24,
                border: '1px solid #2a2a2a', background: '#1a1a1a', color: '#ccc',
                fontFamily: "'DM Sans', sans-serif", cursor: 'pointer', fontSize: 13, minHeight: 44,
              }}
                onMouseEnter={e => { e.currentTarget.style.background = '#2a2a2a'; e.currentTarget.style.color = '#fff'; }}
                onMouseLeave={e => { e.currentTarget.style.background = '#1a1a1a'; e.currentTarget.style.color = '#ccc'; }}
              >{s}</button>
            ))}
          </div>
        </div>
      )}

      {loading && <div style={{ color: '#00e5a0', fontFamily: "'DM Sans', sans-serif", marginTop: 40, textAlign: 'center' }}>Buscando...</div>}

      {error && (
        <div style={{ background: '#1a0a0a', border: '1px solid #ff4444', borderRadius: 12, padding: 20, color: '#ff8888', fontFamily: "'DM Sans', sans-serif", fontSize: 13, lineHeight: 1.6 }}>
          ⚠️ {error}
        </div>
      )}

      {results.length > 0 && (
        <div>
          <p style={{ color: '#8a8a8a', fontFamily: "'DM Sans', sans-serif", fontSize: 13, marginBottom: 14 }}>
            {results.length} resultados para "{query}"
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {results.map((item, i) => (
              <div key={item.id.videoId} style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 12 : 16, padding: isMobile ? '10px 4px' : '8px 12px', borderRadius: 8, transition: 'background 0.15s', minHeight: 56 }}
                onMouseEnter={e => e.currentTarget.style.background = '#1a1a1a'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                onClick={e => e.stopPropagation()}
              >
                {!isMobile && <span style={{ color: '#5a5a5a', width: 20, textAlign: 'center', fontFamily: "'DM Sans', sans-serif", fontSize: 13 }}>{i + 1}</span>}
                <img
                  src={item.snippet.thumbnails.default.url}
                  alt="" onClick={() => onPlayTrack(item)}
                  style={{ width: isMobile ? 52 : 48, height: isMobile ? 39 : 36, borderRadius: 6, objectFit: 'cover', cursor: 'pointer', flexShrink: 0 }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ color: '#fff', fontFamily: "'DM Sans', sans-serif", fontSize: isMobile ? 13 : 14, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.snippet.title}</div>
                  <div style={{ color: '#8a8a8a', fontFamily: "'DM Sans', sans-serif", fontSize: 12 }}>{item.snippet.channelTitle}</div>
                </div>
                <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                  <button onClick={() => onPlayTrack(item)} style={{ background: '#00e5a0', border: 'none', borderRadius: 20, padding: isMobile ? '8px 14px' : '6px 14px', color: '#0a0a0a', fontWeight: 700, fontFamily: "'DM Sans', sans-serif", cursor: 'pointer', fontSize: 12, minHeight: 44 }}>▶</button>
                  {!isMobile && (
                    <button onClick={() => setQueue(q => [...q, item])} style={{ background: 'transparent', border: '1px solid #3a3a3a', borderRadius: 20, padding: '6px 12px', color: '#8a8a8a', fontFamily: "'DM Sans', sans-serif", cursor: 'pointer', fontSize: 12 }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = '#fff'; e.currentTarget.style.color = '#fff'; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = '#3a3a3a'; e.currentTarget.style.color = '#8a8a8a'; }}
                    >+ Cola</button>
                  )}
                  <div style={{ position: 'relative' }}>
                    <button onClick={() => setSavingFor(savingFor === item.id.videoId ? null : item.id.videoId)} style={{ background: 'transparent', border: '1px solid #3a3a3a', borderRadius: 20, padding: isMobile ? '8px 12px' : '6px 10px', color: savingFor === item.id.videoId ? '#00e5a0' : '#8a8a8a', fontFamily: "'DM Sans', sans-serif", cursor: 'pointer', fontSize: 14, minHeight: 44 }}>♡</button>
                    {savingFor === item.id.videoId && (
                      <SaveMenu track={item} playlists={playlists} onAddTrackToPlaylist={onAddTrackToPlaylist} onCreatePlaylist={onCreatePlaylist} onClose={() => setSavingFor(null)} />
                    )}
                  </div>
                  {isMobile && (
                    <button onClick={() => setQueue(q => [...q, item])} style={{ background: 'transparent', border: '1px solid #3a3a3a', borderRadius: 20, padding: '8px 12px', color: '#8a8a8a', fontFamily: "'DM Sans', sans-serif", cursor: 'pointer', fontSize: 12, minHeight: 44 }}>+</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
