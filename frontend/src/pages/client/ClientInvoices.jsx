import { useEffect, useState } from 'react';
import ClientLayout from '../../components/ClientLayout';
import api from '../../api/axios';

function downloadPDF(inv) {
  const itemRows = (inv.items ?? []).map(item => {
    const subtotal = item.price * item.quantity * (1 - (item.discount ?? 0) / 100);
    const type = item.partId ? 'Part' : 'Service';
    return `
      <tr>
        <td>${type}</td>
        <td>${item.name}</td>
        <td style="text-align:center">${item.quantity}</td>
        <td style="text-align:right">$${item.price.toFixed(2)}</td>
        <td style="text-align:center">${item.discount ?? 0}%</td>
        <td style="text-align:right"><strong>$${subtotal.toFixed(2)}</strong></td>
      </tr>`;
  }).join('');

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8"/>
  <title>Invoice ${inv.number ?? inv.id}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: Arial, sans-serif; padding: 48px; color: #111827; font-size: 14px; }
    .logo { font-size: 26px; font-weight: 900; margin-bottom: 32px; }
    .logo span { color: #F97316; }
    .header { display: flex; justify-content: space-between; margin-bottom: 32px; }
    .invoice-num { font-size: 22px; font-weight: 900; }
    .badge { display: inline-block; padding: 3px 12px; border-radius: 20px; font-size: 12px; font-weight: 700;
             background: ${inv.isPaid ? '#F0FDF4' : '#FFFBEB'}; color: ${inv.isPaid ? '#22C55E' : '#F59E0B'}; margin-top: 6px; }
    .section { margin-bottom: 24px; }
    .label { font-size: 11px; font-weight: 700; color: #9CA3AF; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px; }
    .grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 24px; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
    thead tr { background: #F3F4F6; }
    th { padding: 10px 12px; text-align: left; font-size: 11px; font-weight: 700; color: #6B7280; text-transform: uppercase; }
    td { padding: 10px 12px; border-bottom: 1px solid #E5E7EB; }
    .total-row { font-size: 16px; font-weight: 900; color: #F97316; }
    .footer { margin-top: 40px; font-size: 12px; color: #9CA3AF; text-align: center; }
  </style>
</head>
<body>
  <div class="logo">OPER<span>ON</span></div>
  <div class="header">
    <div>
      <div class="invoice-num">${inv.number ?? `#${inv.id}`}</div>
      <div class="badge">${inv.isPaid ? 'PAID' : 'PENDING'}</div>
    </div>
    <div style="text-align:right">
      <div class="label">Issued</div>
      <div>${inv.issuedAt ?? '—'}</div>
      <div class="label" style="margin-top:12px">Work Order</div>
      <div>#${inv.workOrderId}</div>
    </div>
  </div>
  <div class="grid2">
    <div class="section">
      <div class="label">Client</div>
      <div style="font-weight:700">${inv.clientFirstName ?? ''} ${inv.clientLastName ?? ''}</div>
    </div>
    <div class="section">
      <div class="label">Vehicle</div>
      <div style="font-weight:700">${inv.vehicleBrand ?? ''} ${inv.vehicleModel ?? ''}</div>
      <div style="color:#6B7280">${inv.vehicleLicensePlate ?? ''}</div>
    </div>
  </div>
  ${inv.workOrderDescription ? `
  <div class="section">
    <div class="label">Description</div>
    <div>${inv.workOrderDescription}</div>
  </div>` : ''}
  <table>
    <thead>
      <tr>
        <th>Type</th><th>Name</th><th style="text-align:center">Qty</th>
        <th style="text-align:right">Price</th><th style="text-align:center">Discount</th>
        <th style="text-align:right">Subtotal</th>
      </tr>
    </thead>
    <tbody>
      ${itemRows || '<tr><td colspan="6" style="text-align:center;color:#9CA3AF">No items</td></tr>'}
    </tbody>
    <tfoot>
      <tr class="total-row">
        <td colspan="5" style="text-align:right;padding:14px 12px">TOTAL</td>
        <td style="text-align:right;padding:14px 12px">$${(inv.amount ?? 0).toFixed(2)}</td>
      </tr>
    </tfoot>
  </table>
  <div class="footer">Operon Service · Thank you for your business</div>
  <script>window.onload = function(){ window.print(); }</script>
</body>
</html>`;

  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.target = '_blank';
  a.rel = 'noopener';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 10000);
}

export default function ClientInvoices() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');
  const [filter, setFilter]     = useState('ALL');

  useEffect(() => {
    api.get('/api/my-invoices')
      .then(res => setInvoices(res.data))
      .catch(() => setError('Error loading invoices.'))
      .finally(() => setLoading(false));
  }, []);

  const paid   = invoices.filter(i => i.isPaid);
  const unpaid = invoices.filter(i => !i.isPaid);
  const totalPaid    = paid.reduce((s, i) => s + (i.amount ?? 0), 0);
  const totalPending = unpaid.reduce((s, i) => s + (i.amount ?? 0), 0);

  const filtered = filter === 'ALL' ? invoices : filter === 'PAID' ? paid : unpaid;

  const tabs = [
    { key: 'ALL',    label: `All (${invoices.length})` },
    { key: 'PAID',   label: `Paid (${paid.length})` },
    { key: 'UNPAID', label: `Pending (${unpaid.length})` },
  ];

  return (
    <ClientLayout>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text)', margin: 0 }}>Invoices</h2>
        <p style={{ color: 'var(--text2)', fontSize: 14, marginTop: 4 }}>Your billing history</p>
      </div>

      {/* KPI */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 24 }}>
        <div style={{ background: 'var(--card)', borderRadius: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.06)', padding: 20 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', marginBottom: 6 }}>Total Invoices</div>
          <div style={{ fontSize: 28, fontWeight: 900, color: 'var(--text)' }}>{invoices.length}</div>
        </div>
        <div style={{ background: 'var(--card)', borderRadius: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.06)', padding: 20, border: '1.5px solid #BBF7D0' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--green)', textTransform: 'uppercase', marginBottom: 6 }}>Paid</div>
          <div style={{ fontSize: 28, fontWeight: 900, color: 'var(--green)' }}>${totalPaid.toFixed(2)}</div>
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
                {['Invoice', 'Vehicle', 'Amount', 'Issued', 'Status', ''].map(h => (
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
                  <td colSpan={6} style={{ padding: 24, textAlign: 'center', color: 'var(--text2)' }}>
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
                    {inv.vehicleBrand} {inv.vehicleModel}
                    {inv.vehicleLicensePlate && (
                      <span style={{ color: 'var(--text3)', marginLeft: 6, fontSize: 12 }}>{inv.vehicleLicensePlate}</span>
                    )}
                  </td>
                  <td style={{ padding: '13px 16px', fontSize: 15, fontWeight: 900, color: 'var(--accent)' }}>
                    ${inv.amount?.toFixed(2)}
                  </td>
                  <td style={{ padding: '13px 16px', fontSize: 12, color: 'var(--text3)' }}>
                    {inv.issuedAt ?? '—'}
                  </td>
                  <td style={{ padding: '13px 16px' }}>
                    <span style={{
                      background: inv.isPaid ? 'var(--green-bg)' : 'var(--yellow-bg)',
                      color: inv.isPaid ? 'var(--green)' : 'var(--yellow)',
                      borderRadius: 20, padding: '3px 10px',
                      fontSize: 11, fontWeight: 700,
                    }}>
                      {inv.isPaid ? 'Paid' : 'Pending'}
                    </span>
                  </td>
                  <td style={{ padding: '13px 16px' }}>
                    <button
                      onClick={() => downloadPDF(inv)}
                      style={{ background: 'var(--bg)', color: 'var(--text)', border: '1px solid var(--border)', borderRadius: 8, padding: '6px 12px', fontWeight: 700, fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
                    >
                      ↓ PDF
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </ClientLayout>
  );
}
