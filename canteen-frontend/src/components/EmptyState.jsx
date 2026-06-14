import { FiShoppingBag, FiCoffee, FiInbox } from 'react-icons/fi';

const icons = {
  cart: FiShoppingBag,
  menu: FiCoffee,
  default: FiInbox
};

export default function EmptyState({ type = 'default', title, message, action, onAction }) {
  const Icon = icons[type] || icons.default;

  return (
    <div className="text-center py-5">
      <div className="mb-4" style={{ opacity: 0.3 }}>
        <Icon size={80} color="#FF6B35" />
      </div>
      <h5 className="fw-semibold text-secondary">{title || 'Nothing here yet'}</h5>
      <p className="text-muted mb-4">{message || 'Check back later!'}</p>
      {action && (
        <button className="btn btn-primary-orange btn-pill" onClick={onAction}>
          {action}
        </button>
      )}
    </div>
  );
}
