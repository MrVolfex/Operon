import { useEffect, useState } from 'react';
import OwnerLayout from '../../components/OwnerLayout';
import api from '../../api/axios';

const avatarColors = ['#F97316','#3B82F6','#8B5CF6','#22C55E','#EF4444','#F59E0B','#0891B2'];

const EMPTY_FORM = { firstName: '', lastName: '', email: '', username: '', password: '', phone: '', role: 'MECHANIC' };

export default function Workers() {
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    api.get('/api/workers')
      .then(res => setWorkers(res.data))
      .catch(() => setError('Error loading workers.'))
      .finally(() => setLoading(false));
  }, []);

  function handleChange(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setFormError('');
    api.post('/api/workers', form)
      .then(res => {
        setWorkers(prev => [...prev, res.data]);
        setForm(EMPTY_FORM);
        setShowForm(false);
      })
      .catch(() => setFormError('Failed to create worker. Check that username is unique.'))
      .finally(() => setSubmitting(false));
  }

  return (
    <OwnerLayout>
      <div style={{ marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text)', margin: 0 }}>
            Workers
          </h2>
          <p style={{ color: 'var(--text2)', fontSize: 14, marginTop: 4 }}>
            {workers.length} workers
          </p>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            style={{
              background: 'var(--accent)', color: '#fff', border: 'none',
              borderRadius: 10, padding: '9px 18px', fontWeight: 700,
              fontSize: 13, cursor: 'pointer',
            }}
          >
            + Add Worker
          </button>
        )}
      </div>

      {showForm && (
        <div style={{ background: 'var(--card)', borderRadius: 16, padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.06)', marginBottom: 24 }}>
          <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--text)', marginBottom: 20 }}>New Worker</div>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              {[
                { label: 'First Name', name: 'firstName', type: 'text' },
                { label: 'Last Name',  name: 'lastName',  type: 'text' },
                { label: 'Username',   name: 'username',  type: 'text' },
                { label: 'Password',   name: 'password',  type: 'password' },
                { label: 'Email',      name: 'email',     type: 'email' },
                { label: 'Phone',      name: 'phone',     type: 'text' },
              ].map(f => (
                <div key={f.name}>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--text3)', marginBottom: 6 }}>{f.label}</label>
                  <input
                    required
                    name={f.name}
                    type={f.type}
                    value={form[f.name]}
                    onChange={handleChange}
                    style={{ width: '100%', boxSizing: 'border-box', padding: '9px 12px', border: '1px solid var(--border)', borderRadius: 10, fontSize: 13, outline: 'none', background: 'var(--bg)', color: 'var(--text)' }}
                  />
                </div>
              ))}
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--text3)', marginBottom: 6 }}>Role</label>
                <select
                  name="role"
                  value={form.role}
                  onChange={handleChange}
                  style={{ width: '100%', boxSizing: 'border-box', padding: '9px 12px', border: '1px solid var(--border)', borderRadius: 10, fontSize: 13, outline: 'none', background: 'var(--bg)', color: 'var(--text)' }}
                >
                  <option value="MECHANIC">Mechanic</option>
                  <option value="OWNER">Owner</option>
                </select>
              </div>
            </div>
            {formError && <div style={{ fontSize: 12, color: 'var(--red)', marginTop: 12 }}>{formError}</div>}
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 20 }}>
              <button
                type="button"
                onClick={() => { setShowForm(false); setForm(EMPTY_FORM); setFormError(''); }}
                style={{ background: 'var(--bg)', color: 'var(--text)', border: '1px solid var(--border)', borderRadius: 10, padding: '9px 18px', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                style={{ background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 10, padding: '9px 18px', fontWeight: 700, fontSize: 13, cursor: 'pointer', opacity: submitting ? 0.7 : 1 }}
              >
                {submitting ? 'Creating...' : 'Create Worker'}
              </button>
            </div>
          </form>
        </div>
      )}

      {loading && <p style={{ color: 'var(--text2)' }}>Loading...</p>}
      {error && <p style={{ color: 'var(--red)' }}>{error}</p>}

      {!loading && !error && (
        <div style={{
          background: 'var(--card)',
          borderRadius: 16,
          boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
          overflow: 'hidden',
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                {['Worker', 'Username', 'Email', 'Role', 'Status'].map(h => (
                  <th key={h} style={{
                    padding: '11px 16px',
                    textAlign: 'left',
                    fontSize: 11,
                    fontWeight: 700,
                    color: 'var(--text3)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {workers.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ padding: 24, textAlign: 'center', color: 'var(--text2)' }}>
                    No workers found.
                  </td>
                </tr>
              )}
              {workers.map((w, i) => (
                <tr key={w.id} style={{
                  borderBottom: i < workers.length - 1 ? '1px solid var(--border)' : 'none',
                }}>
                  <td style={{ padding: '13px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{
                        width: 36, height: 36, borderRadius: '50%',
                        background: avatarColors[i % avatarColors.length],
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 14, fontWeight: 800, color: '#fff', flexShrink: 0,
                      }}>
                        {w.firstName?.[0]}
                      </div>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 700 }}>{w.firstName} {w.lastName}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '13px 16px', fontSize: 13, color: 'var(--text2)' }}>
                    {w.username}
                  </td>
                  <td style={{ padding: '13px 16px', fontSize: 13, color: 'var(--text2)' }}>
                    {w.email}
                  </td>
                  <td style={{ padding: '13px 16px' }}>
                    <span style={{
                      background: w.role === 'OWNER' ? 'var(--accent-light)' : 'var(--blue-bg)',
                      color: w.role === 'OWNER' ? 'var(--accent)' : 'var(--blue)',
                      borderRadius: 20, padding: '3px 10px',
                      fontSize: 11, fontWeight: 700,
                    }}>
                      {w.role}
                    </span>
                  </td>
                  <td style={{ padding: '13px 16px' }}>
                    <span style={{
                      background: w.isActive ? 'var(--green-bg)' : 'var(--red-bg)',
                      color: w.isActive ? 'var(--green)' : 'var(--red)',
                      borderRadius: 20, padding: '3px 10px',
                      fontSize: 11, fontWeight: 700,
                    }}>
                      {w.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </OwnerLayout>
  );
}
