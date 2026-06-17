import { useEffect, useState } from 'react';
import OwnerLayout from '../../components/OwnerLayout';
import api from '../../api/axios';

const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function buildMonthlyRevenue(paidInvoices) {
  const year = new Date().getFullYear();
  const map = {};
  paidInvoices.forEach(inv => {
    if (!inv.issuedAt) return;
    const d = new Date(inv.issuedAt);
    if (d.getFullYear() !== year) return;
    const month = d.getMonth();
    map[month] = (map[month] ?? 0) + (inv.amount ?? 0);
  });
  return MONTH_NAMES.map((name, i) => ({
    name,
    revenue: parseFloat((map[i] ?? 0).toFixed(2)),
  }));
}

function buildTopClients(paidInvoices) {
  const map = {};
  paidInvoices.forEach(inv => {
    const name = `${inv.clientFirstName ?? ''} ${inv.clientLastName ?? ''}`.trim() || `Client #${inv.clientId}`;
    map[name] = (map[name] ?? 0) + (inv.amount ?? 0);
  });
  return Object.entries(map)
    .map(([name, total]) => ({ name, total: parseFloat(total.toFixed(2)) }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 5);
}

function buildWorkOrdersByStatus(workOrders) {
  const statuses = ['OPEN', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];
  const colors   = ['var(--blue)', 'var(--yellow)', 'var(--green)', 'var(--red)'];
  const labels   = ['Open', 'In Progress', 'Completed', 'Cancelled'];
  return statuses.map((s, i) => ({
    status: s,
    label: labels[i],
    color: colors[i],
    count: workOrders.filter(w => w.status === s).length,
  }));
}

function TopClientsChart({ data }) {
  if (data.length === 0) return <div style={{ color: 'var(--text3)', fontSize: 13, padding: '16px 0' }}>No data yet.</div>;
  const max = data[0].total;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {data.map((d, i) => (
        <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 22, fontSize: 12, fontWeight: 800, color: 'var(--text3)', textAlign: 'right', flexShrink: 0 }}>
            #{i + 1}
          </div>
          <div style={{ width: 120, fontSize: 13, fontWeight: 600, color: 'var(--text)', flexShrink: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {d.name}
          </div>
          <div style={{ flex: 1, background: 'var(--bg)', borderRadius: 6, height: 10, overflow: 'hidden' }}>
            <div style={{ width: `${(d.total / max) * 100}%`, height: '100%', background: '#F97316', borderRadius: 6, transition: 'width 0.3s' }} />
          </div>
          <div style={{ width: 80, fontSize: 13, fontWeight: 800, color: 'var(--text)', textAlign: 'right', flexShrink: 0 }}>
            ${d.total.toFixed(2)}
          </div>
        </div>
      ))}
    </div>
  );
}

function WorkOrderStatusChart({ data }) {
  const total = data.reduce((s, d) => s + d.count, 0);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {data.map(d => (
        <div key={d.status} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 90, fontSize: 13, fontWeight: 600, color: 'var(--text)', flexShrink: 0 }}>{d.label}</div>
          <div style={{ flex: 1, background: 'var(--bg)', borderRadius: 6, height: 10, overflow: 'hidden' }}>
            <div style={{ width: total > 0 ? `${(d.count / total) * 100}%` : '0%', height: '100%', background: d.color, borderRadius: 6, transition: 'width 0.3s' }} />
          </div>
          <div style={{ width: 30, fontSize: 13, fontWeight: 800, color: d.color, textAlign: 'right', flexShrink: 0 }}>{d.count}</div>
        </div>
      ))}
    </div>
  );
}

function RevenueChart({ data }) {
  const [hovered, setHovered] = useState(null);
  if (data.length === 0) {
    return <div style={{ textAlign: 'center', color: 'var(--text3)', fontSize: 13, padding: '32px 0' }}>No revenue data yet.</div>;
  }
  const max = Math.max(...data.map(d => d.revenue));
  const chartHeight = 180;

  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: chartHeight + 32, paddingTop: 8, position: 'relative' }}>
      {data.map((d, i) => {
        const barH = max > 0 ? Math.max((d.revenue / max) * chartHeight, 4) : 4;
        const isHov = hovered === i;
        return (
          <div
            key={d.name}
            style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, cursor: 'default' }}
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
          >
            {isHov && (
              <div style={{
                position: 'absolute', top: 0,
                background: '#111827', color: '#fff',
                borderRadius: 8, padding: '5px 10px',
                fontSize: 12, fontWeight: 700,
                pointerEvents: 'none', whiteSpace: 'nowrap',
              }}>
                {d.name}: ${d.revenue.toFixed(2)}
              </div>
            )}
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', height: chartHeight }}>
              <div style={{
                width: '70%', height: barH,
                background: isHov ? '#ea6700' : '#F97316',
                borderRadius: '6px 6px 0 0',
                transition: 'background 0.15s, height 0.2s',
              }} />
            </div>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text3)', textAlign: 'center', whiteSpace: 'nowrap' }}>
              {d.name}
            </div>
          </div>
        );
      })}
    </div>
  );
}

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
  const monthlyRevenue = buildMonthlyRevenue(paidInvoices);
  const topClients = buildTopClients(paidInvoices);
  const workOrderStatuses = buildWorkOrdersByStatus(workOrders);

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

      {/* Revenue Chart */}
      <div style={{ background: 'var(--card)', borderRadius: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.06)', padding: '20px 24px', marginBottom: 24 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 16 }}>
          Monthly Revenue
        </div>
        <RevenueChart data={monthlyRevenue} />
      </div>

      {/* Bottom row: Top Clients + Work Orders by Status */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>

        <div style={{ background: 'var(--card)', borderRadius: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.06)', padding: '20px 24px' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 16 }}>
            Top Clients by Spending
          </div>
          <TopClientsChart data={topClients} />
        </div>

        <div style={{ background: 'var(--card)', borderRadius: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.06)', padding: '20px 24px' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 16 }}>
            Work Orders by Status
          </div>
          <WorkOrderStatusChart data={workOrderStatuses} />
        </div>

      </div>

    </OwnerLayout>
  );
}
