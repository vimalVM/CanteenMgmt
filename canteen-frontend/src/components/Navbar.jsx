import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { FiShoppingCart, FiLogOut, FiUser, FiMenu } from 'react-icons/fi';
import { useState } from 'react';

export default function Navbar() {
  const { user, logout, isAuthenticated, isAdmin, isStudent } = useAuth();
  const cart = useCart();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(true);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!isAuthenticated) return null;

  return (
    <nav className="navbar navbar-expand-lg navbar-dark sticky-top" style={{ background: '#2C3E50' }}>
      <div className="container">
        <Link className="navbar-brand d-flex align-items-center gap-2" to={isAdmin ? '/admin/dashboard' : '/student/dashboard'}>
          <span style={{ fontSize: '1.5rem' }}>🍽️</span>
          <span className="fw-bold" style={{ color: '#FF6B35' }}>Campus Canteen</span>
        </Link>

        <button className="navbar-toggler border-0" onClick={() => setCollapsed(!collapsed)}>
          <FiMenu size={24} />
        </button>

        <div className={`collapse navbar-collapse ${collapsed ? '' : 'show'}`}>
          <ul className="navbar-nav ms-auto align-items-lg-center gap-lg-1">
            {isStudent && (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/student/dashboard">Dashboard</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/student/menu">Menu</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/student/orders">My Orders</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/student/profile">Profile</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link position-relative" to="/student/cart">
                    <FiShoppingCart size={20} />
                    {cart && cart.itemCount > 0 && (
                      <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill" style={{ background: '#FF6B35', fontSize: '0.65rem' }}>
                        {cart.itemCount}
                      </span>
                    )}
                  </Link>
                </li>
              </>
            )}
            {isAdmin && (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/admin/dashboard">Dashboard</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/admin/menu">Menu</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/admin/orders">Orders</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/admin/students">Students</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/admin/reports">Reports</Link>
                </li>
              </>
            )}
            <li className="nav-item dropdown">
              <a className="nav-link dropdown-toggle d-flex align-items-center gap-1" href="#" data-bs-toggle="dropdown">
                <FiUser size={18} />
                <span className="d-none d-lg-inline">{user?.name?.split(' ')[0]}</span>
              </a>
              <ul className="dropdown-menu dropdown-menu-end">
                <li><span className="dropdown-item-text text-muted small">{user?.email}</span></li>
                <li><hr className="dropdown-divider" /></li>
                <li><button className="dropdown-item text-danger" onClick={handleLogout}><FiLogOut className="me-2" />Logout</button></li>
              </ul>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}
