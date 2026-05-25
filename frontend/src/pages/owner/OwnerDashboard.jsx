import { useEffect, useState } from 'react';
import OwnerLayout from '../../components/OwnerLayout';
import api from '../../api/axios';

export default function OwnerDashboard() {
  const [workOrders, setWorkOrders] = useState([]);
  const [clients, setClients] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/api/work-orders'),
      api.get('/api/clients'),
      api.get('/api/invoices'),
      api.get('/api/workers'),
    ]).then(([wo, cl, inv, wr]) => {
      setWorkOrders(wo.data);
      setClients(cl.data);
      setInvoices(inv.data);
      setWorkers(wr.data);
    }).finally(() => setLoading(false));
  }, []);

  const paidInvoices = invoices.filter(i => i.isPaid);
  const unpaidInvoices = invoices.filter(i => !i.isPaid);
  const totalRevenue = paidInvoices.reduce((sum, i) => sum + (i.amount ?? 0), 0);

  const kpis = [
    { label: 'Total Revenue',   value: `$${totalRevenue.toFixed(2)}`, color: 'var(--accent)',  badge: `${paidInvoices.length} paid` },
    { label: 'Work Orders',     value: workOrders.length,              color: 'var(--blue)',    badge: `${workOrders.filter(w => w.status === 'IN_PROGRESS').length} in progress` },
    { label: 'Active Clients',  value: clients.length,                 color: 'var(--purple)',  badge: 'total' },
    { label: 'Unpaid Invoices', value: unpaidInvoices.length,          color: 'var(--red)',     badge: `$${unpaidInvoices.reduce((s,i) => s+(i.amount??0),0).toFixed(2)} pending` },
  ];

  if (loading) return (
    <OwnerLayout>
      <p style={{ color: 'var(--text2)' }}>Loading...</p>
    </OwnerLayout>
  );

  return (
    <OwnerLayout>
      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 24 }}>
        {kpis.map(k => (
          <div key={k.label} style={{
            background: 'var(--card)',
            borderRadius: 16,
            boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
            padding: '20px 24px',
            borderLeft: `4px solid ${k.color}`,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                {k.label}
              </span>
              <span style={{ fontSize: 11, fontWeight: 700, color: k.color }}>
                {k.badge}
              </span>
            </div>
            <div style={{ fontSize: 32, fontWeight: 900, color: k.color, lineHeight: 1 }}>
              {k.value}
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 16 }}>

        {/* Recent Invoices */}
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 10 }}>
            Recent Invoices
          </div>
          <div style={{ background: 'var(--card)', borderRadius: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['#', 'Client', 'Amount', 'Status'].map(h => (
                    <th key={h} style={{ padding: '11px 14px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {invoices.slice(0, 6).map((inv, i) => (
                  <tr key={inv.id} style={{ borderBottom: i < 5 ? '1px solid var(--border)' : 'none' }}>
                    <td style={{ padding: '12px 14px', fontSize: 12, fontWeight: 700, fontFamily: 'monospace' }}>
                      #{inv.id}
                    </td>
                    <td style={{ padding: '12px 14px', fontSize: 13 }}>
                      {inv.clientFirstName} {inv.clientLastName}
                    </td>
                    <td style={{ padding: '12px 14px', fontSize: 13, fontWeight: 800 }}>
                      ${inv.amount?.toFixed(2)}
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      <span style={{
                        background: inv.isPaid ? 'var(--green-bg)' : 'var(--yellow-bg)',
                        color: inv.isPaid ? 'var(--green)' : 'var(--yellow)',
                        borderRadius: 20, padding: '3px 10px', fontSize: 11, fontWeight: 700,
                      }}>
                        {inv.isPaid ? 'Paid' : 'Pending'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Workers */}
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 10 }}>
            Workers
          </div>
          <div style={{ background: 'var(--card)', borderRadius: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
            {workers.map((w, i) => (
              <div key={w.id} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '13px 16px',
                borderBottom: i < workers.length - 1 ? '1px solid var(--border)' : 'none',
              }}>
                <div style={{
                  width: 38, height: 38, borderRadius: '50%',
                  background: w.role === 'OWNER' ? 'var(--accent)' : 'var(--blue)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 14, fontWeight: 800, color: '#fff', flexShrink: 0,
                }}>
                  {w.firstName?.[0]}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 700 }}>{w.firstName} {w.lastName}</div>
                  <div style={{ fontSize: 11, color: 'var(--text2)' }}>{w.role}</div>
                </div>
                <span style={{
                  background: w.isActive ? 'var(--green-bg)' : 'var(--red-bg)',
                  color: w.isActive ? 'var(--green)' : 'var(--red)',
                  borderRadius: 20, padding: '3px 10px', fontSize: 11, fontWeight: 700,
                }}>
                  {w.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </OwnerLayout>
  );
}
