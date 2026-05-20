import { useEffect, useState } from 'react';
import ClientLayout from '../../components/ClientLayout';
import api from '../../api/axios';

export default function ClientDashboard() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/api/me')
      .then(res => api.get(`/api/vehicles/client/${res.data.id}`))
      .then(res => setVehicles(res.data))
      .catch(() => setError('Failed to fetch vehicles.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <ClientLayout>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text)', margin: 0 }}>
          My Vehicles
        </h2>
        <p style={{ color: 'var(--text2)', fontSize: 14, marginTop: 4 }}>
          {vehicles.length} vehicle{vehicles.length !== 1 ? 's' : ''} registered
        </p>
      </div>

      {loading && <p style={{ color: 'var(--text2)' }}>Loading...</p>}
      {error && <p style={{ color: 'var(--red)' }}>{error}</p>}

      {!loading && !error && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {vehicles.length === 0 && (
            <div style={{
              background: 'var(--card)', borderRadius: 16,
              padding: 32, textAlign: 'center', color: 'var(--text2)',
            }}>
              No vehicles registered.
            </div>
          )}
          {vehicles.map(v => (
            <div key={v.id} style={{
              background: 'var(--card)', borderRadius: 16,
              boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
              padding: '20px 24px',
              display: 'flex', alignItems: 'center', gap: 20,
            }}>
              <div style={{
                width: 48, height: 48, borderRadius: 12,
                background: 'var(--bg)',
                display: 'flex', alignItems: 'center',
                justifyContent: 'center', fontSize: 24, flexShrink: 0,
              }}>
                🚗
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--text)' }}>
                  {v.brand} {v.model} {v.year}
                </div>
                <div style={{ fontSize: 13, color: 'var(--text2)', marginTop: 4 }}>
                  {v.licensePlate} · {v.mileage?.toLocaleString()} km · VIN: {v.vin}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 12, color: 'var(--text3)' }}>Registration expires</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', marginTop: 2 }}>
                  {v.registrationExpiry ?? '—'}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </ClientLayout>
  );
}
