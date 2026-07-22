export function downloadPDF(inv) {
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
