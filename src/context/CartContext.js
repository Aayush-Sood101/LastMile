'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { cartService } from '@/services/api';
import { useAuth } from './AuthContext';

// Create Cart Context
const CartContext = createContext();

// Custom hook to use the cart context
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

// Provider component that wraps the app and makes cart available
export function CartProvider({ children }) {
  const [cart, setCart] = useState({ items: [], totalItems: 0, totalPrice: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { isAuthenticated } = useAuth();

  // Fetch cart on initial load or when auth status changes
  useEffect(() => {
    if (isAuthenticated) {
      fetchCart();
    } else {
      // Reset cart when logged out
      setCart({ items: [], totalItems: 0, totalPrice: 0 });
    }
  }, [isAuthenticated]);

  // Fetch cart from API
  const fetchCart = async () => {
    if (!isAuthenticated) return;
    
    setLoading(true);
    setError(null);
    try {
      const cartData = await cartService.getCart();
      setCart({
        items: cartData.items || [],
        totalItems: cartData.items.reduce((total, item) => total + item.quantity, 0),
        totalPrice: cartData.items.reduce((total, item) => total + (item.price * item.quantity), 0)
      });
    } catch (err) {
      setError('Failed to fetch cart');
      console.error('Cart fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Add item to cart
  const addItem = async (productId, quantity = 1) => {
    if (!isAuthenticated) {
      // Redirect to login or show a message
      return { success: false, error: 'Please log in to add items to cart' };
    }
    
    setLoading(true);
    setError(null);
    try {
      await cartService.addItem(productId, quantity);
      await fetchCart(); // Refresh cart data
      return { success: true };
    } catch (err) {
      setError('Failed to add item to cart');
      console.error('Add to cart error:', err);
      return { success: false, error: err.response?.data?.message || 'Failed to add item to cart' };
    } finally {
      setLoading(false);
    }
  };

  // Update item quantity
  const updateItem = async (productId, quantity) => {
    if (!isAuthenticated) return;
    
    setLoading(true);
    setError(null);
    try {
      await cartService.updateItem(productId, quantity);
      await fetchCart(); // Refresh cart data
      return { success: true };
    } catch (err) {
      setError('Failed to update item quantity');
      console.error('Update cart error:', err);
      return { success: false, error: err.response?.data?.message || 'Failed to update item quantity' };
    } finally {
      setLoading(false);
    }
  };

  // Remove item from cart
  const removeItem = async (productId) => {
    if (!isAuthenticated) return;
    
    setLoading(true);
    setError(null);
    try {
      await cartService.removeItem(productId);
      await fetchCart(); // Refresh cart data
      return { success: true };
    } catch (err) {
      setError('Failed to remove item from cart');
      console.error('Remove from cart error:', err);
      return { success: false, error: err.response?.data?.message || 'Failed to remove item from cart' };
    } finally {
      setLoading(false);
    }
  };

  // Clear cart
  const clearCart = async () => {
    if (!isAuthenticated) return;
    
    setLoading(true);
    setError(null);
    try {
      await cartService.clearCart();
      setCart({ items: [], totalItems: 0, totalPrice: 0 });
      return { success: true };
    } catch (err) {
      setError('Failed to clear cart');
      console.error('Clear cart error:', err);
      return { success: false, error: err.response?.data?.message || 'Failed to clear cart' };
    } finally {
      setLoading(false);
    }
  };

  // Get carbon footprint comparison
  const getCarbonFootprint = async () => {
    if (!isAuthenticated) return null;
    
    setLoading(true);
    setError(null);
    try {
      const data = await cartService.getCarbonFootprint();
      return data;
    } catch (err) {
      setError('Failed to get carbon footprint data');
      console.error('Carbon footprint error:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Value object that will be passed to consumers of this context
  const value = {
    cart,
    loading,
    error,
    addItem,
    updateItem,
    removeItem,
    clearCart,
    fetchCart,
    getCarbonFootprint,
    totalItems: cart.totalItems,
    totalPrice: cart.totalPrice
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export default CartContext;