import { useEffect, useState } from 'react';
import ClientLayout from '../../components/ClientLayout';
import api from '../../api/axios';

const STATUS_COLORS = {
  OPEN:        { bg: 'var(--blue-bg)',   color: 'var(--blue)',   label: 'Open'        },
  IN_PROGRESS: { bg: 'var(--yellow-bg)', color: 'var(--yellow)', label: 'In Progress' },
  COMPLETED:   { bg: 'var(--green-bg)',  color: 'var(--green)',  label: 'Completed'   },
  CANCELLED:   { bg: 'var(--red-bg)',    color: 'var(--red)',    label: 'Cancelled'   },
  PENDING:     { bg: 'var(--purple-bg)', color: 'var(--purple)', label: 'Pending'     },
};

export default function ClientWorkOrderStatus() {
  const [workOrders, setWorkOrders] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');

  useEffect(() => {
    api.get('/api/my-work-orders')
      .then(res => setWorkOrders(res.data))
      .catch(() => setError('Greška pri učitavanju.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <ClientLayout>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text)', margin: 0 }}>Vehicle Status</h2>
        <p style={{ color: 'var(--text2)', fontSize: 14, marginTop: 4 }}>Track the status of your vehicle in the workshop</p>
      </div>

      {loading && <p style={{ color: 'var(--text2)' }}>Loading...</p>}
      {error && <p style={{ color: 'var(--red)' }}>{error}</p>}

      {!loading && !error && workOrders.length === 0 && (
        <p style={{ color: 'var(--text2)' }}>No active work orders.</p>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {workOrders.map(wo => {
          const sc = STATUS_COLORS[wo.status] ?? STATUS_COLORS.PENDING;
          return (
            <div key={wo.id} style={{ background: 'var(--card)', borderRadius: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
              <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontWeight: 800, fontSize: 15, color: 'var(--text)' }}>
                    {wo.vehicleBrand} {wo.vehicleModel}
                  </span>
                  <span style={{ fontSize: 13, color: 'var(--text3)' }}>{wo.vehicleLicensePlate}</span>
                </div>
                <span style={{ background: sc.bg, color: sc.color, borderRadius: 20, padding: '4px 12px', fontSize: 12, fontWeight: 700 }}>
                  {sc.label}
                </span>
              </div>
              <div style={{ padding: '14px 20px', display: 'flex', gap: 32 }}>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', marginBottom: 4 }}>Opened</div>
                  <div style={{ fontSize: 14, color: 'var(--text)' }}>{new Date(wo.openedAt).toLocaleDateString('en-GB')}</div>
                </div>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', marginBottom: 4 }}>Closed</div>
                  <div style={{ fontSize: 14, color: 'var(--text)' }}>
                    {wo.closedAt ? new Date(wo.closedAt).toLocaleDateString('en-GB') : '—'}
                  </div>
                </div>
                {wo.description && (
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', marginBottom: 4 }}>Description</div>
                    <div style={{ fontSize: 14, color: 'var(--text)' }}>{wo.description}</div>
                  </div>
                )}
                <div style={{ marginLeft: 'auto' }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', marginBottom: 4 }}>Total</div>
                  <div style={{ fontSize: 18, fontWeight: 900, color: 'var(--accent)' }}>${wo.total?.toFixed(2)}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </ClientLayout>
  );
}
