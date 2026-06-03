import { useEffect, useState } from 'react';
import OwnerLayout from '../../components/OwnerLayout';
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

export default function OwnerAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [filter, setFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/api/appointments')
      .then(res => setAppointments(res.data))
      .catch(() => setError('Error loading appointments.'))
      .finally(() => setLoading(false));
  }, []);

  const pending   = appointments.filter(a => a.status === 'PENDING');
  const confirmed = appointments.filter(a => a.status === 'CONFIRMED');
  const cancelled = appointments.filter(a => a.status === 'CANCELLED');

  const filtered = filter === 'ALL'       ? appointments
    : filter === 'PENDING'   ? pending
    : filter === 'CONFIRMED' ? confirmed
    : cancelled;

  const tabs = [
    { key: 'ALL',       label: `All (${appointments.length})` },
    { key: 'PENDING',   label: `Pending (${pending.length})` },
    { key: 'CONFIRMED', label: `Confirmed (${confirmed.length})` },
    { key: 'CANCELLED', label: `Cancelled (${cancelled.length})` },
  ];

  return (
    <OwnerLayout>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text)', margin: 0 }}>
          Appointments
        </h2>
        <p style={{ color: 'var(--text2)', fontSize: 14, marginTop: 4 }}>
          {appointments.length} total appointments
        </p>
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: 4, background: 'var(--bg)', border: '1.5px solid var(--border)', borderRadius: 10, width: 'fit-content', marginBottom: 16, overflow: 'hidden' }}>
        {tabs.map(t => (
          <button key={t.key} onClick={() => setFilter(t.key)} style={{
            padding: '7px 16px', fontSize: 12, fontWeight: 700,
            border: 'none', cursor: 'pointer',
            background: filter === t.key ? 'var(--card)' : 'transparent',
            color: filter === t.key ? 'var(--text)' : 'var(--text2)',
            boxShadow: filter === t.key ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
          }}>
            {t.label}
          </button>
        ))}
      </div>

      {loading && <p style={{ color: 'var(--text2)' }}>Loading...</p>}
      {error && <p style={{ color: 'var(--red)' }}>{error}</p>}

      {!loading && !error && (
        <div style={{ background: 'var(--card)', borderRadius: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                {['ID', 'Vehicle', 'Status', 'Note', 'Scheduled At'].map(h => (
                  <th key={h} style={{
                    padding: '11px 16px', textAlign: 'left',
                    fontSize: 11, fontWeight: 700, color: 'var(--text3)',
                    textTransform: 'uppercase', letterSpacing: '0.5px',
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ padding: 24, textAlign: 'center', color: 'var(--text2)' }}>
                    No appointments found.
                  </td>
                </tr>
              )}
              {filtered.map((a, i) => (
                <tr key={a.id} style={{ borderBottom: i < filtered.length - 1 ? '1px solid var(--border)' : 'none' }}>
                  <td style={{ padding: '13px 16px', fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>
                    #{a.id}
                  </td>
                  <td style={{ padding: '13px 16px', fontSize: 14, color: 'var(--text)' }}>
                    {a.vehicleBrand} {a.vehicleModel}
                    <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 2 }}>
                      {a.vehicleLicensePlate}
                    </div>
                  </td>
                  <td style={{ padding: '13px 16px' }}>
                    <span style={{
                      ...statusStyle[a.status],
                      borderRadius: 20, padding: '3px 10px',
                      fontSize: 11, fontWeight: 700,
                    }}>
                      {statusLabel[a.status] ?? a.status}
                    </span>
                  </td>
                  <td style={{ padding: '13px 16px', fontSize: 13, color: 'var(--text2)' }}>
                    {a.note ?? '—'}
                  </td>
                  <td style={{ padding: '13px 16px', fontSize: 13, color: 'var(--text3)' }}>
                    {a.scheduledAt ? new Date(a.scheduledAt).toLocaleString('sr-Latn') : '—'}
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
