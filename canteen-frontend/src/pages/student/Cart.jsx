import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import EmptyState from '../../components/EmptyState';
import { toast } from 'react-toastify';
import API from '../../api/axios';
import { FiPlus, FiMinus, FiTrash2, FiShoppingBag } from 'react-icons/fi';

export default function Cart() {
  const { items, itemCount, totalAmount, updateQty, removeItem, clearCart, fetchCart } = useCart();
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [paymentMode, setPaymentMode] = useState('CASH');
  const [submitting, setSubmitting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [orderResult, setOrderResult] = useState(null);
  const navigate = useNavigate();

  const tax = totalAmount * 0.05;
  const grandTotal = totalAmount + tax;

  const handlePlaceOrder = async () => {
    setSubmitting(true);
    try {
      const res = await API.post('/orders', { specialInstructions, paymentMode });
      setOrderResult(res.data);
      setShowConfirm(false);
      await fetchCart();
      toast.success('Order placed successfully!');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to place order');
    } finally {
      setSubmitting(false);
    }
  };

  if (orderResult) {
    return (
      <div className="container py-5">
        <div className="card card-glass mx-auto p-5 text-center" style={{ maxWidth: 500 }}>
          <span style={{ fontSize: '4rem' }}>🎉</span>
          <h3 className="fw-bold mt-3" style={{ color: '#27AE60' }}>Order Placed!</h3>
          <div className="display-4 fw-bold my-3" style={{ color: '#FF6B35' }}>
            #{String(orderResult.tokenNumber).padStart(3, '0')}
          </div>
          <p className="text-muted">Your token number</p>
          <p className="mb-1">Total: <strong>₹{orderResult.totalAmount.toFixed(0)}</strong></p>
          <p className="text-muted small mb-4">
            Estimated delivery: {new Date(orderResult.estimatedDeliveryTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
          <div className="d-flex gap-2 justify-content-center">
            <button className="btn btn-primary-orange btn-pill" onClick={() => navigate('/student/orders')}>Track Order</button>
            <button className="btn btn-outline-secondary btn-pill" onClick={() => navigate('/student/menu')}>Order More</button>
          </div>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container py-5">
        <EmptyState type="cart" title="Your cart is empty" message="Add some delicious items from our menu!" action="Browse Menu" onAction={() => navigate('/student/menu')} />
      </div>
    );
  }

  return (
    <div className="container py-4">
      <h4 className="fw-bold mb-4">🛒 Your Cart ({itemCount} items)</h4>
      <div className="row g-4">
        <div className="col-lg-8">
          {items.map(item => (
            <div key={item.menuItemId} className="card card-glass mb-3">
              <div className="card-body d-flex align-items-center gap-3">
                <img src={item.imageUrl} alt={item.menuItemName} className="rounded-3"
                  style={{ width: 80, height: 80, objectFit: 'cover' }}
                  onError={e => { e.target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100'; }} />
                <div className="flex-grow-1">
                  <div className="d-flex align-items-center gap-1">
                    <span style={{ fontSize: '0.6rem', color: item.isVeg ? '#27AE60' : '#DC3545' }}>●</span>
                    <h6 className="fw-bold mb-0">{item.menuItemName}</h6>
                  </div>
                  <span className="text-muted">₹{item.price} each</span>
                </div>
                <div className="d-flex align-items-center gap-2">
                  <button className="btn btn-sm btn-outline-secondary rounded-circle p-0" style={{ width: 34, height: 34 }}
                    onClick={() => updateQty(item.menuItemId, item.quantity - 1)}><FiMinus /></button>
                  <span className="fw-bold" style={{ minWidth: 24, textAlign: 'center' }}>{item.quantity}</span>
                  <button className="btn btn-sm btn-outline-secondary rounded-circle p-0" style={{ width: 34, height: 34 }}
                    onClick={() => updateQty(item.menuItemId, item.quantity + 1)}><FiPlus /></button>
                </div>
                <span className="fw-bold" style={{ minWidth: 60, textAlign: 'right' }}>₹{(item.price * item.quantity).toFixed(0)}</span>
                <button className="btn btn-sm text-danger" onClick={() => removeItem(item.menuItemId)}><FiTrash2 /></button>
              </div>
            </div>
          ))}
          <div className="mb-3">
            <label className="form-label fw-semibold">Special Instructions</label>
            <textarea className="form-control" rows={2} placeholder="Any special requests? (e.g., less spicy, no onions)"
              value={specialInstructions} onChange={e => setSpecialInstructions(e.target.value)} />
          </div>
        </div>
        <div className="col-lg-4">
          <div className="card card-glass p-4 sticky-top" style={{ top: 80 }}>
            <h5 className="fw-bold mb-3">Order Summary</h5>
            <div className="d-flex justify-content-between mb-2"><span className="text-muted">Subtotal</span><span>₹{totalAmount.toFixed(0)}</span></div>
            <div className="d-flex justify-content-between mb-2"><span className="text-muted">Tax (5%)</span><span>₹{tax.toFixed(0)}</span></div>
            <hr />
            <div className="d-flex justify-content-between mb-4"><span className="fw-bold fs-5">Total</span><span className="fw-bold fs-5" style={{ color: '#FF6B35' }}>₹{grandTotal.toFixed(0)}</span></div>
            <div className="mb-4">
              <label className="form-label fw-semibold">Payment Method</label>
              {['CASH', 'UPI', 'CARD'].map(mode => (
                <div key={mode} className="form-check">
                  <input className="form-check-input" type="radio" name="payment" id={mode} value={mode}
                    checked={paymentMode === mode} onChange={() => setPaymentMode(mode)} />
                  <label className="form-check-label" htmlFor={mode}>{mode === 'CASH' ? '💵 Cash' : mode === 'UPI' ? '📱 UPI' : '💳 Card'}</label>
                </div>
              ))}
            </div>
            <button className="btn btn-primary-orange btn-lg w-100 btn-pill" onClick={() => setShowConfirm(true)}>
              <FiShoppingBag className="me-2" /> Place Order
            </button>
          </div>
        </div>
      </div>

      {showConfirm && (
        <div className="modal d-block" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content card-glass">
              <div className="modal-header border-0"><h5 className="modal-title fw-bold">Confirm Order</h5>
                <button className="btn-close" onClick={() => setShowConfirm(false)}></button></div>
              <div className="modal-body">
                <p>You are about to place an order for <strong>{itemCount} items</strong> totaling <strong style={{ color: '#FF6B35' }}>₹{grandTotal.toFixed(0)}</strong>.</p>
                <p className="text-muted small">Payment: {paymentMode}</p>
              </div>
              <div className="modal-footer border-0">
                <button className="btn btn-outline-secondary btn-pill" onClick={() => setShowConfirm(false)}>Cancel</button>
                <button className="btn btn-primary-orange btn-pill" onClick={handlePlaceOrder} disabled={submitting}>
                  {submitting ? <span className="spinner-border spinner-border-sm me-2"></span> : null}
                  {submitting ? 'Placing...' : 'Confirm Order'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
