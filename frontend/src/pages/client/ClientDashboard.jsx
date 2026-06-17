import { useEffect, useState } from 'react';
import ClientLayout from '../../components/ClientLayout';
import VehicleAddForm from './VehicleAddForm';
import api from '../../api/axios';

function BrandLogo({ brand }) {
  const [failed, setFailed] = useState(false);
  const slug = brand?.toLowerCase().replace(/\s+/g, '-') ?? '';
  if (!failed && slug) {
    return (
      <img
        src={`/carlogos/${slug}.png`}
        alt={brand}
        onError={() => setFailed(true)}
        style={{ width: 36, height: 36, objectFit: 'contain' }}
      />
    );
  }
  return <span style={{ fontSize: 24 }}>🚗</span>;
}

export default function ClientDashboard() {
  const [vehicles, setVehicles] = useState([]);
  const [workOrders, setWorkOrders] = useState([]);
  const [clientId, setClientId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [expandedVehicleId, setExpandedVehicleId] = useState(null);

  const [unpaidAmount, setUnpaidAmount] = useState(0);
  const [completedServices, setCompletedServices] = useState(0);
  const [daysToExpiry, setDaysToExpiry] = useState(null);
  const [totalSpent, setTotalSpent] = useState(0);
  const [nextAppointment, setNextAppointment] = useState(null);

  useEffect(() => {
    api.get('/api/me').then(res => {
      const id = res.data.id;
      setClientId(id);
      return Promise.all([
        api.get(`/api/vehicles/client/${id}`),
        api.get('/api/my-invoices'),
        api.get('/api/my-work-orders'),
        api.get('/api/my-appointments'),
      ]);
    }).then(([vehiclesRes, invoicesRes, ordersRes, apptsRes]) => {
      setVehicles(vehiclesRes.data);

      const unpaid = invoicesRes.data.filter(i => !i.isPaid).reduce((sum, i) => sum + (i.amount ?? 0), 0);
      setUnpaidAmount(unpaid);
      const spent = invoicesRes.data.filter(i => i.isPaid).reduce((sum, i) => sum + (i.amount ?? 0), 0);
      setTotalSpent(spent);

      setWorkOrders(ordersRes.data);
      setCompletedServices(ordersRes.data.filter(wo => wo.status === 'COMPLETED').length);

      const today = new Date();

      const nearest = vehiclesRes.data
        .filter(v => v.registrationExpiry)
        .map(v => ({
          days: Math.ceil((new Date(v.registrationExpiry) - today) / (1000 * 60 * 60 * 24)),
          label: `${v.brand} ${v.model}`,
        }))
        .sort((a, b) => a.days - b.days)[0] ?? null;
      setDaysToExpiry(nearest);

      const nextAppt = apptsRes.data
        .filter(a => (a.status === 'PENDING' || a.status === 'CONFIRMED') && new Date(a.scheduledAt) >= today)
        .sort((a, b) => new Date(a.scheduledAt) - new Date(b.scheduledAt))[0] ?? null;
      setNextAppointment(nextAppt ? {
        days: Math.ceil((new Date(nextAppt.scheduledAt) - today) / (1000 * 60 * 60 * 24)),
        date: new Date(nextAppt.scheduledAt).toLocaleDateString('en-GB'),
      } : null);
    })
      .catch(() => setError('Failed to load dashboard.'))
      .finally(() => setLoading(false));
  }, []);


  return (
    <ClientLayout>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text)', margin: 0 }}>
          Dashboard
        </h2>
      </div>

      {loading && <p style={{ color: 'var(--text2)' }}>Loading...</p>}
      {error && <p style={{ color: 'var(--red)' }}>{error}</p>}

      {!loading && !error && (
        <>
          {/* KPI Cards */}
          <div style={{ display: 'flex', gap: 16, marginBottom: 32 }}>
            <div style={{ background: 'var(--card)', borderRadius: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.06)', padding: '20px 22px', minWidth: 180 }}>
              <div style={{ fontSize: 30, fontWeight: 900, color: unpaidAmount > 0 ? 'var(--red)' : 'var(--green)', lineHeight: 1 }}>
                ${unpaidAmount.toFixed(2)}
              </div>
              <div style={{ fontSize: 13, color: 'var(--text2)', marginTop: 6 }}>Unpaid Invoices</div>
            </div>

            <div style={{ background: 'var(--card)', borderRadius: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.06)', padding: '20px 22px', minWidth: 180 }}>
              <div style={{ fontSize: 30, fontWeight: 900, color: 'var(--text)', lineHeight: 1 }}>
                {completedServices}
              </div>
              <div style={{ fontSize: 13, color: 'var(--text2)', marginTop: 6 }}>Completed Services</div>
            </div>

            <div style={{ background: 'var(--card)', borderRadius: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.06)', padding: '20px 22px', minWidth: 180 }}>
              <div style={{
                fontSize: 30, fontWeight: 900, lineHeight: 1,
                color: daysToExpiry === null ? 'var(--text3)' : daysToExpiry.days < 30 ? 'var(--red)' : daysToExpiry.days < 90 ? 'var(--yellow)' : 'var(--green)',
              }}>
                {daysToExpiry === null ? '—' : daysToExpiry.days < 0 ? 'Expired' : `${daysToExpiry.days}d`}
              </div>
              <div style={{ fontSize: 13, color: 'var(--text2)', marginTop: 6 }}>Registration Expiry</div>
              {daysToExpiry && <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 2 }}>{daysToExpiry.label}</div>}
            </div>

            <div style={{ background: 'var(--card)', borderRadius: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.06)', padding: '20px 22px', minWidth: 180 }}>
              <div style={{ fontSize: 30, fontWeight: 900, color: 'var(--green)', lineHeight: 1 }}>
                ${totalSpent.toFixed(2)}
              </div>
              <div style={{ fontSize: 13, color: 'var(--text2)', marginTop: 6 }}>Total Spent</div>
            </div>

            <div style={{ background: 'var(--card)', borderRadius: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.06)', padding: '20px 22px', minWidth: 180 }}>
              <div style={{ fontSize: 30, fontWeight: 900, color: nextAppointment ? 'var(--blue)' : 'var(--text3)', lineHeight: 1 }}>
                {nextAppointment ? `${nextAppointment.days}d` : '—'}
              </div>
              <div style={{ fontSize: 13, color: 'var(--text2)', marginTop: 6 }}>Next Appointment</div>
              {nextAppointment && <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 2 }}>{nextAppointment.date}</div>}
            </div>

          </div>

          {/* Vehicles */}
          <div style={{ marginBottom: 16 }}>
            <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--text)', margin: '0 0 12px 0' }}>
              My Vehicles
            </h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {vehicles.length === 0 && !showAdd && (
              <div style={{
                background: 'var(--card)', borderRadius: 16,
                padding: 32, textAlign: 'center', color: 'var(--text2)',
              }}>
                No vehicles registered.
              </div>
            )}

            {vehicles.map(v => {
              const isExpanded = expandedVehicleId === v.id;
              const history = workOrders
                .filter(wo => wo.vehicleId === v.id && (wo.status === 'COMPLETED' || wo.status === 'CANCELLED'))
                .sort((a, b) => new Date(b.closedAt ) - new Date(a.closedAt));
              return (
                <div key={v.id} style={{ background: 'var(--card)', borderRadius: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
                  <div
                    onClick={() => setExpandedVehicleId(isExpanded ? null : v.id)}
                    style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 20, cursor: 'pointer' }}
                  >
                    <div style={{ width: 48, height: 48, borderRadius: 12, background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <BrandLogo brand={v.brand} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--text)' }}>
                        {v.brand} {v.model} {v.year}
                      </div>
                      <div style={{ fontSize: 13, color: 'var(--text2)', marginTop: 4 }}>
                        {v.licensePlate} - {v.mileage?.toLocaleString()} km - VIN: {v.vin}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right', marginRight: 12 }}>
                      <div style={{ fontSize: 12, color: 'var(--text3)' }}>Registration expires</div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', marginTop: 2 }}>{v.registrationExpiry ?? '—'}</div>
                    </div>
                    <div style={{ color: 'var(--text3)', fontSize: 18, transition: 'transform 0.2s', transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                      ▾
                    </div>
                  </div>

                  {isExpanded && (
                    <div style={{ borderTop: '1px solid var(--border)', padding: '16px 24px' }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 12 }}>
                        Service History ({history.length})
                      </div>
                      {history.length === 0 ? (
                        <div style={{ fontSize: 13, color: 'var(--text3)', padding: '8px 0' }}>No service history for this vehicle.</div>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                          {history.map(wo => (
                            <div key={wo.id} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '10px 14px', background: 'var(--bg)', borderRadius: 10 }}>
                              <div style={{ flex: 1 }}>
                                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>
                                  {wo.description || `Work Order #${wo.id}`}
                                </div>
                                <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 2 }}>
                                  {wo.closedAt ? new Date(wo.closedAt).toLocaleDateString('en-GB') : wo.openedAt ? new Date(wo.openedAt).toLocaleDateString('en-GB') : '—'}
                                </div>
                              </div>
                              {wo.total != null && (
                                <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--text)' }}>${wo.total.toFixed(2)}</div>
                              )}
                              <span style={{
                                background: wo.status === 'COMPLETED' ? 'var(--green-bg)' : 'var(--red-bg)',
                                color: wo.status === 'COMPLETED' ? 'var(--green)' : 'var(--red)',
                                borderRadius: 20, padding: '3px 10px', fontSize: 11, fontWeight: 700,
                              }}>
                                {wo.status}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}

            {!showAdd && (
              <button
                onClick={() => setShowAdd(true)}
                style={{
                  background: 'var(--card)', borderRadius: 12,
                  boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                  padding: '12px 20px',
                  display: 'flex', alignItems: 'center', gap: 10,
                  border: '2px dashed var(--border)',
                  cursor: 'pointer', width: '100%',
                }}
              >
                <span style={{
                  width: 28, height: 28, borderRadius: '50%',
                  background: 'var(--accent-light)', color: 'var(--accent)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 18, fontWeight: 700, flexShrink: 0,
                }}>+</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--accent)' }}>
                  Add Vehicle
                </span>
              </button>
            )}

            {showAdd && (
              <VehicleAddForm
                clientId={clientId}
                onSuccess={vehicle => {
                  setVehicles(prev => [...prev, vehicle]);
                  setShowAdd(false);
                }}
                onCancel={() => setShowAdd(false)}
              />
            )}
          </div>
        </>
      )}
    </ClientLayout>
  );
}
