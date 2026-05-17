import { useNavigate } from 'react-router-dom';
import { useIsMobile } from '../hooks/useIsMobile';
import { FEATURED_PLAYLISTS, GENRES, PLAYLIST_COLORS } from '../constants';
import Cover from '../components/Cover';
import Icon from '../components/Icon';

function GenreTile({ genre, onClick }) {
  const bg = `oklch(0.28 0.14 ${genre.hue})`;
  return (
    <button onClick={onClick} style={{
      background: bg, borderRadius: 10, border: 'none', cursor: 'pointer',
      padding: '20px 14px', textAlign: 'left', color: 'var(--text)',
      fontFamily: 'inherit', fontSize: 14, fontWeight: 800, position: 'relative', overflow: 'hidden',
      minHeight: 80,
    }}
      onMouseEnter={e => e.currentTarget.style.filter = 'brightness(1.15)'}
      onMouseLeave={e => e.currentTarget.style.filter = 'none'}
    >
      {genre.name}
      <span style={{ position: 'absolute', bottom: -8, right: -8, fontSize: 48, opacity: 0.2, lineHeight: 1 }}>♫</span>
    </button>
  );
}

function PlaylistCard({ pl, onClick, index }) {
  return (
    <div onClick={onClick} style={{ cursor: 'pointer', borderRadius: 10, overflow: 'hidden', background: 'var(--surface)', transition: 'transform 0.15s, background 0.15s' }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.background = 'var(--surface-2)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.background = 'var(--surface)'; }}
    >
      <Cover seed={pl.id || pl.name} hue={195 + index * 30} size="md" style={{ width: '100%', height: 0, paddingBottom: '100%', borderRadius: 0 }} />
      <div style={{ padding: '10px 12px 12px' }}>
        <div style={{ fontSize: 13, fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{pl.name}</div>
        <div style={{ fontSize: 11, color: 'var(--text-mute)', marginTop: 2 }}>{pl.tracks ? `${pl.tracks.length} canciones` : 'Playlist'}</div>
      </div>
    </div>
  );
}

export default function HomeView({ playlists, onPlayPlaylist, bottomPad }) {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const hours = new Date().getHours();
  const greeting = hours < 12 ? 'Buenos días' : hours < 18 ? 'Buenas tardes' : 'Buenas noches';

  const quickItems = [
    ...playlists.slice(0, 6),
    ...FEATURED_PLAYLISTS.slice(0, Math.max(0, 6 - playlists.length)),
  ].slice(0, 6);

  const pad = isMobile ? '16px' : '32px';

  return (
    <div style={{ overflowY: 'auto', height: '100%', paddingBottom: bottomPad || pad }}>
      <div style={{ padding: `24px ${pad} 0` }}>
        <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: isMobile ? 22 : 28, fontWeight: 900, color: 'var(--text)', marginBottom: 24 }}>
          {greeting}
        </h1>

        {/* Quick picks */}
        {quickItems.length > 0 && (
          <div style={{ marginBottom: 36 }}>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(3, 1fr)', gap: 8 }}>
              {quickItems.map((item, i) => (
                <button key={item.id || i} onClick={() => onPlayPlaylist(item)} style={{
                  display: 'flex', alignItems: 'center', gap: 0,
                  background: 'var(--surface)', borderRadius: 8, border: 'none',
                  cursor: 'pointer', overflow: 'hidden', height: 56, textAlign: 'left',
                  transition: 'background 0.1s',
                }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-2)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'var(--surface)'}
                >
                  <div style={{ width: 56, height: 56, flexShrink: 0, background: item.color || `oklch(0.28 0.14 ${195 + i * 40})`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon name="library" size={22} color="rgba(255,255,255,0.5)" />
                  </div>
                  <span style={{ color: 'var(--text)', fontFamily: 'inherit', fontSize: 12, fontWeight: 700, padding: '0 10px', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                    {item.name}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Genres */}
        <div style={{ marginBottom: 36 }}>
          <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: isMobile ? 18 : 20, fontWeight: 800, marginBottom: 14 }}>Géneros</h2>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', gap: 8 }}>
            {GENRES.map(g => (
              <GenreTile key={g.id} genre={g} onClick={() => navigate(`/search?genre=${encodeURIComponent(g.name)}`)} />
            ))}
          </div>
        </div>

        {/* Featured playlists */}
        {!isMobile && (
          <div style={{ marginBottom: 36 }}>
            <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: 20, fontWeight: 800, marginBottom: 16 }}>Playlists destacadas</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 16 }}>
              {FEATURED_PLAYLISTS.map((pl, i) => (
                <PlaylistCard key={pl.id} pl={pl} onClick={() => navigate('/search')} index={i} />
              ))}
            </div>
          </div>
        )}

        {/* How it works (desktop only) */}
        {!isMobile && (
          <div style={{ background: 'var(--surface)', borderRadius: 16, padding: 28, border: '1px solid var(--green)22', marginBottom: 16 }}>
            <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: 18, fontWeight: 800, marginBottom: 20 }}>¿Cómo funciona Gerify?</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
              {[
                { icon: 'search', title: 'Busca cualquier canción', desc: 'Accede al catálogo completo de YouTube Music — millones de canciones, gratis' },
                { icon: 'play', title: 'Reproduce al instante', desc: 'Streaming directo sin anuncios de video, solo audio puro' },
                { icon: 'library', title: 'Gestiona tu biblioteca', desc: 'Crea playlists, añade canciones y controla la cola de reproducción' },
              ].map((f, i) => (
                <div key={i}>
                  <div style={{ marginBottom: 12, color: 'var(--green)' }}>
                    <Icon name={f.icon} size={28} color="var(--green)" />
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 8 }}>{f.title}</div>
                  <div style={{ fontSize: 13, color: 'var(--text-mute)', lineHeight: 1.6 }}>{f.desc}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
