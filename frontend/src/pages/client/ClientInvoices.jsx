import { useEffect, useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import ClientLayout from '../../components/ClientLayout';
import api from '../../api/axios';
import { downloadPDF } from '../../utils/invoicePdf';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

function PaymentForm({ invoice, clientSecret, onSuccess, onClose }) {
  const stripe = useStripe();
  const elements = useElements();
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    if (!stripe || !elements) return;
    setPaying(true);
    setError('');

    const { error: submitError } = await elements.submit();
    if (submitError) {
      setError(submitError.message);
      setPaying(false);
      return;
    }

    const { error: stripeError, paymentIntent } = await stripe.confirmPayment({
      elements,
      clientSecret,
      confirmParams: {},
      redirect: 'if_required',
    });

    if (stripeError) {
      setError(stripeError.message);
      setPaying(false);
    } else if (paymentIntent && paymentIntent.status === 'succeeded') {
      await api.post('/api/stripe/confirm', {
        paymentIntentId: paymentIntent.id,
        invoiceId: String(invoice.id),
      });
      onSuccess();
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 16 }}>
          Paying <strong>{invoice.number ?? `#${invoice.id}`}</strong> — <strong style={{ color: 'var(--accent)' }}>${invoice.amount?.toFixed(2)}</strong>
        </div>
        <PaymentElement />
      </div>
      {error && (
        <div style={{ background: 'var(--red-bg)', color: 'var(--red)', borderRadius: 10, padding: '10px 14px', fontSize: 13, marginBottom: 16 }}>
          {error}
        </div>
      )}
      <div style={{ display: 'flex', gap: 10 }}>
        <button
          type="submit"
          disabled={paying || !stripe}
          style={{ flex: 1, background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 10, padding: 12, fontWeight: 700, fontSize: 13, cursor: 'pointer', opacity: paying ? 0.7 : 1 }}
        >
          {paying ? 'Processing...' : 'Pay Now'}
        </button>
        <button
          type="button"
          onClick={onClose}
          style={{ flex: 1, background: 'var(--bg)', color: 'var(--text)', border: '1px solid var(--border)', borderRadius: 10, padding: 12, fontWeight: 700, fontSize: 13, cursor: 'pointer' }}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

export default function ClientInvoices() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');
  const [filter, setFilter]     = useState('ALL');
  const [payingInvoice, setPayingInvoice] = useState(null);
  const [clientSecret, setClientSecret]   = useState('');
  const [loadingPayment, setLoadingPayment] = useState(false);

  useEffect(() => {
    api.get('/api/my-invoices')
      .then(res => setInvoices(res.data))
      .catch(() => setError('Error loading invoices.'))
      .finally(() => setLoading(false));
  }, []);

  function openPayment(inv) {
    setLoadingPayment(true);
    api.post(`/api/stripe/pay/${inv.id}`)
      .then(res => {
        setClientSecret(res.data.clientSecret);
        setPayingInvoice(inv);
      })
      .catch(() => setError('Failed to initialize payment.'))
      .finally(() => setLoadingPayment(false));
  }

  function handlePaymentSuccess() {
    setInvoices(prev => prev.map(i => i.id === payingInvoice.id ? { ...i, isPaid: true } : i));
    setPayingInvoice(null);
    setClientSecret('');
  }

  function closePayment() {
    setPayingInvoice(null);
    setClientSecret('');
  }

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
                    <div style={{ display: 'flex', gap: 8 }}>
                      {!inv.isPaid && (
                        <button
                          onClick={() => openPayment(inv)}
                          disabled={loadingPayment}
                          style={{ background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 8, padding: '6px 14px', fontWeight: 700, fontSize: 12, cursor: 'pointer', opacity: loadingPayment ? 0.7 : 1 }}
                        >
                          Pay
                        </button>
                      )}
                      <button
                        onClick={() => downloadPDF(inv)}
                        style={{ background: 'var(--bg)', color: 'var(--text)', border: '1px solid var(--border)', borderRadius: 8, padding: '6px 12px', fontWeight: 700, fontSize: 12, cursor: 'pointer' }}
                      >
                        ↓ PDF
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Payment Modal */}
      {payingInvoice && clientSecret && (
        <div
          onClick={e => { if (e.target === e.currentTarget) closePayment(); }}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <div style={{ background: 'var(--card)', borderRadius: 20, padding: 28, width: 460, maxWidth: '95vw', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--text)', marginBottom: 20 }}>
              Complete Payment
            </div>
            <Elements stripe={stripePromise} options={{ clientSecret }}>
              <PaymentForm
                invoice={payingInvoice}
                clientSecret={clientSecret}
                onSuccess={handlePaymentSuccess}
                onClose={closePayment}
              />
            </Elements>
          </div>
        </div>
      )}
    </ClientLayout>
  );
}
