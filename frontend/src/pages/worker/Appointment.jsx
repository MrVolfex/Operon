import { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import api from '../../api/axios';

const statusLabel = {
  PENDING:   'Pending',
  CONFIRMED: 'Confirmed',
  CANCELLED: 'Cancelled',
};

const statusStyle = {
  PENDING:   { background: 'var(--yellow-bg)', color: 'var(--yellow)' },
  CONFIRMED: { background: 'var(--green-bg)',  color: 'var(--green)'  },
  CANCELLED: { background: 'var(--red-bg)',    color: 'var(--red)'    },
};

const ALL_STATUSES = ['PENDING', 'CONFIRMED', 'CANCELLED'];

export default function Appointment() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updating, setUpdating] = useState(null);

  function handleStatusChange(a, newStatus) {
    if (newStatus === a.status) return;
    setUpdating(a.id);
    api.put(`/api/appointments/${a.id}`, {
      scheduledAt: a.scheduledAt,
      status: newStatus,
      note: a.note,
      clientId: a.clientId,
      vehicleId: a.vehicleId,
    })
      .then(res => setAppointments(prev => prev.map(x => x.id === a.id ? res.data : x)))
      .catch(() => alert('Greška pri promeni statusa.'))
      .finally(() => setUpdating(null));
  }

  useEffect(() => {
    api.get('/api/appointments')
      .then(res => setAppointments(res.data))
      .catch(() => setError('Error loading appointments.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Layout>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text)', margin: 0 }}>
          Schedule
        </h2>
        <p style={{ color: 'var(--text2)', fontSize: 14, marginTop: 4 }}>
          Upcoming appointments
        </p>
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
                {['ID', 'Vehicle', 'Status', 'Note', 'Scheduled At'].map(h => (
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
              {appointments.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ padding: 24, textAlign: 'center', color: 'var(--text2)' }}>
                    No appointments available.
                  </td>
                </tr>
              )}
              {appointments.map((a, i) => (
                <tr key={a.id} style={{
                  borderBottom: i < appointments.length - 1 ? '1px solid var(--border)' : 'none',
                }}>
                  <td style={{ padding: '14px 16px', fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>
                    #{a.id}
                  </td>
                  <td style={{ padding: '14px 16px', fontSize: 14, color: 'var(--text)' }}>
                    {a.vehicleBrand} {a.vehicleModel}
                    <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 2 }}>
                      {a.vehicleLicensePlate}
                    </div>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <select
                      value={a.status}
                      disabled={updating === a.id}
                      onChange={e => handleStatusChange(a, e.target.value)}
                      style={{
                        ...statusStyle[a.status],
                        borderRadius: 20,
                        padding: '3px 10px',
                        fontSize: 11,
                        fontWeight: 700,
                        border: 'none',
                        cursor: 'pointer',
                        outline: 'none',
                        opacity: updating === a.id ? 0.5 : 1,
                      }}
                    >
                      {ALL_STATUSES.map(s => (
                        <option key={s} value={s}>{statusLabel[s]}</option>
                      ))}
                    </select>
                  </td>
                  <td style={{ padding: '14px 16px', fontSize: 14, color: 'var(--text2)' }}>
                    {a.note ?? '—'}
                  </td>
                  <td style={{ padding: '14px 16px', fontSize: 13, color: 'var(--text3)' }}>
                    {a.scheduledAt ? new Date(a.scheduledAt).toLocaleString('sr-Latn') : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Layout>
  );
}
