'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  FaShoppingCart, 
  FaStore, 
  FaUser, 
  FaSignOutAlt, 
  FaUsers, 
  FaClipboardList,
  FaLeaf,
  FaSearch,
  FaBars,
  FaTimes 
} from 'react-icons/fa';
import NotificationBell from './NotificationBell';
import { API_URL, getAuthHeaders } from '../utils/apiConfig';

export default function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [cartCount, setCartCount] = useState(0);
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const fetchCartCount = useCallback(async (token) => {
    try {
      const response = await fetch(`${API_URL}/api/cart`, {
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
  }, [API_URL, setCartCount]);

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
  }, [fetchCartCount]);

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
    <motion.nav 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 100 }}
      className="bg-white text-gray-800 shadow-md sticky top-0 z-50"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20">
          <div className="flex items-center">
            <Link href={isLoggedIn ? '/dashboard' : '/'} className="flex items-center">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-white mr-3">
                <FaLeaf className="h-5 w-5" />
              </div>
              <span className="font-bold text-2xl bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-emerald-800">
                LastMile
              </span>
            </Link>
          </div>
          
          {isLoggedIn && (
            <>
              <div className="hidden md:flex items-center space-x-1">
                <NavLink href="/dashboard" isActive={pathname === '/dashboard'}>
                  <FaStore className="mr-2" size={16} /> Products
                </NavLink>
                <NavLink href="/communities" isActive={pathname === '/communities'}>
                  <FaUsers className="mr-2" size={16} /> Communities
                </NavLink>
                <NavLink href="/orders" isActive={pathname === '/orders'}>
                  <FaClipboardList className="mr-2" size={16} /> Orders
                </NavLink>
                <NavLink href="/account" isActive={pathname === '/account'}>
                  <FaUser className="mr-2" size={16} /> Account
                </NavLink>
                
                <Link href="/cart" className="relative ml-2">
                  <motion.div 
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    className="p-3 rounded-full bg-emerald-100 text-emerald-600 hover:bg-emerald-200 transition-colors duration-200"
                  >
                    <FaShoppingCart size={18} />
                    {cartCount > 0 && (
                      <motion.span 
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full text-xs w-5 h-5 flex items-center justify-center font-semibold"
                      >
                        {cartCount}
                      </motion.span>
                    )}
                  </motion.div>
                </Link>
                
                <div className="ml-2">
                  <NotificationBell userId={user?.id} />
                </div>
                
                <button
                  onClick={handleLogout}
                  className="ml-2 p-3 rounded-full text-gray-500 hover:bg-gray-100 transition-colors duration-200"
                  aria-label="Log out"
                >
                  <FaSignOutAlt size={18} />
                </button>
              </div>
              
              {/* Mobile menu button */}
              <div className="md:hidden flex items-center">
                <button
                  onClick={toggleMenu}
                  className="p-2 rounded-md text-emerald-600 hover:bg-emerald-50 focus:outline-none"
                >
                  {isOpen ? (
                    <FaTimes size={24} />
                  ) : (
                    <FaBars size={24} />
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Mobile menu */}
      {isLoggedIn && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ 
            opacity: isOpen ? 1 : 0, 
            height: isOpen ? 'auto' : 0 
          }}
          transition={{ duration: 0.3 }}
          className="md:hidden overflow-hidden"
        >
          {isOpen && (
            <div className="px-2 pt-2 pb-4 space-y-1 bg-white shadow-lg">
              <MobileNavLink href="/dashboard" isActive={pathname === '/dashboard'}>
                <FaStore className="mr-3" /> Products
              </MobileNavLink>
              <MobileNavLink href="/communities" isActive={pathname === '/communities'}>
                <FaUsers className="mr-3" /> Communities
              </MobileNavLink>
              <MobileNavLink href="/orders" isActive={pathname === '/orders'}>
                <FaClipboardList className="mr-3" /> Orders
              </MobileNavLink>
              <MobileNavLink href="/account" isActive={pathname === '/account'}>
                <FaUser className="mr-3" /> Account
              </MobileNavLink>
              <MobileNavLink href="/cart" isActive={pathname === '/cart'}>
                <div className="flex items-center">
                  <FaShoppingCart className="mr-3" /> 
                  Cart 
                  {cartCount > 0 && (
                    <span className="ml-2 bg-red-500 text-white rounded-full px-2 py-0.5 text-xs">
                      {cartCount}
                    </span>
                  )}
                </div>
              </MobileNavLink>
              
              <div className="px-4 py-3">
                <div className="flex items-center">
                  <span className="mr-3">Notifications</span>
                  <NotificationBell userId={user?.id} isMobile={true} />
                </div>
              </div>
              <div 
                className="block px-4 py-3 rounded-md text-base font-medium text-red-600 hover:bg-red-50 cursor-pointer"
                onClick={handleLogout}
              >
                <div className="flex items-center">
                  <FaSignOutAlt className="mr-3" /> Logout
                </div>
              </div>
            </div>
          )}
        </motion.div>
      )}
    </motion.nav>
  );
}

// NavLink for desktop navigation
function NavLink({ children, href, isActive }) {
  return (
    <Link 
      href={href}
      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center
        ${isActive 
          ? 'bg-emerald-50 text-emerald-700' 
          : 'text-gray-700 hover:bg-gray-50 hover:text-emerald-600'}`
      }
    >
      {children}
    </Link>
  );
}

// Mobile NavLink for responsive design
function MobileNavLink({ children, href, isActive }) {
  return (
    <Link 
      href={href}
      className={`block px-4 py-3 rounded-md text-base font-medium
        ${isActive 
          ? 'bg-emerald-50 text-emerald-700' 
          : 'text-gray-700 hover:bg-gray-50'}`
      }
    >
      {children}
    </Link>
  );
}
