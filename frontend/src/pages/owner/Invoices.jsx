import { useEffect, useState } from 'react';
import OwnerLayout from '../../components/OwnerLayout';
import api from '../../api/axios';

export default function Invoices() {
  const [invoices, setInvoices] = useState([]);
  const [filter, setFilter]     = useState('ALL');
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');
  useEffect(() => {
    api.get('/api/invoices')
      .then(res => setInvoices(res.data))
      .catch(() => setError('Error loading invoices.'))
      .finally(() => setLoading(false));
  }, []);

  function markPaid(id) {
    api.patch(`/api/invoices/${id}/pay`)
      .then(res => setInvoices(prev => prev.map(i => i.id === id ? res.data : i)));
  }

  const paid   = invoices.filter(i => i.isPaid);
  const unpaid = invoices.filter(i => !i.isPaid);
  const totalRevenue = paid.reduce((s, i) => s + (i.amount ?? 0), 0);
  const totalPending = unpaid.reduce((s, i) => s + (i.amount ?? 0), 0);
  const filtered = filter === 'ALL' ? invoices : filter === 'PAID' ? paid : unpaid;

  const tabs = [
    { key: 'ALL',    label: `All (${invoices.length})` },
    { key: 'PAID',   label: `Paid (${paid.length})` },
    { key: 'UNPAID', label: `Pending (${unpaid.length})` },
  ];

  return (
    <OwnerLayout>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text)', margin: 0 }}>Invoices</h2>
        <p style={{ color: 'var(--text2)', fontSize: 14, marginTop: 4 }}>Billing overview — invoices are issued automatically when a work order is completed</p>
      </div>

      {/* KPI */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 24 }}>
        <div style={{ background: 'var(--card)', borderRadius: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.06)', padding: 20 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', marginBottom: 6 }}>Total Invoices</div>
          <div style={{ fontSize: 28, fontWeight: 900, color: 'var(--text)' }}>{invoices.length}</div>
        </div>
        <div style={{ background: 'var(--card)', borderRadius: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.06)', padding: 20, border: '1.5px solid #BBF7D0' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--green)', textTransform: 'uppercase', marginBottom: 6 }}>Collected</div>
          <div style={{ fontSize: 28, fontWeight: 900, color: 'var(--green)' }}>${totalRevenue.toFixed(2)}</div>
          <div style={{ fontSize: 12, color: 'var(--text2)', marginTop: 4 }}>{paid.length} invoices</div>
        </div>
        <div style={{ background: 'var(--card)', borderRadius: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.06)', padding: 20, border: '1.5px solid #FEF08A' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--yellow)', textTransform: 'uppercase', marginBottom: 6 }}>Pending</div>
          <div style={{ fontSize: 28, fontWeight: 900, color: 'var(--yellow)' }}>${totalPending.toFixed(2)}</div>
          <div style={{ fontSize: 12, color: 'var(--text2)', marginTop: 4 }}>{unpaid.length} invoices</div>
        </div>
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
      {error   && <p style={{ color: 'var(--red)' }}>{error}</p>}

      {!loading && !error && (
        <div style={{ background: 'var(--card)', borderRadius: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                {['Invoice', 'Client', 'Vehicle', 'Work Order', 'Amount', 'Issued', 'Status', ''].map(h => (
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
                  <td colSpan={8} style={{ padding: 24, textAlign: 'center', color: 'var(--text2)' }}>
                    No invoices found.
                  </td>
                </tr>
              )}
              {filtered.map((inv, i) => (
                <tr key={inv.id} style={{ borderBottom: i < filtered.length - 1 ? '1px solid var(--border)' : 'none' }}>
                  <td style={{ padding: '13px 16px', fontSize: 12, fontWeight: 700, fontFamily: 'monospace', color: 'var(--text)' }}>
                    {inv.number ?? `#${inv.id}`}
                  </td>
                  <td style={{ padding: '13px 16px', fontSize: 13, color: 'var(--text)' }}>
                    {inv.clientFirstName} {inv.clientLastName}
                  </td>
                  <td style={{ padding: '13px 16px', fontSize: 13, color: 'var(--text2)' }}>
                    {inv.vehicleBrand} {inv.vehicleModel}
                    {inv.vehicleLicensePlate && (
                      <span style={{ color: 'var(--text3)', marginLeft: 6, fontSize: 12 }}>{inv.vehicleLicensePlate}</span>
                    )}
                  </td>
                  <td style={{ padding: '13px 16px', fontSize: 13, color: 'var(--text2)' }}>
                    #{inv.workOrderId}
                  </td>
                  <td style={{ padding: '13px 16px', fontSize: 14, fontWeight: 800, color: 'var(--text)' }}>
                    ${inv.amount?.toFixed(2)}
                  </td>
                  <td style={{ padding: '13px 16px', fontSize: 12, color: 'var(--text3)' }}>
                    {inv.issuedAt ?? '—'}
                  </td>
                  <td style={{ padding: '13px 16px' }}>
                    <span style={{
                      background: inv.isPaid ? 'var(--green-bg)' : 'var(--yellow-bg)',
                      color: inv.isPaid ? 'var(--green)' : 'var(--yellow)',
                      borderRadius: 20, padding: '3px 10px', fontSize: 11, fontWeight: 700,
                    }}>
                      {inv.isPaid ? 'Paid' : 'Pending'}
                    </span>
                  </td>
                  <td style={{ padding: '13px 16px' }}>
                    {!inv.isPaid && (
                      <button
                        onClick={() => markPaid(inv.id)}
                        style={{ background: 'var(--green-bg)', color: 'var(--green)', border: 'none', borderRadius: 8, padding: '5px 12px', fontWeight: 700, fontSize: 12, cursor: 'pointer' }}
                      >
                        Mark Paid
                      </button>
                    )}
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
