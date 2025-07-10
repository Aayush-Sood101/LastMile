'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FaShoppingCart, FaStore, FaUser, FaSignOutAlt, FaUsers, FaClipboardList } from 'react-icons/fa';

export default function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [cartCount, setCartCount] = useState(0);
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    
    if (token && userStr) {
      setIsLoggedIn(true);
      setUser(JSON.parse(userStr));
      
      // Get cart count
      fetchCartCount(token);
    }
  }, []);

  const fetchCartCount = async (token) => {
    try {
      const response = await fetch('http://localhost:5000/api/cart', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data && data.items) {
          setCartCount(data.items.length);
        }
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/';
  };

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const isActive = (path) => {
    return pathname === path ? 'bg-green-700' : '';
  };

  return (
    <nav className="bg-green-600 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href={isLoggedIn ? '/dashboard' : '/'} className="font-bold text-xl">
              BulkBuddy
            </Link>
          </div>
          
          {isLoggedIn && (
            <>
              <div className="hidden md:flex items-center space-x-4">
                <Link href="/dashboard" className={`px-3 py-2 rounded-md text-sm font-medium hover:bg-green-700 ${isActive('/dashboard')}`}>
                  <FaStore className="inline mr-1" /> Products
                </Link>
                <Link href="/communities" className={`px-3 py-2 rounded-md text-sm font-medium hover:bg-green-700 ${isActive('/communities')}`}>
                  <FaUsers className="inline mr-1" /> Communities
                </Link>
                <Link href="/orders" className={`px-3 py-2 rounded-md text-sm font-medium hover:bg-green-700 ${isActive('/orders')}`}>
                  <FaClipboardList className="inline mr-1" /> Orders
                </Link>
                <Link href="/account" className={`px-3 py-2 rounded-md text-sm font-medium hover:bg-green-700 ${isActive('/account')}`}>
                  <FaUser className="inline mr-1" /> Account
                </Link>
                <Link href="/cart" className={`px-3 py-2 rounded-md text-sm font-medium hover:bg-green-700 ${isActive('/cart')}`}>
                  <FaShoppingCart className="inline mr-1" /> 
                  Cart {cartCount > 0 && <span className="bg-white text-green-600 rounded-full px-2 py-0.5 text-xs ml-1">{cartCount}</span>}
                </Link>
                <button onClick={handleLogout} className="px-3 py-2 rounded-md text-sm font-medium hover:bg-green-700">
                  <FaSignOutAlt className="inline mr-1" /> Logout
                </button>
              </div>
              
              {/* Mobile menu button */}
              <div className="md:hidden flex items-center">
                <button
                  onClick={toggleMenu}
                  className="inline-flex items-center justify-center p-2 rounded-md hover:bg-green-700 focus:outline-none"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    {isOpen ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    )}
                  </svg>
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Mobile menu */}
      {isLoggedIn && isOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <Link href="/dashboard" className={`block px-3 py-2 rounded-md text-base font-medium hover:bg-green-700 ${isActive('/dashboard')}`}>
              <FaStore className="inline mr-2" /> Products
            </Link>
            <Link href="/communities" className={`block px-3 py-2 rounded-md text-base font-medium hover:bg-green-700 ${isActive('/communities')}`}>
              <FaUsers className="inline mr-2" /> Communities
            </Link>
            <Link href="/orders" className={`block px-3 py-2 rounded-md textbase font-medium hover:bg-green-700 ${isActive('/orders')}`}>
              <FaClipboardList className="inline mr-2" /> Orders
            </Link>
            <Link href="/account" className={`block px-3 py-2 rounded-md textbase font-medium hover:bg-green-700 ${isActive('/account')}`}>
              <FaUser className="inline mr-2" /> Account
            </Link>
            <Link href="/cart" className={`block px-3 py-2 rounded-md text-base font-medium hover:bg-green-700 ${isActive('/cart')}`}>
              <FaShoppingCart className="inline mr-2" /> 
              Cart {cartCount > 0 && <span className="bg-white text-green-600 rounded-full px-2 py-0.5 text-xs ml-1">{cartCount}</span>}
            </Link>
            <button onClick={handleLogout} className="block w-full text-left px-3 py-2 rounded-md text-base font-medium hover:bg-green-700">
              <FaSignOutAlt className="inline mr-2" /> Logout
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
