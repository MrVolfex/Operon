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

function dayLabel(dateStr) {
  const today    = new Date(); today.setHours(0,0,0,0);
  const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1);
  const d        = new Date(dateStr); d.setHours(0,0,0,0);
  if (d.getTime() === today.getTime())    return 'Today';
  if (d.getTime() === tomorrow.getTime()) return 'Tomorrow';
  return new Date(dateStr).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' });
}

function toDateKey(scheduledAt) {
  return scheduledAt ? scheduledAt.slice(0, 10) : 'unknown';
}

export default function Appointment() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState('');
  const [updating, setUpdating]         = useState(null);
  const [hideCancelled, setHideCancelled] = useState(true);

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

  const visible = appointments
    .filter(a => !hideCancelled || a.status !== 'CANCELLED')
    .sort((a, b) => new Date(b.scheduledAt) - new Date(a.scheduledAt));

  const grouped = visible.reduce((acc, a) => {
    const key = toDateKey(a.scheduledAt);
    if (!acc[key]) acc[key] = [];
    acc[key].push(a);
    return acc;
  }, {});

  const sortedKeys = Object.keys(grouped).sort((a, b) => b.localeCompare(a));

  const cancelledCount = appointments.filter(a => a.status === 'CANCELLED').length;

  return (
    <Layout>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text)', margin: 0 }}>Schedule</h2>
          <p style={{ color: 'var(--text2)', fontSize: 14, marginTop: 4, marginBottom: 0 }}>
            {visible.length} appointment{visible.length !== 1 ? 's' : ''}
          </p>
        </div>
        {cancelledCount > 0 && (
          <button
            onClick={() => setHideCancelled(p => !p)}
            style={{
              background: hideCancelled ? 'var(--bg)' : 'var(--red-bg)',
              color: hideCancelled ? 'var(--text2)' : 'var(--red)',
              border: '1.5px solid var(--border)',
              borderRadius: 10, padding: '7px 14px',
              fontSize: 13, fontWeight: 700, cursor: 'pointer',
            }}
          >
            {hideCancelled ? `Show cancelled (${cancelledCount})` : 'Hide cancelled'}
          </button>
        )}
      </div>

      {loading && <p style={{ color: 'var(--text2)' }}>Loading...</p>}
      {error   && <p style={{ color: 'var(--red)' }}>{error}</p>}

      {!loading && !error && sortedKeys.length === 0 && (
        <div style={{
          background: 'var(--card)', borderRadius: 16,
          padding: 40, textAlign: 'center', color: 'var(--text2)', fontSize: 14,
        }}>
          No appointments.
        </div>
      )}

      {!loading && !error && sortedKeys.map(dateKey => (
        <div key={dateKey} style={{ marginBottom: 28 }}>
          <div style={{
            fontSize: 12, fontWeight: 800, color: 'var(--text3)',
            textTransform: 'uppercase', letterSpacing: '0.7px',
            marginBottom: 10,
          }}>
            {dayLabel(dateKey)}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {grouped[dateKey].map(a => (
              <div key={a.id} style={{
                background: 'var(--card)', borderRadius: 14,
                boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                padding: '16px 20px',
                display: 'flex', alignItems: 'center', gap: 20,
                opacity: a.status === 'CANCELLED' ? 0.55 : 1,
              }}>
                {/* Time */}
                <div style={{
                  minWidth: 54, textAlign: 'center',
                  background: 'var(--bg)', borderRadius: 10, padding: '8px 4px',
                }}>
                  <div style={{ fontSize: 15, fontWeight: 900, color: 'var(--text)', lineHeight: 1 }}>
                    {a.scheduledAt ? new Date(a.scheduledAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) : '—'}
                  </div>
                </div>

                {/* Info */}
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--text)' }}>
                    {a.vehicleBrand} {a.vehicleModel}
                    <span style={{ fontWeight: 500, color: 'var(--text3)', marginLeft: 8, fontSize: 13 }}>
                      {a.vehicleLicensePlate}
                    </span>
                  </div>
                  {a.note && (
                    <div style={{ fontSize: 13, color: 'var(--text2)', marginTop: 3 }}>
                      {a.note}
                    </div>
                  )}
                </div>

                {/* Status */}
                <select
                  value={a.status}
                  disabled={updating === a.id || a.status === 'CANCELLED'}
                  onChange={e => handleStatusChange(a, e.target.value)}
                  style={{
                    ...statusStyle[a.status],
                    borderRadius: 20, padding: '4px 10px',
                    fontSize: 11, fontWeight: 700,
                    border: 'none', cursor: a.status === 'CANCELLED' ? 'default' : 'pointer',
                    outline: 'none', opacity: updating === a.id ? 0.5 : 1,
                  }}
                >
                  {ALL_STATUSES.map(s => (
                    <option key={s} value={s}>{statusLabel[s]}</option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Flat table — all appointments */}
      {!loading && !error && appointments.length > 0 && (
        <>
          <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.7px', margin: '16px 0 10px' }}>
            All Appointments
          </div>
          <div style={{ background: 'var(--card)', borderRadius: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['ID', 'Vehicle', 'Status', 'Note', 'Scheduled At'].map(h => (
                    <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {appointments.map((a, i) => (
                  <tr key={a.id} style={{ borderBottom: i < appointments.length - 1 ? '1px solid var(--border)' : 'none' }}>
                    <td style={{ padding: '14px 16px', fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>#{a.id}</td>
                    <td style={{ padding: '14px 16px', fontSize: 14, color: 'var(--text)' }}>
                      {a.vehicleBrand} {a.vehicleModel}
                      <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 2 }}>{a.vehicleLicensePlate}</div>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <select
                        value={a.status}
                        disabled={updating === a.id}
                        onChange={e => handleStatusChange(a, e.target.value)}
                        style={{ ...statusStyle[a.status], borderRadius: 20, padding: '3px 10px', fontSize: 11, fontWeight: 700, border: 'none', cursor: 'pointer', outline: 'none', opacity: updating === a.id ? 0.5 : 1 }}
                      >
                        {ALL_STATUSES.map(s => <option key={s} value={s}>{statusLabel[s]}</option>)}
                      </select>
                    </td>
                    <td style={{ padding: '14px 16px', fontSize: 14, color: 'var(--text2)' }}>{a.note ?? '—'}</td>
                    <td style={{ padding: '14px 16px', fontSize: 13, color: 'var(--text3)' }}>
                      {a.scheduledAt ? new Date(a.scheduledAt).toLocaleString('sr-Latn') : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </Layout>
  );
}
