import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';

export default function ClientLogin() {
  const [tab, setTab] = useState('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [reg, setReg] = useState({ firstName: '', lastName: '', username: '', password: '', email: '', phone: '', clientType: 'INDIVIDUAL' });
  const [regError, setRegError] = useState('');
  const [regSuccess, setRegSuccess] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleLogin(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/auth/client/login', { username, password });
      login(res.data.token, res.data.role);
      navigate('/client/dashboard');
    } catch {
      setError('Wrong username or password.');
    } finally {
      setLoading(false);
    }
  }

  async function handleRegister(e) {
    e.preventDefault();
    setRegError('');
    setRegSuccess('');
    setLoading(true);
    try {
      await api.post('/api/clients', reg);
      setRegSuccess('Account created! You can now log in.');
      setTab('login');
      setUsername(reg.username);
      setPassword('');
      setReg({ firstName: '', lastName: '', username: '', password: '', email: '', phone: '', clientType: 'INDIVIDUAL' });
    } catch {
      setRegError('Registration failed. Username or email may already be taken.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px 16px',
    }}>
      <div style={{
        background: 'var(--card)',
        borderRadius: 20,
        boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
        padding: '36px 36px 28px',
        width: '100%',
        maxWidth: 420,
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <h1 style={{ fontSize: 30, fontWeight: 900, color: 'var(--text)', margin: 0, letterSpacing: '-0.5px' }}>
            OPER<span style={{ color: 'var(--accent)' }}>ON</span>
          </h1>
          <p style={{ color: 'var(--text2)', fontSize: 13, marginTop: 4 }}>
            Client Portal
          </p>
        </div>

        {/* Tabs */}
        <div style={{
          display: 'flex',
          background: 'var(--bg)',
          borderRadius: 12,
          padding: 4,
          marginBottom: 28,
          gap: 4,
        }}>
          {['login', 'register'].map(t => (
            <button
              key={t}
              type="button"
              onClick={() => { setTab(t); setError(''); setRegError(''); setRegSuccess(''); }}
              style={{
                flex: 1,
                padding: '9px 0',
                border: 'none',
                borderRadius: 9,
                fontSize: 13,
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.15s',
                background: tab === t ? 'var(--card)' : 'transparent',
                color: tab === t ? 'var(--text)' : 'var(--text2)',
                boxShadow: tab === t ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              }}
            >
              {t === 'login' ? 'Login' : 'Register'}
            </button>
          ))}
        </div>

        {/* Login Form */}
        {tab === 'login' && (
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {regSuccess && (
              <div style={{ background: 'var(--green-bg)', color: 'var(--green)', borderRadius: 10, padding: '10px 14px', fontSize: 13, fontWeight: 600 }}>
                {regSuccess}
              </div>
            )}
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                required
                style={{
                  width: '100%', padding: '11px 14px', boxSizing: 'border-box',
                  border: '1px solid var(--border)', borderRadius: 10,
                  fontSize: 14, outline: 'none', background: 'var(--bg)', color: 'var(--text)',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                style={{
                  width: '100%', padding: '11px 14px', boxSizing: 'border-box',
                  border: '1px solid var(--border)', borderRadius: 10,
                  fontSize: 14, outline: 'none', background: 'var(--bg)', color: 'var(--text)',
                }}
              />
            </div>

            {error && (
              <div style={{ background: 'var(--red-bg)', color: 'var(--red)', borderRadius: 10, padding: '10px 14px', fontSize: 13 }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%', background: 'var(--accent)', color: '#fff',
                border: 'none', borderRadius: 10, padding: '12px 0',
                fontWeight: 700, fontSize: 14, marginTop: 4,
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>
        )}

        {/* Register Form */}
        {tab === 'register' && (
          <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {[
                { label: 'First Name', key: 'firstName', placeholder: 'John' },
                { label: 'Last Name', key: 'lastName', placeholder: 'Doe' },
              ].map(f => (
                <div key={f.key}>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>
                    {f.label}
                  </label>
                  <input
                    type="text"
                    value={reg[f.key]}
                    onChange={e => setReg(prev => ({ ...prev, [f.key]: e.target.value }))}
                    required
                    placeholder={f.placeholder}
                    style={{
                      width: '100%', padding: '10px 12px', boxSizing: 'border-box',
                      border: '1px solid var(--border)', borderRadius: 10,
                      fontSize: 13, outline: 'none', background: 'var(--bg)', color: 'var(--text)',
                    }}
                  />
                </div>
              ))}
            </div>

            {[
              { label: 'Username', key: 'username', type: 'text', placeholder: 'john.doe' },
              { label: 'Password', key: 'password', type: 'password', placeholder: '••••••••' },
              { label: 'Email', key: 'email', type: 'email', placeholder: 'john@example.com' },
              { label: 'Phone', key: 'phone', type: 'text', placeholder: '+381 60 123 4567' },
            ].map(f => (
              <div key={f.key}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>
                  {f.label}
                </label>
                <input
                  type={f.type}
                  value={reg[f.key]}
                  onChange={e => setReg(prev => ({ ...prev, [f.key]: e.target.value }))}
                  required
                  placeholder={f.placeholder}
                  style={{
                    width: '100%', padding: '10px 12px', boxSizing: 'border-box',
                    border: '1px solid var(--border)', borderRadius: 10,
                    fontSize: 13, outline: 'none', background: 'var(--bg)', color: 'var(--text)',
                  }}
                />
              </div>
            ))}

            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>
                Account Type
              </label>
              <select
                value={reg.clientType}
                onChange={e => setReg(prev => ({ ...prev, clientType: e.target.value }))}
                style={{
                  width: '100%', padding: '10px 12px', boxSizing: 'border-box',
                  border: '1px solid var(--border)', borderRadius: 10,
                  fontSize: 13, outline: 'none', background: 'var(--bg)', color: 'var(--text)',
                  cursor: 'pointer',
                }}
              >
                <option value="INDIVIDUAL">Individual</option>
                <option value="COMPANY">Company</option>
                <option value="FLEET">Fleet</option>
              </select>
            </div>

            {regError && (
              <div style={{ background: 'var(--red-bg)', color: 'var(--red)', borderRadius: 10, padding: '10px 14px', fontSize: 13 }}>
                {regError}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%', background: 'var(--accent)', color: '#fff',
                border: 'none', borderRadius: 10, padding: '12px 0',
                fontWeight: 700, fontSize: 14, marginTop: 4,
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>
        )}

        {/* Footer */}
        <p style={{ textAlign: 'center', marginTop: 24, marginBottom: 0, fontSize: 12, color: 'var(--text3)' }}>
          Worker?{' '}
          <Link to="/login" style={{ color: 'var(--accent)', fontWeight: 700 }}>
            Worker login
          </Link>
        </p>
      </div>
    </div>
  );
}
