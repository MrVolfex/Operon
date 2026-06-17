import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useEffect, useState } from 'react';
import api from '../api/axios';
import ClientProfile from '../pages/client/ClientProfile';

const navItems = [
  { to: '/client/dashboard', label: 'Dashboard' },
  { to: '/client/appointments', label: 'Appointments' },
  { to: '/client/invoices', label: 'Invoices' },
  { to: '/client/orders', label: 'Parts' },
  { to: '/client/status', label: 'Vehicle Status' },
];

export default function ClientLayout({ children }) {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [clientUsername, setClientUsername] = useState('');
  const [clientId, setClientId] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [showNotifs, setShowNotifs] = useState(false);

  function handleLogout() {
    logout();
    navigate('/client/login');
  }

  useEffect(() => {
    api.get('/api/me').then(res => {
      setClientUsername(res.data.username);
      setClientId(res.data.id);
      return api.get(`/api/notifications/client/${res.data.id}`);
    }).then(res => {
      setNotifications(res.data);
    });
  }, []);

  function fetchNotifications(id) {
    api.get(`/api/notifications/client/${id}`).then(res => setNotifications(res.data));
  }

  useEffect(() => {
    if (!clientId) return;
    const interval = setInterval(() => fetchNotifications(clientId), 30000);
    return () => clearInterval(interval);
  }, [clientId]);

  function markAllRead() {
    const unread = notifications.filter(n => !n.isDelivered);
    Promise.all(unread.map(n => api.patch(`/api/notifications/${n.id}/deliver`))).then(() => {
      setNotifications(prev => prev.map(n => ({ ...n, isDelivered: true })));
    });
  }

  const unreadCount = notifications.filter(n => !n.isDelivered).length;

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
          fontSize: 22, fontWeight: 900, color: '#fff',
          padding: '0 12px', marginBottom: 32,
        }}>
          OPER<span style={{ color: 'var(--accent)' }}>ON</span>
        </div>

        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              style={({ isActive }) => ({
                display: 'block', padding: '10px 12px', borderRadius: 10,
                fontSize: 14, fontWeight: 600, textDecoration: 'none',
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
            borderRadius: 10, color: 'rgba(255,255,255,0.5)',
            padding: '10px 12px', fontSize: 13, fontWeight: 600,
            cursor: 'pointer', textAlign: 'left',
          }}
        >
          Logout
        </button>
      </aside>

      <div style={{ marginLeft: 240, flex: 1, display: 'flex', flexDirection: 'column' }}>
        <header style={{
          height: 62, background: 'var(--card)',
          borderBottom: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 30px', position: 'sticky', top: 0, zIndex: 10,
        }}>
          <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)' }}>
            Welcome, {clientUsername}
          </span>

          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            {/* Bell icon */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => {
                  if (!showNotifs && clientId) fetchNotifications(clientId);
                  setShowNotifs(prev => !prev);
                }}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  padding: '6px 8px', borderRadius: 10, display: 'flex', alignItems: 'center',
                  color: 'var(--text2)',
                }}
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/>
                  <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                </svg>
                {unreadCount > 0 && (
                  <span style={{
                    position: 'absolute', top: 2, right: 2,
                    background: 'var(--red)', color: '#fff',
                    borderRadius: '50%', width: 17, height: 17,
                    fontSize: 10, fontWeight: 800,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    lineHeight: 1,
                  }}>
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {showNotifs && (
                <>
                  <div onClick={() => setShowNotifs(false)} style={{ position: 'fixed', inset: 0, zIndex: 99 }} />
                  <div style={{
                    position: 'absolute', right: 0, top: 'calc(100% + 8px)',
                    background: 'var(--card)', borderRadius: 16,
                    boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                    border: '1px solid var(--border)',
                    width: 340, maxHeight: 420, overflow: 'hidden',
                    display: 'flex', flexDirection: 'column',
                    zIndex: 100,
                  }}>
                    <div style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '14px 16px', borderBottom: '1px solid var(--border)',
                    }}>
                      <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--text)' }}>
                        Notifications
                        {unreadCount > 0 && (
                          <span style={{
                            marginLeft: 8, background: 'var(--red)', color: '#fff',
                            borderRadius: 20, padding: '1px 7px', fontSize: 11,
                          }}>
                            {unreadCount} new
                          </span>
                        )}
                      </span>
                      {unreadCount > 0 && (
                        <button
                          onClick={markAllRead}
                          style={{
                            background: 'none', border: 'none', fontSize: 12,
                            color: 'var(--accent)', fontWeight: 700, cursor: 'pointer', padding: 0,
                          }}
                        >
                          Mark all read
                        </button>
                      )}
                    </div>

                    <div style={{ overflowY: 'auto', flex: 1 }}>
                      {notifications.length === 0 ? (
                        <div style={{ padding: '24px 16px', textAlign: 'center', color: 'var(--text2)', fontSize: 13 }}>
                          No notifications yet
                        </div>
                      ) : (
                        [...notifications].reverse().map((n, i) => (
                          <div key={n.id} style={{
                            padding: '12px 16px',
                            borderBottom: i < notifications.length - 1 ? '1px solid var(--border)' : 'none',
                            background: n.isDelivered ? 'transparent' : 'var(--accent-light)',
                            display: 'flex', alignItems: 'flex-start', gap: 10,
                          }}>
                            {!n.isDelivered && (
                              <div style={{
                                width: 7, height: 7, borderRadius: '50%',
                                background: 'var(--accent)', flexShrink: 0, marginTop: 5,
                              }} />
                            )}
                            <div style={{ flex: 1 }}>
                              <div style={{ fontSize: 13, color: 'var(--text)', lineHeight: 1.4, fontWeight: n.isDelivered ? 400 : 600 }}>
                                {n.content}
                              </div>
                              <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 4 }}>
                                {new Date(n.sentAt).toLocaleString()}
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
            <ClientProfile />
          </div>
        </header>

        <main style={{ padding: '26px 30px' }}>
          {children}
        </main>
      </div>
    </div>
  );
}
