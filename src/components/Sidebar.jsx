import { useNavigate, useLocation } from 'react-router-dom';
import GerifyLogo from './GerifyLogo';

const navItems = [
  { path: "/", icon: "⊞", label: "Inicio" },
  { path: "/search", icon: "⊙", label: "Buscar" },
  { path: "/library", icon: "▤", label: "Biblioteca" },
];

export default function Sidebar({ playlists, onPlayPlaylist }) {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  return (
    <div style={{
      width: 240, background: "#0a0a0a", display: "flex", flexDirection: "column",
      padding: "24px 0", borderRight: "1px solid #1a1a1a", flexShrink: 0,
    }}>
      <div style={{ padding: "0 24px 32px" }}>
        <GerifyLogo />
      </div>

      <nav style={{ padding: "0 12px" }}>
        {navItems.map(item => (
          <button key={item.path} onClick={() => navigate(item.path)} style={{
            display: "flex", alignItems: "center", gap: 14, width: "100%",
            padding: "10px 12px", borderRadius: 8, border: "none", cursor: "pointer",
            background: pathname === item.path ? "#1a1a1a" : "transparent",
            color: pathname === item.path ? "#fff" : "#8a8a8a",
            fontSize: 14, fontFamily: "'DM Sans', sans-serif", fontWeight: 600,
            transition: "all 0.15s", textAlign: "left",
          }}
            onMouseEnter={e => e.currentTarget.style.color = "#fff"}
            onMouseLeave={e => { if (pathname !== item.path) e.currentTarget.style.color = "#8a8a8a"; }}
          >
            <span style={{ fontSize: 18 }}>{item.icon}</span>
            {item.label}
          </button>
        ))}
      </nav>

      {playlists.length > 0 && (
        <div style={{ margin: "24px 12px 0", borderTop: "1px solid #1a1a1a", paddingTop: 16 }}>
          <p style={{ color: "#5a5a5a", fontSize: 11, fontFamily: "'DM Sans', sans-serif", fontWeight: 700, letterSpacing: 1, padding: "0 12px 12px", textTransform: "uppercase" }}>
            Mis Playlists
          </p>
          {playlists.map(pl => (
            <button key={pl.id} onClick={() => onPlayPlaylist(pl)} style={{
              display: "flex", alignItems: "center", gap: 10, width: "100%",
              padding: "8px 12px", border: "none", background: "transparent",
              color: "#8a8a8a", fontSize: 13, fontFamily: "'DM Sans', sans-serif",
              cursor: "pointer", textAlign: "left", borderRadius: 6, transition: "color 0.15s",
            }}
              onMouseEnter={e => e.currentTarget.style.color = "#fff"}
              onMouseLeave={e => e.currentTarget.style.color = "#8a8a8a"}
            >
              <span style={{
                width: 32, height: 32, borderRadius: 4, background: pl.color,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 12, flexShrink: 0,
              }}>♫</span>
              <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{pl.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
