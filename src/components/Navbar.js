'use client';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
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
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    
    if (token && userStr) {
      setIsLoggedIn(true);
      setUser(JSON.parse(userStr));
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
    return pathname === path ? 'bg-emerald-500/20 text-emerald-700 border-emerald-200' : '';
  };

  return (
    <motion.nav 
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 120, damping: 20 }}
      className="bg-white/95 backdrop-blur-xl text-gray-800 shadow-lg border-b border-gray-100/50 sticky top-0 z-50"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20">
          <motion.div 
            className="flex items-center"
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 400 }}
          >
            <Link href={isLoggedIn ? '/dashboard' : '/'} className="flex items-center group">
              <motion.div 
                className="h-12 w-12 rounded-xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-600 flex items-center justify-center text-white mr-3 shadow-lg group-hover:shadow-emerald-200"
                whileHover={{ rotate: 5, scale: 1.1 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                <FaLeaf className="h-6 w-6" />
              </motion.div>
              <span className="font-bold text-3xl bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-700">
                LastMile
              </span>
            </Link>
          </motion.div>
          
          {isLoggedIn && (
            <>
              <div className="hidden md:flex items-center space-x-2">
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
                
                <Link href="/cart" className="relative ml-4">
                  <motion.div 
                    whileHover={{ scale: 1.1, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    className="p-3 rounded-xl bg-gradient-to-br from-emerald-50 to-emerald-100 text-emerald-600 hover:from-emerald-100 hover:to-emerald-200 transition-all duration-300 shadow-md hover:shadow-lg border border-emerald-200/50"
                  >
                    <FaShoppingCart size={18} />
                    <AnimatePresence>
                      {cartCount > 0 && (
                        <motion.span 
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0, opacity: 0 }}
                          className="absolute -top-2 -right-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-full text-xs w-6 h-6 flex items-center justify-center font-bold shadow-lg"
                        >
                          {cartCount}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </motion.div>
                </Link>
                
                <div className="ml-2">
                  <NotificationBell userId={user?.id} />
                </div>
                
                <motion.button
                  onClick={handleLogout}
                  whileHover={{ scale: 1.05, y: -1 }}
                  whileTap={{ scale: 0.95 }}
                  className="ml-4 p-3 rounded-xl text-gray-500 hover:text-red-600 hover:bg-red-50 transition-all duration-300 border border-transparent hover:border-red-200"
                  aria-label="Log out"
                >
                  <FaSignOutAlt size={18} />
                </motion.button>
              </div>
              
              <div className="md:hidden flex items-center">
                <motion.button
                  onClick={toggleMenu}
                  whileTap={{ scale: 0.95 }}
                  className="p-3 rounded-xl text-emerald-600 hover:bg-emerald-50 focus:outline-none transition-all duration-200 border border-emerald-200/50"
                >
                  <AnimatePresence mode="wait">
                    {isOpen ? (
                      <motion.div
                        key="close"
                        initial={{ rotate: -90, opacity: 0 }}
                        animate={{ rotate: 0, opacity: 1 }}
                        exit={{ rotate: 90, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <FaTimes size={24} />
                      </motion.div>
                    ) : (
                      <motion.div
                        key="menu"
                        initial={{ rotate: 90, opacity: 0 }}
                        animate={{ rotate: 0, opacity: 1 }}
                        exit={{ rotate: -90, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <FaBars size={24} />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.button>
              </div>
            </>
          )}
        </div>
      </div>

      <AnimatePresence>
        {isLoggedIn && isOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0, y: -20 }}
            animate={{ opacity: 1, height: 'auto', y: 0 }}
            exit={{ opacity: 0, height: 0, y: -20 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="md:hidden overflow-hidden bg-white/95 backdrop-blur-xl border-t border-gray-100"
          >
            <div className="px-4 pt-4 pb-6 space-y-2">
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
                    <span className="ml-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-full px-2 py-1 text-xs font-bold shadow-md">
                      {cartCount}
                    </span>
                  )}
                </div>
              </MobileNavLink>
              
              <div className="px-4 py-4 border-t border-gray-100 mt-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-700 font-medium">Notifications</span>
                  <NotificationBell userId={user?.id} isMobile={true} />
                </div>
              </div>
              
              <motion.div 
                whileTap={{ scale: 0.98 }}
                className="block px-4 py-4 rounded-xl text-base font-medium text-red-600 hover:bg-red-50 cursor-pointer transition-all duration-200 border border-transparent hover:border-red-200 mx-2"
                onClick={handleLogout}
              >
                <div className="flex items-center">
                  <FaSignOutAlt className="mr-3" /> Logout
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}

function NavLink({ children, href, isActive }) {
  return (
    <Link href={href}>
      <motion.div
        whileHover={{ scale: 1.05, y: -1 }}
        whileTap={{ scale: 0.98 }}
        className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 flex items-center border shadow-sm hover:shadow-md ${
          isActive
            ? 'bg-gradient-to-r from-emerald-50 to-emerald-100 text-emerald-700 border-emerald-200 shadow-emerald-100'
            : 'text-gray-700 hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 hover:text-emerald-600 border-gray-200/50 hover:border-emerald-200'
        }`}
      >
        {children}
      </motion.div>
    </Link>
  );
}

function MobileNavLink({ children, href, isActive }) {
  return (
    <Link href={href}>
      <motion.div
        whileTap={{ scale: 0.98 }}
        className={`block px-4 py-4 rounded-xl text-base font-medium transition-all duration-200 border ${
          isActive
            ? 'bg-gradient-to-r from-emerald-50 to-emerald-100 text-emerald-700 border-emerald-200'
            : 'text-gray-700 hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 border-transparent hover:border-gray-200'
        }`}
      >
        {children}
      </motion.div>
    </Link>
  );
}
