import { useEffect, useState } from 'react';
import ClientLayout from '../../components/ClientLayout';
import VehicleAddForm from './VehicleAddForm';
import api from '../../api/axios';

function BrandLogo({ brand }) {
  const [failed, setFailed] = useState(false);
  const slug = brand?.toLowerCase().replace(/\s+/g, '-') ?? '';
  if (!failed && slug)
    return <img src={`/carlogos/${slug}.png`} alt={brand} onError={() => setFailed(true)} style={{ width: 36, height: 36, objectFit: 'contain' }} />;
  return <span style={{ fontSize: 24 }}>🚗</span>;
}

export default function ClientVehicles() {
  const [vehicles, setVehicles] = useState([]);
  const [clientId, setClientId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [uploadingId, setUploadingId] = useState(null);

  useEffect(() => {
    api.get('/api/me').then(res => {
      setClientId(res.data.id);
      return api.get(`/api/vehicles/client/${res.data.id}`);
    }).then(res => setVehicles(res.data))
      .finally(() => setLoading(false));
  }, []);

  async function handlePhotoUpload(vehicleId, slot, file) {
    if (!file) return;
    setUploadingId(`${vehicleId}-${slot}`);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', 'client_vehicles');
      const res = await fetch('https://api.cloudinary.com/v1_1/d6likkfk/image/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (data.error) throw new Error(data.error.message);
      const imageUrl = data.secure_url;
      await api.patch(`/api/vehicles/${vehicleId}/images`, { slot: String(slot), imageUrl });
      setVehicles(prev => prev.map(v => v.id === vehicleId ? { ...v, [`image${slot}`]: imageUrl } : v));
    } catch (err) {
      alert('Upload failed: ' + err.message);
    } finally {
      setUploadingId(null);
    }
  }

  async function handleDelete(vehicleId) {
    if (!window.confirm('Delete this vehicle?')) return;
    try {
      await api.delete(`/api/vehicles/${vehicleId}`);
      setVehicles(prev => prev.filter(v => v.id !== vehicleId));
    } catch {
      alert('Cannot delete vehicle — it may have active work orders.');
    }
  }

  return (
    <ClientLayout>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text)', margin: 0 }}>My Vehicles</h2>
        {!showAdd && (
          <button
            onClick={() => setShowAdd(true)}
            style={{
              background: 'var(--accent)', color: '#fff', border: 'none',
              borderRadius: 10, padding: '9px 18px', fontWeight: 700, fontSize: 13, cursor: 'pointer',
            }}
          >
            + Add Vehicle
          </button>
        )}
      </div>

      {loading && <p style={{ color: 'var(--text2)' }}>Loading...</p>}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {showAdd && (
          <VehicleAddForm
            clientId={clientId}
            onSuccess={vehicle => { setVehicles(prev => [...prev, vehicle]); setShowAdd(false); }}
            onCancel={() => setShowAdd(false)}
          />
        )}

        {!loading && vehicles.length === 0 && !showAdd && (
          <div style={{ background: 'var(--card)', borderRadius: 16, padding: 32, textAlign: 'center', color: 'var(--text2)' }}>
            No vehicles registered yet.
          </div>
        )}

        {vehicles.map(v => {
          const isExpanded = expandedId === v.id;
          return (
            <div key={v.id} style={{ background: 'var(--card)', borderRadius: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
              {/* Header row */}
              <div
                onClick={() => setExpandedId(isExpanded ? null : v.id)}
                style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 16, cursor: 'pointer' }}
              >
                <div style={{ width: 48, height: 48, borderRadius: 12, background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <BrandLogo brand={v.brand} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--text)' }}>{v.brand} {v.model} {v.year}</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginTop: 4 }}>
                    <div style={{ fontSize: 12, color: 'var(--text2)' }}>
                      <span style={{ fontWeight: 700, color: 'var(--text3)' }}>Registration: </span>{v.licensePlate}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text2)' }}>
                      <span style={{ fontWeight: 700, color: 'var(--text3)' }}>Mileage: </span>{v.mileage?.toLocaleString()} km
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text2)' }}>
                      <span style={{ fontWeight: 700, color: 'var(--text3)' }}>VIN: </span>{v.vin}
                    </div>
                  </div>
                </div>
                <div style={{ textAlign: 'right', marginRight: 8 }}>
                  <div style={{ fontSize: 11, color: 'var(--text3)' }}>Reg. expires</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', marginTop: 2 }}>{v.registrationExpiry ?? '—'}</div>
                </div>
                <div style={{ color: 'var(--text3)', fontSize: 18, transition: 'transform 0.2s', transform: isExpanded ? 'rotate(180deg)' : 'none' }}>▾</div>
              </div>

              {/* Expanded */}
              {isExpanded && (
                <div style={{ borderTop: '1px solid var(--border)', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 20 }}>
                  {/* Details grid */}
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 12 }}>Details</div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                      {[
                        { label: 'Brand', value: v.brand },
                        { label: 'Model', value: v.model },
                        { label: 'Year', value: v.year },
                        { label: 'License Plate', value: v.licensePlate },
                        { label: 'VIN', value: v.vin },
                        { label: 'Mileage', value: `${v.mileage?.toLocaleString()} km` },
                        { label: 'Reg. Date', value: v.registrationDate ?? '—' },
                        { label: 'Reg. Expiry', value: v.registrationExpiry ?? '—' },
                      ].map(f => (
                        <div key={f.label} style={{ background: 'var(--bg)', borderRadius: 10, padding: '10px 14px' }}>
                          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>{f.label}</div>
                          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{f.value}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Photos */}
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 12 }}>Photos</div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 10 }}>
                      {[1, 2, 3, 4].map(slot => {
                        const url = v[`image${slot}`];
                        const isUploading = uploadingId === `${v.id}-${slot}`;
                        return (
                          <div key={slot}>
                            <input type="file" accept="image/*" id={`photo-${v.id}-${slot}`} style={{ display: 'none' }}
                              onChange={e => handlePhotoUpload(v.id, slot, e.target.files[0])} />
                            <label htmlFor={`photo-${v.id}-${slot}`} onClick={e => e.stopPropagation()}
                              style={{
                                display: 'block', cursor: isUploading ? 'not-allowed' : 'pointer',
                                borderRadius: 10, overflow: 'hidden',
                                border: url ? 'none' : '2px dashed var(--border)',
                                background: url ? 'transparent' : 'var(--bg)',
                                height: 100, position: 'relative',
                              }}
                            >
                              {url
                                ? <img src={url} alt={`Photo ${slot}`} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                                : (
                                  <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                                    <span style={{ fontSize: 20, color: 'var(--text3)' }}>+</span>
                                    <span style={{ fontSize: 10, color: 'var(--text3)', fontWeight: 600 }}>Add photo</span>
                                  </div>
                                )
                              }
                              {isUploading && (
                                <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                  <span style={{ color: '#fff', fontSize: 11, fontWeight: 700 }}>Uploading...</span>
                                </div>
                              )}
                            </label>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Delete */}
                  <div>
                    <button
                      onClick={() => handleDelete(v.id)}
                      style={{
                        background: 'var(--red-bg)', color: 'var(--red)', border: 'none',
                        borderRadius: 10, padding: '9px 18px', fontWeight: 700, fontSize: 13, cursor: 'pointer',
                      }}
                    >
                      Delete Vehicle
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </ClientLayout>
  );
}
