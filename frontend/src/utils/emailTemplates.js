function wrap(content) {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8"/>
  <style>
    body { margin: 0; padding: 0; background: #F3F4F6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
    .wrapper { max-width: 560px; margin: 40px auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 1px 6px rgba(0,0,0,0.08); }
    .header { background: #111827; padding: 24px 32px; }
    .logo { font-size: 22px; font-weight: 900; color: #fff; letter-spacing: -0.5px; }
    .logo span { color: #F97316; }
    .body { padding: 32px; }
    .body h2 { font-size: 20px; font-weight: 800; color: #111827; margin: 0 0 16px; }
    .body p { font-size: 14px; color: #6B7280; line-height: 1.7; margin: 0 0 14px; }
    .badge { display: inline-block; background: #FFF7ED; color: #F97316; border-radius: 20px; padding: 4px 14px; font-size: 12px; font-weight: 700; margin-bottom: 16px; }
    .card { background: #F3F4F6; border-radius: 12px; padding: 16px 20px; margin: 20px 0; }
    .card-row { display: flex; justify-content: space-between; padding: 5px 0; border-bottom: 1px solid #E5E7EB; }
    .card-row:last-child { border-bottom: none; }
    .card-label { font-size: 12px; font-weight: 700; color: #9CA3AF; text-transform: uppercase; letter-spacing: 0.04em; }
    .card-value { font-size: 13px; font-weight: 700; color: #111827; }
    .expiry { color: #EF4444 !important; }
    .footer { padding: 20px 32px; border-top: 1px solid #E5E7EB; }
    .footer p { font-size: 12px; color: #9CA3AF; margin: 0; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <div class="logo">OPER<span>ON</span></div>
    </div>
    <div class="body">
      ${content}
    </div>
    <div class="footer">
      <p>This message was sent by Operon Auto Service. Please do not reply directly to this email.</p>
    </div>
  </div>
</body>
</html>`;
}

export function registrationReminderTemplate({ clientFirstName, vehicleBrand, vehicleModel, licensePlate, vin, expiryDate }) {
  return wrap(`
    <div class="badge">Registration Reminder</div>
    <h2>Your vehicle registration is expiring soon</h2>
    <p>Dear <strong>${clientFirstName}</strong>,</p>
    <p>We would like to remind you that the registration for your vehicle is approaching its expiry date. Please make sure to renew it on time to avoid any issues.</p>
    <div class="card">
      <div class="card-row">
        <span class="card-label">Vehicle</span>
        <span class="card-value">${vehicleBrand} ${vehicleModel}</span>
      </div>
      <div class="card-row">
        <span class="card-label">License Plate</span>
        <span class="card-value">${licensePlate}</span>
      </div>
      <div class="card-row">
        <span class="card-label">VIN</span>
        <span class="card-value">${vin}</span>
      </div>
      <div class="card-row">
        <span class="card-label">Registration Expiry</span>
        <span class="card-value expiry">${expiryDate}</span>
      </div>
    </div>
    <p>If you need assistance or would like to schedule a service appointment, feel free to contact us.</p>
  `);
}

export function customTemplate({ clientFirstName, subject, message }) {
  return wrap(`
    <h2>${subject}</h2>
    <p>Dear <strong>${clientFirstName}</strong>,</p>
    <p>${message.replace(/\n/g, '<br/>')}</p>
  `);
}
