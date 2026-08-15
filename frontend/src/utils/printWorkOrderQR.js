export function printWorkOrderQR(workOrder) {
  const svgEl = document.querySelector('#qr-svg-container svg');
  const svgHTML = svgEl ? svgEl.outerHTML : '';
  const pw = window.open('', '_blank', 'width=420,height=560');
  pw.document.write(`<!DOCTYPE html><html><head><title>WO #${workOrder.id}</title>
    <style>
      body { font-family: -apple-system, sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; margin: 0; padding: 24px; box-sizing: border-box; }
      .label { font-size: 11px; font-weight: 700; color: #6B7280; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 4px; }
      .id { font-size: 30px; font-weight: 900; color: #111827; margin: 0 0 4px; }
      .vehicle { font-size: 15px; font-weight: 700; color: #111827; margin: 0 0 2px; }
      .plate { font-size: 13px; color: #6B7280; margin: 0 0 20px; }
      .hint { font-size: 11px; color: #9CA3AF; margin-top: 16px; }
    </style>
  </head><body>
    <div class="label">Work Order</div>
    <div class="id">#${workOrder.id}</div>
    <div class="vehicle">${workOrder.vehicleBrand} ${workOrder.vehicleModel}</div>
    <div class="plate">${workOrder.vehicleLicensePlate}</div>
    ${svgHTML}
    <div class="hint">Scan to open work order</div>
    <script>window.onload = function() { window.print(); };<\/script>
  </body></html>`);
  pw.document.close();
}
