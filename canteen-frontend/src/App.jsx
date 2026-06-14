import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css';

import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import StudentDashboard from './pages/student/Dashboard';
import Menu from './pages/student/Menu';
import Cart from './pages/student/Cart';
import MyOrders from './pages/student/MyOrders';
import Profile from './pages/student/Profile';
import AdminDashboard from './pages/admin/Dashboard';
import MenuManagement from './pages/admin/MenuManagement';
import OrderManagement from './pages/admin/OrderManagement';
import StudentManagement from './pages/admin/StudentManagement';
import Reports from './pages/admin/Reports';

function AppRoutes() {
  const { isAuthenticated, isAdmin } = useAuth();

  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/login" element={isAuthenticated ? <Navigate to={isAdmin ? '/admin/dashboard' : '/student/dashboard'} /> : <Login />} />
        <Route path="/register" element={<Register />} />

        {/* Student Routes */}
        <Route path="/student/dashboard" element={<ProtectedRoute role="STUDENT"><StudentDashboard /></ProtectedRoute>} />
        <Route path="/student/menu" element={<ProtectedRoute role="STUDENT"><Menu /></ProtectedRoute>} />
        <Route path="/student/cart" element={<ProtectedRoute role="STUDENT"><Cart /></ProtectedRoute>} />
        <Route path="/student/orders" element={<ProtectedRoute role="STUDENT"><MyOrders /></ProtectedRoute>} />
        <Route path="/student/profile" element={<ProtectedRoute role="STUDENT"><Profile /></ProtectedRoute>} />

        {/* Admin Routes */}
        <Route path="/admin/dashboard" element={<ProtectedRoute role="ADMIN"><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/menu" element={<ProtectedRoute role="ADMIN"><MenuManagement /></ProtectedRoute>} />
        <Route path="/admin/orders" element={<ProtectedRoute role="ADMIN"><OrderManagement /></ProtectedRoute>} />
        <Route path="/admin/students" element={<ProtectedRoute role="ADMIN"><StudentManagement /></ProtectedRoute>} />
        <Route path="/admin/reports" element={<ProtectedRoute role="ADMIN"><Reports /></ProtectedRoute>} />

        {/* Default redirect */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <AppRoutes />
          <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop closeOnClick pauseOnHover theme="colored" />
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}
