import { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import api from '../../api/axios';

const statusLabel = {
  OPEN:        'Open',
  IN_PROGRESS: 'In Progress',
  COMPLETED:   'Completed',
  CANCELLED:   'Cancelled',
};

const statusStyle = {
  OPEN:        { background: 'var(--blue-bg)',   color: 'var(--blue)'   },
  IN_PROGRESS: { background: 'var(--yellow-bg)', color: 'var(--yellow)' },
  COMPLETED:   { background: 'var(--green-bg)',  color: 'var(--green)'  },
  CANCELLED:   { background: 'var(--red-bg)',    color: 'var(--red)'    },
};

function isToday(dateStr) {
  const d = new Date(dateStr);
  const t = new Date();
  return d.getFullYear() === t.getFullYear() &&
         d.getMonth()    === t.getMonth()    &&
         d.getDate()     === t.getDate();
}

export default function Dashboard() {
  const [orders, setOrders]         = useState([]);
  const [todayAppts, setTodayAppts] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');

  useEffect(() => {
    Promise.all([
      api.get('/api/work-orders'),
      api.get('/api/appointments/status/CONFIRMED'),
    ])
      .then(([woRes, apptRes]) => {
        setOrders(woRes.data);
        const bookedIds = new Set(woRes.data.map(wo => wo.appointmentId).filter(Boolean));
        setTodayAppts(
          apptRes.data
            .filter(a => isToday(a.scheduledAt) && !bookedIds.has(a.id))
            .sort((a, b) => new Date(a.scheduledAt) - new Date(b.scheduledAt))
        );
      })
      .catch(() => setError('Error loading data.'))
      .finally(() => setLoading(false));
  }, []);

  const today = new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <Layout>
      {loading && <p style={{ color: 'var(--text2)' }}>Loading...</p>}
      {error   && <p style={{ color: 'var(--red)' }}>{error}</p>}

      {/* KPI cards */}
      {!loading && !error && (() => {
        const activeOrders = orders.filter(o => o.status === 'OPEN' || o.status === 'IN_PROGRESS');
        const completedToday = orders.filter(o => o.status === 'COMPLETED' && o.closedAt && isToday(o.closedAt));
        const cards = [
          {
            value: todayAppts.length,
            label: "Today's Appointments",
            accent: 'var(--blue)',
            badge: { text: 'Today', bg: 'var(--blue-bg)', color: 'var(--blue)' },
          },
          {
            value: activeOrders.length,
            label: 'Active Work Orders',
            accent: 'var(--yellow)',
            badge: { text: `${activeOrders.length} active`, bg: 'var(--yellow-bg)', color: 'var(--yellow)' },
          },
          {
            value: completedToday.length,
            label: 'Completed Today',
            accent: 'var(--green)',
            badge: { text: 'Today', bg: 'var(--green-bg)', color: 'var(--green)' },
          },
        ];
        return (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 32 }}>
            {cards.map(c => (
              <div key={c.label} style={{
                background: 'var(--card)', borderRadius: 16,
                boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                padding: '20px 24px',
                borderLeft: `4px solid ${c.accent}`,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    {c.label}
                  </span>
                  <span style={{ background: c.badge.bg, color: c.badge.color, borderRadius: 20, padding: '3px 10px', fontSize: 11, fontWeight: 700 }}>
                    {c.badge.text}
                  </span>
                </div>
                <div style={{ fontSize: 38, fontWeight: 900, color: c.accent, lineHeight: 1 }}>{c.value}</div>
              </div>
            ))}
          </div>
        );
      })()}

      {/* Today's schedule */}
      {!loading && !error && (
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 12 }}>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text)', margin: 0 }}>Today's Schedule</h2>
            <span style={{ fontSize: 13, color: 'var(--text2)' }}>{today}</span>
          </div>
          <div style={{ background: 'var(--card)', borderRadius: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['Time', 'Client', 'Vehicle', 'Note'].map(h => (
                    <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {todayAppts.length === 0 && (
                  <tr>
                    <td colSpan={4} style={{ padding: 24, textAlign: 'center', color: 'var(--text2)' }}>
                      No appointments scheduled for today.
                    </td>
                  </tr>
                )}
                {todayAppts.map((a, i) => (
                  <tr key={a.id} style={{ borderBottom: i < todayAppts.length - 1 ? '1px solid var(--border)' : 'none' }}>
                    <td style={{ padding: '14px 16px', fontSize: 15, fontWeight: 800, color: 'var(--accent)' }}>
                      {new Date(a.scheduledAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td style={{ padding: '14px 16px', fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>
                      {a.clientFirstName} {a.clientLastName}
                    </td>
                    <td style={{ padding: '14px 16px', fontSize: 14, color: 'var(--text)' }}>
                      {a.vehicleBrand} {a.vehicleModel}
                      <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 2 }}>{a.vehicleLicensePlate}</div>
                    </td>
                    <td style={{ padding: '14px 16px', fontSize: 13, color: 'var(--text2)' }}>{a.note ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text)', margin: 0 }}>
          Work Orders
        </h2>
        <p style={{ color: 'var(--text2)', fontSize: 14, marginTop: 4 }}>
          View all work orders
        </p>
      </div>

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
                {['ID', 'Vehicle', 'Status', 'Description', 'Opened'].map(h => (
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
              {orders.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ padding: 24, textAlign: 'center', color: 'var(--text2)' }}>
                    No work orders available.
                  </td>
                </tr>
              )}
              {orders.map((o, i) => (
                <tr key={o.id} style={{
                  borderBottom: i < orders.length - 1 ? '1px solid var(--border)' : 'none',
                }}>
                  <td style={{ padding: '14px 16px', fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>
                    #{o.id}
                  </td>
                  <td style={{ padding: '14px 16px', fontSize: 14, color: 'var(--text)' }}>
                  {o.vehicleBrand} {o.vehicleModel}
                    <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 2 }}>
                      {o.vehicleLicensePlate}
                    </div>
                  </td>

                  <td style={{ padding: '14px 16px' }}>
                    <span style={{
                      ...statusStyle[o.status],
                      borderRadius: 20,
                      padding: '3px 10px',
                      fontSize: 11,
                      fontWeight: 700,
                    }}>
                      {statusLabel[o.status] ?? o.status}
                    </span>
                  </td>
                  <td style={{ padding: '14px 16px', fontSize: 14, color: 'var(--text2)', maxWidth: 200 }}>
                    {o.description ?? '—'}
                  </td>
                  <td style={{ padding: '14px 16px', fontSize: 13, color: 'var(--text3)' }}>
                    {o.openedAt ? new Date(o.openedAt).toLocaleDateString('sr-Latn') : '—'}
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
