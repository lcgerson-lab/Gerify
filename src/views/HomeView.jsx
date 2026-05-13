import { useNavigate } from 'react-router-dom';
import { useIsMobile } from '../hooks/useIsMobile';
import { FEATURED_PLAYLISTS } from '../constants';

export default function HomeView({ playlists, onPlayPlaylist, bottomPad }) {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const hours = new Date().getHours();
  const greeting = hours < 12 ? 'Buenos días' : hours < 18 ? 'Buenas tardes' : 'Buenas noches';

  // Quick picks: playlists propias primero, luego destacadas hasta llenar 6
  const quickItems = [
    ...playlists.slice(0, 6),
    ...FEATURED_PLAYLISTS.slice(0, Math.max(0, 6 - playlists.length)),
  ].slice(0, 6);

  if (isMobile) {
    return (
      <div style={{ overflowY: 'auto', height: '100%', paddingBottom: bottomPad || '24px' }}>
        <div style={{ padding: '8px 16px 20px' }}>
          <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: 22, fontWeight: 800, color: '#fff', marginBottom: 16 }}>
            {greeting}
          </h1>

          {/* Quick picks grid — estilo Spotify */}
          {quickItems.length > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 32 }}>
              {quickItems.map((item, i) => (
                <button key={item.id || i} onClick={() => onPlayPlaylist(item)} style={{
                  display: 'flex', alignItems: 'center', gap: 0,
                  background: '#1a1a1a', borderRadius: 8, border: 'none',
                  cursor: 'pointer', overflow: 'hidden', height: 56,
                  textAlign: 'left', minHeight: 56,
                }}>
                  <div style={{
                    width: 56, height: 56, flexShrink: 0,
                    background: item.color ? `linear-gradient(135deg, ${item.color}, #111)` : '#1a472a',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22,
                  }}>♫</div>
                  <span style={{
                    color: '#fff', fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontWeight: 700,
                    padding: '0 10px', overflow: 'hidden',
                    display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                  }}>{item.name}</span>
                </button>
              ))}
            </div>
          )}

          {/* Playlists destacadas */}
          <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: 18, fontWeight: 700, color: '#fff', marginBottom: 14 }}>
            Playlists destacadas
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {FEATURED_PLAYLISTS.map(pl => (
              <button key={pl.id} onClick={() => navigate('/search')} style={{
                display: 'flex', alignItems: 'center', gap: 14,
                background: '#1a1a1a', borderRadius: 10, border: 'none',
                cursor: 'pointer', padding: '12px 14px', textAlign: 'left', minHeight: 68,
              }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 6, flexShrink: 0,
                  background: `linear-gradient(135deg, ${pl.color}, #111)`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20,
                }}>♫</div>
                <div>
                  <div style={{ color: '#fff', fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 600 }}>{pl.name}</div>
                  <div style={{ color: '#6a6a6a', fontFamily: "'DM Sans', sans-serif", fontSize: 12, marginTop: 2 }}>Playlist</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  /* ── DESKTOP (igual que antes) ── */
  return (
    <div style={{ padding: '32px', overflowY: 'auto', height: '100%' }}>
      <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: 28, fontWeight: 800, color: '#fff', marginBottom: 32 }}>{greeting}</h1>

      <section style={{ marginBottom: 48 }}>
        <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: 20, fontWeight: 700, color: '#fff', marginBottom: 20 }}>Playlists destacadas</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 16 }}>
          {FEATURED_PLAYLISTS.map(pl => (
            <div key={pl.id} onClick={() => onPlayPlaylist(pl)} style={{
              background: '#1a1a1a', borderRadius: 12, padding: 16, cursor: 'pointer',
              transition: 'background 0.2s, transform 0.2s', position: 'relative', overflow: 'hidden',
            }}
              onMouseEnter={e => { e.currentTarget.style.background = '#222'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = '#1a1a1a'; e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              <div style={{ width: '100%', paddingBottom: '100%', borderRadius: 8, background: `linear-gradient(135deg, ${pl.color}, #111)`, marginBottom: 12, position: 'relative' }}>
                <span style={{ position: 'absolute', bottom: 10, right: 10, fontSize: 32, opacity: 0.6 }}>♫</span>
              </div>
              <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 600, color: '#fff' }}>{pl.name}</div>
              <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: '#8a8a8a', marginTop: 4 }}>Playlist</div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: 20, fontWeight: 700, color: '#fff', marginBottom: 16 }}>¿Cómo funciona Gerify?</h2>
        <div style={{ background: '#1a1a1a', borderRadius: 16, padding: 24, border: '1px solid #00e5a022' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
            {[
              { icon: '⊙', title: 'Busca cualquier canción', desc: 'Accede al catálogo completo de YouTube Music — millones de canciones, gratuito' },
              { icon: '▶', title: 'Reproduce al instante', desc: 'Streaming directo sin anuncios de video, solo audio puro' },
              { icon: '≡', title: 'Gestiona tu biblioteca', desc: 'Crea playlists propias, añade canciones y controla la cola de reproducción' },
            ].map((f, i) => (
              <div key={i}>
                <div style={{ fontSize: 28, marginBottom: 12, color: '#00e5a0' }}>{f.icon}</div>
                <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 700, color: '#fff', marginBottom: 8 }}>{f.title}</div>
                <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: '#6a6a6a', lineHeight: 1.6 }}>{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
