import { useState, useEffect } from 'react';
import API from '../../api/axios';
import LoadingSpinner from '../../components/LoadingSpinner';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from 'recharts';
import { FiDownload } from 'react-icons/fi';

const COLORS = ['#FF6B35', '#2C3E50', '#27AE60', '#0D6EFD', '#FFC107', '#DC3545', '#6F42C1', '#20C997'];

export default function Reports() {
  const [loading, setLoading] = useState(true);
  const [weekly, setWeekly] = useState([]);
  const [hourly, setHourly] = useState([]);
  const [topItems, setTopItems] = useState([]);
  const [revenue, setRevenue] = useState({});
  const [dateFrom, setDateFrom] = useState(() => { const d = new Date(); d.setDate(d.getDate() - 30); return d.toISOString().split('T')[0]; });
  const [dateTo, setDateTo] = useState(() => new Date().toISOString().split('T')[0]);

  const fetchData = () => {
    setLoading(true);
    Promise.all([
      API.get('/reports/weekly'),
      API.get(`/reports/hourly`),
      API.get('/reports/top-items?limit=10'),
      API.get(`/reports/revenue?from=${dateFrom}&to=${dateTo}`)
    ]).then(([w, h, t, r]) => {
      setWeekly(w.data);
      setHourly(h.data);
      setTopItems(t.data);
      setRevenue(r.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, [dateFrom, dateTo]);

  const categoryData = topItems.reduce((acc, item) => {
    const existing = acc.find(a => a.name === item.category);
    if (existing) existing.value += item.totalOrders;
    else acc.push({ name: item.category, value: item.totalOrders });
    return acc;
  }, []);

  const handlePrint = () => window.print();

  if (loading) return <LoadingSpinner />;

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <h4 className="fw-bold mb-0">📈 Reports & Analytics</h4>
        <div className="d-flex gap-2 align-items-center">
          <input type="date" className="form-control form-control-sm" value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
          <span className="text-muted">to</span>
          <input type="date" className="form-control form-control-sm" value={dateTo} onChange={e => setDateTo(e.target.value)} />
          <button className="btn btn-sm btn-outline-secondary btn-pill" onClick={handlePrint}><FiDownload className="me-1" />Print</button>
        </div>
      </div>

      <div className="row g-3 mb-4">
        {[
          { label: 'Total Revenue', value: `₹${(revenue.totalRevenue || 0).toFixed(0)}`, color: '#27AE60' },
          { label: 'Total Orders', value: revenue.totalOrders || 0, color: '#0D6EFD' },
          { label: 'Avg Order Value', value: `₹${(revenue.averageOrderValue || 0).toFixed(0)}`, color: '#FF6B35' },
          { label: 'Top Category', value: categoryData.length > 0 ? categoryData.sort((a, b) => b.value - a.value)[0]?.name : '-', color: '#6F42C1' }
        ].map((s, i) => (
          <div key={i} className="col-md-3 col-6">
            <div className="card card-glass p-3 text-center">
              <h3 className="fw-bold mb-0" style={{ color: s.color }}>{s.value}</h3>
              <small className="text-muted">{s.label}</small>
            </div>
          </div>
        ))}
      </div>

      <div className="row g-4 mb-4">
        <div className="col-lg-8">
          <div className="card card-glass p-3">
            <h6 className="fw-bold mb-3">Revenue by Day (Last 7 Days)</h6>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={weekly}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={d => d ? new Date(d + 'T00:00').toLocaleDateString('en', { weekday: 'short' }) : ''} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v) => [`₹${v}`, 'Revenue']} />
                <Bar dataKey="revenue" fill="#FF6B35" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="col-lg-4">
          <div className="card card-glass p-3">
            <h6 className="fw-bold mb-3">Orders by Category</h6>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={categoryData} cx="50%" cy="50%" outerRadius={100} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                  {categoryData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="row g-4 mb-4">
        <div className="col-lg-6">
          <div className="card card-glass p-3">
            <h6 className="fw-bold mb-3">Orders by Hour (Today)</h6>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={hourly}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" tick={{ fontSize: 11 }} tickFormatter={h => `${h}:00`} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="orders" stroke="#FF6B35" strokeWidth={2} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="revenue" stroke="#27AE60" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="col-lg-6">
          <div className="card card-glass p-3">
            <h6 className="fw-bold mb-3">Top 10 Selling Items</h6>
            <div className="table-responsive" style={{ maxHeight: 250, overflowY: 'auto' }}>
              <table className="table table-sm mb-0">
                <thead className="table-light"><tr><th>#</th><th>Item</th><th>Sold</th><th>Revenue</th><th>Rating</th></tr></thead>
                <tbody>
                  {topItems.map((item, i) => (
                    <tr key={i}>
                      <td className="fw-bold">{i + 1}</td>
                      <td>{item.name}</td>
                      <td>{item.totalOrders}</td>
                      <td>₹{(item.revenue || 0).toFixed(0)}</td>
                      <td>{item.rating > 0 ? `⭐ ${item.rating}` : '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
