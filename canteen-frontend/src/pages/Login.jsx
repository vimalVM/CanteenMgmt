import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { FiEye, FiEyeOff, FiLogIn } from 'react-icons/fi';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) { toast.error('Please fill all fields'); return; }
    setSubmitting(true);
    try {
      const data = await login(email, password);
      toast.success(`Welcome back, ${data.name}!`);
      navigate(data.role === 'ADMIN' ? '/admin/dashboard' : '/student/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Invalid credentials');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="text-center mb-4">
          <span style={{ fontSize: '3rem' }}>🍽️</span>
          <h2 className="fw-bold mt-2" style={{ color: '#2C3E50' }}>Campus Canteen</h2>
          <p className="text-muted">Sign in to your account</p>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label fw-semibold">Email</label>
            <input type="email" className="form-control form-control-lg" placeholder="you@example.com"
              value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div className="mb-3">
            <label className="form-label fw-semibold">Password</label>
            <div className="input-group">
              <input type={showPass ? 'text' : 'password'} className="form-control form-control-lg" placeholder="••••••••"
                value={password} onChange={e => setPassword(e.target.value)} required />
              <button type="button" className="btn btn-outline-secondary" onClick={() => setShowPass(!showPass)}>
                {showPass ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
          </div>
          <button type="submit" className="btn btn-primary-orange btn-lg w-100 btn-pill mt-2" disabled={submitting}>
            {submitting ? <span className="spinner-border spinner-border-sm me-2"></span> : <FiLogIn className="me-2" />}
            {submitting ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        <p className="text-center mt-4 mb-0 text-muted">
          Don't have an account? <Link to="/register" style={{ color: '#FF6B35', fontWeight: 600 }}>Register</Link>
        </p>
      </div>
    </div>
  );
}
