import { useEffect, useState } from 'react';
import OwnerLayout from '../../components/OwnerLayout';
import api from '../../api/axios';
import { registrationReminderTemplate, customTemplate } from '../../utils/emailTemplates';

const typeStyle = {
  INDIVIDUAL: { background: 'var(--blue-bg)',   color: 'var(--blue)'   },
  COMPANY:    { background: 'var(--purple-bg)', color: 'var(--purple)' },
  FLEET:      { background: 'var(--yellow-bg)', color: 'var(--yellow)' },
};

const avatarColors = ['#F97316','#3B82F6','#8B5CF6','#22C55E','#EF4444','#F59E0B','#0891B2'];

export default function Clients() {
  const [clients, setClients] = useState([]);
  const [vehicles, setVehicles] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expanded, setExpanded] = useState(null);
  const [reminderClient, setReminderClient] = useState(null);
  const [reminderTemplate, setReminderTemplate] = useState('custom');
  const [reminderForm, setReminderForm] = useState({ subject: '', message: '', vehicle: null });
  const [reminderSending, setReminderSending] = useState(false);
  const [reminderSuccess, setReminderSuccess] = useState(false);
  const [reminderError, setReminderError] = useState('');

  const [broadcastOpen, setBroadcastOpen] = useState(false);
  const [broadcastForm, setBroadcastForm] = useState({ subject: '', message: '' });
  const [broadcastSending, setBroadcastSending] = useState(false);
  const [broadcastSuccess, setBroadcastSuccess] = useState(false);
  const [broadcastError, setBroadcastError] = useState('');

  useEffect(() => {
    api.get('/api/clients')
      .then(res => {
        setClients(res.data);
        return Promise.all(res.data.map(c =>
          api.get(`/api/clients/${c.id}/vehicles`).then(v => ({ clientId: c.id, vehicles: v.data }))
        ));
      })
      .then(results => {
        const map = {};
        results.forEach(r => { map[r.clientId] = r.vehicles; });
        setVehicles(map);
      })
      .catch(() => setError('Error loading data.'))
      .finally(() => setLoading(false));
  }, []);

  function vehiclesForClient(clientId) {
    return vehicles[clientId] ?? [];
  }

  function toggleExpand(id) {
    setExpanded(prev => prev === id ? null : id);
  }

  return (
    <OwnerLayout>
      <div style={{ marginBottom: 24, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text)', margin: 0 }}>Clients</h2>
          <p style={{ color: 'var(--text2)', fontSize: 14, marginTop: 4 }}>
            {clients.length} clients · {Object.values(vehicles).reduce((sum, v) => sum + v.length, 0)} vehicles
          </p>
        </div>
        <button
          onClick={() => { setBroadcastOpen(true); setBroadcastForm({ subject: '', message: '' }); setBroadcastSuccess(false); setBroadcastError(''); }}
          style={{ background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 10, padding: '9px 18px', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}
        >
          Notify All Clients
        </button>
      </div>

      {loading && <p style={{ color: 'var(--text2)' }}>Loading...</p>}
      {error && <p style={{ color: 'var(--red)' }}>{error}</p>}

      {!loading && !error && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {clients.map((c, i) => {
            const clientVehicles = vehiclesForClient(c.id);
            const isExpanded = expanded === c.id;
            const color = avatarColors[i % avatarColors.length];

            return (
              <div key={c.id} style={{
                background: 'var(--card)',
                borderRadius: 16,
                boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                overflow: 'hidden',
              }}>
                {/* Client row */}
                <div
                  onClick={() => toggleExpand(c.id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 14,
                    padding: '16px 20px', cursor: 'pointer',
                  }}
                >
                  <div style={{
                    width: 42, height: 42, borderRadius: '50%',
                    background: color,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 16, fontWeight: 800, color: '#fff', flexShrink: 0,
                  }}>
                    {c.firstName?.[0]}
                  </div>

                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>
                      {c.firstName} {c.lastName}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text2)', marginTop: 2 }}>
                      {c.email} · {c.phone}
                    </div>
                  </div>

                  <span style={{
                    ...typeStyle[c.clientType],
                    borderRadius: 20, padding: '3px 10px',
                    fontSize: 11, fontWeight: 700,
                  }}>
                    {c.clientType}
                  </span>

                  <div style={{ fontSize: 12, color: 'var(--text2)', minWidth: 80, textAlign: 'right' }}>
                    {clientVehicles.length} vehicle{clientVehicles.length !== 1 ? 's' : ''}
                  </div>

                  <button
                    onClick={e => {
                      e.stopPropagation();
                      setReminderClient(c);
                      setReminderTemplate('custom');
                      setReminderForm({ subject: '', message: '', vehicle: null });
                      setReminderSuccess(false);
                      setReminderError('');
                    }}
                    style={{
                      background: 'var(--accent)', color: '#fff', border: 'none',
                      borderRadius: 8, padding: '6px 14px', fontSize: 12,
                      fontWeight: 700, cursor: 'pointer', marginLeft: 8,
                    }}
                  >
                    Send Reminder
                  </button>

                  <div style={{ fontSize: 18, color: 'var(--text3)', marginLeft: 8 }}>
                    {isExpanded ? '▲' : '▼'}
                  </div>
                </div>

                {/* Vehicles */}
                {isExpanded && (
                  <div style={{ borderTop: '1px solid var(--border)' }}>
                    {clientVehicles.length === 0 ? (
                      <div style={{ padding: '14px 20px', fontSize: 13, color: 'var(--text2)' }}>
                        No vehicles.
                      </div>
                    ) : clientVehicles.map((v, vi) => (
                      <div key={v.id} style={{
                        display: 'flex', alignItems: 'center', gap: 14,
                        padding: '12px 20px 12px 76px',
                        borderBottom: vi < clientVehicles.length - 1 ? '1px solid var(--border)' : 'none',
                        background: '#FAFAFA',
                      }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>
                            {v.brand} {v.model} {v.year}
                          </div>
                          <div style={{ fontSize: 11, color: 'var(--text2)', marginTop: 2 }}>
                            {v.licensePlate} · {v.mileage?.toLocaleString()} km · VIN: {v.vin}
                          </div>
                        </div>
                        <div style={{ fontSize: 12, color: 'var(--text3)', textAlign: 'right' }}>
                          <div>Reg. Expires: {v.registrationExpiry ?? '—'}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
      {broadcastOpen && (
        <div
          onClick={e => { if (e.target === e.currentTarget) setBroadcastOpen(false); }}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <div style={{ background: 'var(--card)', borderRadius: 20, padding: 28, width: 480, maxWidth: '95vw' }}>
            <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--text)', marginBottom: 4 }}>Notify All Clients</div>
            <div style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 20 }}>
              Sending to <strong>{clients.length} clients</strong>
            </div>

            {broadcastSuccess ? (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>✓</div>
                <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--green)', marginBottom: 20 }}>
                  Email sent to all {clients.length} clients!
                </div>
                <button onClick={() => setBroadcastOpen(false)}
                  style={{ background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 10, padding: '10px 24px', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
                  Close
                </button>
              </div>
            ) : (
              <>
                <div style={{ marginBottom: 14 }}>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--text3)', marginBottom: 6 }}>Subject</label>
                  <input value={broadcastForm.subject} onChange={e => setBroadcastForm(p => ({ ...p, subject: e.target.value }))}
                    placeholder="e.g. Important announcement from Operon"
                    style={{ width: '100%', boxSizing: 'border-box', padding: '9px 12px', border: '1px solid var(--border)', borderRadius: 10, fontSize: 13, outline: 'none', background: 'var(--bg)', color: 'var(--text)' }} />
                </div>
                <div style={{ marginBottom: 20 }}>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--text3)', marginBottom: 6 }}>Message</label>
                  <textarea value={broadcastForm.message} onChange={e => setBroadcastForm(p => ({ ...p, message: e.target.value }))}
                    placeholder="Write your message here..." rows={5}
                    style={{ width: '100%', boxSizing: 'border-box', padding: '9px 12px', border: '1px solid var(--border)', borderRadius: 10, fontSize: 13, outline: 'none', background: 'var(--bg)', color: 'var(--text)', resize: 'vertical', fontFamily: 'inherit' }} />
                </div>
                {broadcastError && <div style={{ fontSize: 12, color: 'var(--red)', marginBottom: 12 }}>{broadcastError}</div>}
                <div style={{ display: 'flex', gap: 10 }}>
                  <button
                    disabled={broadcastSending || !broadcastForm.subject || !broadcastForm.message}
                    onClick={() => {
                      setBroadcastSending(true);
                      setBroadcastError('');
                      const htmlBody = customTemplate({ clientFirstName: 'Valued Client', subject: broadcastForm.subject, message: broadcastForm.message });
                      api.post(`/api/email/to-all-clients?subject=${encodeURIComponent(broadcastForm.subject)}`, htmlBody, {
                        headers: { 'Content-Type': 'text/plain' },
                      })
                        .then(() => setBroadcastSuccess(true))
                        .catch(() => setBroadcastError('Failed to send. Check server configuration.'))
                        .finally(() => setBroadcastSending(false));
                    }}
                    style={{ flex: 1, background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 10, padding: 12, fontWeight: 700, fontSize: 13, cursor: 'pointer', opacity: (broadcastSending || !broadcastForm.subject || !broadcastForm.message) ? 0.6 : 1 }}
                  >
                    {broadcastSending ? 'Sending...' : `Send to All ${clients.length} Clients`}
                  </button>
                  <button onClick={() => setBroadcastOpen(false)}
                    style={{ flex: 1, background: 'var(--bg)', color: 'var(--text)', border: '1px solid var(--border)', borderRadius: 10, padding: 12, fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
                    Cancel
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {reminderClient && (
        <div
          onClick={e => { if (e.target === e.currentTarget) setReminderClient(null); }}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <div style={{ background: 'var(--card)', borderRadius: 20, padding: 28, width: 480, maxWidth: '95vw' }}>
            <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--text)', marginBottom: 4 }}>
              Send Reminder
            </div>
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 13, color: 'var(--text2)' }}>
                To: <strong>{reminderClient.firstName} {reminderClient.lastName}</strong>
              </div>
              <div style={{ fontSize: 13, color: 'var(--text3)', marginTop: 2 }}>
                Email: {reminderClient.email}
              </div>
            </div>

            {reminderSuccess ? (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>✓</div>
                <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--green)', marginBottom: 20 }}>Email sent successfully!</div>
                <button onClick={() => setReminderClient(null)}
                  style={{ background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 10, padding: '10px 24px', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
                  Close
                </button>
              </div>
            ) : (
              <>
                {/* Template selector */}
                <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
                  {[
                    { key: 'custom', label: 'Custom Message' },
                    { key: 'registration', label: 'Registration Reminder' },
                  ].map(t => (
                    <button key={t.key} onClick={() => {
                      setReminderTemplate(t.key);
                      setReminderForm({ subject: '', message: '', vehicle: null });
                    }}
                      style={{
                        flex: 1, padding: '8px 12px', borderRadius: 10, fontWeight: 700, fontSize: 12, cursor: 'pointer',
                        background: reminderTemplate === t.key ? 'var(--accent)' : 'var(--bg)',
                        color: reminderTemplate === t.key ? '#fff' : 'var(--text2)',
                        border: reminderTemplate === t.key ? 'none' : '1px solid var(--border)',
                      }}>
                      {t.label}
                    </button>
                  ))}
                </div>

                {/* Custom template fields */}
                {reminderTemplate === 'custom' && (
                  <>
                    <div style={{ marginBottom: 14 }}>
                      <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--text3)', marginBottom: 6 }}>Subject</label>
                      <input value={reminderForm.subject} onChange={e => setReminderForm(p => ({ ...p, subject: e.target.value }))}
                        placeholder="e.g. Important update from Operon"
                        style={{ width: '100%', boxSizing: 'border-box', padding: '9px 12px', border: '1px solid var(--border)', borderRadius: 10, fontSize: 13, outline: 'none', background: 'var(--bg)', color: 'var(--text)' }} />
                    </div>
                    <div style={{ marginBottom: 20 }}>
                      <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--text3)', marginBottom: 6 }}>Message</label>
                      <textarea value={reminderForm.message} onChange={e => setReminderForm(p => ({ ...p, message: e.target.value }))}
                        placeholder="Write your message here..." rows={5}
                        style={{ width: '100%', boxSizing: 'border-box', padding: '9px 12px', border: '1px solid var(--border)', borderRadius: 10, fontSize: 13, outline: 'none', background: 'var(--bg)', color: 'var(--text)', resize: 'vertical', fontFamily: 'inherit' }} />
                    </div>
                  </>
                )}

                {/* Registration reminder fields */}
                {reminderTemplate === 'registration' && (
                  <>
                    <div style={{ marginBottom: 14 }}>
                      <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--text3)', marginBottom: 6 }}>Vehicle</label>
                      <select value={reminderForm.vehicle?.id ?? ''} onChange={e => {
                        const v = vehiclesForClient(reminderClient.id).find(x => x.id === Number(e.target.value));
                        setReminderForm(p => ({ ...p, vehicle: v ?? null }));
                      }}
                        style={{ width: '100%', padding: '9px 12px', border: '1px solid var(--border)', borderRadius: 10, fontSize: 13, outline: 'none', background: 'var(--bg)', color: 'var(--text)' }}>
                        <option value="">-- Select vehicle --</option>
                        {vehiclesForClient(reminderClient.id).map(v => (
                          <option key={v.id} value={v.id}>{v.brand} {v.model} · {v.licensePlate}</option>
                        ))}
                      </select>
                    </div>
                    {reminderForm.vehicle && (
                      <div style={{ background: 'var(--bg)', borderRadius: 10, padding: '12px 16px', marginBottom: 20, fontSize: 13 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                          <span style={{ color: 'var(--text3)', fontWeight: 700, fontSize: 11, textTransform: 'uppercase' }}>Registration Expiry</span>
                          <span style={{ fontWeight: 700, color: 'var(--red)' }}>{reminderForm.vehicle.registrationExpiry ?? '—'}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: 'var(--text3)', fontWeight: 700, fontSize: 11, textTransform: 'uppercase' }}>VIN</span>
                          <span style={{ fontWeight: 700, color: 'var(--text)' }}>{reminderForm.vehicle.vin}</span>
                        </div>
                      </div>
                    )}
                  </>
                )}

                {reminderError && <div style={{ fontSize: 12, color: 'var(--red)', marginBottom: 12 }}>{reminderError}</div>}

                <div style={{ display: 'flex', gap: 10 }}>
                  <button
                    disabled={reminderSending || (reminderTemplate === 'custom' ? (!reminderForm.subject || !reminderForm.message) : !reminderForm.vehicle)}
                    onClick={() => {
                      setReminderSending(true);
                      setReminderError('');

                      let subject, htmlBody;
                      if (reminderTemplate === 'custom') {
                        subject = reminderForm.subject;
                        htmlBody = customTemplate({ clientFirstName: reminderClient.firstName, subject, message: reminderForm.message });
                      } else {
                        const v = reminderForm.vehicle;
                        subject = `Registration Reminder — ${v.brand} ${v.model} (${v.licensePlate})`;
                        htmlBody = registrationReminderTemplate({
                          clientFirstName: reminderClient.firstName,
                          vehicleBrand: v.brand, vehicleModel: v.model,
                          licensePlate: v.licensePlate, vin: v.vin,
                          expiryDate: v.registrationExpiry ?? '—',
                        });
                      }

                      api.post(`/api/email/reminder/${reminderClient.id}?subject=${encodeURIComponent(subject)}`, htmlBody, {
                        headers: { 'Content-Type': 'text/plain' },
                      })
                        .then(() => setReminderSuccess(true))
                        .catch(() => setReminderError('Failed to send email. Check server configuration.'))
                        .finally(() => setReminderSending(false));
                    }}
                    style={{ flex: 1, background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 10, padding: 12, fontWeight: 700, fontSize: 13, cursor: 'pointer', opacity: reminderSending ? 0.6 : 1 }}
                  >
                    {reminderSending ? 'Sending...' : 'Send Email'}
                  </button>
                  <button onClick={() => setReminderClient(null)}
                    style={{ flex: 1, background: 'var(--bg)', color: 'var(--text)', border: '1px solid var(--border)', borderRadius: 10, padding: 12, fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
                    Cancel
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

    </OwnerLayout>
  );
}
