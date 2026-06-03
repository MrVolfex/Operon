import { useState } from 'react';
import api from '../../api/axios';

const EMPTY = { licensePlate: '', vin: '', brand: '', model: '', year: '', mileage: '', registrationDate: '', registrationExpiry: '' };

const fields = [
  { name: 'brand',              label: 'Brand',               type: 'text',   placeholder: 'Volkswagen' },
  { name: 'model',              label: 'Model',               type: 'text',   placeholder: 'Golf' },
  { name: 'year',               label: 'Year',                type: 'number', placeholder: '2020' },
  { name: 'licensePlate',       label: 'License Plate',       type: 'text',   placeholder: 'BG 123-AB' },
  { name: 'vin',                label: 'VIN',                 type: 'text',   placeholder: 'WVWZZZ1JZ3W386752' },
  { name: 'mileage',            label: 'Mileage (km)',        type: 'number', placeholder: '75000' },
  { name: 'registrationDate',   label: 'Registration Date',   type: 'date',   placeholder: '' },
  { name: 'registrationExpiry', label: 'Registration Expiry', type: 'date',   placeholder: '' },
];

export default function VehicleAddForm({ clientId, onSuccess, onCancel }) {
  const [form, setForm] = useState(EMPTY);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const res = await api.post('/api/vehicles', {
        ...form,
        year: parseInt(form.year),
        mileage: parseInt(form.mileage),
        clientId,
      });
      setForm(EMPTY);
      onSuccess(res.data);
    } catch {
      setError('Failed to add vehicle. Check that VIN is unique.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div style={{
      background: 'var(--card)', borderRadius: 16,
      boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
      padding: '20px 24px',
      border: '2px solid var(--accent-mid)',
    }}>
      <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--text)', marginBottom: 16 }}>
        New Vehicle
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {fields.map(f => (
            <div key={f.name}>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 5 }}>
                {f.label}
              </label>
              <input
                type={f.type}
                value={form[f.name]}
                onChange={e => setForm(prev => ({ ...prev, [f.name]: e.target.value }))}
                required
                placeholder={f.placeholder}
                style={{
                  width: '100%', padding: '9px 12px', boxSizing: 'border-box',
                  border: '1px solid var(--border)', borderRadius: 10,
                  fontSize: 13, outline: 'none', background: 'var(--bg)', color: 'var(--text)',
                }}
              />
            </div>
          ))}
        </div>

        {error && (
          <div style={{ background: 'var(--red-bg)', color: 'var(--red)', borderRadius: 10, padding: '10px 14px', fontSize: 13 }}>
            {error}
          </div>
        )}

        <div style={{ display: 'flex', gap: 10 }}>
          <button type="submit" disabled={submitting} style={{ flex: 1, background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 10, padding: '11px 0', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
            {submitting ? 'Adding...' : 'Add Vehicle'}
          </button>
          <button type="button" onClick={onCancel} style={{ flex: 1, background: 'var(--bg)', color: 'var(--text)', border: '1px solid var(--border)', borderRadius: 10, padding: '11px 0', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
