import { useEffect, useState, useRef } from 'react';
import ClientLayout from '../../components/ClientLayout';
import api from '../../api/axios';

const STATUS_COLORS = {
  PENDING:   { bg: 'var(--yellow-bg)', color: 'var(--yellow)' },
  CONFIRMED: { bg: 'var(--blue-bg)',   color: 'var(--blue)'   },
  DELIVERED: { bg: 'var(--green-bg)',  color: 'var(--green)'  },
  CANCELLED: { bg: 'var(--red-bg)',    color: 'var(--red)'    },
};

export default function ClientOrders() {
  const [catalog, setCatalog]   = useState([]);
  const [orders, setOrders]     = useState([]);
  const [cart, setCart]         = useState([]);
  const [tab, setTab]           = useState('catalog');
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');
  const [placing, setPlacing]   = useState(false);
  const [success, setSuccess]   = useState('');
  const [cartOpen, setCartOpen] = useState(false);
  const cartRef = useRef(null);
  const [search, setSearch] = useState(''); 

  useEffect(() => {
    function handleClickOutside(e) {
      if (cartRef.current && !cartRef.current.contains(e.target)) {
        setCartOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    Promise.all([
      api.get('/api/client-orders/catalog'),
      api.get('/api/client-orders/my-orders'),
    ])
      .then(([catRes, ordRes]) => {
        setCatalog(catRes.data);
        setOrders(ordRes.data);
      })
      .catch(() => setError('Error loading data.'))
      .finally(() => setLoading(false));
  }, []);

  function addToCart(part) {
    setCart(prev => {
      const existing = prev.find(i => i.partId === part.id);
      if (existing) {
        return prev.map(i => i.partId === part.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { partId: part.id, partName: part.name, partBrand: part.brand, price: part.price, quantity: 1 }];
    });
  }

  function removeFromCart(partId) {
    setCart(prev => prev.filter(i => i.partId !== partId));
  }

  function changeQty(partId, delta) {
    setCart(prev => prev
      .map(i => i.partId === partId ? { ...i, quantity: i.quantity + delta } : i)
      .filter(i => i.quantity > 0)
    );
  }

  async function placeOrders() {
    if (cart.length === 0) return;
    setPlacing(true);
    setError('');
    try {
      const payload = cart.map(i => ({ partId: i.partId, quantity: i.quantity }));
      const res = await api.post('/api/client-orders', payload);
      setOrders(prev => [res.data, ...prev]);
      setCart([]);
      setSuccess('Order placed successfully!');
      setTab('orders');
      setTimeout(() => setSuccess(''), 3500);
    } catch {
      setError('Error placing order.');
    } finally {
      setPlacing(false);
    }
  }

  const cartTotal = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);

  const filteredCatalog = catalog.filter(p => {
    const q = search.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      (p.partNumber && p.partNumber.toLowerCase().includes(q)) ||
      (p.brand && p.brand.toLowerCase().includes(q)) ||
      (p.model && p.model.toLowerCase().includes(q))
    );
  }).filter(p => p.stockQuantity > 0);

  return (
    <ClientLayout>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text)', margin: 0 }}>Parts Orders</h2>
          <p style={{ color: 'var(--text2)', fontSize: 14, marginTop: 4 }}>Order parts directly from the workshop</p>
        </div>

        <div style={{ position: 'relative' }} ref={cartRef}>
          <button
            onClick={() => setCartOpen(o => !o)}
            style={{
              position: 'relative', background: 'var(--card)', border: '1px solid var(--border)',
              borderRadius: 12, padding: '9px 14px', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 8,
            }}
          >
            <CartIcon />
            <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>Cart</span>
            {cart.length > 0 && (
              <span style={{
                position: 'absolute', top: -6, right: -6,
                background: 'var(--accent)', color: '#fff',
                borderRadius: '50%', width: 20, height: 20,
                fontSize: 11, fontWeight: 800,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {cart.reduce((s, i) => s + i.quantity, 0)}
              </span>
            )}
          </button>

          {cartOpen && (
            <div style={{
              position: 'absolute', top: 'calc(100% + 10px)', right: 0,
              width: 340, background: 'var(--card)',
              borderRadius: 16, boxShadow: '0 8px 32px rgba(0,0,0,0.14)',
              border: '1px solid var(--border)', zIndex: 100, overflow: 'hidden',
            }}>
              <div style={{ padding: '16px 18px', borderBottom: '1px solid var(--border)', fontWeight: 800, fontSize: 15, color: 'var(--text)' }}>
                Cart
              </div>
              {cart.length === 0 ? (
                <div style={{ padding: 24, textAlign: 'center', color: 'var(--text2)', fontSize: 14 }}>
                  Your cart is empty.
                </div>
              ) : (
                <>
                  <div style={{ maxHeight: 300, overflowY: 'auto' }}>
                    {cart.map(item => (
                      <div key={item.partId} style={{
                        padding: '12px 18px', borderBottom: '1px solid var(--border)',
                        display: 'flex', alignItems: 'center', gap: 10,
                      }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {item.partName}
                          </div>
                          {item.partBrand && (
                            <div style={{ fontSize: 11, color: 'var(--text3)' }}>{item.partBrand}</div>
                          )}
                          <div style={{ fontSize: 12, color: 'var(--accent)', fontWeight: 700, marginTop: 2 }}>
                            ${(item.price * item.quantity).toFixed(2)}
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <button onClick={() => changeQty(item.partId, -1)} style={qtyBtnStyle}>−</button>
                          <span style={{ fontWeight: 700, fontSize: 14, minWidth: 16, textAlign: 'center' }}>{item.quantity}</span>
                          <button onClick={() => changeQty(item.partId, 1)} style={qtyBtnStyle}>+</button>
                        </div>
                        <button
                          onClick={() => removeFromCart(item.partId)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text3)', fontSize: 18, lineHeight: 1, padding: '2px 4px' }}
                        >×</button>
                      </div>
                    ))}
                  </div>
                  <div style={{ padding: '14px 18px', borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ fontSize: 12, color: 'var(--text2)' }}>Total</div>
                      <div style={{ fontSize: 18, fontWeight: 900, color: 'var(--accent)' }}>${cartTotal.toFixed(2)}</div>
                    </div>
                    <button
                      onClick={() => { setCartOpen(false); placeOrders(); }}
                      disabled={placing}
                      style={{
                        background: 'var(--accent)', color: '#fff', border: 'none',
                        borderRadius: 10, padding: '10px 20px', fontWeight: 700,
                        fontSize: 13, cursor: 'pointer',
                      }}
                    >
                      {placing ? 'Placing...' : 'Place Order'}
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {success && (
        <div style={{ background: 'var(--green-bg)', color: 'var(--green)', borderRadius: 10, padding: '12px 16px', marginBottom: 20, fontWeight: 600 }}>
          {success}
        </div>
      )}
      {error && (
        <div style={{ background: 'var(--red-bg)', color: 'var(--red)', borderRadius: 10, padding: '12px 16px', marginBottom: 20, fontWeight: 600 }}>
          {error}
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: 4, marginBottom: 20, background: 'var(--card)', borderRadius: 12, padding: 4, width: 'fit-content', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
          {[['catalog', 'Parts Catalog'], ['orders', 'My Orders']].map(([key, label]) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              style={{
                padding: '8px 20px', borderRadius: 9, border: 'none', fontWeight: 700, fontSize: 13,
                background: tab === key ? 'var(--accent)' : 'transparent',
                color: tab === key ? '#fff' : 'var(--text2)',
                cursor: 'pointer',
              }}
            >
              {label}
            </button>
          ))}
        </div>
        <div>
          {tab === 'catalog' &&  (
          <input
            type="text"
            placeholder="Search by name, number, brand..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              padding: '9px 14px', border: '1px solid var(--border)',
              borderRadius: 10, fontSize: 13, outline: 'none',
              width: 300, background: 'var(--card)', color: 'var(--text)',
              marginBottom: 16, display: 'block',
            }}/>)}
          </div>
      </div>

      


      {loading && <p style={{ color: 'var(--text2)' }}>Loading...</p>}
      
      {/* CATALOG TAB */}
      {!loading && tab === 'catalog' && (
        
        <div>
          {filteredCatalog.length === 0 && (
            <p style={{ color: 'var(--text2)' }}>{search ? 'No results found.' : 'No parts available.'}
</p>
          )}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
            {filteredCatalog.map(part => {
              const inCart = cart.find(i => i.partId === part.id);
              return (
                <div key={part.id} style={{
                  background: 'var(--card)', borderRadius: 16,
                  boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                  padding: 20, display: 'flex', flexDirection: 'column', gap: 8,
                }}>
                  <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--text)' }}>{part.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--text3)', fontWeight: 600 }}>
                    #{part.partNumber}{part.brand ? ` · ${part.brand}` : ''}{part.model ? ` · ${part.model}` : ''}
                  </div>
                  <div style={{ fontSize: 22, fontWeight: 900, color: 'var(--accent)', marginTop: 4 }}>
                    ${part.price?.toFixed(2)}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text3)' }}>In stock: {part.stockQuantity} pcs</div>

                  {inCart ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 4 }}>
                      <button onClick={() => changeQty(part.id, -1)} style={qtyBtnStyle}>−</button>
                      <span style={{ fontWeight: 700, fontSize: 15 }}>{inCart.quantity}</span>
                      <button onClick={() => changeQty(part.id, 1)} style={qtyBtnStyle}>+</button>
                      <button onClick={() => removeFromCart(part.id)} style={{ marginLeft: 'auto', background: 'var(--red-bg)', color: 'var(--red)', border: 'none', borderRadius: 8, padding: '5px 10px', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                        Remove
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => addToCart(part)}
                      style={{ marginTop: 4, background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 10, padding: '9px 0', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}
                    >
                      + Add to Cart
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ORDERS TAB */}
      {!loading && tab === 'orders' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {orders.length === 0 && (
            <p style={{ color: 'var(--text2)' }}>No orders yet.</p>
          )}
          {orders.map(order => {
            const sc = STATUS_COLORS[order.status] ?? STATUS_COLORS.PENDING;
            const total = order.items.reduce((s, i) => s + i.unitPrice * i.quantity, 0);
            return (
              <div key={order.id} style={{ background: 'var(--card)', borderRadius: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
                {/* Order header */}
                <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ fontWeight: 800, fontSize: 15, color: 'var(--text)' }}>Order #{order.id}</span>
                    <span style={{ background: sc.bg, color: sc.color, borderRadius: 20, padding: '3px 10px', fontSize: 11, fontWeight: 700 }}>
                      {order.status}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                    <span style={{ fontSize: 13, color: 'var(--text2)' }}>
                      {new Date(order.orderedAt).toLocaleDateString('en-GB')}
                    </span>
                    <span style={{ fontSize: 16, fontWeight: 900, color: 'var(--accent)' }}>
                      ${total.toFixed(2)}
                    </span>
                  </div>
                </div>
                {/* Order items */}
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border)' }}>
                      {['Part', 'Brand', 'Part No.', 'Qty', 'Unit Price', 'Total'].map(h => (
                        <th key={h} style={{ padding: '10px 20px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {order.items.map((item, i) => (
                      <tr key={item.id} style={{ borderBottom: i < order.items.length - 1 ? '1px solid var(--border)' : 'none' }}>
                        <td style={{ padding: '12px 20px', fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>{item.partName}</td>
                        <td style={{ padding: '12px 20px', fontSize: 13, color: 'var(--text2)' }}>{item.partBrand ?? '—'}</td>
                        <td style={{ padding: '12px 20px', fontSize: 13, color: 'var(--text2)' }}>{item.partNumber}</td>
                        <td style={{ padding: '12px 20px', fontSize: 14, color: 'var(--text)' }}>{item.quantity}</td>
                        <td style={{ padding: '12px 20px', fontSize: 14, color: 'var(--text)' }}>${item.unitPrice?.toFixed(2)}</td>
                        <td style={{ padding: '12px 20px', fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>
                          ${(item.unitPrice * item.quantity).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          })}
        </div>
      )}

      
    </ClientLayout>
  );
}

const qtyBtnStyle = {
  width: 30, height: 30, borderRadius: 8, border: '1px solid var(--border)',
  background: 'var(--bg)', color: 'var(--text)', fontWeight: 700, fontSize: 16,
  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
};

function CartIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text)' }}>
      <circle cx="9" cy="21" r="1"/>
      <circle cx="20" cy="21" r="1"/>
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
    </svg>
  );
}
