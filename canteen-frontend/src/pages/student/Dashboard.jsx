import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import API from '../../api/axios';
import StatusBadge from '../../components/StatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';
import { FiShoppingBag, FiClock, FiDollarSign, FiArrowRight } from 'react-icons/fi';

export default function StudentDashboard() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/orders/my').then(res => { setOrders(res.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good Morning';
    if (h < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const activeOrders = orders.filter(o => ['PENDING', 'CONFIRMED', 'PREPARING', 'READY'].includes(o.status));
  const thisMonth = orders.filter(o => {
    const d = new Date(o.orderTime);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });
  const monthSpent = thisMonth.reduce((s, o) => s + o.totalAmount, 0);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="container py-4">
      <div className="card card-glass mb-4 p-4" style={{ background: 'linear-gradient(135deg, #FF6B35 0%, #E55A24 100%)', color: 'white', border: 'none' }}>
        <h3 className="fw-bold mb-1">{getGreeting()}, {user?.name?.split(' ')[0]}! 👋</h3>
        <p className="mb-0 opacity-75">What would you like to eat today?</p>
      </div>

      <div className="row g-3 mb-4">
        <div className="col-md-4">
          <div className="card card-glass p-3 text-center h-100">
            <FiClock size={28} className="mx-auto mb-2" style={{ color: '#FF6B35' }} />
            <h3 className="fw-bold mb-0">{activeOrders.length}</h3>
            <small className="text-muted">Active Orders</small>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card card-glass p-3 text-center h-100">
            <FiShoppingBag size={28} className="mx-auto mb-2" style={{ color: '#27AE60' }} />
            <h3 className="fw-bold mb-0">{orders.length}</h3>
            <small className="text-muted">Total Orders</small>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card card-glass p-3 text-center h-100">
            <FiDollarSign size={28} className="mx-auto mb-2" style={{ color: '#0D6EFD' }} />
            <h3 className="fw-bold mb-0">₹{monthSpent.toFixed(0)}</h3>
            <small className="text-muted">Spent This Month</small>
          </div>
        </div>
      </div>

      {activeOrders.length > 0 && (
        <div className="card card-glass mb-4">
          <div className="card-header bg-transparent d-flex justify-content-between align-items-center">
            <h5 className="fw-bold mb-0">Active Orders</h5>
            <Link to="/student/orders" className="btn btn-sm btn-outline-primary">View All</Link>
          </div>
          <div className="card-body p-0">
            {activeOrders.slice(0, 3).map(order => (
              <div key={order.id} className="d-flex justify-content-between align-items-center p-3 border-bottom">
                <div>
                  <span className="fw-bold me-2">#{String(order.tokenNumber).padStart(3, '0')}</span>
                  <span className="text-muted small">{order.items.length} items · ₹{order.totalAmount.toFixed(0)}</span>
                </div>
                <StatusBadge status={order.status} />
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="row g-3">
        <div className="col-md-4">
          <Link to="/student/menu" className="card card-glass p-4 text-center text-decoration-none quick-link-card">
            <span style={{ fontSize: '2rem' }}>🍛</span>
            <h6 className="fw-bold mt-2 mb-1 text-dark">Browse Menu</h6>
            <small className="text-muted">Explore our delicious items</small>
          </Link>
        </div>
        <div className="col-md-4">
          <Link to="/student/cart" className="card card-glass p-4 text-center text-decoration-none quick-link-card">
            <span style={{ fontSize: '2rem' }}>🛒</span>
            <h6 className="fw-bold mt-2 mb-1 text-dark">View Cart</h6>
            <small className="text-muted">Check your cart items</small>
          </Link>
        </div>
        <div className="col-md-4">
          <Link to="/student/orders" className="card card-glass p-4 text-center text-decoration-none quick-link-card">
            <span style={{ fontSize: '2rem' }}>📋</span>
            <h6 className="fw-bold mt-2 mb-1 text-dark">Order History</h6>
            <small className="text-muted">Track past orders</small>
          </Link>
        </div>
      </div>
    </div>
  );
}
