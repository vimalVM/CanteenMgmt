export default function StatusBadge({ status }) {
  const colors = {
    PENDING: { bg: '#FFF3CD', color: '#856404', border: '#FFC107' },
    CONFIRMED: { bg: '#CFE2FF', color: '#084298', border: '#0D6EFD' },
    PREPARING: { bg: '#FFE5D0', color: '#984C0C', border: '#FF6B35' },
    READY: { bg: '#D1E7DD', color: '#0F5132', border: '#198754' },
    DELIVERED: { bg: '#E2E3E5', color: '#41464B', border: '#6C757D' },
    CANCELLED: { bg: '#F8D7DA', color: '#842029', border: '#DC3545' }
  };

  const style = colors[status] || colors.PENDING;

  return (
    <span className="badge" style={{
      backgroundColor: style.bg,
      color: style.color,
      border: `1px solid ${style.border}`,
      fontWeight: 600,
      fontSize: '0.75rem',
      padding: '0.35em 0.75em',
      borderRadius: '50px'
    }}>
      {status}
    </span>
  );
}
