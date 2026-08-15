import { useEffect, useState } from 'react';
import { ClipboardList, Wrench, CheckCircle, Car } from 'lucide-react';
import ClientLayout from '../../components/ClientLayout';
import api from '../../api/axios';

function BrandLogo({ brand }) {
  const [failed, setFailed] = useState(false);
  const slug = brand?.toLowerCase().replace(/\s+/g, '-') ?? '';
  if (!failed && slug)
    return <img src={`/carlogos/${slug}.png`} alt={brand} onError={() => setFailed(true)} style={{ width: 44, height: 44, objectFit: 'contain' }} />;
  return <Car size={28} color="var(--text3)" />;
}

const STEPS = [
  { key: 'OPEN',        label: 'Started Working', Icon: ClipboardList },
  { key: 'IN_PROGRESS', label: 'In Progress', Icon: Wrench        },
  { key: 'COMPLETED',   label: 'Ready',       Icon: CheckCircle   },
];

function StatusTracker({ status }) {
  const currentIdx = STEPS.findIndex(s => s.key === status);

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 0, margin: '20px 0 4px' }}>
      {STEPS.map((step, i) => {
        const done    = i < currentIdx;
        const active  = i === currentIdx;
        const pending = i > currentIdx;

        return (
          <div key={step.key} style={{ display: 'flex', alignItems: 'center', flex: i < STEPS.length - 1 ? 1 : 'none' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
              <div style={{
                width: 40, height: 40, borderRadius: '50%',
                background: done ? 'var(--green)' : active ? 'var(--accent)' : 'var(--bg)',
                border: `2px solid ${done ? 'var(--green)' : active ? 'var(--accent)' : 'var(--border)'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.2s',
              }}>
                {done
                  ? <CheckCircle size={20} color="#fff" strokeWidth={2.5} />
                  : <step.Icon size={18} color={active ? '#fff' : 'var(--text3)'} strokeWidth={2} />
                }
              </div>
              <span style={{
                fontSize: 11, fontWeight: 700,
                color: done ? 'var(--green)' : active ? 'var(--accent)' : 'var(--text3)',
                whiteSpace: 'nowrap',
              }}>
                {step.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div style={{
                flex: 1, height: 3, margin: '0 8px', marginBottom: 22,
                background: done ? 'var(--green)' : 'var(--border)',
                borderRadius: 2, transition: 'background 0.3s',
              }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function ClientWorkOrderStatus() {
  const [workOrders, setWorkOrders] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');
  const [dismissed, setDismissed]   = useState(() => {
    try { return JSON.parse(localStorage.getItem('dismissedWorkOrders') || '[]'); } catch { return []; }
  });

  function dismiss(id) {
    const next = [...dismissed, id];
    setDismissed(next);
    localStorage.setItem('dismissedWorkOrders', JSON.stringify(next));
  }

  useEffect(() => {
    api.get('/api/my-work-orders')
      .then(res => setWorkOrders(res.data))
      .catch(() => setError('Error loading work orders.'))
      .finally(() => setLoading(false));
  }, []);

  const oneDayAgo = new Date(Date.now() - 1 * 24 * 60 * 60 * 1000);
  const active    = workOrders.filter(wo =>
    !dismissed.includes(wo.id) && (
      wo.status === 'OPEN' || wo.status === 'IN_PROGRESS' ||
      (wo.status === 'COMPLETED' && new Date(wo.closedAt) >= oneDayAgo)
    )
  );
  const history   = workOrders
    .filter(wo => dismissed.includes(wo.id) || wo.status === 'CANCELLED' || (wo.status === 'COMPLETED' && new Date(wo.closedAt) < oneDayAgo))
    .sort((a, b) => new Date(b.closedAt ?? b.openedAt) - new Date(a.closedAt ?? a.openedAt));

  const historyStatusStyle = {
    COMPLETED: { bg: 'var(--green-bg)',  color: 'var(--green)',  label: 'Completed' },
    CANCELLED: { bg: 'var(--red-bg)',    color: 'var(--red)',    label: 'Cancelled' },
  };

  return (
    <ClientLayout>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text)', margin: 0 }}>Vehicle Status</h2>
        <p style={{ color: 'var(--text2)', fontSize: 14, marginTop: 4 }}>Track your vehicle's repair progress in real time</p>
      </div>

      {loading && <p style={{ color: 'var(--text2)' }}>Loading...</p>}
      {error   && <p style={{ color: 'var(--red)' }}>{error}</p>}

      {!loading && !error && (
        <>
          {/* ── Empty state ── */}
          {active.length === 0 && (
            <div style={{
              background: 'var(--card)', borderRadius: 20,
              boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
              padding: '56px 32px', textAlign: 'center', marginBottom: 28,
            }}>
              <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'center' }}>
                <Wrench size={52} color="var(--text3)" strokeWidth={1.5} />
              </div>
              <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--text)', marginBottom: 8 }}>
                You have no vehicles in service
              </div>
              <div style={{ fontSize: 14, color: 'var(--text2)' }}>
                Follow their repair status here once your vehicle is brought in.
              </div>
            </div>
          )}

          {/* ── Active work orders ── */}
          {active.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 28 }}>
              {active.map(wo => (
                <div key={wo.id} style={{
                  background: 'var(--card)', borderRadius: 20,
                  boxShadow: '0 1px 3px rgba(0,0,0,0.06)', overflow: 'hidden',
                  border: '2px solid var(--accent-mid)',
                }}>
                  {/* Header */}
                  <div style={{
                    padding: '16px 22px', borderBottom: '1px solid var(--border)',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                      <BrandLogo brand={wo.vehicleBrand} />
                      <div>
                        <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--text)' }}>
                          {wo.vehicleBrand} {wo.vehicleModel}
                        </div>
                        <div style={{ fontSize: 13, color: 'var(--text3)', marginTop: 2 }}>
                          {wo.vehicleLicensePlate}
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: 11, color: 'var(--text3)', fontWeight: 600, textTransform: 'uppercase', marginBottom: 2 }}>Opened</div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>
                          {new Date(wo.openedAt).toLocaleDateString('en-GB')}
                        </div>
                      </div>
                      {wo.status === 'COMPLETED' && (
                        <button
                          onClick={() => dismiss(wo.id)}
                          title="Move to history"
                          style={{
                            background: 'var(--bg)', border: '1px solid var(--border)',
                            borderRadius: 8, width: 30, height: 30,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            cursor: 'pointer', color: 'var(--text3)', flexShrink: 0,
                          }}
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Status tracker */}
                  <div style={{ padding: '8px 28px 20px' }}>
                    <StatusTracker status={wo.status} />

                    {wo.description && (
                      <div style={{
                        marginTop: 16, background: 'var(--bg)', borderRadius: 12,
                        padding: '12px 16px', fontSize: 13, color: 'var(--text2)',
                        borderLeft: '3px solid var(--accent)',
                      }}>
                        <span style={{ fontWeight: 700, color: 'var(--text)', marginRight: 6 }}>Note:</span>
                        {wo.description}
                      </div>
                    )}

                    {wo.total > 0 && (
                      <div style={{ marginTop: 12, display: 'flex', justifyContent: 'flex-end' }}>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: 11, color: 'var(--text3)', fontWeight: 600, textTransform: 'uppercase' }}>Estimated Total</div>
                          <div style={{ fontSize: 22, fontWeight: 900, color: 'var(--accent)' }}>${wo.total?.toFixed(2)}</div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── History ── */}
          {history.length > 0 && (
            <>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 12 }}>
                Service History ({history.length})
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {history.map(wo => {
                  const sc = historyStatusStyle[wo.status];
                  return (
                    <div key={wo.id} style={{
                      background: 'var(--card)', borderRadius: 14,
                      boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                      padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 14,
                    }}>
                      <BrandLogo brand={wo.vehicleBrand} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>
                          {wo.vehicleBrand} {wo.vehicleModel}
                          <span style={{ fontWeight: 400, color: 'var(--text3)', marginLeft: 8, fontSize: 13 }}>{wo.vehicleLicensePlate}</span>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                          <div style={{ fontSize: 12, color: 'var(--text2)' }}>
                            <span style={{ fontWeight: 700, color: 'var(--text3)' }}>Received: </span>
                            {new Date(wo.openedAt).toLocaleDateString('en-GB')}
                          </div>
                          {wo.closedAt && (
                            <div style={{ fontSize: 12, color: 'var(--text2)' }}>
                              <span style={{ fontWeight: 700, color: 'var(--text3)' }}>Closed: </span>
                              {new Date(wo.closedAt).toLocaleDateString('en-GB')}
                            </div>
                          )}
                          {wo.description && (
                            <div style={{ fontSize: 12, color: 'var(--text2)' }}>
                              <span style={{ fontWeight: 700, color: 'var(--text3)' }}>Work done: </span>
                              {wo.description}
                            </div>
                          )}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{ background: sc.bg, color: sc.color, borderRadius: 20, padding: '3px 12px', fontSize: 11, fontWeight: 700 }}>
                          {sc.label}
                        </span>
                        {wo.total > 0 && (
                          <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--text)', marginTop: 6 }}>
                            ${wo.total?.toFixed(2)}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </>
      )}
    </ClientLayout>
  );
}
