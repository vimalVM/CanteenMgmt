import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { FiUserPlus } from 'react-icons/fi';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '', phone: '', registrationNumber: '' });
  const [submitting, setSubmitting] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) { toast.error('Please fill required fields'); return; }
    if (form.password !== form.confirmPassword) { toast.error('Passwords do not match'); return; }
    if (form.password.length < 6) { toast.error('Password must be at least 6 characters'); return; }

    setSubmitting(true);
    try {
      await register({ name: form.name, email: form.email, password: form.password, phone: form.phone, registrationNumber: form.registrationNumber });
      toast.success('Registration successful! Please login.');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Registration failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card" style={{ maxWidth: 480 }}>
        <div className="text-center mb-4">
          <span style={{ fontSize: '3rem' }}>🍽️</span>
          <h2 className="fw-bold mt-2" style={{ color: '#2C3E50' }}>Create Account</h2>
          <p className="text-muted">Join Campus Canteen</p>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label fw-semibold">Full Name *</label>
            <input type="text" className="form-control" placeholder="John Doe" value={form.name} onChange={update('name')} required />
          </div>
          <div className="mb-3">
            <label className="form-label fw-semibold">Email *</label>
            <input type="email" className="form-control" placeholder="you@college.edu" value={form.email} onChange={update('email')} required />
          </div>
          <div className="row mb-3">
            <div className="col-6">
              <label className="form-label fw-semibold">Password *</label>
              <input type="password" className="form-control" placeholder="Min 6 chars" value={form.password} onChange={update('password')} required />
            </div>
            <div className="col-6">
              <label className="form-label fw-semibold">Confirm *</label>
              <input type="password" className="form-control" placeholder="Re-enter" value={form.confirmPassword} onChange={update('confirmPassword')} required />
            </div>
          </div>
          <div className="row mb-3">
            <div className="col-6">
              <label className="form-label fw-semibold">Phone</label>
              <input type="tel" className="form-control" placeholder="9876543210" value={form.phone} onChange={update('phone')} />
            </div>
            <div className="col-6">
              <label className="form-label fw-semibold">Reg. Number</label>
              <input type="text" className="form-control" placeholder="STU2024001" value={form.registrationNumber} onChange={update('registrationNumber')} />
            </div>
          </div>
          <button type="submit" className="btn btn-primary-orange btn-lg w-100 btn-pill mt-2" disabled={submitting}>
            {submitting ? <span className="spinner-border spinner-border-sm me-2"></span> : <FiUserPlus className="me-2" />}
            {submitting ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>
        <p className="text-center mt-4 mb-0 text-muted">
          Already have an account? <Link to="/login" style={{ color: '#FF6B35', fontWeight: 600 }}>Sign In</Link>
        </p>
      </div>
    </div>
  );
}
