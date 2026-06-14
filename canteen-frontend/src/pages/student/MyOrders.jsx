import { useState, useEffect } from 'react';
import API from '../../api/axios';
import StatusBadge from '../../components/StatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { FiStar } from 'react-icons/fi';

const STATUS_STEPS = ['PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'DELIVERED'];

function StatusStepper({ status }) {
  const idx = STATUS_STEPS.indexOf(status);
  if (status === 'CANCELLED') return <span className="badge bg-danger">Cancelled</span>;
  return (
    <div className="d-flex align-items-center gap-1 my-2">
      {STATUS_STEPS.map((step, i) => (
        <div key={step} className="d-flex align-items-center">
          <div className="rounded-circle d-flex align-items-center justify-content-center"
            style={{ width: 24, height: 24, fontSize: '0.6rem', fontWeight: 700,
              background: i <= idx ? '#FF6B35' : '#dee2e6', color: i <= idx ? 'white' : '#6c757d',
              transition: 'all 0.3s' }}>
            {i < idx ? '✓' : i + 1}
          </div>
          {i < STATUS_STEPS.length - 1 && (
            <div style={{ width: 20, height: 2, background: i < idx ? '#FF6B35' : '#dee2e6', transition: 'all 0.3s' }} />
          )}
        </div>
      ))}
    </div>
  );
}

export default function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('active');
  const [selected, setSelected] = useState(null);
  const [rating, setRating] = useState(5);
  const [review, setReview] = useState('');
  const navigate = useNavigate();

  const fetchOrders = () => {
    API.get('/orders/my').then(res => { setOrders(res.data); setLoading(false); }).catch(() => setLoading(false));
  };

  useEffect(() => { fetchOrders(); const interval = setInterval(fetchOrders, 30000); return () => clearInterval(interval); }, []);

  const active = orders.filter(o => ['PENDING', 'CONFIRMED', 'PREPARING', 'READY'].includes(o.status));
  const past = orders.filter(o => ['DELIVERED', 'CANCELLED'].includes(o.status));
  const displayed = tab === 'active' ? active : past;

  const handleCancel = async (id) => {
    try { await API.patch(`/orders/my/${id}/cancel`); toast.success('Order cancelled'); fetchOrders(); setSelected(null); }
    catch (err) { toast.error(err.response?.data?.error || 'Cannot cancel'); }
  };

  const handleRate = async (id) => {
    try { await API.post(`/orders/${id}/rate`, { rating, review }); toast.success('Thanks for your review!'); fetchOrders(); setSelected(null); }
    catch (err) { toast.error(err.response?.data?.error || 'Rating failed'); }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="container py-4">
      <h4 className="fw-bold mb-4">📋 My Orders</h4>
      <ul className="nav nav-pills mb-4">
        <li className="nav-item"><button className={`nav-link ${tab === 'active' ? 'active' : ''}`} style={tab === 'active' ? { background: '#FF6B35' } : {}} onClick={() => setTab('active')}>Active ({active.length})</button></li>
        <li className="nav-item"><button className={`nav-link ${tab === 'past' ? 'active' : ''}`} style={tab === 'past' ? { background: '#FF6B35' } : {}} onClick={() => setTab('past')}>Past Orders ({past.length})</button></li>
      </ul>

      {displayed.length === 0 ? (
        <EmptyState title={tab === 'active' ? 'No active orders' : 'No past orders'} message={tab === 'active' ? 'Place an order from the menu!' : 'Your order history will appear here'} action={tab === 'active' ? 'Browse Menu' : undefined} onAction={() => navigate('/student/menu')} />
      ) : (
        displayed.map(order => (
          <div key={order.id} className="card card-glass mb-3 order-card" onClick={() => setSelected(order)}>
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <span className="fw-bold fs-5 me-2" style={{ color: '#FF6B35' }}>#{String(order.tokenNumber).padStart(3, '0')}</span>
                  <span className="text-muted small">{new Date(order.orderTime).toLocaleDateString()} {new Date(order.orderTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <StatusBadge status={order.status} />
              </div>
              <StatusStepper status={order.status} />
              <p className="text-muted small mb-1">{order.items.map(i => `${i.menuItemName} x${i.quantity}`).join(', ')}</p>
              <span className="fw-bold">₹{order.totalAmount.toFixed(0)}</span>
              <span className="text-muted small ms-2">{order.paymentMode}</span>
            </div>
          </div>
        ))
      )}

      {selected && (
        <div className="modal d-block" style={{ background: 'rgba(0,0,0,0.5)' }} onClick={() => setSelected(null)}>
          <div className="modal-dialog modal-dialog-centered modal-lg" onClick={e => e.stopPropagation()}>
            <div className="modal-content card-glass">
              <div className="modal-header border-0">
                <h5 className="fw-bold">Order #{String(selected.tokenNumber).padStart(3, '0')}</h5>
                <button className="btn-close" onClick={() => setSelected(null)}></button>
              </div>
              <div className="modal-body">
                <StatusStepper status={selected.status} />
                <div className="d-flex gap-1 mb-2 flex-wrap">{STATUS_STEPS.map(s => <small key={s} className="text-muted" style={{ flex: 1, textAlign: 'center', fontSize: '0.6rem' }}>{s}</small>)}</div>
                <hr />
                <h6 className="fw-bold">Items</h6>
                {selected.items.map((item, i) => (
                  <div key={i} className="d-flex justify-content-between py-1">
                    <span><span style={{ color: item.isVeg ? '#27AE60' : '#DC3545', fontSize: '0.6rem' }}>●</span> {item.menuItemName} x{item.quantity}</span>
                    <span>₹{item.subtotal.toFixed(0)}</span>
                  </div>
                ))}
                <hr />
                <div className="d-flex justify-content-between"><strong>Total</strong><strong style={{ color: '#FF6B35' }}>₹{selected.totalAmount.toFixed(0)}</strong></div>
                {selected.specialInstructions && <p className="text-muted small mt-2">📝 {selected.specialInstructions}</p>}

                {selected.status === 'PENDING' && (
                  <button className="btn btn-outline-danger btn-pill mt-3" onClick={() => handleCancel(selected.id)}>Cancel Order</button>
                )}

                {selected.status === 'DELIVERED' && selected.rating === 0 && (
                  <div className="mt-3 p-3 rounded-3" style={{ background: '#f8f9fa' }}>
                    <h6 className="fw-bold">Rate this order</h6>
                    <div className="d-flex gap-1 mb-2">
                      {[1, 2, 3, 4, 5].map(s => (
                        <FiStar key={s} size={24} onClick={() => setRating(s)} style={{ cursor: 'pointer', color: s <= rating ? '#FFC107' : '#dee2e6', fill: s <= rating ? '#FFC107' : 'none' }} />
                      ))}
                    </div>
                    <textarea className="form-control mb-2" rows={2} placeholder="Write a review (optional)" value={review} onChange={e => setReview(e.target.value)} />
                    <button className="btn btn-primary-orange btn-sm btn-pill" onClick={() => handleRate(selected.id)}>Submit Review</button>
                  </div>
                )}
                {selected.rating > 0 && <p className="mt-2">Your rating: {'⭐'.repeat(selected.rating)}</p>}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
