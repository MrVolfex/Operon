import { useEffect, useState } from 'react';
import ClientLayout from '../../components/ClientLayout';
import api from '../../api/axios';

const SERVICES = [
  { key: 'mali-servis',   label: 'Minor Service',    price: 'from $60',  icon: '🔧' },
  { key: 'veliki-servis', label: 'Major Service',    price: 'from $140', icon: '⚙️' },
  { key: 'gume',          label: 'Tires / Wheels',   price: 'from $12',  icon: '🔄' },
  { key: 'dijagnostika',  label: 'Diagnostics',      price: 'from $20',  icon: '🔍' },
  { key: 'kocioni',       label: 'Brake System',     price: 'from $35',  icon: '🪛' },
  { key: 'ostalo',        label: 'Other',            price: 'by quote',  icon: '📋' },
];

const TIME_SLOTS = ['08:00','09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00'];

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DAY_LABELS = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];

const statusStyle = {
  PENDING:   { background: 'var(--yellow-bg)', color: 'var(--yellow)' },
  CONFIRMED: { background: 'var(--green-bg)',  color: 'var(--green)'  },
  CANCELLED: { background: 'var(--red-bg)',    color: 'var(--red)'    },
};

function MiniCalendar({ selectedDate, onSelect }) {
  const today = new Date();
  const [viewYear, setViewYear]   = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDay    = new Date(viewYear, viewMonth, 1).getDay();
  const offset      = firstDay === 0 ? 6 : firstDay - 1;

  function shift(dir) {
    let m = viewMonth + dir, y = viewYear;
    if (m > 11) { m = 0; y++; }
    if (m < 0)  { m = 11; y--; }
    setViewMonth(m); setViewYear(y);
  }

  function isPast(day) {
    return new Date(viewYear, viewMonth, day) < new Date(today.getFullYear(), today.getMonth(), today.getDate());
  }
  function isWeekend(day) {
    const d = new Date(viewYear, viewMonth, day).getDay();
    return d === 0 || d === 6;
  }
  function isToday(day) {
    return day === today.getDate() && viewMonth === today.getMonth() && viewYear === today.getFullYear();
  }
  function isSelected(day) {
    return selectedDate &&
      day === selectedDate.getDate() &&
      viewMonth === selectedDate.getMonth() &&
      viewYear === selectedDate.getFullYear();
  }

  const navBtn = (label, dir) => (
    <button onClick={() => shift(dir)} style={{
      width: 28, height: 28, borderRadius: 8,
      border: '1.5px solid var(--border)', background: 'var(--bg)',
      cursor: 'pointer', fontSize: 16, color: 'var(--text2)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>{label}</button>
  );

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        {navBtn('‹', -1)}
        <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--text)' }}>{MONTHS[viewMonth]} {viewYear}</div>
        {navBtn('›', 1)}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
        {DAY_LABELS.map(d => (
          <div key={d} style={{ textAlign: 'center', fontSize: 10, color: 'var(--text3)', fontWeight: 700, paddingBottom: 6 }}>{d}</div>
        ))}
        {Array.from({ length: offset }).map((_, i) => <div key={`e${i}`} />)}
        {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
          const past    = isPast(day);
          const weekend = isWeekend(day);
          const sel     = isSelected(day);
          const tod     = isToday(day);
          const disabled = past || weekend;

          return (
            <div
              key={day}
              onClick={() => !disabled && onSelect(new Date(viewYear, viewMonth, day))}
              style={{
                padding: '7px 4px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                borderRadius: 8, fontSize: 12, fontWeight: 600,
                border: sel ? '1.5px solid var(--accent)' : tod ? '1.5px solid var(--accent-mid)' : '1.5px solid var(--border)',
                background: sel ? 'var(--accent)' : 'var(--card)',
                color: sel ? '#fff' : tod ? 'var(--accent)' : 'var(--text)',
                opacity: disabled ? 0.3 : 1,
                cursor: disabled ? 'not-allowed' : 'pointer',
                transition: 'all 0.12s',
              }}
            >
              {day}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function ClientAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [vehicles, setVehicles]         = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState('');

  const [selectedVehicle, setSelectedVehicle] = useState('');
  const [selectedService, setSelectedService] = useState('mali-servis');
  const [selectedDate, setSelectedDate]       = useState(null);
  const [selectedTime, setSelectedTime]       = useState('');
  const [bookedSlots, setBookedSlots]         = useState([]);
  const [note, setNote]                       = useState('');
  const [submitting, setSubmitting]           = useState(false);
  const [formError, setFormError]             = useState('');
  const [showConfirm, setShowConfirm]         = useState(false);
  const [showSuccess, setShowSuccess]         = useState(false);
  const [bookedInfo, setBookedInfo]           = useState(null);

  useEffect(() => {
    api.get('/api/me')
      .then(res => Promise.all([
        api.get('/api/my-appointments'),
        api.get(`/api/vehicles/client/${res.data.id}`),
      ]))
      .then(([apptRes, vehRes]) => {
        setAppointments(apptRes.data);
        setVehicles(vehRes.data);
        if (vehRes.data.length > 0) setSelectedVehicle(String(vehRes.data[0].id));
      })
      .catch(() => setError('Error loading data.'))
      .finally(() => setLoading(false));
  }, []);

  function handleDateSelect(date) {
    setSelectedDate(date);
    setSelectedTime('');
    const p = n => String(n).padStart(2, '0');
    const dateStr = `${date.getFullYear()}-${p(date.getMonth()+1)}-${p(date.getDate())}`;
    api.get(`/api/my-appointments/booked-slots?date=${dateStr}`)
      .then(res => setBookedSlots(res.data))
      .catch(() => setBookedSlots([]));
  }

  function handleCancel(id) {
    const appt = appointments.find(a => a.id === id);
    api.patch(`/api/my-appointments/${id}/cancel`)
      .then(() => {
        setAppointments(prev => prev.map(a => a.id === id ? { ...a, status: 'CANCELLED' } : a));
        if (appt?.scheduledAt) {
          const t = new Date(appt.scheduledAt);
          const slot = `${String(t.getHours()).padStart(2,'0')}:${String(t.getMinutes()).padStart(2,'0')}`;
          setBookedSlots(prev => prev.filter(s => s !== slot));
        }
      })
      .catch(() => alert('Error cancelling appointment.'));
  }

  function buildScheduledAt() {
    if (!selectedDate || !selectedTime) return null;
    const [h, m] = selectedTime.split(':');
    const d = new Date(selectedDate);
    d.setHours(parseInt(h), parseInt(m), 0, 0);
    const p = n => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${p(d.getMonth()+1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}:00`;
  }

  function handleSubmit() {
    setFormError('');
    if (!selectedVehicle) { setFormError('Please select a vehicle.'); return; }
    if (!selectedDate)    { setFormError('Please select a date.'); return; }
    if (!selectedTime)    { setFormError('Please select a time slot.'); return; }

    const serviceLabel = SERVICES.find(s => s.key === selectedService)?.label ?? '';
    const fullNote = serviceLabel + (note ? ` — ${note}` : '');

    setSubmitting(true);
    api.post('/api/my-appointments', {
      vehicleId: Number(selectedVehicle),
      scheduledAt: buildScheduledAt(),
      note: fullNote,
    })
      .then(res => {
        setAppointments(prev => [res.data, ...prev]);
        setBookedInfo({ date: selectedDate, time: selectedTime, service: svcObj?.label });
        setShowConfirm(false);
        setShowSuccess(true);
        setSelectedDate(null);
        setSelectedTime('');
        setNote('');
      })
      .catch(() => setFormError('Error booking appointment.'))
      .finally(() => setSubmitting(false));
  }

  const vehObj  = vehicles.find(v => String(v.id) === selectedVehicle);
  const svcObj  = SERVICES.find(s => s.key === selectedService);
  const canBook = selectedVehicle && selectedDate && selectedTime;

  function fmtDate(d) {
    if (!d) return '—';
    return d.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' });
  }

  const sLabel = { fontSize: 12, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 10 };

  if (loading) return <ClientLayout><p style={{ color: 'var(--text2)' }}>Loading...</p></ClientLayout>;
  if (error)   return <ClientLayout><p style={{ color: 'var(--red)' }}>{error}</p></ClientLayout>;

  return (
    <ClientLayout>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text)', margin: 0 }}>Book a Service</h2>
      </div>

      {/* ── Booking grid ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24, alignItems: 'start', marginBottom: 36 }}>

        {/* LEFT */}
        <div>
          {/* Vehicle */}
          <div style={sLabel}>Vehicle</div>
          <select
            value={selectedVehicle}
            onChange={e => setSelectedVehicle(e.target.value)}
            style={{
              width: '100%', padding: '10px 14px', marginBottom: 24,
              border: '2px solid var(--border)', borderRadius: 12,
              fontSize: 14, fontWeight: 600, color: 'var(--text)',
              background: 'var(--card)', outline: 'none', boxSizing: 'border-box',
            }}
          >
            {vehicles.map(v => (
              <option key={v.id} value={v.id}>{v.brand} {v.model} {v.year} — {v.licensePlate}</option>
            ))}
          </select>

          {/* Service type */}
          <div style={sLabel}>Service Type</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 24 }}>
            {SERVICES.map(s => (
              <div
                key={s.key}
                onClick={() => setSelectedService(s.key)}
                style={{
                  border: `2px solid ${selectedService === s.key ? 'var(--accent)' : 'var(--border)'}`,
                  borderRadius: 14, padding: '16px 12px',
                  cursor: 'pointer', textAlign: 'center',
                  background: selectedService === s.key ? 'var(--accent-light)' : 'var(--card)',
                  transition: 'all 0.15s',
                }}
              >
                <div style={{ fontSize: 28, marginBottom: 8 }}>{s.icon}</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>{s.label}</div>
                <div style={{ fontSize: 11, color: 'var(--text2)', marginTop: 3 }}>{s.price}</div>
              </div>
            ))}
          </div>

          {/* Calendar */}
          <div style={sLabel}>Select Date</div>
          <div style={{ background: 'var(--card)', borderRadius: 16, padding: 20, marginBottom: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
            <MiniCalendar selectedDate={selectedDate} onSelect={handleDateSelect} />
          </div>

          {/* Time slots */}
          <div style={sLabel}>Available Time Slots</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 24 }}>
            {TIME_SLOTS.map(t => {
              const booked = bookedSlots.includes(t);
              const selected = selectedTime === t;
              return (
                <div
                  key={t}
                  onClick={() => !booked && setSelectedTime(t)}
                  style={{
                    padding: '10px', borderRadius: 10, textAlign: 'center',
                    border: `2px solid ${selected ? 'var(--accent)' : 'var(--border)'}`,
                    background: booked ? 'var(--bg)' : selected ? 'var(--accent-light)' : 'var(--card)',
                    fontSize: 13, fontWeight: 600,
                    color: booked ? 'var(--text3)' : selected ? 'var(--accent)' : 'var(--text)',
                    cursor: booked ? 'not-allowed' : 'pointer',
                    opacity: booked ? 0.45 : 1,
                    transition: 'all 0.15s',
                  }}
                >
                  {t}
                </div>
              );
            })}
          </div>

          {/* Note */}
          <div style={sLabel}>Note (optional)</div>
          <textarea
            value={note}
            onChange={e => setNote(e.target.value)}
            rows={4}
            placeholder='Describe the issue or anything we should know...'
            style={{
              width: '100%', padding: 12, boxSizing: 'border-box',
              border: '2px solid var(--border)', borderRadius: 12,
              fontSize: 14, fontFamily: 'inherit', color: 'var(--text)',
              resize: 'vertical', outline: 'none', minHeight: 100,
            }}
          />
        </div>

        {/* RIGHT: summary */}
        <div style={{ background: 'var(--card)', borderRadius: 16, padding: 24, position: 'sticky', top: 88, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
          <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--text)', marginBottom: 16 }}>Appointment Summary</div>

          {[
            { label: 'Vehicle', val: vehObj ? `${vehObj.brand} ${vehObj.model}` : '—' },
            { label: 'Service', val: svcObj?.label ?? '—' },
            { label: 'Date',    val: fmtDate(selectedDate) },
            { label: 'Time',    val: selectedTime || '—' },
            { label: 'Workshop', val: 'Operon Service' },
          ].map(row => (
            <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
              <span style={{ fontSize: 13, color: 'var(--text2)' }}>{row.label}</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', textAlign: 'right', maxWidth: 160 }}>{row.val}</span>
            </div>
          ))}

          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0' }}>
            <span style={{ fontSize: 13, color: 'var(--text2)' }}>Est. Price</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--accent)' }}>{svcObj?.price ?? '—'}</span>
          </div>

          <button
            onClick={() => { setFormError(''); setShowConfirm(true); }}
            disabled={!canBook}
            style={{
              width: '100%', background: 'var(--accent)', color: '#fff',
              border: 'none', borderRadius: 12, padding: 15,
              fontSize: 15, fontWeight: 700,
              cursor: canBook ? 'pointer' : 'not-allowed',
              opacity: canBook ? 1 : 0.45, marginTop: 16, transition: 'opacity 0.2s',
            }}
          >
            Confirm Booking
          </button>
          <div style={{ fontSize: 11, color: 'var(--text3)', textAlign: 'center', marginTop: 8 }}>
            Confirmation will be sent via email and SMS
          </div>
        </div>
      </div>

      {/* ── Confirm modal ── */}
      {showConfirm && (
        <div
          onClick={e => { if (e.target === e.currentTarget) setShowConfirm(false); }}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <div style={{ background: 'var(--card)', borderRadius: 20, padding: 28, width: 480, maxWidth: '95vw' }}>
            <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--text)', marginBottom: 4 }}>Confirm Booking</div>
            <div style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 20 }}>Review details before confirming</div>

            <div style={{ background: 'var(--bg)', borderRadius: 12, padding: 16, marginBottom: 20 }}>
              {[
                { label: 'Service', val: svcObj?.label },
                { label: 'Date',    val: fmtDate(selectedDate) },
                { label: 'Time',    val: selectedTime },
                { label: 'Vehicle', val: vehObj ? `${vehObj.brand} ${vehObj.model} · ${vehObj.licensePlate}` : '—' },
              ].map(row => (
                <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0' }}>
                  <span style={{ fontSize: 13, color: 'var(--text2)' }}>{row.label}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>{row.val}</span>
                </div>
              ))}
              <div style={{ height: 1, background: 'var(--border)', margin: '8px 0' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0' }}>
                <span style={{ fontSize: 13, color: 'var(--text2)' }}>Est. Price</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--accent)' }}>{svcObj?.price}</span>
              </div>
            </div>

            {formError && (
              <div style={{ background: 'var(--red-bg)', color: 'var(--red)', borderRadius: 8, padding: '8px 12px', fontSize: 12, marginBottom: 12 }}>
                {formError}
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={submitting}
              style={{ width: '100%', background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 12, padding: 14, fontSize: 15, fontWeight: 700, cursor: submitting ? 'not-allowed' : 'pointer', opacity: submitting ? 0.7 : 1 }}
            >
              {submitting ? 'Zakazivanje...' : '✓ Potvrdi zakazivanje'}
            </button>
            <button
              onClick={() => setShowConfirm(false)}
              style={{ width: '100%', background: 'var(--bg)', color: 'var(--text)', border: 'none', borderRadius: 12, padding: 14, fontSize: 15, fontWeight: 700, cursor: 'pointer', marginTop: 10 }}
            >
              Nazad
            </button>
          </div>
        </div>
      )}

      {/* ── Success modal ── */}
      {showSuccess && (
        <div
          onClick={() => setShowSuccess(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <div style={{ background: 'var(--card)', borderRadius: 20, padding: 36, width: 420, maxWidth: '95vw', textAlign: 'center' }}>
            <div style={{
              width: 68, height: 68, background: 'var(--green-bg)', borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px',
            }}>
              <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--text)', marginBottom: 8 }}>Termin zakazan!</div>
            <div style={{ fontSize: 14, color: 'var(--text2)', marginBottom: 24 }}>
              {bookedInfo?.service} · {fmtDate(bookedInfo?.date)} · {bookedInfo?.time}
            </div>
            <button
              onClick={() => setShowSuccess(false)}
              style={{ background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 12, padding: '12px 32px', fontSize: 15, fontWeight: 700, cursor: 'pointer' }}
            >
              Odlično
            </button>
          </div>
        </div>
      )}

      {/* ── Appointments list ── */}
      <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 12 }}>
        Moji termini ({appointments.length})
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {appointments.length === 0 && (
          <div style={{ background: 'var(--card)', borderRadius: 16, padding: 32, textAlign: 'center', color: 'var(--text2)' }}>
            Nema zakazanih termina.
          </div>
        )}
        {appointments.map(a => (
          <div key={a.id} style={{
            background: 'var(--card)', borderRadius: 16,
            boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
            padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 16,
          }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>
                {a.vehicleBrand} {a.vehicleModel}
                <span style={{ fontWeight: 400, color: 'var(--text3)', marginLeft: 8, fontSize: 13 }}>
                  {a.vehicleLicensePlate}
                </span>
              </div>
              <div style={{ fontSize: 12, color: 'var(--text2)', marginTop: 4 }}>
                {a.scheduledAt ? new Date(a.scheduledAt).toLocaleString('sr-Latn') : '—'}
                {a.note && <span style={{ marginLeft: 8 }}>· {a.note}</span>}
              </div>
            </div>
            <span style={{ ...statusStyle[a.status], borderRadius: 20, padding: '3px 10px', fontSize: 11, fontWeight: 700 }}>
              {a.status}
            </span>
            {a.status === 'PENDING' && (
              <button
                onClick={() => handleCancel(a.id)}
                style={{ background: 'var(--red-bg)', color: 'var(--red)', border: 'none', borderRadius: 8, padding: '6px 12px', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}
              >
                Otkaži
              </button>
            )}
          </div>
        ))}
      </div>
    </ClientLayout>
  );
}
