import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { to: '/dashboard', label: 'Moji nalozi' },
  { to: '/parts', label: 'Delovi' },
  { to: '/schedule', label: 'Zakazivanje' },
];

export default function Layout({ children }) {
  const { logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)' }}>
      <aside style={{
        width: 240,
        background: 'var(--sidebar)',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        top: 0, left: 0, bottom: 0,
        padding: '24px 12px',
      }}>
        <div style={{
          fontSize: 22,
          fontWeight: 900,
          color: '#fff',
          padding: '0 12px',
          marginBottom: 32,
        }}>
          OPER<span style={{ color: 'var(--accent)' }}>ON</span>
        </div>

        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              style={({ isActive }) => ({
                display: 'block',
                padding: '10px 12px',
                borderRadius: 10,
                fontSize: 14,
                fontWeight: 600,
                textDecoration: 'none',
                background: isActive ? 'var(--accent)' : 'transparent',
                color: isActive ? '#fff' : 'rgba(255,255,255,0.45)',
              })}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <button
          onClick={handleLogout}
          style={{
            background: 'transparent',
            border: '1px solid rgba(255,255,255,0.15)',
            borderRadius: 10,
            color: 'rgba(255,255,255,0.5)',
            padding: '10px 12px',
            fontSize: 13,
            fontWeight: 600,
            cursor: 'pointer',
            textAlign: 'left',
          }}
        >
          Odjava
        </button>
      </aside>

      <div style={{ marginLeft: 240, flex: 1, display: 'flex', flexDirection: 'column' }}>
        <header style={{
          height: 62,
          background: 'var(--card)',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          padding: '0 30px',
          position: 'sticky',
          top: 0,
          zIndex: 10,
        }}>
          <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)' }}>
            Radnički portal
          </span>
        </header>

        <main style={{ padding: '26px 30px' }}>
          {children}
        </main>
      </div>
    </div>
  );
}
