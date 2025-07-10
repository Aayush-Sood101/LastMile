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
      const response = await axios.get('http://localhost:5000/api/products', {
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
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 space-y-4 md:space-y-0">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Browse Products</h1>
            <p className="text-gray-600">Find groceries and household items for your next bulk order</p>
          </div>
          
          <div className="flex w-full md:w-auto space-x-2">
            <div className="relative flex-grow">
              <input
                type="text"
                placeholder="Search products..."
                className="input-field pr-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <FaSearch className="absolute right-3 top-3 text-gray-400" />
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
          <div className="hidden md:block w-64 bg-white rounded-xl shadow-sm p-4">
            <h2 className="font-semibold text-lg mb-4">Categories</h2>
            <div className="space-y-2">
              <div 
                className={`cursor-pointer p-2 rounded hover:bg-gray-100 ${selectedCategory === '' ? 'bg-green-100 text-green-700' : ''}`}
                onClick={() => setSelectedCategory('')}
              >
                All Categories
              </div>
              {categories.map(category => (
                <div 
                  key={category}
                  className={`cursor-pointer p-2 rounded hover:bg-gray-100 ${selectedCategory === category ? 'bg-green-100 text-green-700' : ''}`}
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                </div>
              ))}
            </div>
          </div>

          {/* Filters - Mobile */}
          {filterOpen && (
            <div className="md:hidden fixed inset-0 bg-gray-800 bg-opacity-75 z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-xl w-full max-w-sm p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="font-semibold text-lg">Filter Products</h2>
                  <button onClick={() => setFilterOpen(false)}>
                    <FaTimes />
                  </button>
                </div>
                
                <h3 className="font-medium mb-2">Categories</h3>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  <div 
                    className={`cursor-pointer p-2 rounded hover:bg-gray-100 ${selectedCategory === '' ? 'bg-green-100 text-green-700' : ''}`}
                    onClick={() => handleCategoryChange('')}
                  >
                    All Categories
                  </div>
                  {categories.map(category => (
                    <div 
                      key={category}
                      className={`cursor-pointer p-2 rounded hover:bg-gray-100 ${selectedCategory === category ? 'bg-green-100 text-green-700' : ''}`}
                      onClick={() => handleCategoryChange(category)}
                    >
                      {category}
                    </div>
                  ))}
                </div>
                
                <button 
                  className="btn-primary w-full mt-4"
                  onClick={() => setFilterOpen(false)}
                >
                  Apply Filters
                </button>
              </div>
            </div>
          )}

          {/* Product Grid */}
          <div className="flex-grow">
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600"></div>
              </div>
            ) : error ? (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            ) : filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map(product => (
                  <ProductCard 
                    key={product._id} 
                    product={product}
                    onAddToCart={handleAddToCart}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm p-8 text-center">
                <h3 className="text-xl font-semibold mb-2">No products found</h3>
                <p className="text-gray-600">
                  Try adjusting your search or filter criteria
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Cart updated notification */}
      {cartUpdated && (
        <div className="fixed bottom-4 right-4 bg-green-600 text-white px-4 py-2 rounded-md shadow-md flex items-center">
          <span>Item added to cart</span>
        </div>
      )}
    </div>
  );
}
