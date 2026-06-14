import { useState, useEffect } from 'react';
import API from '../../api/axios';
import StatusBadge from '../../components/StatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';
import { toast } from 'react-toastify';
import { FiDownload } from 'react-icons/fi';

const STATUSES = ['PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'DELIVERED'];
const STATUS_COLORS = { PENDING: '#FFC107', CONFIRMED: '#0D6EFD', PREPARING: '#FF6B35', READY: '#198754', DELIVERED: '#6C757D' };

export default function OrderManagement() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterDate, setFilterDate] = useState('');
  const [filterPayment, setFilterPayment] = useState('');
  const [selected, setSelected] = useState(null);

  const fetchOrders = () => {
    API.get('/orders').then(res => { setOrders(res.data); setLoading(false); }).catch(() => setLoading(false));
  };

  useEffect(() => { fetchOrders(); }, []);

  const updateStatus = async (orderId, status) => {
    try {
      await API.patch(`/orders/${orderId}/status`, { status });
      toast.success(`Order updated to ${status}`);
      fetchOrders();
      if (selected?.id === orderId) setSelected(null);
    } catch (err) { toast.error('Failed to update'); }
  };

  const filtered = orders.filter(o => {
    if (filterDate) { const d = new Date(o.orderTime).toISOString().split('T')[0]; if (d !== filterDate) return false; }
    if (filterPayment && o.paymentMode !== filterPayment) return false;
    return true;
  });

  const byStatus = {};
  STATUSES.forEach(s => { byStatus[s] = filtered.filter(o => o.status === s); });

  const exportCSV = () => {
    const header = 'Token,Student,Items,Total,Status,Payment,Date\n';
    const rows = filtered.map(o =>
      `${o.tokenNumber},${o.studentName},${o.items.length},${o.totalAmount.toFixed(0)},${o.status},${o.paymentMode},${new Date(o.orderTime).toLocaleString()}`
    ).join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'orders.csv'; a.click();
    URL.revokeObjectURL(url);
    toast.success('CSV exported!');
  };

  if (loading) return <LoadingSpinner />;

  const elapsed = (time) => {
    const diff = Math.floor((Date.now() - new Date(time).getTime()) / 60000);
    if (diff < 1) return 'Just now';
    if (diff < 60) return `${diff}m ago`;
    return `${Math.floor(diff / 60)}h ${diff % 60}m ago`;
  };

  return (
    <div className="container-fluid py-4 px-4">
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <h4 className="fw-bold mb-0">📦 Order Management</h4>
        <div className="d-flex gap-2 align-items-center">
          <input type="date" className="form-control form-control-sm" value={filterDate} onChange={e => setFilterDate(e.target.value)} style={{ width: 160 }} />
          <select className="form-select form-select-sm" value={filterPayment} onChange={e => setFilterPayment(e.target.value)} style={{ width: 120 }}>
            <option value="">All Payment</option>
            <option value="CASH">Cash</option>
            <option value="UPI">UPI</option>
            <option value="CARD">Card</option>
          </select>
          <button className="btn btn-sm btn-outline-secondary btn-pill" onClick={exportCSV}><FiDownload className="me-1" />CSV</button>
        </div>
      </div>

      <div className="row g-3">
        {STATUSES.map(status => (
          <div key={status} className="col">
            <div className="card card-glass h-100">
              <div className="card-header bg-transparent d-flex justify-content-between align-items-center py-2">
                <div className="d-flex align-items-center gap-2">
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: STATUS_COLORS[status] }}></div>
                  <span className="fw-bold small">{status}</span>
                </div>
                <span className="badge bg-light text-dark">{byStatus[status]?.length || 0}</span>
              </div>
              <div className="card-body p-2" style={{ maxHeight: 500, overflowY: 'auto' }}>
                {(byStatus[status] || []).map(order => (
                  <div key={order.id} className="card mb-2 border-0 shadow-sm" style={{ cursor: 'pointer' }} onClick={() => setSelected(order)}>
                    <div className="card-body p-2">
                      <div className="d-flex justify-content-between align-items-center mb-1">
                        <span className="fw-bold" style={{ color: '#FF6B35' }}>#{String(order.tokenNumber).padStart(3, '0')}</span>
                        <span className="text-muted" style={{ fontSize: '0.65rem' }}>{elapsed(order.orderTime)}</span>
                      </div>
                      <p className="mb-1 small fw-semibold">{order.studentName}</p>
                      <p className="mb-1 text-muted" style={{ fontSize: '0.7rem' }}>{order.items.map(i => `${i.menuItemName} x${i.quantity}`).join(', ')}</p>
                      <div className="d-flex justify-content-between align-items-center">
                        <span className="fw-bold small">₹{order.totalAmount.toFixed(0)}</span>
                        {status !== 'DELIVERED' && (
                          <select className="form-select form-select-sm" style={{ width: 'auto', fontSize: '0.7rem' }}
                            value={order.status} onChange={e => { e.stopPropagation(); updateStatus(order.id, e.target.value); }}>
                            {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                            <option value="CANCELLED">CANCELLED</option>
                          </select>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {selected && (
        <div className="modal d-block" style={{ background: 'rgba(0,0,0,0.5)' }} onClick={() => setSelected(null)}>
          <div className="modal-dialog modal-dialog-centered" onClick={e => e.stopPropagation()}>
            <div className="modal-content card-glass">
              <div className="modal-header border-0">
                <h5 className="fw-bold">Order #{String(selected.tokenNumber).padStart(3, '0')}</h5>
                <button className="btn-close" onClick={() => setSelected(null)}></button>
              </div>
              <div className="modal-body">
                <p><strong>Student:</strong> {selected.studentName} ({selected.studentEmail})</p>
                <p><strong>Payment:</strong> {selected.paymentMode} | <strong>Status:</strong> <StatusBadge status={selected.status} /></p>
                <h6 className="fw-bold mt-3">Items</h6>
                {selected.items.map((item, i) => (
                  <div key={i} className="d-flex justify-content-between py-1 border-bottom">
                    <span>{item.menuItemName} x{item.quantity}</span>
                    <span>₹{item.subtotal.toFixed(0)}</span>
                  </div>
                ))}
                <div className="d-flex justify-content-between mt-2"><strong>Total</strong><strong style={{ color: '#FF6B35' }}>₹{selected.totalAmount.toFixed(0)}</strong></div>
                {selected.specialInstructions && <p className="mt-2 text-muted small">📝 {selected.specialInstructions}</p>}
                {selected.status !== 'DELIVERED' && selected.status !== 'CANCELLED' && (
                  <div className="mt-3 d-flex gap-2 flex-wrap">
                    {STATUSES.filter(s => STATUSES.indexOf(s) > STATUSES.indexOf(selected.status)).map(s => (
                      <button key={s} className="btn btn-sm btn-outline-primary btn-pill" onClick={() => updateStatus(selected.id, s)}>{s}</button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
