'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import PriceOptimizerAdvanced from '@/utils/priceOptimizerAdvanced';
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
      const operationalCosts = products.map(p => p.operationalCost || 0.2); // Default to 0.2 if not provided
      const maxRetailPrices = products.map(p => p.price || 0);
      const quantities = products.map(p => p.quantityDemanded || 100);
      
      // Run advanced optimization
      const optimizationResults = PriceOptimizerAdvanced.optimizeDiscounts({
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
          supplierCost: product.costPrice || 0,
          operationalCost: product.operationalCost || 0.2,
          optimizedPrice: optimizationResults.prices[i],
          discount: optimizationResults.discounts[i],
          profit: optimizationResults.profitPerProduct[i],
          unitProfit: optimizationResults.prices[i] - (product.costPrice || 0) - (product.operationalCost || 0.2)
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
        
        <div className="overflow-x-auto">{/* Important: no whitespace between tags */}
          <table className="min-w-full divide-y divide-gray-200">{/* Important: no whitespace between tags */}
            <thead className="bg-gray-50">{/* Important: no whitespace between tags */}
              <tr>{/* Important: no whitespace between table elements */}
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price (₹)</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Supplier Cost (₹)</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Op. Cost (₹)</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity Demanded</th>
              </tr>{/* Important: no whitespace between elements */}
            </thead>{/* Important: no whitespace between elements */}
            <tbody className="bg-white divide-y divide-gray-200">{/* Important: no whitespace between elements */}
              {products.map((product) => (
                <tr key={product._id}>
                  <td className="px-6 py-4 whitespace-nowrap">{product.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{product.price.toFixed(2)}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{product.costPrice ? product.costPrice.toFixed(2) : 'N/A'}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{product.operationalCost ? product.operationalCost.toFixed(2) : '0.20'}</td>
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
            </tbody>{/* Important: no whitespace between tags */}
          </table>{/* Important: no whitespace between tags */}
        </div>
      </div>
      
      {results && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Optimization Results</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-5 rounded-lg shadow-sm border border-blue-200">
              <p className="text-sm text-gray-600 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Total Profit
              </p>
              <p className="text-3xl font-bold text-blue-700">₹{results.totalProfit.toFixed(2)}</p>
            </div>
            
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-5 rounded-lg shadow-sm border border-blue-200">
              <p className="text-sm text-gray-600 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
                Overall Margin
              </p>
              <p className="text-3xl font-bold text-blue-700">{results.margin.toFixed(2)}%</p>
              <div className="mt-2 bg-blue-200 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-blue-600 h-full rounded-full" 
                  style={{ width: `${Math.min(100, (results.margin / targetMargin) * 100)}%` }}
                ></div>
              </div>
              <p className="text-xs text-blue-700 mt-1">Target: {targetMargin}%</p>
            </div>
          </div>
          
          {results.productDetails.some(p => p.profit < 0 || p.unitProfit < 0) && (
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-md mb-6">
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-400 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <div className="text-sm text-yellow-700">
                  <p className="font-medium mb-1">Warning: Some products have low or negative profit margins</p>
                  <ul className="list-disc ml-5 space-y-1">
                    <li>Products with supplier cost + operational cost higher than or close to the price cannot be discounted</li>
                    <li>Consider adjusting supplier costs or increasing prices for these products</li>
                    <li>The optimization algorithm will avoid discounting unprofitable products</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
          
          {/* Explanation card */}
          <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-md mb-6">
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <div className="text-sm text-blue-700">
                <p className="font-medium mb-1">Price Optimization Details:</p>
                <ul className="list-disc ml-5 space-y-1">
                  <li>Original Price: The initial retail price before any discount</li>
                  <li>Supplier Cost: The cost of purchasing the product from suppliers</li>
                  <li>Op. Cost: Operational costs including logistics, storage, etc.</li>
                  <li>Unit Profit: Profit per unit (Optimized Price - Supplier Cost - Op. Cost)</li>
                  <li>Total Profit: Unit profit multiplied by quantity demanded</li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="overflow-x-auto mt-6">{/* Important: no whitespace between tags */}
            <table className="min-w-full divide-y divide-gray-200">{/* Important: no whitespace between tags */}
              <thead className="bg-gray-50">{/* Important: no whitespace between tags */}
                <tr>{/* Important: no whitespace between tags */}
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Original Price (₹)</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Supplier Cost (₹)</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Op. Cost (₹)</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Optimized Price (₹)</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Discount (%)</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit Profit (₹)</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Profit (₹)</th>
                </tr>{/* Important: no whitespace between tags */}
              </thead>{/* Important: no whitespace between tags */}
              <tbody className="bg-white divide-y divide-gray-200">{/* Important: no whitespace between tags */}
                {results.productDetails.map((product) => {
                  const isProfitable = product.profit >= 0;
                  return (
                    <tr key={product._id} className={!isProfitable ? "bg-red-50" : ""}>
                      <td className="px-6 py-4 whitespace-nowrap">{product.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{product.originalPrice.toFixed(2)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-600">{product.supplierCost.toFixed(2)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-600">{product.operationalCost.toFixed(2)}</td>
                      <td className={`px-6 py-4 whitespace-nowrap font-medium ${product.discount > 0 ? "text-green-600" : "text-gray-600"}`}>{product.optimizedPrice.toFixed(2)}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {product.discount > 0 ? (
                          <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">{product.discount.toFixed(2)}%</span>
                        ) : (
                          <span className="text-gray-500">0.00%</span>
                        )}
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap font-medium ${product.unitProfit > 0 ? "text-green-600" : "text-red-600"}`}>{product.unitProfit.toFixed(2)}</td>
                      <td className={`px-6 py-4 whitespace-nowrap font-medium ${isProfitable ? "text-green-600" : "text-red-600"}`}>{product.profit.toFixed(2)}</td>
                    </tr>
                  );
                })}
              </tbody>{/* Important: no whitespace between tags */}
            </table>{/* Important: no whitespace between tags */}
          </div>
          
          <div className="mt-6 flex justify-end">
            <button
              onClick={saveOptimizedPrices}
              disabled={loading}
              className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium flex items-center shadow-md"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              {loading ? 'Saving...' : 'Apply Optimized Prices'}
            </button>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
