'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import PriceOptimizer from '@/utils/priceOptimizer';
import { PricingAPI } from '@/utils/pricingApi';
import axios from 'axios';
import { FaChevronLeft, FaSignOutAlt, FaStore } from 'react-icons/fa';

export default function PriceOptimizerPage() {
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [optimizing, setOptimizing] = useState(false);
  const [results, setResults] = useState(null);
  const [targetMargin, setTargetMargin] = useState(20);
  const [maxDiscount, setMaxDiscount] = useState(50);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/auth/login');
  };
  
  useEffect(() => {
    // Check if user is logged in and has admin role
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    
    if (!token || !userStr) {
      router.push('/auth/login');
      return;
    }
    
    const user = JSON.parse(userStr);
    if (user.role !== 'walmart') {
      router.push('/dashboard');
      return;
    }
    
    // Fetch products
    fetchProducts(token);
  }, [router]);
  
  const fetchProducts = async (token) => {
    try {
      const response = await axios.get('http://localhost:5000/api/products', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      // Add quantity demanded field to each product
      const productsWithDemand = response.data.map(product => ({
        ...product,
        quantityDemanded: product.popularityScore ? Math.round(product.popularityScore * 100) : 100
      }));
      
      setProducts(productsWithDemand);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching products:', error);
      setError('Failed to fetch products. Please try again.');
      setLoading(false);
    }
  };
  
  const handleQuantityChange = (id, value) => {
    setProducts(products.map(product => 
      product._id === id ? { ...product, quantityDemanded: parseInt(value) } : product
    ));
  };
  
  const optimizePricing = () => {
    setOptimizing(true);
    setError('');
    setSuccess('');
    
    try {
      // Prepare data for optimization
      const supplierCosts = products.map(p => p.costPrice || 0);
      const operationalCosts = products.map(p => p.operationalCost || 5); // Default to 5 if not provided
      const maxRetailPrices = products.map(p => p.price || 0);
      const quantities = products.map(p => p.quantityDemanded || 100);
      
      // Run optimization
      const optimizationResults = PriceOptimizer.optimizeDiscounts({
        supplierCosts,
        operationalCosts,
        maxRetailPrices,
        quantities,
        targetMargin: targetMargin / 100,
        maxDiscount: maxDiscount / 100
      });
      
      // Add product info to results
      const resultsWithProductInfo = {
        ...optimizationResults,
        productDetails: products.map((product, i) => ({
          _id: product._id,
          name: product.name,
          originalPrice: product.price,
          optimizedPrice: optimizationResults.prices[i],
          discount: optimizationResults.discounts[i],
          profit: optimizationResults.profitPerProduct[i]
        }))
      };
      
      setResults(resultsWithProductInfo);
      setSuccess('Price optimization completed successfully!');
    } catch (error) {
      console.error('Error during price optimization:', error);
      setError('Failed to optimize prices. Please check your inputs and try again.');
    } finally {
      setOptimizing(false);
    }
  };
  
  const saveOptimizedPrices = async () => {
    if (!results) return;
    
    setLoading(true);
    try {
      // Update each product with its optimized price
      const token = localStorage.getItem('token');
      const updatePromises = results.productDetails.map(product => 
        axios.put(`http://localhost:5000/api/products/${product._id}`, 
          { 
            discountPercentage: product.discount,
            discountedPrice: product.optimizedPrice
          }, 
          { headers: { Authorization: `Bearer ${token}` } }
        )
      );
      
      await Promise.all(updatePromises);
      setSuccess('Optimized prices saved successfully!');
    } catch (error) {
      console.error('Error saving optimized prices:', error);
      setError('Failed to save optimized prices. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  if (loading) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-6">Price Optimizer</h1>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Bar - Desktop */}
      <div className="bg-white shadow-md border-b border-gray-200 hidden md:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="bg-primary-600 text-white p-2 rounded-lg mr-3">
                <FaStore className="h-5 w-5" />
              </div>
              <h2 className="text-xl font-bold text-gray-800">LastMile Admin</h2>
            </div>
            
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => router.push('/admin/dashboard')}
                className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
              >
                <FaChevronLeft className="h-4 w-4" />
                <span>Back to Dashboard</span>
              </button>
              
              <button 
                onClick={handleLogout}
                className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 transition-colors"
              >
                <FaSignOutAlt className="h-4 w-4" />
                <span>Log Out</span>
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Navigation Bar - Mobile */}
      <div className="md:hidden fixed top-0 left-0 right-0 bg-white shadow-md text-gray-800 z-10">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center">
            <div className="bg-primary-600 text-white p-2 rounded-lg mr-2">
              <FaStore className="h-5 w-5" />
            </div>
            <h2 className="text-lg font-bold">LastMile Admin</h2>
          </div>
          
          <div className="flex items-center space-x-2">
            <button 
              onClick={() => router.push('/admin/dashboard')}
              className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors duration-200"
            >
              <FaChevronLeft className="h-5 w-5 text-gray-700" />
            </button>
            
            <button 
              onClick={handleLogout}
              className="p-2 rounded-lg bg-red-50 hover:bg-red-100 transition-colors duration-200"
            >
              <FaSignOutAlt className="h-5 w-5 text-red-600" />
            </button>
          </div>
        </div>
      </div>
      
      <div className="p-8 md:pt-8 pt-20">
        <h1 className="text-2xl font-bold mb-6">Price Optimizer</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {success}
        </div>
      )}
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Optimization Parameters</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Target Profit Margin (%)
            </label>
            <input
              type="number"
              value={targetMargin}
              onChange={(e) => setTargetMargin(Number(e.target.value))}
              className="w-full p-2 border border-gray-300 rounded"
              min="0"
              max="100"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Maximum Discount (%)
            </label>
            <input
              type="number"
              value={maxDiscount}
              onChange={(e) => setMaxDiscount(Number(e.target.value))}
              className="w-full p-2 border border-gray-300 rounded"
              min="0"
              max="100"
            />
          </div>
        </div>
        
        <button
          onClick={optimizePricing}
          disabled={optimizing}
          className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded"
        >
          {optimizing ? 'Optimizing...' : 'Optimize Pricing'}
        </button>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Products</h2>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price (₹)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cost (₹)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quantity Demanded
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {products.map((product) => (
                <tr key={product._id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {product.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {product.price}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {product.costPrice || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="number"
                      value={product.quantityDemanded}
                      onChange={(e) => handleQuantityChange(product._id, e.target.value)}
                      className="w-24 p-1 border border-gray-300 rounded"
                      min="0"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {results && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Optimization Results</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-gray-50 p-4 rounded">
              <p className="text-sm font-medium text-gray-500">Total Profit</p>
              <p className="text-2xl font-bold">₹{results.totalProfit.toFixed(2)}</p>
            </div>
            
            <div className="bg-gray-50 p-4 rounded">
              <p className="text-sm font-medium text-gray-500">Overall Margin</p>
              <p className="text-2xl font-bold">{results.margin.toFixed(2)}%</p>
            </div>
          </div>
          
          <div className="overflow-x-auto mt-6">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Original Price (₹)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Optimized Price (₹)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Discount (%)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Profit (₹)
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {results.productDetails.map((product) => (
                  <tr key={product._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {product.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {product.originalPrice.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-green-600">
                      {product.optimizedPrice.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {product.discount.toFixed(2)}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {product.profit.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="mt-6">
            <button
              onClick={saveOptimizedPrices}
              disabled={loading}
              className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded"
            >
              {loading ? 'Saving...' : 'Apply Optimized Prices'}
            </button>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
