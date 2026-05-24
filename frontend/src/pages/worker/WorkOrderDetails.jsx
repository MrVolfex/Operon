import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import api from '../../api/axios';

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

  useEffect(() => {
    Promise.all([
      api.get(`/api/work-orders/${id}`),
      api.get(`/api/order-items/work-order/${id}`),
      api.get('/api/parts'),
      api.get('/api/service-types'),
    ])
      .then(([woRes, itemsRes, partsRes, servicesRes]) => {
        setWorkOrder(woRes.data);
        setOrderItems(itemsRes.data);
        setParts(partsRes.data);
        setServices(servicesRes.data);
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Layout><p style={{ color: 'var(--text2)' }}>Loading...</p></Layout>;
  if (!workOrder) return <Layout><p style={{ color: 'var(--red)' }}>Work order not found.</p></Layout>;

  return (
    <Layout>
      <button
        onClick={() => navigate('/worker/work-orders')}
        style={{
          background: 'var(--bg)', color: 'var(--text)', border: '1px solid var(--border)',
          borderRadius: 10, padding: '9px 16px', fontWeight: 700, fontSize: 13,
          cursor: 'pointer', marginBottom: 20,
        }}
      >
        ← Back
      </button>

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
                onClick={() => { if (workOrder.status !== s) setPendingStatus(s); }}
                style={{
                  padding: '7px 16px', borderRadius: 20, fontWeight: 700, fontSize: 12,
                  border: workOrder.status === s ? 'none' : '1px solid var(--border)',
                  background: workOrder.status === s ? STATUS_COLORS[s]?.bg : 'transparent',
                  color: workOrder.status === s ? STATUS_COLORS[s]?.color : 'var(--text3)',
                  cursor: workOrder.status === s ? 'default' : 'pointer',
                }}
              >
                {s}
              </button>
            ))}
          </div>
          <div style={{ fontSize: 13, color: 'var(--text2)', marginTop: 12 }}>
            Opened: {new Date(workOrder.openedAt).toLocaleString('en-GB')}
          </div>
        </div>
      </div>

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
                  No items. Add a part or service below.
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
                  <button
                    onClick={() => {
                      api.delete(`/api/order-items/${item.id}`)
                        .then(() => setOrderItems(prev => prev.filter(x => x.id !== item.id)));
                    }}
                    style={{ background: 'var(--red-bg)', color: 'var(--red)', border: 'none', borderRadius: 8, padding: '5px 10px', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Forma za dodavanje stavki */}
      <AddItemForm
        workOrderId={id}
        parts={parts}
        services={services}
        onAdded={item => setOrderItems(prev => [...prev, item])}
      />

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
