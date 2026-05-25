import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';

export default function ClientProfile() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    api.get('/api/me').then(res => setProfile(res.data));
  }, []);

  function handleLogout() {
    logout();
    navigate('/client/login');
  }

  if (!profile) return null;

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setShow(prev => !prev)}
        style={{
          width: 36, height: 36, borderRadius: '50%',
          background: 'var(--accent)', color: '#fff',
          border: 'none', cursor: 'pointer',
          fontSize: 13, fontWeight: 800,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
      >
        {profile.firstName?.[0]}{profile.lastName?.[0]}
      </button>

      {show && (
        <>
          <div onClick={() => setShow(false)} style={{ position: 'fixed', inset: 0, zIndex: 99 }} />
          <div style={{
            position: 'absolute', right: 0, top: 'calc(100% + 8px)',
            background: 'var(--card)', borderRadius: 14,
            boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
            border: '1px solid var(--border)',
            width: 200, zIndex: 100, overflow: 'hidden',
          }}>
            <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)' }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>
                {profile.firstName} {profile.lastName}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 2 }}>
                @{profile.username}
              </div>
            </div>
            <button
              onClick={handleLogout}
              style={{
                width: '100%', padding: '12px 16px', background: 'none',
                border: 'none', textAlign: 'left', cursor: 'pointer',
                fontSize: 13, fontWeight: 600, color: 'var(--red)',
              }}
            >
              Logout
            </button>
          </div>
        </>
      )}
    </div>
  );
}
