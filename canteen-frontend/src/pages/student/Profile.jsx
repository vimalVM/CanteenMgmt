import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import API from '../../api/axios';
import { toast } from 'react-toastify';
import LoadingSpinner from '../../components/LoadingSpinner';
import { FiSave, FiLock } from 'react-icons/fi';

export default function Profile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [orderStats, setOrderStats] = useState({ total: 0, spent: 0 });

  useEffect(() => {
    Promise.all([API.get('/auth/me'), API.get('/orders/my')])
      .then(([profileRes, ordersRes]) => {
        const p = profileRes.data;
        setProfile(p);
        setName(p.name);
        setPhone(p.phone || '');
        const orders = ordersRes.data;
        setOrderStats({ total: orders.length, spent: orders.reduce((s, o) => s + o.totalAmount, 0) });
        setLoading(false);
      }).catch(() => setLoading(false));
  }, []);

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      await API.put('/profile', { name, phone });
      toast.success('Profile updated!');
    } catch (err) { toast.error('Failed to update profile'); }
    finally { setSaving(false); }
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) { toast.error('Passwords do not match'); return; }
    if (newPassword.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    try {
      await API.patch('/profile/password', { currentPassword, newPassword });
      toast.success('Password changed!');
      setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
    } catch (err) { toast.error(err.response?.data?.error || 'Failed to change password'); }
  };

  if (loading) return <LoadingSpinner />;

  const initials = name ? name.split(' ').map(n => n[0]).join('').toUpperCase() : '?';

  return (
    <div className="container py-4" style={{ maxWidth: 700 }}>
      <div className="card card-glass mb-4">
        <div className="card-body text-center py-4">
          <div className="rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
            style={{ width: 80, height: 80, background: 'linear-gradient(135deg, #FF6B35, #E55A24)', color: 'white', fontSize: '1.8rem', fontWeight: 700 }}>
            {initials}
          </div>
          <h4 className="fw-bold mb-1">{profile?.name}</h4>
          <p className="text-muted mb-0">{profile?.email}</p>
          {profile?.registrationNumber && <span className="badge bg-light text-dark mt-2">{profile.registrationNumber}</span>}
        </div>
      </div>

      <div className="row g-3 mb-4">
        <div className="col-6">
          <div className="card card-glass p-3 text-center">
            <h4 className="fw-bold mb-0">{orderStats.total}</h4>
            <small className="text-muted">Total Orders</small>
          </div>
        </div>
        <div className="col-6">
          <div className="card card-glass p-3 text-center">
            <h4 className="fw-bold mb-0">₹{orderStats.spent.toFixed(0)}</h4>
            <small className="text-muted">Total Spent</small>
          </div>
        </div>
      </div>

      <div className="card card-glass mb-4">
        <div className="card-header bg-transparent"><h5 className="fw-bold mb-0">Edit Profile</h5></div>
        <div className="card-body">
          <div className="mb-3">
            <label className="form-label fw-semibold">Name</label>
            <input type="text" className="form-control" value={name} onChange={e => setName(e.target.value)} />
          </div>
          <div className="mb-3">
            <label className="form-label fw-semibold">Email</label>
            <input type="email" className="form-control" value={profile?.email || ''} disabled />
          </div>
          <div className="mb-3">
            <label className="form-label fw-semibold">Phone</label>
            <input type="tel" className="form-control" value={phone} onChange={e => setPhone(e.target.value)} />
          </div>
          <div className="mb-3">
            <label className="form-label fw-semibold">Registration Number</label>
            <input type="text" className="form-control" value={profile?.registrationNumber || ''} disabled />
          </div>
          <button className="btn btn-primary-orange btn-pill" onClick={handleSaveProfile} disabled={saving}>
            <FiSave className="me-2" />{saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      <div className="card card-glass">
        <div className="card-header bg-transparent"><h5 className="fw-bold mb-0">Change Password</h5></div>
        <div className="card-body">
          <div className="mb-3">
            <label className="form-label fw-semibold">Current Password</label>
            <input type="password" className="form-control" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} />
          </div>
          <div className="mb-3">
            <label className="form-label fw-semibold">New Password</label>
            <input type="password" className="form-control" value={newPassword} onChange={e => setNewPassword(e.target.value)} />
          </div>
          <div className="mb-3">
            <label className="form-label fw-semibold">Confirm New Password</label>
            <input type="password" className="form-control" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
          </div>
          <button className="btn btn-outline-secondary btn-pill" onClick={handleChangePassword}>
            <FiLock className="me-2" />Change Password
          </button>
        </div>
      </div>
    </div>
  );
}
