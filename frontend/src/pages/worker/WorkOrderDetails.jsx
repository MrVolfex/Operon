import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import api from '../../api/axios';
import { QRCodeSVG } from 'qrcode.react';
import { printWorkOrderQR } from '../../utils/printWorkOrderQR';

const STATUS_COLORS = {
  OPEN:        { bg: 'var(--blue-bg)',   color: 'var(--blue)'   },
  IN_PROGRESS: { bg: 'var(--yellow-bg)', color: 'var(--yellow)' },
  COMPLETED:   { bg: 'var(--green-bg)',  color: 'var(--green)'  },
  CANCELLED:   { bg: 'var(--red-bg)',    color: 'var(--red)'    },
  PENDING:     { bg: 'var(--purple-bg)', color: 'var(--purple)' },
};

const ALL_STATUSES = ['OPEN', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];

export default function WorkOrderDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [workOrder, setWorkOrder] = useState(null);
  const [orderItems, setOrderItems] = useState([]);
  const [parts, setParts] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pendingStatus, setPendingStatus] = useState(null);
  const [description, setDescription] = useState('');
  const [savingDesc, setSavingDesc] = useState(false);
  const [descSaved, setDescSaved] = useState(false);
  const [descError, setDescError] = useState('');
  const [showQR, setShowQR] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState(null);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyItems, setHistoryItems] = useState({});

  useEffect(() => {
    Promise.all([
      api.get(`/api/work-orders/${id}`),
      api.get(`/api/order-items/work-order/${id}`),
      api.get('/api/parts'),
      api.get('/api/service-types'),
    ])
      .then(([woRes, itemsRes, partsRes, servicesRes]) => {
        setWorkOrder(woRes.data);
        setDescription(woRes.data.description ?? '');
        setOrderItems(itemsRes.data);
        setParts(partsRes.data);
        setServices(servicesRes.data);
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Layout><p style={{ color: 'var(--text2)' }}>Loading...</p></Layout>;
  if (!workOrder) return <Layout><p style={{ color: 'var(--red)' }}>Work order not found.</p></Layout>;

  const locked = workOrder.status === 'COMPLETED';

  return (
    <Layout>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <button
          onClick={() => navigate('/worker/work-orders')}
          style={{
            background: 'var(--card)', color: 'var(--text)', border: '2px solid var(--border)',
            borderRadius: 10, padding: '9px 20px', fontWeight: 700, fontSize: 13,
            cursor: 'pointer', boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
          }}
        >
          Back
        </button>
        {workOrder.status !== 'COMPLETED' && workOrder.status !== 'CANCELLED' && (
          <button
            onClick={() => setShowQR(true)}
            style={{
              background: 'var(--card)', color: 'var(--text)', border: '2px solid var(--border)',
              borderRadius: 10, padding: '9px 20px', fontWeight: 700, fontSize: 13,
              cursor: 'pointer', boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
            }}
          >
            Print QR
          </button>
        )}
      </div>

      <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text)', marginBottom: 24 }}>
        Work Order #{workOrder.id}
      </h2>

      {/* Info kartica */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 32 }}>
        {/* Vozilo */}
        <div style={{ background: 'var(--card)', borderRadius: 16, padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>Vehicle</div>
          <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--text)', marginBottom: 4 }}>
            {workOrder.vehicleBrand} {workOrder.vehicleModel}
          </div>
          <div style={{ fontSize: 14, color: 'var(--text2)' }}>{workOrder.vehicleLicensePlate}</div>
          {workOrder.clientFirstName && (
            <div style={{ fontSize: 14, color: 'var(--text2)', marginTop: 8 }}>
              Client: <strong>{workOrder.clientFirstName} {workOrder.clientLastName}</strong>
            </div>
          )}
        </div>

        {/* Status */}
        <div style={{ background: 'var(--card)', borderRadius: 16, padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>Status</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            {ALL_STATUSES.map(s => (
              <button
                key={s}
                onClick={() => { if (!locked && workOrder.status !== s) setPendingStatus(s); }}
                disabled={locked}
                style={{
                  padding: '7px 16px', borderRadius: 20, fontWeight: 700, fontSize: 12,
                  border: workOrder.status === s ? `2px solid ${STATUS_COLORS[s]?.color}` : '1px solid var(--border)',
                  background: workOrder.status === s ? STATUS_COLORS[s]?.bg : 'transparent',
                  color: workOrder.status === s ? STATUS_COLORS[s]?.color : 'var(--text3)',
                  cursor: locked || workOrder.status === s ? 'default' : 'pointer',
                  opacity: locked && workOrder.status !== s ? 0.35 : 1,
                }}
              >
                {s}
              </button>
            ))}
          </div>
          {locked && (
            <div style={{ fontSize: 12, color: 'var(--green)', fontWeight: 700, marginTop: 10 }}>
              ✓ Work order completed — no further changes allowed.
            </div>
          )}
          <div style={{ fontSize: 13, color: 'var(--text2)', marginTop: 12 }}>
            Opened: {new Date(workOrder.openedAt).toLocaleString('en-GB')}
          </div>
        </div>
      </div>

      {/* Vehicle Service History */}
      <div style={{ background: 'var(--card)', borderRadius: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.06)', marginBottom: 32, overflow: 'hidden' }}>
        <button
          onClick={() => {
            if (!showHistory && history === null) {
              setHistoryLoading(true);
              api.get(`/api/work-orders/vehicle/${workOrder.vehicleId}`)
                .then(res => setHistory(res.data.filter(wo => wo.id !== workOrder.id)))
                .catch(() => setHistory([]))
                .finally(() => setHistoryLoading(false));
            }
            setShowHistory(v => !v);
          }}
          style={{
            width: '100%', background: 'none', border: 'none',
            padding: '16px 24px', display: 'flex', alignItems: 'center',
            justifyContent: 'space-between', cursor: 'pointer',
          }}
        >
          <span style={{ fontSize: 15, fontWeight: 800, color: 'var(--text)' }}>Vehicle Service History</span>
          <span style={{
            fontSize: 18, color: 'var(--text3)',
            display: 'inline-block',
            transform: showHistory ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s',
          }}>▾</span>
        </button>

        {showHistory && (
          <div style={{ borderTop: '1px solid var(--border)', padding: '4px 24px 16px' }}>
            {historyLoading && <p style={{ color: 'var(--text2)', fontSize: 13 }}>Loading history...</p>}
            {!historyLoading && history?.length === 0 && (
              <p style={{ color: 'var(--text2)', fontSize: 13 }}>No previous work orders for this vehicle.</p>
            )}
            {!historyLoading && history !== null && history.map((wo) => (
              <div key={wo.id} style={{
                background: 'var(--bg)', borderRadius: 12, border: '1px solid var(--border)',
                padding: '14px 16px', marginBottom: 10,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>#{wo.id}</span>
                  <span style={{
                    background: STATUS_COLORS[wo.status]?.bg,
                    color: STATUS_COLORS[wo.status]?.color,
                    borderRadius: 20, padding: '2px 10px', fontSize: 11, fontWeight: 700,
                  }}>{wo.status}</span>
                  <span style={{ fontSize: 12, color: 'var(--text3)', marginLeft: 'auto' }}>
                    {new Date(wo.openedAt).toLocaleDateString('en-GB')}
                    {wo.closedAt ? ` - ${new Date(wo.closedAt).toLocaleDateString('en-GB')}` : ''}
                  </span>
                </div>
                {wo.description && (
                  <div style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 8, lineHeight: 1.5 }}>
                    {wo.description}
                  </div>
                )}

                {/* Items toggle */}
                <button
                  onClick={() => {
                    if (historyItems[wo.id] !== undefined) {
                      setHistoryItems(prev => {
                        const next = { ...prev };
                        delete next[wo.id];
                        return next;
                      });
                    } else {
                      setHistoryItems(prev => ({ ...prev, [wo.id]: 'loading' }));
                      api.get(`/api/order-items/work-order/${wo.id}`)
                        .then(res => setHistoryItems(prev => ({ ...prev, [wo.id]: res.data })))
                        .catch(() => setHistoryItems(prev => ({ ...prev, [wo.id]: [] })));
                    }
                  }}
                  style={{
                    background: 'none', border: 'none', padding: 0,
                    fontSize: 12, fontWeight: 700, color: 'var(--blue)',
                    cursor: 'pointer', marginBottom: 8,
                  }}
                >
                  {historyItems[wo.id] !== undefined ? '▴ Hide Items' : '▾ Show Items'}
                </button>

                {historyItems[wo.id] === 'loading' && (
                  <div style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 8 }}>Loading items...</div>
                )}
                {Array.isArray(historyItems[wo.id]) && (
                  <div style={{ marginBottom: 8, background: 'var(--bg)', borderRadius: 10, overflow: 'hidden' }}>
                    {historyItems[wo.id].length === 0 ? (
                      <div style={{ padding: '8px 12px', fontSize: 12, color: 'var(--text3)' }}>No items on this order.</div>
                    ) : (
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                        <thead>
                          <tr style={{ borderBottom: '1px solid var(--border)' }}>
                            {['Type', 'Name', 'Qty', 'Price', 'Total'].map(h => (
                              <th key={h} style={{ padding: '6px 12px', textAlign: 'left', fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', fontSize: 10, letterSpacing: '0.04em' }}>{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {historyItems[wo.id].map((item, ii) => (
                            <tr key={item.id} style={{ borderBottom: ii < historyItems[wo.id].length - 1 ? '1px solid var(--border)' : 'none' }}>
                              <td style={{ padding: '6px 12px' }}>
                                <span style={{
                                  background: item.partId ? 'var(--blue-bg)' : 'var(--purple-bg)',
                                  color: item.partId ? 'var(--blue)' : 'var(--purple)',
                                  borderRadius: 20, padding: '2px 8px', fontSize: 10, fontWeight: 700,
                                }}>
                                  {item.partId ? 'Part' : 'Service'}
                                </span>
                              </td>
                              <td style={{ padding: '6px 12px', color: 'var(--text)', fontWeight: 600 }}>{item.name}</td>
                              <td style={{ padding: '6px 12px', color: 'var(--text2)' }}>{item.quantity}</td>
                              <td style={{ padding: '6px 12px', color: 'var(--text2)' }}>${item.price?.toFixed(2)}</td>
                              <td style={{ padding: '6px 12px', fontWeight: 700, color: 'var(--text)' }}>
                                ${(item.price * item.quantity * (1 - (item.discount ?? 0) / 100)).toFixed(2)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                )}

              </div>
            ))}
            {!historyLoading && history !== null && (
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16, paddingTop: 12, borderTop: '1px solid var(--border)' }}>
                <button
                  disabled
                  title="AI summarization coming soon"
                  style={{
                    background: 'var(--purple-bg)', color: 'var(--purple)',
                    border: '1px solid var(--purple)', borderRadius: 8,
                    padding: '6px 14px', fontSize: 12, fontWeight: 700,
                    cursor: 'not-allowed', opacity: 0.75,
                  }}
                >
                  ✦ Summarize History
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Description */}
      <div style={{ background: 'var(--card)', borderRadius: 16, padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.06)', marginBottom: 32 }}>
        <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--text)', marginBottom: 16 }}>Work Description</div>
        <textarea
          value={description}
          onChange={e => !locked && setDescription(e.target.value)}
          readOnly={locked}
          placeholder="Describe the work performed..."
          rows={4}
          style={{
            width: '100%', boxSizing: 'border-box',
            padding: '10px 12px', border: '1px solid var(--border)',
            borderRadius: 10, fontSize: 14, resize: 'vertical',
            outline: 'none', background: 'var(--bg)', color: 'var(--text)',
            fontFamily: 'inherit', cursor: locked ? 'default' : 'text',
          }}
        />
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 10 }}>
          {descError && <div style={{ fontSize: 12, color: 'var(--red)', marginBottom: 8 }}>{descError}</div>}
          {!locked && (
            <button
              disabled={savingDesc}
              onClick={() => {
                setSavingDesc(true);
                setDescError('');
                setDescSaved(false);
                api.patch(`/api/work-orders/${id}/description`, description, {
                  headers: { 'Content-Type': 'text/plain' },
                }).then(res => { setWorkOrder(res.data); setDescSaved(true); setTimeout(() => setDescSaved(false), 2000); })
                  .catch(() => setDescError('Failed to save description.'))
                  .finally(() => setSavingDesc(false));
              }}
              style={{
                background: descSaved ? 'var(--green)' : 'var(--accent)', color: '#fff', border: 'none',
                borderRadius: 10, padding: '9px 20px', fontWeight: 700,
                fontSize: 13, cursor: 'pointer', opacity: savingDesc ? 0.7 : 1,
              }}
            >
              {savingDesc ? 'Saving...' : descSaved ? 'Saved ✓' : 'Save'}
            </button>
          )}
        </div>
      </div>

      {/* Forma za dodavanje stavki */}
      {!locked && (
        <div style={{ marginBottom: 32 }}>
          <AddItemForm
            workOrderId={id}
            parts={parts}
            services={services}
            onAdded={item => setOrderItems(prev => [...prev, item])}
          />
        </div>
      )}

      {/* Stavke naloga */}
      <div style={{ background: 'var(--card)', borderRadius: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.06)', overflow: 'hidden', marginBottom: 32 }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', fontWeight: 800, fontSize: 15, color: 'var(--text)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>Items</span>
          <span style={{ fontSize: 16, fontWeight: 900, color: 'var(--accent)' }}>
            Total: ${orderItems.reduce((s, i) => s + i.price * i.quantity, 0).toFixed(2)}
          </span>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              {['Type', 'Name', 'Qty', 'Price', 'Discount', 'Total', ''].map(h => (
                <th key={h} style={{ padding: '12px 20px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {orderItems.length === 0 && (
              <tr>
                <td colSpan={7} style={{ padding: 24, textAlign: 'center', color: 'var(--text2)' }}>
                  No items added yet.
                </td>
              </tr>
            )}
            {orderItems.map((item, i) => (
              <tr key={item.id} style={{ borderBottom: i < orderItems.length - 1 ? '1px solid var(--border)' : 'none' }}>
                <td style={{ padding: '12px 20px' }}>
                  <span style={{
                    background: item.partId ? 'var(--blue-bg)' : 'var(--purple-bg)',
                    color: item.partId ? 'var(--blue)' : 'var(--purple)',
                    borderRadius: 20, padding: '3px 10px', fontSize: 11, fontWeight: 700,
                  }}>
                    {item.partId ? 'Part' : 'Service'}
                  </span>
                </td>
                <td style={{ padding: '12px 20px', fontSize: 14, color: 'var(--text)', fontWeight: 600 }}>{item.name}</td>
                <td style={{ padding: '12px 20px', fontSize: 14, color: 'var(--text)' }}>{item.quantity}</td>
                <td style={{ padding: '12px 20px', fontSize: 14, color: 'var(--text)' }}>${item.price?.toFixed(2)}</td>
                <td style={{ padding: '12px 20px', fontSize: 14, color: 'var(--text)' }}>{item.discount ?? 0}%</td>
                <td style={{ padding: '12px 20px', fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>
                  ${(item.price * item.quantity * (1 - (item.discount ?? 0) / 100)).toFixed(2)}
                </td>
                <td style={{ padding: '12px 20px' }}>
                  {!locked && (
                    <button
                      onClick={() => {
                        api.delete(`/api/order-items/${item.id}`)
                          .then(() => setOrderItems(prev => prev.filter(x => x.id !== item.id)));
                      }}
                      style={{ background: 'var(--red-bg)', color: 'var(--red)', border: 'none', borderRadius: 8, padding: '5px 10px', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}
                    >
                      Remove
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showQR && (
        <div
          onClick={e => { if (e.target === e.currentTarget) setShowQR(false); }}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <div style={{ background: '#fff', borderRadius: 20, padding: 36, textAlign: 'center', width: 320 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>Work Order</div>
            <div style={{ fontSize: 28, fontWeight: 900, color: '#111827', marginBottom: 4 }}>#{workOrder.id}</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#111827', marginBottom: 2 }}>
              {workOrder.vehicleBrand} {workOrder.vehicleModel}
            </div>
            <div style={{ fontSize: 13, color: '#6B7280', marginBottom: 24 }}>{workOrder.vehicleLicensePlate}</div>
            <div id="qr-svg-container" style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
              <QRCodeSVG
                value={`${window.location.origin}/worker/work-orders/${workOrder.id}`}
                size={200}
                bgColor="#ffffff"
                fgColor="#111827"
                level="M"
              />
            </div>
            <div style={{ fontSize: 11, color: '#9CA3AF', marginBottom: 24 }}>Scan to open work order</div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={() => printWorkOrderQR(workOrder)}
                style={{ flex: 1, background: '#F97316', color: '#fff', border: 'none', borderRadius: 10, padding: 12, fontWeight: 700, fontSize: 13, cursor: 'pointer' }}
              >
                Print
              </button>
              <button
                onClick={() => setShowQR(false)}
                style={{ flex: 1, background: '#F3F4F6', color: '#111827', border: '1px solid #E5E7EB', borderRadius: 10, padding: 12, fontWeight: 700, fontSize: 13, cursor: 'pointer' }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {pendingStatus && (
        <div
          onClick={e => { if (e.target === e.currentTarget) setPendingStatus(null); }}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <div style={{ background: 'var(--card)', borderRadius: 20, padding: 28, width: 400, maxWidth: '95vw' }}>
            <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--text)', marginBottom: 8 }}>Change Status</div>
            <div style={{ fontSize: 14, color: 'var(--text2)', marginBottom: 24 }}>
              Change status from{' '}
              <span style={{ fontWeight: 700, color: STATUS_COLORS[workOrder.status]?.color }}>{workOrder.status}</span>
              {' '}to{' '}
              <span style={{ fontWeight: 700, color: STATUS_COLORS[pendingStatus]?.color }}>{pendingStatus}</span>?
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={() => {
                  api.patch(`/api/work-orders/${id}/status?status=${pendingStatus}`)
                    .then(res => { setWorkOrder(res.data); setPendingStatus(null); });
                }}
                style={{ flex: 1, background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 10, padding: 12, fontWeight: 700, fontSize: 13, cursor: 'pointer' }}
              >
                Confirm
              </button>
              <button
                onClick={() => setPendingStatus(null)}
                style={{ flex: 1, background: 'var(--bg)', color: 'var(--text)', border: '1px solid var(--border)', borderRadius: 10, padding: 12, fontWeight: 700, fontSize: 13, cursor: 'pointer' }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}

function AddItemForm({ workOrderId, parts, services, onAdded }) {
  const [type, setType]           = useState('part');
  const [selectedId, setSelectedId] = useState('');
  const [quantity, setQuantity]   = useState(1);
  const [discount, setDiscount]   = useState(0);
  const [submitting, setSubmitting] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    if (!selectedId) return;
    setSubmitting(true);

    const body = {
      workOrderId: Number(workOrderId),
      quantity,
      discount,
      partId:        type === 'part'    ? Number(selectedId) : null,
      serviceTypeId: type === 'service' ? Number(selectedId) : null,
    };

    api.post('/api/order-items', body)
      .then(res => {
        onAdded(res.data);
        setSelectedId('');
        setQuantity(1);
        setDiscount(0);
      })
      .finally(() => setSubmitting(false));
  }

  const options = type === 'part' ? parts : services;

  return (
    <div style={{ background: 'var(--card)', borderRadius: 16, padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
      <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--text)', marginBottom: 16 }}>Add Item</div>
      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end' }}>

        <div>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--text3)', marginBottom: 6 }}>Type</label>
          <select
            value={type}
            onChange={e => { setType(e.target.value); setSelectedId(''); }}
            style={{ padding: '9px 12px', border: '1px solid var(--border)', borderRadius: 10, fontSize: 13, outline: 'none' }}
          >
            <option value="part">Part</option>
            <option value="service">Service</option>
          </select>
        </div>

        <div style={{ flex: 1, minWidth: 200 }}>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--text3)', marginBottom: 6 }}>
            {type === 'part' ? 'Part' : 'Service'}
          </label>
          <select
            value={selectedId}
            onChange={e => setSelectedId(e.target.value)}
            required
            style={{ width: '100%', padding: '9px 12px', border: '1px solid var(--border)', borderRadius: 10, fontSize: 13, outline: 'none' }}
          >
            <option value="">-- Select --</option>
            {options.map(o => (
              <option key={o.id} value={o.id}>
                {o.name ?? o.type} — ${o.price?.toFixed(2)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--text3)', marginBottom: 6 }}>Quantity</label>
          <input
            type="number" min={1} value={quantity}
            onChange={e => setQuantity(Number(e.target.value))}
            style={{ width: 80, padding: '9px 12px', border: '1px solid var(--border)', borderRadius: 10, fontSize: 13, outline: 'none' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--text3)', marginBottom: 6 }}>Discount %</label>
          <input
            type="number" min={0} max={100} value={discount}
            onChange={e => setDiscount(Number(e.target.value))}
            style={{ width: 80, padding: '9px 12px', border: '1px solid var(--border)', borderRadius: 10, fontSize: 13, outline: 'none' }}
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          style={{ background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 10, padding: '10px 20px', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}
        >
          {submitting ? 'Adding...' : '+ Add'}
        </button>
      </form>
    </div>
  );
}
