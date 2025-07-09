'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();
  const { user, isAuthenticated, logout, isWalmart } = useAuth();
  const { totalItems } = useCart();

  // Handle scroll effect for transparent navbar
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Check if current path is the homepage
  const isHomePage = pathname === '/';
  
  // Determine navbar styles based on scroll position and current page
  const navbarClasses = `
    fixed top-0 left-0 right-0 z-50 transition-all duration-300 px-4 
    ${isHomePage && !isScrolled 
      ? 'bg-transparent text-white' 
      : 'bg-white text-gray-800 shadow-md'}
  `;

  // Link styles for homepage vs other pages
  const linkClasses = `
    hover:text-blue-500 transition-colors duration-200
    ${isHomePage && !isScrolled ? 'text-white hover:text-blue-300' : 'text-gray-800'}
  `;

  return (
    <nav className={navbarClasses}>
      <div className="container mx-auto max-w-7xl">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <Link href="/">
            <div className="flex items-center space-x-2 font-bold text-xl">
              <span>NeighborBulk</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/products" className={linkClasses}>
              Products
            </Link>
            <Link href="/communities" className={linkClasses}>
              Communities
            </Link>
            <Link href="/how-it-works" className={linkClasses}>
              How It Works
            </Link>

            {/* Auth Links */}
            {isAuthenticated ? (
              <div className="flex items-center space-x-6">
                {/* Cart Icon with counter */}
                <Link href="/cart" className="relative">
                  <span className={linkClasses}>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                  </span>
                  {totalItems > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                      {totalItems}
                    </span>
                  )}
                </Link>

                {/* Dashboard Link */}
                <Link 
                  href={isWalmart ? "/dashboard/admin" : "/dashboard"}
                  className={`${linkClasses} font-semibold`}
                >
                  Dashboard
                </Link>

                {/* User Menu Dropdown */}
                <div className="relative group">
                  <button className={`${linkClasses} flex items-center space-x-1`}>
                    <span>{user?.name?.split(' ')[0] || 'Account'}</span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 hidden group-hover:block">
                    <Link href="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      Profile
                    </Link>
                    <Link href="/orders" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      My Orders
                    </Link>
                    <button
                      onClick={logout}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  href="/login"
                  className={`${linkClasses} font-semibold`}
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className={`
                    ${isHomePage && !isScrolled 
                      ? 'bg-white text-blue-700 hover:bg-gray-100' 
                      : 'bg-blue-600 text-white hover:bg-blue-700'} 
                    px-4 py-2 rounded-md font-semibold transition-colors
                  `}
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden focus:outline-none"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {isMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 bg-white text-gray-800">
            <div className="flex flex-col space-y-3">
              <Link
                href="/products"
                className="py-2 px-4 hover:bg-gray-100 rounded-md"
                onClick={() => setIsMenuOpen(false)}
              >
                Products
              </Link>
              <Link
                href="/communities"
                className="py-2 px-4 hover:bg-gray-100 rounded-md"
                onClick={() => setIsMenuOpen(false)}
              >
                Communities
              </Link>
              <Link
                href="/how-it-works"
                className="py-2 px-4 hover:bg-gray-100 rounded-md"
                onClick={() => setIsMenuOpen(false)}
              >
                How It Works
              </Link>

              {/* Auth Links for Mobile */}
              {isAuthenticated ? (
                <>
                  <Link
                    href="/cart"
                    className="py-2 px-4 hover:bg-gray-100 rounded-md flex items-center justify-between"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <span>Cart</span>
                    {totalItems > 0 && (
                      <span className="bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                        {totalItems}
                      </span>
                    )}
                  </Link>
                  <Link
                    href={isWalmart ? "/dashboard/admin" : "/dashboard"}
                    className="py-2 px-4 hover:bg-gray-100 rounded-md"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/profile"
                    className="py-2 px-4 hover:bg-gray-100 rounded-md"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Profile
                  </Link>
                  <Link
                    href="/orders"
                    className="py-2 px-4 hover:bg-gray-100 rounded-md"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    My Orders
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      setIsMenuOpen(false);
                    }}
                    className="w-full text-left py-2 px-4 hover:bg-gray-100 rounded-md"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="py-2 px-4 hover:bg-gray-100 rounded-md"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    href="/register"
                    className="py-2 px-4 bg-blue-600 text-white rounded-md"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}