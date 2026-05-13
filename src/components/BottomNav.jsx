import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const NAV_ITEMS = [
  { path: '/', icon: '⊞', label: 'Inicio' },
  { path: '/search', icon: '⊙', label: 'Buscar' },
  { path: '/library', icon: '▤', label: 'Biblioteca' },
];

export default function BottomNav({ onCreatePlaylist }) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');

  const handleCreate = () => {
    if (!name.trim()) return;
    onCreatePlaylist(name.trim());
    setName('');
    setShowModal(false);
    navigate('/library');
  };

  return (
    <>
      {showModal && (
        <div
          onClick={() => { setShowModal(false); setName(''); }}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 200, display: 'flex', alignItems: 'flex-end' }}
        >
          <div onClick={e => e.stopPropagation()} style={{
            width: '100%', background: '#1a1a1a',
            borderRadius: '20px 20px 0 0',
            padding: '24px 20px',
            paddingBottom: 'calc(24px + env(safe-area-inset-bottom))',
          }}>
            <div style={{ width: 36, height: 4, borderRadius: 2, background: '#3a3a3a', margin: '0 auto 20px' }} />
            <h3 style={{ color: '#fff', fontFamily: "'Syne', sans-serif", fontSize: 20, fontWeight: 800, marginBottom: 20 }}>Nueva Playlist</h3>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleCreate()}
              placeholder="Nombre de la playlist"
              autoFocus
              style={{
                width: '100%', padding: '16px', borderRadius: 10, border: '1px solid #2a2a2a',
                background: '#0a0a0a', color: '#fff', fontFamily: "'DM Sans', sans-serif",
                fontSize: 16, outline: 'none', marginBottom: 16, boxSizing: 'border-box',
              }}
            />
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={() => { setShowModal(false); setName(''); }}
                style={{ flex: 1, padding: 16, borderRadius: 10, border: '1px solid #3a3a3a', background: 'transparent', color: '#fff', fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: 15, cursor: 'pointer', minHeight: 52 }}
              >Cancelar</button>
              <button
                onClick={handleCreate}
                style={{ flex: 1, padding: 16, borderRadius: 10, border: 'none', background: '#00e5a0', color: '#0a0a0a', fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: 15, cursor: 'pointer', minHeight: 52 }}
              >Crear</button>
            </div>
          </div>
        </div>
      )}

      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        height: 'calc(64px + env(safe-area-inset-bottom))',
        background: '#121212',
        borderTop: '1px solid #1e1e1e',
        display: 'flex',
        alignItems: 'flex-start',
        paddingTop: 8,
        zIndex: 100,
      }}>
        {NAV_ITEMS.map(item => {
          const active = pathname === item.path;
          return (
            <button key={item.path} onClick={() => navigate(item.path)} style={{
              flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
              background: 'none', border: 'none', cursor: 'pointer', padding: '4px 0',
              color: active ? '#fff' : '#6a6a6a', minHeight: 44,
            }}>
              <span style={{ fontSize: 22, lineHeight: 1 }}>{item.icon}</span>
              <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 10, fontWeight: active ? 700 : 400 }}>{item.label}</span>
              {active && <div style={{ width: 4, height: 4, borderRadius: '50%', background: '#00e5a0', marginTop: 1 }} />}
            </button>
          );
        })}
        <button onClick={() => setShowModal(true)} style={{
          flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
          background: 'none', border: 'none', cursor: 'pointer', padding: '4px 0',
          color: '#6a6a6a', minHeight: 44,
        }}>
          <span style={{ fontSize: 26, lineHeight: 1, fontWeight: 300 }}>+</span>
          <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 10 }}>Crear</span>
        </button>
      </div>
    </>
  );
}
