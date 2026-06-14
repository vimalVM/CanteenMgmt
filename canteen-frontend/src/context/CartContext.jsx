import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import API from '../api/axios';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export const useCart = () => useContext(CartContext);

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const { isAuthenticated, isStudent } = useAuth();

  const fetchCart = useCallback(async () => {
    if (!isAuthenticated || !isStudent) return;
    try {
      const res = await API.get('/cart');
      setItems(res.data.items || []);
    } catch (e) {
      console.error('Failed to fetch cart', e);
    }
  }, [isAuthenticated, isStudent]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const addItem = async (menuItemId, quantity = 1) => {
    setLoading(true);
    try {
      const res = await API.post('/cart/add', { menuItemId, quantity });
      setItems(res.data.items || []);
      return true;
    } catch (e) {
      console.error('Failed to add item', e);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateQty = async (menuItemId, quantity) => {
    setLoading(true);
    try {
      const res = await API.put(`/cart/update/${menuItemId}`, { quantity });
      setItems(res.data.items || []);
    } catch (e) {
      console.error('Failed to update quantity', e);
    } finally {
      setLoading(false);
    }
  };

  const removeItem = async (menuItemId) => {
    setLoading(true);
    try {
      const res = await API.delete(`/cart/remove/${menuItemId}`);
      setItems(res.data.items || []);
    } catch (e) {
      console.error('Failed to remove item', e);
    } finally {
      setLoading(false);
    }
  };

  const clearCart = async () => {
    setLoading(true);
    try {
      const res = await API.delete('/cart/clear');
      setItems(res.data.items || []);
    } catch (e) {
      console.error('Failed to clear cart', e);
    } finally {
      setLoading(false);
    }
  };

  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);
  const totalAmount = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, itemCount, totalAmount, loading, addItem, updateQty, removeItem, clearCart, fetchCart }}>
      {children}
    </CartContext.Provider>
  );
}
