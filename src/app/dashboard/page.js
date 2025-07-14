'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import ProductCard from '@/components/ProductCard';
import PageHeader from '@/components/PageHeader';
import { Card, CardBody, Button } from '@/components/Card';
import { FaSearch, FaFilter, FaTimes, FaLeaf, FaShoppingBasket } from 'react-icons/fa';
import { API_URL, getAuthHeaders } from '@/utils/apiConfig';

export default function Dashboard() {
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);
  const [cartUpdated, setCartUpdated] = useState(false);

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/auth/login');
      return;
    }

    // Fetch products
    fetchProducts();
  }, [router]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/api/products`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setProducts(response.data);
      
      // Extract unique categories
      const uniqueCategories = [...new Set(response.data.map(product => product.category))];
      setCategories(uniqueCategories);
      
    } catch (error) {
      console.error('Error fetching products:', error);
      setError('Failed to load products. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    setFilterOpen(false);
  };

  const handleAddToCart = () => {
    setCartUpdated(true);
    // Reset cart updated flag after 2 seconds
    setTimeout(() => setCartUpdated(false), 2000);
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === '' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 space-y-4 md:space-y-0">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 flex items-center">
              <span className="bg-primary-50 text-primary-600 p-2 rounded-lg mr-3">
                <FaShoppingBasket className="h-6 w-6" />
              </span>
              LastMile Products
            </h1>
            <p className="text-gray-600 mt-1">Find groceries and household items for your neighborhood&apos;s next delivery</p>
          </div>
          
          <div className="flex w-full md:w-auto space-x-2">
            <div className="relative flex-grow">
              <input
                type="text"
                placeholder="Search products..."
                className="input-field pr-10 shadow-sm hover:shadow-md transition-shadow duration-300"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <FaSearch className="absolute right-3 top-3.5 text-gray-400" />
            </div>
            
            <button 
              className="md:hidden bg-white p-2 rounded-md border border-gray-300"
              onClick={() => setFilterOpen(!filterOpen)}
            >
              <FaFilter />
            </button>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          {/* Filters - Desktop */}
          <div className="hidden md:block w-72 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="bg-primary-50 px-5 py-4 border-b border-gray-100">
              <h2 className="font-semibold text-lg text-gray-800 flex items-center">
                <FaFilter className="mr-2 text-primary-600" /> 
                Filter Products
              </h2>
            </div>
            
            <div className="p-5">
              <h3 className="font-medium text-gray-700 mb-3">Categories</h3>
              <div className="space-y-1">
                <div 
                  className={`cursor-pointer px-3 py-2 rounded-lg flex items-center transition-all duration-150 
                    ${selectedCategory === '' 
                      ? 'bg-primary-50 text-primary-700 font-medium' 
                      : 'hover:bg-gray-50 text-gray-700'}`}
                  onClick={() => setSelectedCategory('')}
                >
                  <span className={`w-2 h-2 rounded-full mr-2 ${selectedCategory === '' ? 'bg-primary-600' : 'bg-gray-300'}`}></span>
                  All Categories
                </div>
                
                {categories.map(category => (
                  <div 
                    key={category}
                    className={`cursor-pointer px-3 py-2 rounded-lg flex items-center transition-all duration-150
                      ${selectedCategory === category 
                        ? 'bg-primary-50 text-primary-700 font-medium' 
                        : 'hover:bg-gray-50 text-gray-700'}`}
                    onClick={() => setSelectedCategory(category)}
                  >
                    <span className={`w-2 h-2 rounded-full mr-2 ${selectedCategory === category ? 'bg-primary-600' : 'bg-gray-300'}`}></span>
                    {category}
                  </div>
                ))}
              </div>
              
              {selectedCategory && (
                <button 
                  className="mt-5 text-primary-600 hover:text-primary-800 text-sm flex items-center"
                  onClick={() => setSelectedCategory('')}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Clear filter
                </button>
              )}
            </div>
            
            <div className="px-5 py-4 bg-gray-50 border-t border-gray-100">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">
                  {filteredProducts.length} products found
                </span>
                <span className="text-xs px-2 py-1 bg-primary-100 text-primary-700 rounded-full">
                  LastMile Delivery
                </span>
              </div>
            </div>
          </div>

          {/* Filters - Mobile */}
          {filterOpen && (
            <div className="md:hidden fixed inset-0 bg-gray-800 bg-opacity-75 z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-xl w-full max-w-sm p-0 overflow-hidden">
                <div className="bg-primary-50 px-5 py-4 flex justify-between items-center">
                  <h2 className="font-semibold text-lg text-gray-800">Filter Products</h2>
                  <button 
                    onClick={() => setFilterOpen(false)}
                    className="bg-white p-1.5 rounded-full text-gray-500 hover:text-gray-700"
                  >
                    <FaTimes />
                  </button>
                </div>
                
                <div className="p-5">
                  <h3 className="font-medium text-gray-700 mb-3">Categories</h3>
                  <div className="space-y-1 max-h-60 overflow-y-auto">
                    <div 
                      className={`cursor-pointer px-3 py-2 rounded-lg flex items-center transition-all duration-150 
                        ${selectedCategory === '' 
                          ? 'bg-primary-50 text-primary-700 font-medium' 
                          : 'hover:bg-gray-50 text-gray-700'}`}
                      onClick={() => handleCategoryChange('')}
                    >
                      <span className={`w-2 h-2 rounded-full mr-2 ${selectedCategory === '' ? 'bg-primary-600' : 'bg-gray-300'}`}></span>
                      All Categories
                    </div>
                    
                    {categories.map(category => (
                      <div 
                        key={category}
                        className={`cursor-pointer px-3 py-2 rounded-lg flex items-center transition-all duration-150
                          ${selectedCategory === category 
                            ? 'bg-primary-50 text-primary-700 font-medium' 
                            : 'hover:bg-gray-50 text-gray-700'}`}
                        onClick={() => handleCategoryChange(category)}
                      >
                        <span className={`w-2 h-2 rounded-full mr-2 ${selectedCategory === category ? 'bg-primary-600' : 'bg-gray-300'}`}></span>
                        {category}
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="px-5 py-4 bg-gray-50 border-t border-gray-100">
                  <button 
                    className="btn-primary w-full"
                    onClick={() => setFilterOpen(false)}
                  >
                    Apply & Close
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Product Grid */}
          <div className="flex-grow">
            {loading ? (
              <div className="flex flex-col justify-center items-center h-64 bg-white rounded-xl shadow-sm p-8">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600 mb-4"></div>
                <p className="text-gray-500">Loading products...</p>
              </div>
            ) : error ? (
              <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl shadow-sm">
                <div className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p>{error}</p>
                </div>
              </div>
            ) : filteredProducts.length > 0 ? (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <p className="text-gray-600">
                    Showing <span className="font-medium">{filteredProducts.length}</span> products
                    {selectedCategory && <span> in <span className="font-medium">{selectedCategory}</span></span>}
                  </p>
                  {searchTerm && (
                    <div className="flex items-center bg-primary-50 px-3 py-1 rounded-lg">
                      <p className="text-sm text-primary-700">Search: &quot;{searchTerm}&quot;</p>
                      <button 
                        className="ml-2 text-primary-600 hover:text-primary-800"
                        onClick={() => setSearchTerm('')}
                      >
                        <FaTimes size={12} />
                      </button>
                    </div>
                  )}
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredProducts.map(product => (
                    <ProductCard 
                      key={product._id} 
                      product={product}
                      onAddToCart={handleAddToCart}
                    />
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm p-8 text-center">
                <div className="flex flex-col items-center">
                  <div className="bg-gray-100 p-6 rounded-full mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold mb-2">No products found</h3>
                  <p className="text-gray-600 max-w-xs mx-auto">
                    We couldn&apos;t find any products matching your criteria. Try adjusting your search or filters.
                  </p>
                  {(searchTerm || selectedCategory) && (
                    <button 
                      onClick={() => {
                        setSearchTerm('');
                        setSelectedCategory('');
                      }}
                      className="mt-4 text-primary-600 hover:text-primary-800 font-medium flex items-center"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Clear all filters
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Cart updated notification */}
      {cartUpdated && (
        <div className="fixed bottom-4 right-4 bg-green-600 text-white px-4 py-3 rounded-lg shadow-lg flex items-center animate-pulse">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>Item added to your cart</span>
        </div>
      )}
    </div>
  );
}
