import { useState, useEffect } from 'react';
import API from '../../api/axios';
import LoadingSpinner from '../../components/LoadingSpinner';
import { toast } from 'react-toastify';
import { FiPlus, FiEdit2, FiTrash2, FiSearch } from 'react-icons/fi';

export default function MenuManagement() {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showCatModal, setShowCatModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [editingCat, setEditingCat] = useState(null);
  const [form, setForm] = useState({ name: '', description: '', price: '', category: '', imageUrl: '', preparationTime: '', calories: '', isVeg: true, available: true, isDailySpecial: false });
  const [catForm, setCatForm] = useState({ name: '', description: '', displayOrder: 0, iconUrl: '' });

  const fetchData = () => {
    Promise.all([API.get('/menu'), API.get('/categories')])
      .then(([menuRes, catRes]) => { setItems(menuRes.data); setCategories(catRes.data); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, []);

  const update = (f) => (e) => setForm({ ...form, [f]: e.target.type === 'checkbox' ? e.target.checked : e.target.value });

  const openAdd = () => { setEditing(null); setForm({ name: '', description: '', price: '', category: categories[0]?.name || '', imageUrl: '', preparationTime: '15', calories: '', isVeg: true, available: true, isDailySpecial: false }); setShowModal(true); };
  const openEdit = (item) => { setEditing(item); setForm({ name: item.name, description: item.description, price: item.price, category: item.category, imageUrl: item.imageUrl, preparationTime: item.preparationTime, calories: item.calories, isVeg: item.veg, available: item.available, isDailySpecial: item.dailySpecial }); setShowModal(true); };

  const handleSave = async () => {
    const payload = { ...form, price: parseFloat(form.price), preparationTime: parseInt(form.preparationTime), calories: parseInt(form.calories) || 0 };
    try {
      if (editing) { await API.put(`/menu/${editing.id}`, payload); toast.success('Item updated'); }
      else { await API.post('/menu', payload); toast.success('Item created'); }
      setShowModal(false); fetchData();
    } catch (err) { toast.error('Failed to save item'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this item?')) return;
    try { await API.delete(`/menu/${id}`); toast.success('Item deleted'); fetchData(); }
    catch (err) { toast.error('Failed to delete'); }
  };

  const handleToggle = async (id) => {
    try { await API.patch(`/menu/${id}/toggle`); fetchData(); }
    catch (err) { toast.error('Failed to toggle'); }
  };

  const handleSaveCat = async () => {
    try {
      if (editingCat) { await API.put(`/categories/${editingCat.id}`, catForm); toast.success('Category updated'); }
      else { await API.post('/categories', catForm); toast.success('Category created'); }
      setShowCatModal(false); fetchData();
    } catch (err) { toast.error(err.response?.data?.error || 'Failed to save category'); }
  };

  const handleDeleteCat = async (id) => {
    if (!confirm('Delete this category?')) return;
    try { await API.delete(`/categories/${id}`); toast.success('Category deleted'); fetchData(); }
    catch (err) { toast.error('Failed to delete'); }
  };

  const filtered = items.filter(i => !search || i.name.toLowerCase().includes(search.toLowerCase()));

  if (loading) return <LoadingSpinner />;

  return (
    <div className="container py-4">
      <h4 className="fw-bold mb-4">🍽️ Menu Management</h4>

      <div className="card card-glass mb-4">
        <div className="card-header bg-transparent d-flex justify-content-between align-items-center">
          <h5 className="fw-bold mb-0">Categories</h5>
          <button className="btn btn-sm btn-primary-orange btn-pill" onClick={() => { setEditingCat(null); setCatForm({ name: '', description: '', displayOrder: 0, iconUrl: '' }); setShowCatModal(true); }}>
            <FiPlus className="me-1" />Add Category
          </button>
        </div>
        <div className="card-body">
          <div className="d-flex flex-wrap gap-2">
            {categories.map(cat => (
              <div key={cat.id} className="badge bg-light text-dark p-2 d-flex align-items-center gap-2" style={{ fontSize: '0.9rem' }}>
                {cat.iconUrl} {cat.name}
                <FiEdit2 size={12} className="text-primary" style={{ cursor: 'pointer' }} onClick={() => { setEditingCat(cat); setCatForm({ name: cat.name, description: cat.description, displayOrder: cat.displayOrder, iconUrl: cat.iconUrl }); setShowCatModal(true); }} />
                <FiTrash2 size={12} className="text-danger" style={{ cursor: 'pointer' }} onClick={() => handleDeleteCat(cat.id)} />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card card-glass">
        <div className="card-header bg-transparent d-flex justify-content-between align-items-center flex-wrap gap-2">
          <h5 className="fw-bold mb-0">Menu Items ({items.length})</h5>
          <div className="d-flex gap-2">
            <div className="input-group" style={{ maxWidth: 250 }}>
              <span className="input-group-text bg-white"><FiSearch size={14} /></span>
              <input type="text" className="form-control form-control-sm" placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <button className="btn btn-sm btn-primary-orange btn-pill" onClick={openAdd}><FiPlus className="me-1" />Add Item</button>
          </div>
        </div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead className="table-light"><tr><th></th><th>Name</th><th>Category</th><th>Price</th><th>Type</th><th>Available</th><th>Actions</th></tr></thead>
              <tbody>
                {filtered.map(item => (
                  <tr key={item.id}>
                    <td><img src={item.imageUrl} alt="" style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 8 }} onError={e => { e.target.src = 'https://via.placeholder.com/40'; }} /></td>
                    <td className="fw-semibold">{item.name}{item.dailySpecial && <span className="badge ms-1" style={{ background: '#FF6B35', fontSize: '0.6rem' }}>Special</span>}</td>
                    <td><span className="text-muted small">{item.category}</span></td>
                    <td>₹{item.price}</td>
                    <td><span style={{ color: item.veg ? '#27AE60' : '#DC3545' }}>{item.veg ? '🟢' : '🔴'}</span></td>
                    <td>
                      <div className="form-check form-switch mb-0">
                        <input className="form-check-input" type="checkbox" checked={item.available} onChange={() => handleToggle(item.id)} />
                      </div>
                    </td>
                    <td>
                      <button className="btn btn-sm btn-outline-primary me-1" onClick={() => openEdit(item)}><FiEdit2 size={14} /></button>
                      <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(item.id)}><FiTrash2 size={14} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="modal d-block" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content card-glass">
              <div className="modal-header border-0"><h5 className="fw-bold">{editing ? 'Edit Item' : 'Add New Item'}</h5><button className="btn-close" onClick={() => setShowModal(false)}></button></div>
              <div className="modal-body">
                <div className="row g-3">
                  <div className="col-md-6"><label className="form-label fw-semibold">Name</label><input className="form-control" value={form.name} onChange={update('name')} /></div>
                  <div className="col-md-6"><label className="form-label fw-semibold">Category</label>
                    <select className="form-select" value={form.category} onChange={update('category')}>{categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}</select>
                  </div>
                  <div className="col-12"><label className="form-label fw-semibold">Description</label><textarea className="form-control" rows={2} value={form.description} onChange={update('description')} /></div>
                  <div className="col-md-4"><label className="form-label fw-semibold">Price (₹)</label><input type="number" className="form-control" value={form.price} onChange={update('price')} /></div>
                  <div className="col-md-4"><label className="form-label fw-semibold">Prep Time (min)</label><input type="number" className="form-control" value={form.preparationTime} onChange={update('preparationTime')} /></div>
                  <div className="col-md-4"><label className="form-label fw-semibold">Calories</label><input type="number" className="form-control" value={form.calories} onChange={update('calories')} /></div>
                  <div className="col-12"><label className="form-label fw-semibold">Image URL</label><input className="form-control" value={form.imageUrl} onChange={update('imageUrl')} /></div>
                  {form.imageUrl && <div className="col-12"><img src={form.imageUrl} alt="Preview" style={{ height: 100, objectFit: 'cover', borderRadius: 8 }} /></div>}
                  <div className="col-md-4"><div className="form-check"><input className="form-check-input" type="checkbox" checked={form.isVeg} onChange={update('isVeg')} id="vegCheck" /><label className="form-check-label" htmlFor="vegCheck">Vegetarian</label></div></div>
                  <div className="col-md-4"><div className="form-check"><input className="form-check-input" type="checkbox" checked={form.available} onChange={update('available')} id="availCheck" /><label className="form-check-label" htmlFor="availCheck">Available</label></div></div>
                  <div className="col-md-4"><div className="form-check"><input className="form-check-input" type="checkbox" checked={form.isDailySpecial} onChange={update('isDailySpecial')} id="specialCheck" /><label className="form-check-label" htmlFor="specialCheck">Daily Special</label></div></div>
                </div>
              </div>
              <div className="modal-footer border-0"><button className="btn btn-outline-secondary btn-pill" onClick={() => setShowModal(false)}>Cancel</button><button className="btn btn-primary-orange btn-pill" onClick={handleSave}>Save</button></div>
            </div>
          </div>
        </div>
      )}

      {showCatModal && (
        <div className="modal d-block" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content card-glass">
              <div className="modal-header border-0"><h5 className="fw-bold">{editingCat ? 'Edit Category' : 'Add Category'}</h5><button className="btn-close" onClick={() => setShowCatModal(false)}></button></div>
              <div className="modal-body">
                <div className="mb-3"><label className="form-label fw-semibold">Name</label><input className="form-control" value={catForm.name} onChange={e => setCatForm({ ...catForm, name: e.target.value })} /></div>
                <div className="mb-3"><label className="form-label fw-semibold">Description</label><input className="form-control" value={catForm.description} onChange={e => setCatForm({ ...catForm, description: e.target.value })} /></div>
                <div className="mb-3"><label className="form-label fw-semibold">Display Order</label><input type="number" className="form-control" value={catForm.displayOrder} onChange={e => setCatForm({ ...catForm, displayOrder: parseInt(e.target.value) })} /></div>
                <div className="mb-3"><label className="form-label fw-semibold">Icon (emoji)</label><input className="form-control" value={catForm.iconUrl} onChange={e => setCatForm({ ...catForm, iconUrl: e.target.value })} /></div>
              </div>
              <div className="modal-footer border-0"><button className="btn btn-outline-secondary btn-pill" onClick={() => setShowCatModal(false)}>Cancel</button><button className="btn btn-primary-orange btn-pill" onClick={handleSaveCat}>Save</button></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
