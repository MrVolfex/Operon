import { useEffect, useState } from "react";
import Layout from "../../components/Layout";
import api from "../../api/axios";

export default function Parts() {
  const [parts, setParts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editPart, setEditPart] = useState(null);
  const [form, setForm] = useState({ name: '', partNumber: '', price: '', stockQuantity: '', brand: '', model: '' });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError]   = useState('');
  const [search, setSearch] = useState('');

    useEffect(() => {
        api.get('/api/parts')
        .then(res => setParts(res.data))
        .catch(() => setError('Error loading parts.'))
        .finally(() => setLoading(false));
    }, []);

  function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setFormError('');

    const body = {
      name: form.name,
      partNumber: form.partNumber,
      price: parseFloat(form.price),
      stockQuantity: parseInt(form.stockQuantity),
      brand: form.brand || null,
      model: form.model || null,
    };

    const req = editPart ? api.put(`/api/parts/${editPart.id}`, body) : api.post('/api/parts', body);

    req.then(res => {
        if (editPart) {
          setParts(prev => prev.map(p => p.id === editPart.id ? res.data : p));
        } else {
          setParts(prev => [...prev, res.data]);
        }
        setShowModal(false);
      })
      .catch(() => setFormError('Greška pri čuvanju dela.'))
      .finally(() => setSubmitting(false));
  }
  const filteredParts = parts.filter(p => {
    const q = search.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      (p.partNumber && p.partNumber.toLowerCase().includes(q)) ||
      (p.brand && p.brand.toLowerCase().includes(q)) ||
      (p.model && p.model.toLowerCase().includes(q))
    );
  });

  return (
    <Layout>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <div>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text)', margin: 0 }}>Parts</h2>
            <p style={{ color: 'var(--text2)', fontSize: 14, marginTop: 4 }}>
              {parts.length} items in inventory
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <input
              type="text"
              placeholder="Pretraži po imenu, broju, marki..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                padding: '9px 14px', border: '1px solid var(--border)',
                borderRadius: 10, fontSize: 13, outline: 'none',
                width: 280, background: 'var(--card)', color: 'var(--text)',
              }}
            />
            <button
              onClick={() => {
                setEditPart(null);
                setForm({ name: '', partNumber: '', price: '', stockQuantity: '', brand: '', model: '' });
                setFormError('');
                setShowModal(true);
              }}
              style={{
                background: 'var(--accent)', color: '#fff', border: 'none',
                borderRadius: 10, padding: '9px 18px', fontWeight: 700,
                fontSize: 13, cursor: 'pointer',
              }}
            >
              + Add Part
            </button>
          </div>
          
      </div>


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
                {['ID', 'Name', 'Part Number', 'Brand', 'Model', 'Price', 'Stock', ''].map(h => (
                  <th key={h} style={{
                    padding: '12px 16px',
                    textAlign: 'left',
                    fontSize: 12,
                    fontWeight: 700,
                    color: 'var(--text3)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredParts.length === 0 && (
                <tr>
                  <td colSpan={8} style={{ padding: 24, textAlign: 'center', color: 'var(--text2)' }}>
                    No parts available.
                  </td>
                </tr>
              )}
              {filteredParts.map((p, i) => (
                <tr key={p.id} style={{
                  borderBottom: i < filteredParts.length - 1 ? '1px solid var(--border)' : 'none',
                  background: p.stockQuantity === 0 ? 'var(--red-bg)' : 'transparent',
                }}>
                  <td style={{ padding: '14px 16px', fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>
                    #{p.id}
                  </td>
                  <td style={{ padding: '14px 16px', fontSize: 14, color: 'var(--text)' }}>
                    {p.name}
                  </td>
                  <td style={{ padding: '14px 16px', fontSize: 13, color: 'var(--text2)' }}>
                    {p.partNumber}
                  </td>
                  <td style={{ padding: '14px 16px', fontSize: 14, color: 'var(--text)' }}>
                    {p.brand}
                  </td>
                  <td style={{ padding: '14px 16px', fontSize: 14, color: 'var(--text)' }}>
                    {p.model}
                  </td>
                  <td style={{ padding: '14px 16px', fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>
                    ${p.price?.toFixed(2)}
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <span style={{
                      background: p.stockQuantity > 0 ? 'var(--green-bg)' : 'var(--red-bg)',
                      color: p.stockQuantity > 0 ? 'var(--green)' : 'var(--red)',
                      borderRadius: 20,
                      padding: '3px 10px',
                      fontSize: 11,
                      fontWeight: 700,
                    }}>
                      {p.stockQuantity}
                    </span>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button
                        onClick={() => {
                          setEditPart(p);
                          setForm({
                            name: p.name ?? '',
                            partNumber: p.partNumber ?? '',
                            price: p.price ?? '',
                            stockQuantity: p.stockQuantity ?? '',
                            brand: p.brand ?? '',
                            model: p.model ?? '',
                          });
                          setFormError('');
                          setShowModal(true);
                        }}
                        style={{
                          background: 'var(--bg)', color: 'var(--text)',
                          border: '1px solid var(--border)', borderRadius: 8,
                          padding: '5px 12px', fontSize: 12, fontWeight: 600, cursor: 'pointer',
                        }}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => {
                          api.delete(`/api/parts/${p.id}`)
                            .then(() => setParts(prev => prev.filter(x => x.id !== p.id)))
                            .catch(() => alert('Greška pri brisanju.'));
                        }}
                        style={{
                          background: 'var(--red-bg)', color: 'var(--red)', border: 'none',
                          borderRadius: 8, padding: '5px 12px', fontSize: 12, fontWeight: 600, cursor: 'pointer',
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {showModal && (
        <div
          onClick={e => { if (e.target === e.currentTarget) setShowModal(false); }}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <div style={{ background: 'var(--card)', borderRadius: 20, padding: 28, width: 500, maxWidth: '95vw' }}>
            <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--text)', marginBottom: 20 }}>
              {editPart ? 'Edit Part' : 'Add New Part'}
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                {[
                  { label: 'Name *',           key: 'name',          required: true,  placeholder: 'Filter ulja' },
                  { label: 'Part Number *',    key: 'partNumber',     required: true,  placeholder: 'OF-1234' },
                  { label: 'Price (RSD) *',    key: 'price',          required: true,  placeholder: '1200.00' },
                  { label: 'Stock Quantity *', key: 'stockQuantity',  required: true,  placeholder: '10' },
                  { label: 'Brand',            key: 'brand',          placeholder: 'Bosch' },
                  { label: 'Model',            key: 'model',          placeholder: 'Golf 7' },
                ].map(f => (
                  <div key={f.key}>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 6 }}>
                      {f.label}
                    </label>
                    <input
                      type="text"
                      value={form[f.key]}
                      onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                      required={f.required}
                      placeholder={f.placeholder}
                      style={{ width: '100%', padding: '9px 12px', boxSizing: 'border-box', border: '1px solid var(--border)', borderRadius: 10, fontSize: 14, outline: 'none' }}
                    />
                  </div>
                ))}
              </div>

              {formError && (
                <div style={{ background: 'var(--red-bg)', color: 'var(--red)', borderRadius: 8, padding: '8px 12px', fontSize: 13 }}>
                  {formError}
                </div>
              )}

              <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                <button type="submit" disabled={submitting} style={{ flex: 1, background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 10, padding: 12, fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
                  {submitting ? 'Saving...' : editPart ? 'Save Changes' : 'Add Part'}
                </button>
                <button type="button" onClick={() => setShowModal(false)} style={{ flex: 1, background: 'var(--bg)', color: 'var(--text)', border: 'none', borderRadius: 10, padding: 12, fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </Layout>
    );
}