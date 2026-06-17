import { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';

const STATUS_COLORS = {
  OPEN:        { bg: 'var(--blue-bg)',   color: 'var(--blue)'   },
  IN_PROGRESS: { bg: 'var(--yellow-bg)', color: 'var(--yellow)' },
  COMPLETED:   { bg: 'var(--green-bg)',  color: 'var(--green)'  },
  CANCELLED:   { bg: 'var(--red-bg)',    color: 'var(--red)'    },
  PENDING:     { bg: 'var(--purple-bg)', color: 'var(--purple)' },
};


export default function WorkOrders() {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const [workOrders, setWorkOrders] = useState([]);
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [apptSortAsc, setApptSortAsc] = useState(true);

    useEffect(() => {
        Promise.all([
            api.get('/api/appointments/status/CONFIRMED'),
            api.get('/api/work-orders')
        ])
        .then(([appRes,woRes]) => {
            const bookedIds = new Set(woRes.data.map(wo => wo.appointmentId).filter(Boolean));
            const sorted = appRes.data
                .filter(a => !bookedIds.has(a.id))
                .sort((a, b) => new Date(a.scheduledAt) - new Date(b.scheduledAt));
            setAppointments(sorted);
            setWorkOrders(woRes.data);
        })
        .catch(() => setError('Error loading data.'))
        .finally(() => setLoading(false));
    }, []);

     return (
        <Layout>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text)', marginBottom: 24 }}>
            Work Orders
        </h2>
        {loading && <p style={{ color: 'var(--text2)' }}>Loading...</p>}

        {/* Confirmed appointments */}
        <div style={{ marginBottom: 32 }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)', marginBottom: 12 }}>
            Confirmed Appointments
        </h3>
        <div style={{ background: 'var(--card)', borderRadius: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                {['ID', 'Client', 'Vehicle'].map(h => (
                    <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      {h}
                    </th>
                ))}
                <th
                  onClick={() => setApptSortAsc(p => !p)}
                  style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.05em', cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap' }}
                >
                  Appointment {apptSortAsc ? '↑' : '↓'}
                </th>
                {['Note', ''].map(h => (
                    <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      {h}
                    </th>
                ))}
                </tr>
            </thead>
            <tbody>
                {appointments.length === 0 && (
                <tr>
                    <td colSpan={6} style={{ padding: 24, textAlign: 'center', color: 'var(--text2)' }}>
                    No confirmed appointments.
                    </td>
                </tr>
                )}
                {[...appointments].sort((a, b) => apptSortAsc
                    ? new Date(a.scheduledAt) - new Date(b.scheduledAt)
                    : new Date(b.scheduledAt) - new Date(a.scheduledAt)
                ).map((a, i) => (
                <tr key={a.id} style={{ borderBottom: i < appointments.length - 1 ? '1px solid var(--border)' : 'none' }}>
                    <td style={{ padding: '14px 16px', fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>#{a.id}</td>
                    <td style={{ padding: '14px 16px', fontSize: 14, color: 'var(--text)' }}>{a.clientFirstName} {a.clientLastName}</td>
                    <td style={{ padding: '14px 16px', fontSize: 14, color: 'var(--text)' }}>{a.vehicleBrand} {a.vehicleModel}</td>
                    <td style={{ padding: '14px 16px', fontSize: 13, color: 'var(--text2)' }}>
                      {new Date(a.scheduledAt).toLocaleString('en-GB')}
                    </td>
                    <td style={{ padding: '14px 16px', fontSize: 13, color: 'var(--text2)' }}>{a.note ?? '—'}</td>
                    <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                    <button
                        onClick={() => {
                        api.post(`/api/work-orders/from-appointment/${a.id}`)
                            .then(res => {
                            setAppointments(prev => prev.filter(x => x.id !== a.id));
                            setWorkOrders(prev => [res.data, ...prev]);
                            });
                        }}
                        style={{ background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 8, padding: '7px 14px', fontWeight: 700, fontSize: 12, cursor: 'pointer' }}
                    >
                        Open Work Order
                    </button>
                    </td>
                </tr>
                ))}
            </tbody>
            </table>
            </div>
        </div>
        {/* Work orders list */}
        <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)', margin: 0 }}>Work Orders</h3>
          <div style={{ display: 'flex', gap: 4, background: 'var(--card)', borderRadius: 12, padding: 4, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
            {['ALL', 'OPEN', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'].map(s => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                style={{
                  padding: '6px 14px', borderRadius: 9, border: 'none', fontWeight: 700, fontSize: 12,
                  background: statusFilter === s ? (s === 'ALL' ? 'var(--accent)' : STATUS_COLORS[s]?.bg) : 'transparent',
                  color: statusFilter === s ? (s === 'ALL' ? '#fff' : STATUS_COLORS[s]?.color) : 'var(--text2)',
                  cursor: 'pointer',
                }}
              >
                {s === 'ALL' ? 'All' : s}
              </button>
            ))}
          </div>
        </div>
        <div style={{ background: 'var(--card)', borderRadius: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                {['ID', 'Vehicle', 'Plate', 'Client', 'Status', 'Opened', 'Total', ''].map(h => (
                    <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {h}
                    </th>
                ))}
                </tr>
            </thead>
            <tbody>
                {workOrders.filter(wo => statusFilter === 'ALL' || wo.status === statusFilter).length === 0 && (
                <tr>
                    <td colSpan={8} style={{ padding: 24, textAlign: 'center', color: 'var(--text2)' }}>
                    No work orders.
                    </td>
                </tr>
                )}
                {workOrders.filter(wo => statusFilter === 'ALL' || wo.status === statusFilter).map((wo, i, arr) => (
                <tr key={wo.id} style={{ borderBottom: i < arr.length - 1 ? '1px solid var(--border)' : 'none' }}>
                    <td style={{ padding: '14px 16px', fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>#{wo.id}</td>
                    <td style={{ padding: '14px 16px', fontSize: 14, color: 'var(--text)' }}>{wo.vehicleBrand} {wo.vehicleModel}</td>
                    <td style={{ padding: '14px 16px', fontSize: 13, color: 'var(--text2)' }}>{wo.vehicleLicensePlate}</td>
                    <td style={{ padding: '14px 16px', fontSize: 14, color: 'var(--text)' }}>
                    {wo.clientFirstName ? `${wo.clientFirstName} ${wo.clientLastName}` : '—'}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                    <span style={{
                        background: STATUS_COLORS[wo.status]?.bg,
                        color: STATUS_COLORS[wo.status]?.color,
                        borderRadius: 20, padding: '3px 10px', fontSize: 11, fontWeight: 700,}}>
                        {wo.status}
                    </span>
                    </td>
                    <td style={{ padding: '14px 16px', fontSize: 13, color: 'var(--text2)' }}>
                    {new Date(wo.openedAt).toLocaleDateString('en-GB')}
                    </td>
                    <td style={{ padding: '14px 16px', fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>
                    ${wo.total?.toFixed(2)}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                    <button
                        onClick={() => navigate(`/worker/work-orders/${wo.id}`)}
                        style={{ background: 'var(--bg)', color: 'var(--text)', border: '1px solid var(--border)', borderRadius: 8, padding: '7px 14px', fontWeight: 700, fontSize: 12, cursor: 'pointer' }}>
                        Detalji
                    </button>
                    </td>
                </tr>
                ))}
            </tbody>
            </table>
        </div>
        </div>



        </Layout>
  );
}

   

