import { useEffect, useState } from 'react';
import api from '../api/axios';

const EMPTY_FORM = { type: '', price: '', duration: '' };

export default function ServiceTypesPage({ Layout }) {
  const [services, setServices]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');

  const [showAdd, setShowAdd]       = useState(false);
  const [form, setForm]             = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError]   = useState('');

  const [editId, setEditId]         = useState(null);
  const [editForm, setEditForm]     = useState(EMPTY_FORM);
  const [editSubmitting, setEditSubmitting] = useState(false);


  useEffect(() => {
    api.get('/api/service-types')
      .then(res => setServices(res.data))
      .catch(() => setError('Error loading service types.'))
      .finally(() => setLoading(false));
  }, []);

  function handleAdd(e) {
    e.preventDefault();
    setSubmitting(true);
    setFormError('');
    api.post('/api/service-types', {
      type: form.type,
      price: parseFloat(form.price),
      duration: parseInt(form.duration),
    })
      .then(res => {
        setServices(prev => [...prev, res.data]);
        setForm(EMPTY_FORM);
        setShowAdd(false);
      })
      .catch(() => setFormError('Failed to create service type.'))
      .finally(() => setSubmitting(false));
  }

  function startEdit(s) {
    setEditId(s.id);
    setEditForm({ type: s.type, price: String(s.price), duration: String(s.duration) });
  }

  function handleEdit(e) {
    e.preventDefault();
    setEditSubmitting(true);
    api.put(`/api/service-types/${editId}`, {
      type: editForm.type,
      price: parseFloat(editForm.price),
      duration: parseInt(editForm.duration),
    })
      .then(res => {
        setServices(prev => prev.map(s => s.id === editId ? res.data : s));
        setEditId(null);
      })
      .catch(() => alert('Failed to update service type.'))
      .finally(() => setEditSubmitting(false));
  }


  const inputStyle = {
    width: '100%', boxSizing: 'border-box',
    padding: '8px 12px', border: '1px solid var(--border)',
    borderRadius: 10, fontSize: 13, outline: 'none',
    background: 'var(--bg)', color: 'var(--text)',
  };

  return (
    <Layout>
      <div style={{ marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text)', margin: 0 }}>Service Types</h2>
          <p style={{ color: 'var(--text2)', fontSize: 14, marginTop: 4 }}>{services.length} service types</p>
        </div>
        {!showAdd && (
          <button
            onClick={() => setShowAdd(true)}
            style={{
              background: 'var(--accent)', color: '#fff', border: 'none',
              borderRadius: 10, padding: '9px 18px', fontWeight: 700, fontSize: 13, cursor: 'pointer',
            }}
          >
            + Add Service Type
          </button>
        )}
      </div>

      {/* Add form */}
      {showAdd && (
        <div style={{ background: 'var(--card)', borderRadius: 16, padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.06)', marginBottom: 24 }}>
          <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--text)', marginBottom: 20 }}>New Service Type</div>
          <form onSubmit={handleAdd}>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 14, marginBottom: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--text3)', marginBottom: 6 }}>Name</label>
                <input required value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))} placeholder="e.g. Oil Change" style={inputStyle} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--text3)', marginBottom: 6 }}>Price ($)</label>
                <input required type="number" min="0" step="0.01" value={form.price} onChange={e => setForm(p => ({ ...p, price: e.target.value }))} placeholder="0.00" style={inputStyle} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--text3)', marginBottom: 6 }}>Duration (min)</label>
                <input required type="number" min="1" value={form.duration} onChange={e => setForm(p => ({ ...p, duration: e.target.value }))} placeholder="60" style={inputStyle} />
              </div>
            </div>
            {formError && <div style={{ fontSize: 12, color: 'var(--red)', marginBottom: 12 }}>{formError}</div>}
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button type="button" onClick={() => { setShowAdd(false); setForm(EMPTY_FORM); setFormError(''); }}
                style={{ background: 'var(--bg)', color: 'var(--text)', border: '1px solid var(--border)', borderRadius: 10, padding: '9px 18px', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
                Cancel
              </button>
              <button type="submit" disabled={submitting}
                style={{ background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 10, padding: '9px 18px', fontWeight: 700, fontSize: 13, cursor: 'pointer', opacity: submitting ? 0.7 : 1 }}>
                {submitting ? 'Saving...' : 'Save'}
              </button>
            </div>
          </form>
        </div>
      )}

      {loading && <p style={{ color: 'var(--text2)' }}>Loading...</p>}
      {error   && <p style={{ color: 'var(--red)' }}>{error}</p>}

      {!loading && !error && (
        <div style={{ background: 'var(--card)', borderRadius: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                {['Service Name', 'Price', 'Duration', ''].map(h => (
                  <th key={h} style={{ padding: '11px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {services.length === 0 && (
                <tr><td colSpan={4} style={{ padding: 24, textAlign: 'center', color: 'var(--text2)' }}>No service types yet.</td></tr>
              )}
              {services.map((s, i) => (
                <tr key={s.id} style={{ borderBottom: i < services.length - 1 ? '1px solid var(--border)' : 'none' }}>
                  {editId === s.id ? (
                    <>
                      <td style={{ padding: '10px 16px' }}>
                        <input value={editForm.type} onChange={e => setEditForm(p => ({ ...p, type: e.target.value }))} style={{ ...inputStyle, width: '100%' }} />
                      </td>
                      <td style={{ padding: '10px 16px' }}>
                        <input type="number" min="0" step="0.01" value={editForm.price} onChange={e => setEditForm(p => ({ ...p, price: e.target.value }))} style={{ ...inputStyle, width: 100 }} />
                      </td>
                      <td style={{ padding: '10px 16px' }}>
                        <input type="number" min="1" value={editForm.duration} onChange={e => setEditForm(p => ({ ...p, duration: e.target.value }))} style={{ ...inputStyle, width: 80 }} />
                      </td>
                      <td style={{ padding: '10px 16px' }}>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button onClick={handleEdit} disabled={editSubmitting}
                            style={{ background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 8, padding: '6px 14px', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                            {editSubmitting ? '...' : 'Save'}
                          </button>
                          <button onClick={() => setEditId(null)}
                            style={{ background: 'var(--bg)', color: 'var(--text)', border: '1px solid var(--border)', borderRadius: 8, padding: '6px 14px', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                            Cancel
                          </button>
                        </div>
                      </td>
                    </>
                  ) : (
                    <>
                      <td style={{ padding: '14px 16px', fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>{s.type}</td>
                      <td style={{ padding: '14px 16px', fontSize: 13, fontWeight: 700, color: 'var(--accent)' }}>${s.price?.toFixed(2)}</td>
                      <td style={{ padding: '14px 16px', fontSize: 13, color: 'var(--text2)' }}>{s.duration} min</td>
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                          <button onClick={() => startEdit(s)}
                            style={{ background: 'var(--bg)', color: 'var(--text)', border: '1px solid var(--border)', borderRadius: 8, padding: '6px 14px', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                            Edit
                          </button>
                        </div>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

    </Layout>
  );
}
