import { useState, useEffect } from 'react';
import API from '../../api/axios';
import LoadingSpinner from '../../components/LoadingSpinner';
import { FiSearch } from 'react-icons/fi';

export default function StudentManagement() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [studentOrders, setStudentOrders] = useState([]);

  useEffect(() => {
    API.get('/students').then(res => { setStudents(res.data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const handleSearch = (q) => {
    setSearch(q);
    API.get(`/students?search=${q}`).then(res => setStudents(res.data));
  };

  const viewStudent = async (student) => {
    try {
      const res = await API.get(`/students/${student.id}`);
      setSelected(res.data);
      setStudentOrders(res.data.orders || []);
    } catch (err) { console.error(err); }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="container py-4">
      <h4 className="fw-bold mb-4">👥 Student Management</h4>

      <div className="card card-glass">
        <div className="card-header bg-transparent d-flex justify-content-between align-items-center">
          <h5 className="fw-bold mb-0">Students ({students.length})</h5>
          <div className="input-group" style={{ maxWidth: 300 }}>
            <span className="input-group-text bg-white"><FiSearch size={14} /></span>
            <input type="text" className="form-control form-control-sm" placeholder="Search by name or reg number..."
              value={search} onChange={e => handleSearch(e.target.value)} />
          </div>
        </div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead className="table-light">
                <tr><th>Name</th><th>Email</th><th>Reg. Number</th><th>Phone</th><th>Joined</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {students.map(s => (
                  <tr key={s.id}>
                    <td className="fw-semibold">{s.name}</td>
                    <td className="text-muted small">{s.email}</td>
                    <td>{s.registrationNumber || '-'}</td>
                    <td>{s.phone || '-'}</td>
                    <td className="text-muted small">{new Date(s.createdAt).toLocaleDateString()}</td>
                    <td><button className="btn btn-sm btn-outline-primary btn-pill" onClick={() => viewStudent(s)}>View</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {selected && (
        <div className="modal d-block" style={{ background: 'rgba(0,0,0,0.5)' }} onClick={() => setSelected(null)}>
          <div className="modal-dialog modal-dialog-centered modal-lg" onClick={e => e.stopPropagation()}>
            <div className="modal-content card-glass">
              <div className="modal-header border-0">
                <h5 className="fw-bold">{selected.user?.name || 'Student'}</h5>
                <button className="btn-close" onClick={() => setSelected(null)}></button>
              </div>
              <div className="modal-body">
                <div className="row g-3 mb-3">
                  <div className="col-md-6"><strong>Email:</strong> {selected.user?.email}</div>
                  <div className="col-md-6"><strong>Phone:</strong> {selected.user?.phone || '-'}</div>
                  <div className="col-md-6"><strong>Reg Number:</strong> {selected.user?.registrationNumber || '-'}</div>
                  <div className="col-md-6"><strong>Total Orders:</strong> {selected.totalOrders}</div>
                  <div className="col-md-6"><strong>Total Spent:</strong> ₹{(selected.totalSpent || 0).toFixed(0)}</div>
                </div>
                <h6 className="fw-bold">Order History</h6>
                <div style={{ maxHeight: 300, overflowY: 'auto' }}>
                  <table className="table table-sm">
                    <thead><tr><th>Token</th><th>Date</th><th>Items</th><th>Total</th><th>Status</th></tr></thead>
                    <tbody>
                      {studentOrders.map(o => (
                        <tr key={o.id}>
                          <td className="fw-bold" style={{ color: '#FF6B35' }}>#{String(o.tokenNumber).padStart(3, '0')}</td>
                          <td className="small">{new Date(o.orderTime).toLocaleDateString()}</td>
                          <td>{o.items.length}</td>
                          <td>₹{o.totalAmount.toFixed(0)}</td>
                          <td><span className={`badge bg-${o.status === 'DELIVERED' ? 'success' : o.status === 'CANCELLED' ? 'danger' : 'warning'}`}>{o.status}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
