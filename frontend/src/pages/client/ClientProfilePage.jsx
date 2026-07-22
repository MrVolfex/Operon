import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ClientLayout from '../../components/ClientLayout';
import api from '../../api/axios';

function BrandLogo({ brand }) {
  const [failed, setFailed] = useState(false);
  const slug = brand?.toLowerCase().replace(/\s+/g, '-') ?? '';
  if (!failed && slug)
    return <img src={`/carlogos/${slug}.png`} alt={brand} onError={() => setFailed(true)} style={{ width: 32, height: 32, objectFit: 'contain' }} />;
  return <span style={{ fontSize: 20 }}>🚗</span>;
}

export default function ClientProfilePage() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [vehicles, setVehicles] = useState([]);
  const [edit, setEdit] = useState(false);
  const [form, setForm] = useState({});
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/api/me').then(res => {
      setProfile(res.data);
      setForm({
        firstName: res.data.firstName,
        lastName: res.data.lastName,
        phone: res.data.phone ?? '',
        email: res.data.email ?? '',
        address: res.data.address ?? '',
        city: res.data.city ?? '',
        postalCode: res.data.postalCode ?? '',
        companyName: res.data.companyName ?? '',
        pib: res.data.pib ?? '',
      });
      return api.get(`/api/vehicles/client/${res.data.id}`);
    }).then(res => setVehicles(res.data));
  }, []);

  async function handleSave() {
    if (password && password !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    setError('');
    setSaving(true);
    try {
      const body = { ...form };
      if (password) body.password = password;
      const res = await api.put('/api/me', body);
      setProfile(res.data);
      setEdit(false);
      setPassword('');
      setConfirm('');
      setSuccess('Profile updated successfully.');
      setTimeout(() => setSuccess(''), 3000);
    } catch {
      setError('Failed to save changes.');
    } finally {
      setSaving(false);
    }
  }

  async function handleAvatarUpload(file) {
    if (!file) return;
    setUploadingAvatar(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', 'client_profiles');
      const res = await fetch('https://api.cloudinary.com/v1_1/d6likkfk/image/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (data.error) throw new Error(data.error.message);
      await api.patch('/api/me/profile-image', { imageUrl: data.secure_url });
      setProfile(prev => ({ ...prev, profileImageUrl: data.secure_url }));
      setImgError(false);
    } catch (err) {
      alert('Upload failed: ' + err.message);
    } finally {
      setUploadingAvatar(false);
    }
  }

  function handleCancel() {
    setEdit(false);
    setPassword('');
    setConfirm('');
    setError('');
    setForm({
      firstName: profile.firstName,
      lastName: profile.lastName,
      phone: profile.phone ?? '',
      email: profile.email ?? '',
      address: profile.address ?? '',
      city: profile.city ?? '',
      postalCode: profile.postalCode ?? '',
      companyName: profile.companyName ?? '',
      pib: profile.pib ?? '',
    });
  }

  if (!profile) return <ClientLayout><p style={{ color: 'var(--text2)' }}>Loading...</p></ClientLayout>;

  const avatarLetter = profile.username?.[0]?.toUpperCase() ?? '?';

  const clientTypeColor = {
    INDIVIDUAL: { bg: 'var(--blue-bg)', color: 'var(--blue)' },
    COMPANY:    { bg: 'var(--purple-bg)', color: 'var(--purple)' },
    FLEET:      { bg: 'var(--yellow-bg)', color: 'var(--yellow)' },
  }[profile.clientType] ?? { bg: 'var(--bg)', color: 'var(--text2)' };

  const inputStyle = {
    width: '100%', padding: '9px 12px', boxSizing: 'border-box',
    border: '1px solid var(--border)', borderRadius: 10,
    fontSize: 13, outline: 'none', background: 'var(--bg)', color: 'var(--text)',
  };

  const labelStyle = {
    fontSize: 11, fontWeight: 700, color: 'var(--text3)',
    textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 5, display: 'block',
  };

  return (
    <ClientLayout>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text)', margin: 0 }}>My Profile</h2>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 20, alignItems: 'start' }}>

        {/* LEFT — identity card */}
        <div style={{ background: 'var(--card)', borderRadius: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
          {/* Accent top strip */}
          <div style={{ height: 6, background: 'var(--accent)' }} />

          <div style={{ padding: '28px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
            {/* Avatar */}
            <input type="file" accept="image/*" id="avatar-upload" style={{ display: 'none' }}
              onChange={e => handleAvatarUpload(e.target.files[0])} />
            <label htmlFor="avatar-upload" style={{ cursor: 'pointer', display: 'block', position: 'relative', width: 88, height: 88, borderRadius: '50%', overflow: 'hidden', marginBottom: 16 }}>
              {profile.profileImageUrl && !imgError ? (
                <img src={profile.profileImageUrl} alt="avatar" onError={() => setImgError(true)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <div style={{ width: '100%', height: '100%', background: 'var(--accent)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, fontWeight: 800 }}>
                  {avatarLetter}
                </div>
              )}
              <div style={{
                position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.45)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                opacity: uploadingAvatar ? 1 : 0, transition: 'opacity 0.2s',
              }}
                onMouseEnter={e => e.currentTarget.style.opacity = 1}
                onMouseLeave={e => { if (!uploadingAvatar) e.currentTarget.style.opacity = 0; }}
              >
                {uploadingAvatar
                  ? <span style={{ color: '#fff', fontSize: 10, fontWeight: 700 }}>...</span>
                  : <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
                }
              </div>
            </label>

            <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--text)' }}>
              {profile.firstName} {profile.lastName}
            </div>
            <div style={{ fontSize: 13, color: 'var(--text3)', marginTop: 3 }}>@{profile.username}</div>

            <span style={{
              marginTop: 12,
              background: clientTypeColor.bg, color: clientTypeColor.color,
              borderRadius: 20, padding: '4px 14px', fontSize: 11, fontWeight: 700,
            }}>
              {profile.clientType}
            </span>

            <div style={{ marginTop: 20, width: '100%', borderTop: '1px solid var(--border)', paddingTop: 16, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
              <button
                onClick={() => navigate('/client/vehicles')}
                style={{
                  background: 'var(--accent-light)', color: 'var(--accent)',
                  border: 'none', borderRadius: 10, padding: '7px 16px',
                  fontSize: 12, fontWeight: 700, cursor: 'pointer', width: '100%',
                }}
              >
                My Vehicles →
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT — personal info */}
        <div style={{ background: 'var(--card)', borderRadius: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.06)', padding: '28px 28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
            <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--text)' }}>Personal Information</div>
            {!edit && (
              <button onClick={() => setEdit(true)} style={{
                background: 'var(--accent)', color: '#fff', border: 'none',
                borderRadius: 10, padding: '8px 18px', fontWeight: 700, fontSize: 13, cursor: 'pointer',
              }}>
                Edit Profile
              </button>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
            {[
              { key: 'firstName', label: 'First Name' },
              { key: 'lastName',  label: 'Last Name' },
              { key: 'email',     label: 'Email' },
              { key: 'phone',     label: 'Phone' },
            ].map(f => (
              <div key={f.key}>
                <label style={labelStyle}>{f.label}</label>
                {edit ? (
                  <input value={form[f.key]} onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))} style={inputStyle} />
                ) : (
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', padding: '9px 0', borderBottom: '1px solid var(--border)' }}>
                    {profile[f.key] || <span style={{ color: 'var(--text3)' }}>—</span>}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Address */}
          <div style={{ marginTop: 24, paddingTop: 24, borderTop: '1px solid var(--border)' }}>
            <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--text)', marginBottom: 16 }}>Address</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 18 }}>
              {[
                { key: 'address',    label: 'Street & Number' },
                { key: 'city',       label: 'City' },
                { key: 'postalCode', label: 'Postal Code' },
              ].map(f => (
                <div key={f.key}>
                  <label style={labelStyle}>{f.label}</label>
                  {edit ? (
                    <input value={form[f.key]} onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))} style={inputStyle} />
                  ) : (
                    <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', padding: '9px 0', borderBottom: '1px solid var(--border)' }}>
                      {profile[f.key] || <span style={{ color: 'var(--text3)' }}>—</span>}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Company info — only for COMPANY and FLEET */}
          {(profile.clientType === 'COMPANY' || profile.clientType === 'FLEET') && (
            <div style={{ marginTop: 24, paddingTop: 24, borderTop: '1px solid var(--border)' }}>
              <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--text)', marginBottom: 16 }}>Company Information</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
                {[
                  { key: 'companyName', label: 'Company Name' },
                  { key: 'pib',         label: 'PIB' },
                ].map(f => (
                  <div key={f.key}>
                    <label style={labelStyle}>{f.label}</label>
                    {edit ? (
                      <input value={form[f.key]} onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))} style={inputStyle} />
                    ) : (
                      <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', padding: '9px 0', borderBottom: '1px solid var(--border)' }}>
                        {profile[f.key] || <span style={{ color: 'var(--text3)' }}>—</span>}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {edit && (
            <div style={{ marginTop: 24, paddingTop: 24, borderTop: '1px solid var(--border)' }}>
              <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--text)', marginBottom: 16 }}>
                Change Password
                <span style={{ fontSize: 12, fontWeight: 400, color: 'var(--text3)', marginLeft: 8 }}>leave blank to keep current</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
                <div>
                  <label style={labelStyle}>New Password</label>
                  <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Confirm Password</label>
                  <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="••••••••" style={inputStyle} />
                </div>
              </div>
            </div>
          )}

          {error && <div style={{ marginTop: 16, background: 'var(--red-bg)', color: 'var(--red)', borderRadius: 10, padding: '10px 14px', fontSize: 13 }}>{error}</div>}
          {success && <div style={{ marginTop: 16, background: 'var(--green-bg)', color: 'var(--green)', borderRadius: 10, padding: '10px 14px', fontSize: 13 }}>{success}</div>}

          {edit && (
            <div style={{ marginTop: 24, display: 'flex', gap: 10 }}>
              <button onClick={handleSave} disabled={saving} style={{
                background: 'var(--accent)', color: '#fff', border: 'none',
                borderRadius: 10, padding: '10px 24px', fontWeight: 700, fontSize: 13,
                cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1,
              }}>
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
              <button onClick={handleCancel} style={{
                background: 'var(--bg)', color: 'var(--text)', border: '1px solid var(--border)',
                borderRadius: 10, padding: '10px 24px', fontWeight: 700, fontSize: 13, cursor: 'pointer',
              }}>
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>
    </ClientLayout>
  );
}
