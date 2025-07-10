'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { communityCartService } from '@/services/api';

// Create the Community Cart Context
const CommunityCartContext = createContext();

// Custom hook to use the community cart context
export const useCommunityCart = () => {
  const context = useContext(CommunityCartContext);
  if (!context) {
    throw new Error('useCommunityCart must be used within a CommunityCartProvider');
  }
  return context;
};

// Provider component
export function CommunityCartProvider({ children }) {
  const [communityCart, setCommunityCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user, isAuthenticated } = useAuth();

  // Load community cart when user changes
  useEffect(() => {
    const loadCommunityCart = async () => {
      if (!isAuthenticated || !user?.community) {
        setCommunityCart(null);
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        const data = await communityCartService.getMyCommunityCart();
        setCommunityCart(data);
      } catch (err) {
        console.error('Error loading community cart:', err);
        setError('Failed to load community cart');
      } finally {
        setLoading(false);
      }
    };

    loadCommunityCart();
  }, [isAuthenticated, user]);

  // Add item to community cart
  const addItem = async (productId, quantity) => {
    try {
      setLoading(true);
      const { communityCart: updatedCart } = await communityCartService.addItem(productId, quantity);
      setCommunityCart(updatedCart);
      return { success: true };
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add item to community cart');
      return { success: false, error: err.response?.data?.message };
    } finally {
      setLoading(false);
    }
  };

  // Update item in community cart
  const updateItem = async (productId, quantity) => {
    try {
      setLoading(true);
      const { communityCart: updatedCart } = await communityCartService.updateItem(productId, quantity);
      setCommunityCart(updatedCart);
      return { success: true };
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update item in community cart');
      return { success: false, error: err.response?.data?.message };
    } finally {
      setLoading(false);
    }
  };

  // Remove item from community cart
  const removeItem = async (productId) => {
    try {
      setLoading(true);
      await communityCartService.removeItem(productId);
      setCommunityCart(prev => ({
        ...prev,
        items: prev.items.filter(item => item.product._id !== productId)
      }));
      return { success: true };
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to remove item from community cart');
      return { success: false, error: err.response?.data?.message };
    } finally {
      setLoading(false);
    }
  };

  // Lock community cart (for community admin)
  const lockCart = async () => {
    if (!user?.community || !user?.isCommunityAdmin) {
      return { success: false, error: 'Only community admins can lock the cart' };
    }
    
    try {
      setLoading(true);
      await communityCartService.lockCart(user.community);
      setCommunityCart(prev => ({
        ...prev,
        isLocked: true
      }));
      return { success: true };
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to lock community cart');
      return { success: false, error: err.response?.data?.message };
    } finally {
      setLoading(false);
    }
  };

  // Refresh cart data
  const refreshCart = async () => {
    try {
      setLoading(true);
      const data = await communityCartService.getMyCommunityCart();
      setCommunityCart(data);
      return { success: true };
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to refresh community cart');
      return { success: false, error: err.response?.data?.message };
    } finally {
      setLoading(false);
    }
  };

  // Value object
  const value = {
    communityCart,
    loading,
    error,
    addItem,
    updateItem,
    removeItem,
    lockCart,
    refreshCart,
    itemCount: communityCart?.items?.length || 0
  };

  return <CommunityCartContext.Provider value={value}>{children}</CommunityCartContext.Provider>;
}

export default CommunityCartContext;
