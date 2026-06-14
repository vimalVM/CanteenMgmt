export default function LoadingSpinner({ text = 'Loading...' }) {
  return (
    <div className="d-flex flex-column align-items-center justify-content-center py-5">
      <div className="spinner-border" style={{ color: '#FF6B35', width: '3rem', height: '3rem' }} role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
      <p className="mt-3 text-muted">{text}</p>
    </div>
  );
}
