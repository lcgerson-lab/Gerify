import Icon from './Icon';
import Cover from './Cover';
import { PLAYLIST_COLORS } from '../constants';

const navItems = [
  { path: '/', icon: 'home', label: 'Inicio' },
  { path: '/search', icon: 'search', label: 'Buscar' },
  { path: '/library', icon: 'library', label: 'Biblioteca' },
];

export default function Sidebar({ playlists, onPlayPlaylist, pathname, navigate }) {
  return (
    <div style={{ width: 240, background: 'var(--bg-2)', display: 'flex', flexDirection: 'column', padding: '20px 0', borderRight: '1px solid var(--line)', flexShrink: 0 }}>
      <div style={{ padding: '0 20px 28px', display: 'flex', alignItems: 'center', gap: 8 }}>
        <Icon name="logo" size={28} />
        <span style={{ fontFamily: "'Syne', sans-serif", fontSize: 18, fontWeight: 900, color: 'var(--green)' }}>Gerify</span>
      </div>

      <nav style={{ padding: '0 10px' }}>
        {navItems.map(item => {
          const active = pathname === item.path;
          return (
            <button key={item.path} onClick={() => navigate(item.path)} style={{
              display: 'flex', alignItems: 'center', gap: 12, width: '100%',
              padding: '10px 12px', borderRadius: 8, border: 'none', cursor: 'pointer',
              background: active ? 'var(--surface)' : 'transparent',
              color: active ? 'var(--text)' : 'var(--text-mute)',
              fontSize: 14, fontFamily: 'inherit', fontWeight: 700,
              textAlign: 'left', transition: 'color 0.1s, background 0.1s',
            }}
              onMouseEnter={e => { if (!active) { e.currentTarget.style.color = 'var(--text)'; e.currentTarget.style.background = 'var(--surface)'; } }}
              onMouseLeave={e => { if (!active) { e.currentTarget.style.color = 'var(--text-mute)'; e.currentTarget.style.background = 'transparent'; } }}
            >
              <Icon name={item.icon} size={20} color="currentColor" />
              {item.label}
            </button>
          );
        })}
      </nav>

      {playlists.length > 0 && (
        <div style={{ margin: '20px 10px 0', borderTop: '1px solid var(--line)', paddingTop: 16, flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <p style={{ color: 'var(--text-dim)', fontSize: 11, fontWeight: 700, letterSpacing: 1, padding: '0 12px 10px', textTransform: 'uppercase' }}>Mis Playlists</p>
          <div style={{ overflowY: 'auto', flex: 1 }}>
            {playlists.map((pl, i) => (
              <button key={pl.id} onClick={() => onPlayPlaylist(pl)} style={{
                display: 'flex', alignItems: 'center', gap: 10, width: '100%',
                padding: '7px 12px', border: 'none', background: 'transparent',
                color: 'var(--text-mute)', fontSize: 13, fontFamily: 'inherit',
                cursor: 'pointer', textAlign: 'left', borderRadius: 6, transition: 'color 0.1s',
              }}
                onMouseEnter={e => { e.currentTarget.style.color = 'var(--text)'; e.currentTarget.style.background = 'var(--surface)'; }}
                onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-mute)'; e.currentTarget.style.background = 'transparent'; }}
              >
                <Cover seed={pl.id} hue={PLAYLIST_COLORS[i % PLAYLIST_COLORS.length] ? 195 : 195} size="xs" style={{ width: 32, height: 32 }} />
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 600 }}>{pl.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
