import { useEffect, useState } from 'react';
import OwnerLayout from '../../components/OwnerLayout';
import api from '../../api/axios';

const typeStyle = {
  INDIVIDUAL: { background: 'var(--blue-bg)',   color: 'var(--blue)'   },
  COMPANY:    { background: 'var(--purple-bg)', color: 'var(--purple)' },
  FLEET:      { background: 'var(--yellow-bg)', color: 'var(--yellow)' },
};

const avatarColors = ['#F97316','#3B82F6','#8B5CF6','#22C55E','#EF4444','#F59E0B','#0891B2'];

export default function Clients() {
  const [clients, setClients] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    Promise.all([
      api.get('/api/clients'),
      api.get('/api/vehicles'),
    ]).then(([cl, vh]) => {
      setClients(cl.data);
      setVehicles(vh.data);
    }).catch(() => setError('Error loading data.'))
      .finally(() => setLoading(false));
  }, []);

  function vehiclesForClient(clientId) {
    return vehicles.filter(v => v.clientId === clientId);
  }

  function toggleExpand(id) {
    setExpanded(prev => prev === id ? null : id);
  }

  return (
    <OwnerLayout>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text)', margin: 0 }}>
          Clients
        </h2>
        <p style={{ color: 'var(--text2)', fontSize: 14, marginTop: 4 }}>
          {clients.length} clients · {vehicles.length} vehicles
        </p>
      </div>

      {loading && <p style={{ color: 'var(--text2)' }}>Loading...</p>}
      {error && <p style={{ color: 'var(--red)' }}>{error}</p>}

      {!loading && !error && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {clients.map((c, i) => {
            const clientVehicles = vehiclesForClient(c.id);
            const isExpanded = expanded === c.id;
            const color = avatarColors[i % avatarColors.length];

            return (
              <div key={c.id} style={{
                background: 'var(--card)',
                borderRadius: 16,
                boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                overflow: 'hidden',
              }}>
                {/* Client row */}
                <div
                  onClick={() => toggleExpand(c.id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 14,
                    padding: '16px 20px', cursor: 'pointer',
                  }}
                >
                  <div style={{
                    width: 42, height: 42, borderRadius: '50%',
                    background: color,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 16, fontWeight: 800, color: '#fff', flexShrink: 0,
                  }}>
                    {c.firstName?.[0]}
                  </div>

                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>
                      {c.firstName} {c.lastName}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text2)', marginTop: 2 }}>
                      {c.email} · {c.phone}
                    </div>
                  </div>

                  <span style={{
                    ...typeStyle[c.clientType],
                    borderRadius: 20, padding: '3px 10px',
                    fontSize: 11, fontWeight: 700,
                  }}>
                    {c.clientType}
                  </span>

                  <div style={{ fontSize: 12, color: 'var(--text2)', minWidth: 80, textAlign: 'right' }}>
                    {clientVehicles.length} vehicle{clientVehicles.length !== 1 ? 's' : ''}
                  </div>

                  <div style={{ fontSize: 18, color: 'var(--text3)', marginLeft: 8 }}>
                    {isExpanded ? '▲' : '▼'}
                  </div>
                </div>

                {/* Vehicles */}
                {isExpanded && (
                  <div style={{ borderTop: '1px solid var(--border)' }}>
                    {clientVehicles.length === 0 ? (
                      <div style={{ padding: '14px 20px', fontSize: 13, color: 'var(--text2)' }}>
                        No vehicles.
                      </div>
                    ) : clientVehicles.map((v, vi) => (
                      <div key={v.id} style={{
                        display: 'flex', alignItems: 'center', gap: 14,
                        padding: '12px 20px 12px 76px',
                        borderBottom: vi < clientVehicles.length - 1 ? '1px solid var(--border)' : 'none',
                        background: '#FAFAFA',
                      }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>
                            {v.brand} {v.model} {v.year}
                          </div>
                          <div style={{ fontSize: 11, color: 'var(--text2)', marginTop: 2 }}>
                            {v.licensePlate} · {v.mileage?.toLocaleString()} km · VIN: {v.vin}
                          </div>
                        </div>
                        <div style={{ fontSize: 12, color: 'var(--text3)', textAlign: 'right' }}>
                          <div>Reg: {v.registrationExpiry ?? '—'}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </OwnerLayout>
  );
}
