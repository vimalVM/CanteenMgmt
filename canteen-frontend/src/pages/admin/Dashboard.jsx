import { useState, useEffect } from 'react';
import API from '../../api/axios';
import StatusBadge from '../../components/StatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';
import { toast } from 'react-toastify';
import { FiDollarSign, FiShoppingBag, FiClock, FiCoffee } from 'react-icons/fi';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function AdminDashboard() {
  const [stats, setStats] = useState({});
  const [orders, setOrders] = useState([]);
  const [hourlyData, setHourlyData] = useState([]);
  const [menuCount, setMenuCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchData = () => {
    Promise.all([
      API.get('/orders/today/stats'),
      API.get('/orders'),
      API.get('/reports/hourly'),
      API.get('/menu')
    ]).then(([statsRes, ordersRes, hourlyRes, menuRes]) => {
      setStats(statsRes.data);
      setOrders(ordersRes.data);
      setHourlyData(hourlyRes.data);
      setMenuCount(menuRes.data.filter(i => i.available).length);
      setLoading(false);
    }).catch(() => setLoading(false));
  };

  useEffect(() => { fetchData(); const interval = setInterval(fetchData, 15000); return () => clearInterval(interval); }, []);

  const quickUpdate = async (orderId, status) => {
    try {
      await API.patch(`/orders/${orderId}/status`, { status });
      toast.success(`Order updated to ${status}`);
      fetchData();
    } catch (err) { toast.error('Failed to update order'); }
  };

  if (loading) return <LoadingSpinner />;

  const pendingOrders = orders.filter(o => ['PENDING', 'CONFIRMED', 'PREPARING', 'READY'].includes(o.status));

  return (
    <div className="container py-4">
      <h4 className="fw-bold mb-4">📊 Admin Dashboard</h4>

      <div className="row g-3 mb-4">
        {[
          { icon: <FiDollarSign />, label: "Today's Revenue", value: `₹${(stats.revenue || 0).toFixed(0)}`, color: '#27AE60' },
          { icon: <FiShoppingBag />, label: 'Orders Today', value: stats.totalOrders || 0, color: '#0D6EFD' },
          { icon: <FiClock />, label: 'Pending Orders', value: stats.pendingOrders || 0, color: '#FFC107' },
          { icon: <FiCoffee />, label: 'Active Menu Items', value: menuCount, color: '#FF6B35' }
        ].map((s, i) => (
          <div key={i} className="col-md-3 col-6">
            <div className="card card-glass p-3 text-center h-100">
              <div className="mx-auto mb-2" style={{ color: s.color, fontSize: '1.5rem' }}>{s.icon}</div>
              <h3 className="fw-bold mb-0">{s.value}</h3>
              <small className="text-muted">{s.label}</small>
            </div>
          </div>
        ))}
      </div>

      <div className="row g-4 mb-4">
        <div className="col-lg-8">
          <div className="card card-glass">
            <div className="card-header bg-transparent"><h5 className="fw-bold mb-0">Live Orders</h5></div>
            <div className="card-body p-0" style={{ maxHeight: 400, overflowY: 'auto' }}>
              {pendingOrders.length === 0 ? (
                <p className="text-center text-muted py-4">No active orders</p>
              ) : (
                <table className="table table-hover mb-0">
                  <thead className="table-light"><tr><th>Token</th><th>Student</th><th>Items</th><th>Total</th><th>Status</th><th>Actions</th></tr></thead>
                  <tbody>
                    {pendingOrders.slice(0, 15).map(order => (
                      <tr key={order.id}>
                        <td className="fw-bold" style={{ color: '#FF6B35' }}>#{String(order.tokenNumber).padStart(3, '0')}</td>
                        <td>{order.studentName}</td>
                        <td>{order.items.length} items</td>
                        <td>₹{order.totalAmount.toFixed(0)}</td>
                        <td><StatusBadge status={order.status} /></td>
                        <td>
                          {order.status === 'PENDING' && <button className="btn btn-sm btn-outline-primary me-1" onClick={() => quickUpdate(order.id, 'CONFIRMED')}>Confirm</button>}
                          {order.status === 'CONFIRMED' && <button className="btn btn-sm btn-outline-warning me-1" onClick={() => quickUpdate(order.id, 'PREPARING')}>Prepare</button>}
                          {order.status === 'PREPARING' && <button className="btn btn-sm btn-outline-success me-1" onClick={() => quickUpdate(order.id, 'READY')}>Ready</button>}
                          {order.status === 'READY' && <button className="btn btn-sm btn-success me-1" onClick={() => quickUpdate(order.id, 'DELIVERED')}>Deliver</button>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
        <div className="col-lg-4">
          <div className="card card-glass p-3">
            <h6 className="fw-bold mb-3">Orders by Hour (Today)</h6>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={hourlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="orders" fill="#FF6B35" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
