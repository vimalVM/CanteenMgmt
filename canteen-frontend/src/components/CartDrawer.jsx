import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import { FiX, FiPlus, FiMinus, FiTrash2 } from 'react-icons/fi';

export default function CartDrawer({ show, onClose }) {
  const { items, itemCount, totalAmount, updateQty, removeItem } = useCart();
  const navigate = useNavigate();

  const goToCart = () => {
    onClose();
    navigate('/student/cart');
  };

  return (
    <>
      {show && <div className="offcanvas-backdrop fade show" onClick={onClose}></div>}
      <div className={`offcanvas offcanvas-end ${show ? 'show' : ''}`} style={{ visibility: show ? 'visible' : 'hidden', width: '380px' }}>
        <div className="offcanvas-header" style={{ background: '#2C3E50' }}>
          <h5 className="offcanvas-title text-white">
            🛒 Cart ({itemCount} items)
          </h5>
          <button className="btn-close btn-close-white" onClick={onClose}></button>
        </div>
        <div className="offcanvas-body p-0 d-flex flex-column">
          {items.length === 0 ? (
            <div className="text-center py-5 text-muted">
              <p>Your cart is empty</p>
              <button className="btn btn-primary-orange btn-sm" onClick={() => { onClose(); navigate('/student/menu'); }}>
                Browse Menu
              </button>
            </div>
          ) : (
            <>
              <div className="flex-grow-1 overflow-auto p-3">
                {items.map((item) => (
                  <div key={item.menuItemId} className="d-flex align-items-center gap-2 mb-3 p-2 rounded-3" style={{ background: '#f8f9fa' }}>
                    <div className="flex-grow-1">
                      <div className="d-flex align-items-center gap-1">
                        <span style={{ fontSize: '0.6rem', color: item.isVeg ? '#27AE60' : '#DC3545' }}>●</span>
                        <span className="fw-semibold small">{item.menuItemName}</span>
                      </div>
                      <span className="text-muted small">₹{item.price}</span>
                    </div>
                    <div className="d-flex align-items-center gap-1">
                      <button className="btn btn-sm btn-outline-secondary rounded-circle p-0" style={{ width: 28, height: 28 }}
                        onClick={() => updateQty(item.menuItemId, item.quantity - 1)}>
                        <FiMinus size={12} />
                      </button>
                      <span className="fw-bold small" style={{ minWidth: 20, textAlign: 'center' }}>{item.quantity}</span>
                      <button className="btn btn-sm btn-outline-secondary rounded-circle p-0" style={{ width: 28, height: 28 }}
                        onClick={() => updateQty(item.menuItemId, item.quantity + 1)}>
                        <FiPlus size={12} />
                      </button>
                    </div>
                    <span className="fw-semibold small" style={{ minWidth: 50, textAlign: 'right' }}>₹{(item.price * item.quantity).toFixed(0)}</span>
                    <button className="btn btn-sm text-danger p-0" onClick={() => removeItem(item.menuItemId)}>
                      <FiTrash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
              <div className="p-3 border-top">
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-muted">Subtotal</span>
                  <span className="fw-bold">₹{totalAmount.toFixed(0)}</span>
                </div>
                <button className="btn btn-primary-orange w-100 btn-pill" onClick={goToCart}>
                  View Cart & Checkout
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
