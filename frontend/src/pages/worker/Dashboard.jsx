import { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import api from '../../api/axios';

const statusLabel = {
  OPEN:        'Otvoren',
  IN_PROGRESS: 'U toku',
  COMPLETED:   'Završen',
  CANCELLED:   'Otkazan',
};

const statusStyle = {
  OPEN:        { background: 'var(--blue-bg)',   color: 'var(--blue)'   },
  IN_PROGRESS: { background: 'var(--yellow-bg)', color: 'var(--yellow)' },
  COMPLETED:   { background: 'var(--green-bg)',  color: 'var(--green)'  },
  CANCELLED:   { background: 'var(--red-bg)',    color: 'var(--red)'    },
};

export default function Dashboard() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/api/work-orders')
      .then(res => setOrders(res.data))
      .catch(() => setError('Greška pri učitavanju naloga.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Layout>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text)', margin: 0 }}>
          Radni nalozi
        </h2>
        <p style={{ color: 'var(--text2)', fontSize: 14, marginTop: 4 }}>
          Pregled svih radnih naloga
        </p>
      </div>

      {loading && <p style={{ color: 'var(--text2)' }}>Učitavanje...</p>}
      {error   && <p style={{ color: 'var(--red)' }}>{error}</p>}

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
                {['ID', 'Vozilo', 'Status', 'Opis', 'Otvoreno'].map(h => (
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
                    Nema radnih naloga.
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
                    {o.idVehicle}
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
