import { useState, useEffect } from 'react';
import API from '../../api/axios';
import { useCart } from '../../context/CartContext';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import { toast } from 'react-toastify';
import { FiSearch, FiClock, FiPlus, FiMinus, FiStar, FiZap } from 'react-icons/fi';

export default function Menu() {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [vegOnly, setVegOnly] = useState(false);
  const [availableOnly, setAvailableOnly] = useState(true);
  const { items: cartItems, addItem, updateQty } = useCart();

  useEffect(() => {
    Promise.all([API.get('/menu'), API.get('/categories')])
      .then(([menuRes, catRes]) => {
        setItems(menuRes.data);
        setCategories(catRes.data);
        setLoading(false);
      }).catch(() => setLoading(false));
  }, []);

  const getCartQty = (itemId) => {
    const ci = cartItems.find(c => c.menuItemId === itemId);
    return ci ? ci.quantity : 0;
  };

  const handleAdd = async (item) => {
    const ok = await addItem(item.id, 1);
    if (ok) toast.success(`${item.name} added to cart!`);
  };

  const filtered = items.filter(item => {
    if (activeCategory !== 'All' && item.category !== activeCategory) return false;
    if (vegOnly && !item.veg) return false;
    if (availableOnly && !item.available) return false;
    if (search) {
      const s = search.toLowerCase();
      return item.name.toLowerCase().includes(s) || item.description.toLowerCase().includes(s);
    }
    return true;
  });

  if (loading) return <LoadingSpinner text="Loading menu..." />;

  return (
    <div className="container py-4">
      <div className="mb-4">
        <div className="input-group input-group-lg">
          <span className="input-group-text bg-white border-end-0"><FiSearch /></span>
          <input type="text" className="form-control border-start-0 ps-0" placeholder="Search menu items..."
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      <div className="d-flex align-items-center gap-3 mb-3 flex-wrap">
        <div className="category-tabs d-flex gap-2 flex-grow-1 overflow-auto pb-1">
          <button className={`btn btn-sm btn-pill ${activeCategory === 'All' ? 'btn-primary-orange' : 'btn-outline-secondary'}`}
            onClick={() => setActiveCategory('All')}>All</button>
          {categories.map(cat => (
            <button key={cat.id} className={`btn btn-sm btn-pill ${activeCategory === cat.name ? 'btn-primary-orange' : 'btn-outline-secondary'}`}
              onClick={() => setActiveCategory(cat.name)}>
              {cat.iconUrl} {cat.name}
            </button>
          ))}
        </div>
        <div className="d-flex gap-2 align-items-center">
          <div className="form-check form-switch mb-0">
            <input className="form-check-input" type="checkbox" checked={vegOnly} onChange={e => setVegOnly(e.target.checked)} id="vegToggle" />
            <label className="form-check-label small fw-semibold" htmlFor="vegToggle" style={{ color: '#27AE60' }}>Veg Only</label>
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState type="menu" title="No items found" message="Try adjusting your search or filters" />
      ) : (
        <div className="row g-3">
          {filtered.map(item => {
            const qty = getCartQty(item.id);
            return (
              <div key={item.id} className="col-sm-6 col-lg-4 col-xl-3">
                <div className={`card card-glass h-100 menu-card ${item.dailySpecial ? 'daily-special' : ''}`}>
                  <div className="position-relative">
                    <img src={item.imageUrl} className="card-img-top" alt={item.name}
                      style={{ height: 180, objectFit: 'cover' }}
                      onError={e => { e.target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400'; }} />
                    <span className="position-absolute top-0 end-0 m-2" style={{ fontSize: '0.7rem', background: item.veg ? '#27AE60' : '#DC3545', color: 'white', padding: '2px 8px', borderRadius: 50 }}>
                      {item.veg ? '🟢 Veg' : '🔴 Non-Veg'}
                    </span>
                    {item.dailySpecial && (
                      <span className="position-absolute top-0 start-0 m-2 badge" style={{ background: '#FF6B35' }}>
                        <FiZap size={10} className="me-1" />Today's Special
                      </span>
                    )}
                    {!item.available && (
                      <div className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center" style={{ background: 'rgba(0,0,0,0.5)' }}>
                        <span className="badge bg-danger">Unavailable</span>
                      </div>
                    )}
                  </div>
                  <div className="card-body d-flex flex-column">
                    <h6 className="fw-bold mb-1">{item.name}</h6>
                    <p className="text-muted small mb-2 flex-grow-1" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {item.description}
                    </p>
                    <div className="d-flex align-items-center gap-2 mb-2">
                      {item.rating > 0 && (
                        <span className="d-flex align-items-center gap-1 small"><FiStar size={12} style={{ color: '#FFC107', fill: '#FFC107' }} /> {item.rating}</span>
                      )}
                      <span className="d-flex align-items-center gap-1 small text-muted"><FiClock size={12} /> {item.preparationTime}min</span>
                      <span className="small text-muted">🔥 {item.calories}cal</span>
                    </div>
                    <div className="d-flex justify-content-between align-items-center mt-auto">
                      <span className="fw-bold fs-5" style={{ color: '#FF6B35' }}>₹{item.price}</span>
                      {item.available && (
                        qty > 0 ? (
                          <div className="d-flex align-items-center gap-2">
                            <button className="btn btn-sm btn-outline-secondary rounded-circle p-0" style={{ width: 32, height: 32 }}
                              onClick={() => updateQty(item.id, qty - 1)}><FiMinus size={14} /></button>
                            <span className="fw-bold">{qty}</span>
                            <button className="btn btn-sm btn-primary-orange rounded-circle p-0" style={{ width: 32, height: 32 }}
                              onClick={() => updateQty(item.id, qty + 1)}><FiPlus size={14} /></button>
                          </div>
                        ) : (
                          <button className="btn btn-sm btn-primary-orange btn-pill" onClick={() => handleAdd(item)}>
                            <FiPlus size={14} className="me-1" />Add
                          </button>
                        )
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
