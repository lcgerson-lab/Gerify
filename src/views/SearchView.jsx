import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useIsMobile } from '../hooks/useIsMobile';
import { YT_API_KEY, SEARCH_SUGGESTIONS, GENRES } from '../constants';
import Icon from '../components/Icon';
import Cover from '../components/Cover';

const QUALITY_KEYWORDS = ['official audio', 'audio oficial', 'lyrics', 'official lyric', 'letra oficial', 'lyric video'];
const FILTERS = [
  { id: 'all', label: 'Todo' },
  { id: 'audio', label: 'Audio oficial' },
  { id: 'lyrics', label: 'Lyrics' },
];

function rankResults(items) {
  return [...items].sort((a, b) => {
    const aQ = QUALITY_KEYWORDS.some(k => a.snippet.title.toLowerCase().includes(k)) ? -1 : 0;
    const bQ = QUALITY_KEYWORDS.some(k => b.snippet.title.toLowerCase().includes(k)) ? -1 : 0;
    return aQ - bQ;
  });
}

function filterResults(items, filterId) {
  if (filterId === 'all') return items;
  if (filterId === 'audio') return items.filter(i => ['official audio', 'audio oficial'].some(k => i.snippet.title.toLowerCase().includes(k)));
  if (filterId === 'lyrics') return items.filter(i => ['lyrics', 'official lyric', 'letra oficial', 'lyric video'].some(k => i.snippet.title.toLowerCase().includes(k)));
  return items;
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
    <div style={{ position: 'absolute', top: 40, right: 0, background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 10, padding: 12, minWidth: 200, zIndex: 200, boxShadow: '0 8px 32px rgba(0,0,0,0.6)' }} onClick={e => e.stopPropagation()}>
      <p style={{ color: 'var(--text-mute)', fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8 }}>Guardar en</p>
      {playlists.length === 0 && <p style={{ color: 'var(--text-dim)', fontSize: 12, marginBottom: 8 }}>Sin playlists aún</p>}
      {playlists.map(pl => (
        <button key={pl.id} onClick={() => { onAddTrackToPlaylist(pl.id, track); onClose(); }} style={{ display: 'block', width: '100%', textAlign: 'left', padding: '7px 10px', background: 'transparent', border: 'none', borderRadius: 6, color: 'var(--text-mute)', fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}
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

export default function SearchView({ onPlayTrack, onAddToQueue, playlists, onAddTrackToPlaylist, onCreatePlaylist, likedIds, onToggleLike, bottomPad }) {
  const isMobile = useIsMobile();
  const [searchParams] = useSearchParams();
  const [query, setQuery] = useState('');
  const [allResults, setAllResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [savingFor, setSavingFor] = useState(null);
  const [filter, setFilter] = useState('all');

  // Auto-search if genre param set from HomeView
  useEffect(() => {
    const genre = searchParams.get('genre');
    if (genre) { setQuery(genre); search(genre); }
  }, []);

  const search = async (q) => {
    if (!q.trim()) return;
    setLoading(true);
    setError('');
    setSavingFor(null);
    setFilter('all');
    try {
      const res = await fetch(
        `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(q + ' official audio OR lyrics')}&type=video&videoCategoryId=10&maxResults=50&key=${YT_API_KEY}`
      );
      const data = await res.json();
      if (data.error) {
        setError('API key inválida o sin quota. Reemplaza YT_API_KEY en src/constants.js');
        setAllResults([]);
      } else {
        setAllResults(rankResults(data.items || []));
      }
    } catch {
      setError('Error de red.');
    }
    setLoading(false);
  };

  const results = filterResults(allResults, filter);
  const pad = isMobile ? '16px' : '32px';

  return (
    <div style={{ padding: `24px ${pad} 0`, overflowY: 'auto', height: '100%', paddingBottom: bottomPad || pad }} onClick={() => setSavingFor(null)}>
      <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: isMobile ? 22 : 28, fontWeight: 900, marginBottom: 20 }}>Buscar</h1>

      {/* Search bar */}
      <div style={{ position: 'relative', marginBottom: 20 }}>
        <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-mute)', display: 'flex' }}>
          <Icon name="search" size={18} />
        </span>
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && search(query)}
          placeholder="¿Qué quieres escuchar?"
          style={{
            width: '100%', padding: isMobile ? '14px 14px 14px 44px' : '13px 120px 13px 44px',
            borderRadius: 32, border: 'none', background: 'var(--surface)', color: 'var(--text)',
            fontSize: 15, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box',
          }}
        />
        <button onClick={() => search(query)} style={{
          position: 'absolute', right: 6, top: '50%', transform: 'translateY(-50%)',
          background: 'var(--green)', border: 'none', borderRadius: 24, padding: isMobile ? '8px 14px' : '8px 20px',
          color: '#0a0a0a', fontWeight: 800, fontFamily: 'inherit', cursor: 'pointer', fontSize: 13,
        }}>Buscar</button>
      </div>

      {/* Filter tabs (only when there are results) */}
      {allResults.length > 0 && (
        <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>
          {FILTERS.map(f => (
            <button key={f.id} onClick={() => setFilter(f.id)} style={{
              padding: '6px 14px', borderRadius: 20, border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, fontWeight: 600,
              background: filter === f.id ? 'var(--text)' : 'var(--surface)',
              color: filter === f.id ? '#0a0a0a' : 'var(--text-mute)',
              transition: 'all 0.1s',
            }}>{f.label}</button>
          ))}
        </div>
      )}

      {/* Suggestions */}
      {!allResults.length && !loading && !error && (
        <div>
          <p style={{ color: 'var(--text-mute)', marginBottom: 14, fontSize: 13 }}>Búsquedas populares</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 32 }}>
            {SEARCH_SUGGESTIONS.map(s => (
              <button key={s} onClick={() => { setQuery(s); search(s); }} style={{
                padding: '10px 18px', borderRadius: 24, border: '1px solid var(--line)',
                background: 'var(--surface)', color: 'var(--text-mute)', fontFamily: 'inherit',
                cursor: 'pointer', fontSize: 13, fontWeight: 600, minHeight: 44, transition: 'all 0.1s',
              }}
                onMouseEnter={e => { e.currentTarget.style.background = 'var(--surface-2)'; e.currentTarget.style.color = 'var(--text)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'var(--surface)'; e.currentTarget.style.color = 'var(--text-mute)'; }}
              >{s}</button>
            ))}
          </div>
          <p style={{ color: 'var(--text-mute)', marginBottom: 12, fontSize: 13 }}>Explorar géneros</p>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', gap: 8 }}>
            {GENRES.map(g => (
              <button key={g.id} onClick={() => { setQuery(g.name); search(g.name); }} style={{
                background: `oklch(0.28 0.14 ${g.hue})`, borderRadius: 10, border: 'none', cursor: 'pointer',
                padding: '16px 14px', textAlign: 'left', color: 'var(--text)', fontFamily: 'inherit',
                fontSize: 13, fontWeight: 800, minHeight: 64, position: 'relative', overflow: 'hidden',
              }}
                onMouseEnter={e => e.currentTarget.style.filter = 'brightness(1.15)'}
                onMouseLeave={e => e.currentTarget.style.filter = 'none'}
              >{g.name}</button>
            ))}
          </div>
        </div>
      )}

      {loading && (
        <div style={{ color: 'var(--green)', marginTop: 40, textAlign: 'center', fontSize: 14 }}>Buscando...</div>
      )}

      {error && (
        <div style={{ background: 'oklch(0.18 0.05 20)', border: '1px solid oklch(0.50 0.15 20)', borderRadius: 12, padding: 20, color: 'oklch(0.75 0.12 20)', fontSize: 13, lineHeight: 1.6 }}>
          ⚠️ {error}
        </div>
      )}

      {results.length > 0 && (
        <div>
          <p style={{ color: 'var(--text-mute)', fontSize: 13, marginBottom: 14 }}>
            {results.length} resultados{allResults.length !== results.length ? ` (filtrado de ${allResults.length})` : ''} para &ldquo;{query}&rdquo;
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {results.map((item, i) => {
              const isLiked = likedIds?.has(item.id.videoId);
              return (
                <div key={item.id.videoId} style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 12 : 14, padding: isMobile ? '10px 4px' : '8px 10px', borderRadius: 8, minHeight: 56 }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--surface)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  onClick={e => e.stopPropagation()}
                >
                  {!isMobile && <span style={{ color: 'var(--text-dim)', width: 20, textAlign: 'center', fontSize: 12, fontWeight: 600 }}>{i + 1}</span>}
                  <Cover item={item} size="xs" style={{ cursor: 'pointer' }} />
                  <div style={{ flex: 1, minWidth: 0, cursor: 'pointer' }} onClick={() => onPlayTrack(item, results, `Búsqueda: ${query}`)}>
                    <div style={{ fontSize: isMobile ? 13 : 14, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.snippet.title}</div>
                    <div style={{ color: 'var(--text-mute)', fontSize: 12, marginTop: 2 }}>{item.snippet.channelTitle}</div>
                  </div>
                  <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                    <button onClick={() => onPlayTrack(item, results, `Búsqueda: ${query}`)} style={{ background: 'var(--green)', border: 'none', borderRadius: 20, padding: '8px 14px', color: '#0a0a0a', fontWeight: 800, cursor: 'pointer', fontSize: 12, minHeight: 40 }}>▶</button>
                    {!isMobile && (
                      <button onClick={() => onAddToQueue(item)} style={{ background: 'transparent', border: '1px solid var(--surface-3)', borderRadius: 20, padding: '6px 12px', color: 'var(--text-mute)', cursor: 'pointer', fontSize: 12, fontFamily: 'inherit' }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--text)'; e.currentTarget.style.color = 'var(--text)'; }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--surface-3)'; e.currentTarget.style.color = 'var(--text-mute)'; }}
                      >+ Cola</button>
                    )}
                    <div style={{ position: 'relative' }}>
                      <button onClick={e => { e.stopPropagation(); setSavingFor(savingFor === item.id.videoId ? null : item.id.videoId); }} style={{ background: 'transparent', border: '1px solid var(--surface-3)', borderRadius: 20, padding: isMobile ? '8px 12px' : '6px 10px', color: isLiked ? 'var(--green)' : 'var(--text-mute)', cursor: 'pointer', fontSize: 14, minHeight: 40, display: 'flex', alignItems: 'center' }}>
                        <Icon name={isLiked ? 'heart-fill' : 'heart'} size={16} color="currentColor" />
                      </button>
                      {savingFor === item.id.videoId && (
                        <SaveMenu track={item} playlists={playlists} onAddTrackToPlaylist={onAddTrackToPlaylist} onCreatePlaylist={onCreatePlaylist} onClose={() => setSavingFor(null)} />
                      )}
                    </div>
                    {isMobile && (
                      <button onClick={() => onAddToQueue(item)} style={{ background: 'transparent', border: '1px solid var(--surface-3)', borderRadius: 20, padding: '8px 12px', color: 'var(--text-mute)', cursor: 'pointer', fontSize: 12, minHeight: 40 }}>+</button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
