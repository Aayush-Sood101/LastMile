'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { optimizeDiscountsWithLogistics } from '@/utils/logisticsApi';
import { toast } from 'react-hot-toast';

const LogisticsOptimizer = () => {
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  
  // Logistics parameters
  const [params, setParams] = useState({
    targetMargin: 0.2,
    maxDiscount: 0.5,
    distanceKm: 10,
    costPerKm: 55,
    numHouseholds: 50
  });
  
  // Form for adding product
  const [productForm, setProductForm] = useState({
    productId: '',
    quantity: 1,
    volume: 0.02,
    weight: 1.5
  });
  
  // Fetch products from API
  const fetchProducts = async () => {
    try {
      console.log('Fetching products...');
      const token = localStorage.getItem('token');
      console.log('Using token:', token ? 'Present' : 'Missing');
      
      setLoading(true);
      
      // Define possible API endpoints to try in order
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const endpoints = [
        '/api/products',                     // Next.js API route
        `${API_BASE_URL}/api/products`,      // Direct backend API
        'http://localhost:5000/api/products' // Explicit localhost
      ];
      
      let response = null;
      let successfulEndpoint = null;
      
      // Try each endpoint until one works
      for (const endpoint of endpoints) {
        console.log(`Trying to fetch products from: ${endpoint}`);
        try {
          const fetchResponse = await fetch(endpoint, {
            headers: {
              'x-auth-token': token,
              'Authorization': `Bearer ${token}`
            }
          });
          
          // If this endpoint worked, use it
          if (fetchResponse.ok) {
            response = fetchResponse;
            successfulEndpoint = endpoint;
            console.log(`Successfully connected to: ${endpoint}`);
            break;
          } else {
            console.warn(`Endpoint ${endpoint} returned status: ${fetchResponse.status}`);
          }
        } catch (fetchError) {
          console.warn(`Failed to connect to ${endpoint}:`, fetchError.message);
        }
      }
      
      // If we got a successful response from any endpoint
      if (response && response.ok) {
        const data = await response.json();
        console.log(`Fetched ${data.length} products from ${successfulEndpoint}`);
        
        // Validate products have required fields
        const validProducts = data.filter(product => 
          product._id && 
          product.name && 
          typeof product.price === 'number' && 
          product.price > 0
        );
        
        if (validProducts.length !== data.length) {
          console.warn(`Filtered out ${data.length - validProducts.length} invalid products`);
        }
        
        // Add missing fields with defaults if needed
        const productsWithDefaults = validProducts.map(product => ({
          ...product,
          costPrice: product.costPrice || product.price * 0.7,
          operationalCost: product.operationalCost || 5
        }));
        
        setProducts(productsWithDefaults);
        toast.success(`Loaded ${productsWithDefaults.length} products`);
      } else {
        console.error('All API endpoints failed');
        toast.error('Failed to load products: API endpoints unreachable');
        
        // For demo/testing purposes, create some sample products
        const sampleProducts = [
          { _id: '60d21b4667d0d8992e610c85', name: 'Sample Product 1', price: 100, costPrice: 70, operationalCost: 5 },
          { _id: '60d21b4667d0d8992e610c86', name: 'Sample Product 2', price: 200, costPrice: 140, operationalCost: 5 },
          { _id: '60d21b4667d0d8992e610c87', name: 'Sample Product 3', price: 150, costPrice: 105, operationalCost: 5 }
        ];
        
        console.log('Using sample products for demonstration');
        setProducts(sampleProducts);
        toast.info('Using sample products for demonstration');
      }
    } catch (error) {
      console.error('Unexpected error fetching products:', error);
      toast.error('Failed to load products: ' + (error.message || 'Unknown error'));
      
      // Still provide sample products for demonstration
      const sampleProducts = [
        { _id: '60d21b4667d0d8992e610c85', name: 'Sample Product 1', price: 100, costPrice: 70, operationalCost: 5 },
        { _id: '60d21b4667d0d8992e610c86', name: 'Sample Product 2', price: 200, costPrice: 140, operationalCost: 5 },
        { _id: '60d21b4667d0d8992e610c87', name: 'Sample Product 3', price: 150, costPrice: 105, operationalCost: 5 }
      ];
      
      console.log('Using sample products for demonstration after error');
      setProducts(sampleProducts);
      toast.info('Using sample products for demonstration');
    } finally {
      setLoading(false);
    }
  };
  
  // Call fetchProducts on component mount
  useEffect(() => {
    fetchProducts();
  }, []);
  
  // Handle input change for optimization parameters
  const handleParamChange = (e) => {
    const { name, value } = e.target;
    setParams(prev => ({
      ...prev,
      [name]: parseFloat(value)
    }));
  };
  
  // Handle product form change
  const handleProductFormChange = (e) => {
    const { name, value } = e.target;
    setProductForm(prev => ({
      ...prev,
      [name]: name === 'productId' ? value : parseFloat(value)
    }));
  };
  
  // Add product to selected products
  const handleAddProduct = () => {
    console.log('handleAddProduct called', productForm);
    const product = products.find(p => p._id === productForm.productId);
    
    if (!product) {
      toast.error('Please select a valid product');
      return;
    }
    
    console.log('Product found:', product);
    
    // Check if product already exists
    const existingIndex = selectedProducts.findIndex(p => p.productId === productForm.productId);
    
    if (existingIndex >= 0) {
      // Update existing product
      const updatedProducts = [...selectedProducts];
      updatedProducts[existingIndex] = {
        ...updatedProducts[existingIndex],
        quantity: productForm.quantity,
        volume: productForm.volume,
        weight: productForm.weight
      };
      
      setSelectedProducts(updatedProducts);
      console.log('Updated existing product', updatedProducts);
      toast.success(`Updated ${product.name}`);
    } else {
      // Add new product
      const newProduct = {
        productId: product._id,
        name: product.name,
        price: product.price,
        costPrice: product.costPrice || (product.price * 0.7),
        operationalCost: product.operationalCost || 5,
        quantity: productForm.quantity,
        volume: productForm.volume,
        weight: productForm.weight
      };
      
      setSelectedProducts(prev => [...prev, newProduct]);
      console.log('Added new product', newProduct);
      toast.success(`Added ${product.name}`);
    }
    
    // Reset form
    setProductForm({
      productId: '',
      quantity: 1,
      volume: 0.02,
      weight: 1.5
    });
  };
  
  // Remove product from selected products
  const handleRemoveProduct = (index) => {
    setSelectedProducts(prev => prev.filter((_, i) => i !== index));
  };
  
  // Run optimization
  const handleOptimize = async () => {
    if (selectedProducts.length === 0) {
      toast.error('Please add at least one product');
      return;
    }
    
    // Validate all required fields
    let validationErrors = [];
    
    // Check parameter ranges
    if (params.targetMargin < 0 || params.targetMargin > 1) {
      validationErrors.push('Target margin must be between 0 and 1');
    }
    
    if (params.maxDiscount < 0 || params.maxDiscount > 1) {
      validationErrors.push('Max discount must be between 0 and 1');
    }
    
    if (params.distanceKm <= 0) {
      validationErrors.push('Distance must be greater than 0');
    }
    
    if (params.costPerKm <= 0) {
      validationErrors.push('Cost per km must be greater than 0');
    }
    
    if (params.numHouseholds <= 0) {
      validationErrors.push('Number of households must be greater than 0');
    }
    
    // Check product data
    selectedProducts.forEach((product, index) => {
      if (!product.productId || !product.productId.match(/^[0-9a-fA-F]{24}$/)) {
        validationErrors.push(`Product #${index + 1} has an invalid ID`);
      }
      
      if (!product.quantity || product.quantity <= 0) {
        validationErrors.push(`Product #${index + 1} must have a positive quantity`);
      }
      
      if (!product.volume || product.volume <= 0) {
        validationErrors.push(`Product #${index + 1} must have a positive volume`);
      }
      
      if (!product.weight || product.weight <= 0) {
        validationErrors.push(`Product #${index + 1} must have a positive weight`);
      }
    });
    
    // Show validation errors and exit if any
    if (validationErrors.length > 0) {
      console.error('Validation errors:', validationErrors);
      toast.error(`Please fix the following errors: ${validationErrors[0]}`);
      return;
    }
    
    setLoading(true);
    
    try {
      // Prepare data for API
      const optimizationData = {
        productIds: selectedProducts.map(p => p.productId),
        quantities: selectedProducts.map(p => parseInt(p.quantity, 10) || 1), // Ensure quantities are numbers
        volumePerUnit: selectedProducts.map(p => parseFloat(p.volume) || 0.02), // Ensure volumes are numbers
        weightPerUnit: selectedProducts.map(p => parseFloat(p.weight) || 1.5), // Ensure weights are numbers
        targetMargin: parseFloat(params.targetMargin) || 0.2,
        maxDiscount: parseFloat(params.maxDiscount) || 0.5,
        distanceKm: parseFloat(params.distanceKm) || 10,
        costPerKm: parseFloat(params.costPerKm) || 55,
        numHouseholds: parseInt(params.numHouseholds, 10) || 50
      };
      
      // Validate array lengths are consistent
      const arrayLengths = [
        optimizationData.productIds.length,
        optimizationData.quantities.length,
        optimizationData.volumePerUnit.length,
        optimizationData.weightPerUnit.length
      ];
      
      if (new Set(arrayLengths).size !== 1) {
        throw new Error('Inconsistent data arrays. This is likely a bug in the application.');
      }
      
      // Log detailed request for debugging
      console.log('Sending optimization request with data:', JSON.stringify(optimizationData, null, 2));
      console.log('Selected products details:', JSON.stringify(selectedProducts, null, 2));
      
      toast.loading('Running optimization...');
      
      const result = await optimizeDiscountsWithLogistics(optimizationData);
      
      toast.dismiss();
      setResults(result);
      
      // Show different success messages for real vs mock data
      if (result.isMockData) {
        toast.success('Optimization completed with sample data (offline mode)');
        console.log('Using mock optimization results (offline mode)');
      } else {
        toast.success('Optimization completed successfully');
      }
    } catch (error) {
      toast.dismiss();
      console.error('Optimization error:', error);
      
      // Show a more detailed error message
      const errorMessage = error.message || 'Failed to optimize';
      toast.error(errorMessage);
      
      // Additional debugging help in console
      console.log('Debug info for optimization error:');
      console.log('- Selected products:', selectedProducts);
      console.log('- Parameters:', params);
      
      // Suggest solutions based on common errors
      if (errorMessage.includes('404')) {
        console.log('Suggestion: The API endpoint might not be available or incorrectly configured');
        toast.error('Server endpoint not found. Please check if the backend server is running.');
      } else if (errorMessage.includes('401') || errorMessage.includes('403')) {
        console.log('Suggestion: Authentication issue. Token might be invalid or expired');
        toast.error('Authentication failed. Try logging out and back in.');
      } else if (errorMessage.includes('Some products not found')) {
        console.log('Suggestion: Some product IDs in the request are invalid or not found in the database');
        toast.error('Some products could not be found. Please refresh the page and try again.');
      } else if (errorMessage.includes('400')) {
        console.log('Suggestion: The request data is invalid or incomplete');
        toast.error('Invalid request data. Please make sure all products have valid data.');
        
        // Force refresh the product list
        fetchProducts();
      }
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="container mx-auto p-4">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-4 text-primary-600">Logistics & Discount Optimizer</h1>
        <p className="text-gray-600">
          Optimize product discounts while considering logistics constraints and maximizing CO₂ savings.
        </p>
      </div>
      
      <div className="grid md:grid-cols-2 gap-6">
        {/* Parameters Section */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Optimization Parameters</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Target Profit Margin (0-1)
              </label>
              <input
                type="number"
                name="targetMargin"
                min="0"
                max="1"
                step="0.01"
                value={params.targetMargin}
                onChange={handleParamChange}
                className="w-full p-2 border rounded-md"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Maximum Discount (0-1)
              </label>
              <input
                type="number"
                name="maxDiscount"
                min="0"
                max="1"
                step="0.01"
                value={params.maxDiscount}
                onChange={handleParamChange}
                className="w-full p-2 border rounded-md"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Delivery Distance (km)
              </label>
              <input
                type="number"
                name="distanceKm"
                min="1"
                value={params.distanceKm}
                onChange={handleParamChange}
                className="w-full p-2 border rounded-md"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cost per km (₹)
              </label>
              <input
                type="number"
                name="costPerKm"
                min="1"
                value={params.costPerKm}
                onChange={handleParamChange}
                className="w-full p-2 border rounded-md"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Number of Households
              </label>
              <input
                type="number"
                name="numHouseholds"
                min="1"
                value={params.numHouseholds}
                onChange={handleParamChange}
                className="w-full p-2 border rounded-md"
              />
            </div>
          </div>
        </div>
        
        {/* Product Selection Section */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Add Products</h2>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Select Product
            </label>
            <select
              name="productId"
              value={productForm.productId}
              onChange={handleProductFormChange}
              className="w-full p-2 border rounded-md"
            >
              <option value="">Select a product</option>
              {products.map(product => (
                <option key={product._id} value={product._id}>
                  {product.name} - ₹{product.price}
                </option>
              ))}
            </select>
          </div>
          
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Quantity
              </label>
              <input
                type="number"
                name="quantity"
                min="1"
                value={productForm.quantity}
                onChange={handleProductFormChange}
                className="w-full p-2 border rounded-md"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Volume (m³)
              </label>
              <input
                type="number"
                name="volume"
                min="0.001"
                step="0.001"
                value={productForm.volume}
                onChange={handleProductFormChange}
                className="w-full p-2 border rounded-md"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Weight (kg)
              </label>
              <input
                type="number"
                name="weight"
                min="0.1"
                step="0.1"
                value={productForm.weight}
                onChange={handleProductFormChange}
                className="w-full p-2 border rounded-md"
              />
            </div>
          </div>
          
          <div className="mb-6">
            <button
              type="button"
              onClick={handleAddProduct}
              disabled={!productForm.productId}
              className={`w-full ${
                !productForm.productId ? 'bg-gray-300 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'
              } text-white py-2 px-4 rounded-md transition duration-200`}
            >
              Add Product
            </button>
          </div>
        </div>
      </div>
      
      {/* Selected Products Table */}
      {selectedProducts.length > 0 && (
        <div className="mt-8 bg-white p-6 rounded-lg shadow-md overflow-x-auto">
          <h2 className="text-xl font-semibold mb-4">Selected Products</h2>
          
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
                  Quantity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Volume (m³)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Weight (kg)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {selectedProducts.map((product, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {product.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ₹{product.price}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {product.quantity}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {product.volume} m³
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {product.weight} kg
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleRemoveProduct(index)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          <div className="mt-6">          <button
            type="button"
            onClick={handleOptimize}
            disabled={loading}
            className={`w-full ${
              loading ? 'bg-gray-400' : 'bg-primary-600 hover:bg-primary-700'
            } text-white py-3 px-4 rounded-md transition`}
          >
            {loading ? 'Optimizing...' : 'Run Optimization'}
          </button>
          </div>
        </div>
      )}
      
      {/* Results Section */}
      {results && (
        <div className="mt-8 bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Optimization Results</h2>
          
          <div className="grid md:grid-cols-3 gap-6 mb-6">
            {/* Financial Summary */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-md border border-blue-200 shadow-sm">
              <h3 className="text-lg font-medium mb-3 text-blue-800 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                Financial Summary
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center border-b border-blue-200 pb-1">
                  <span className="text-gray-600 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Total Revenue:
                  </span>
                  <span className="font-medium">₹{results.optimization.totalRevenue.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center border-b border-blue-200 pb-1">
                  <span className="text-gray-600 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    Total Profit:
                  </span>
                  <span className="font-medium text-blue-700">₹{results.optimization.totalProfit.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center border-b border-blue-200 pb-1">
                  <span className="text-gray-700 flex items-center font-semibold">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                    Profit Margin:
                  </span>
                  <span className="font-bold text-blue-700">{(results.optimization.finalMargin * 100).toFixed(1)}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                    Transport Cost:
                  </span>
                  <span className="font-medium text-red-500">₹{results.optimization.transportCost.toFixed(2)}</span>
                </div>
              </div>
              
              <div className="mt-3 pt-2 border-t border-blue-200">
                <p className="text-xs text-blue-800">
                  Target margin: {(results.optimization.targetMargin * 100).toFixed(1)}%
                </p>
                <div className="bg-blue-200 h-2 rounded-full mt-1 overflow-hidden">
                  <div 
                    className="bg-blue-600 h-full rounded-full" 
                    style={{ width: `${Math.min(100, (results.optimization.finalMargin / results.optimization.targetMargin) * 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>
            
            {/* Logistics Information */}
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-md border border-purple-200 shadow-sm">
              <h3 className="text-lg font-medium mb-3 text-purple-800 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                </svg>
                Logistics
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center border-b border-purple-200 pb-1">
                  <span className="text-gray-600 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    Trucks Required:
                  </span>
                  <span className="font-medium text-purple-700">{results.logistics.numTrucks}</span>
                </div>
                <div className="flex justify-between items-center border-b border-purple-200 pb-1">
                  <span className="text-gray-600 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                    </svg>
                    Delivery Distance:
                  </span>
                  <span className="font-medium">{results.logistics.distanceKm} km</span>
                </div>
                <div className="flex justify-between items-center border-b border-purple-200 pb-1">
                  <span className="text-gray-600 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Cost per km:
                  </span>
                  <span className="font-medium">₹{results.logistics.costPerKm}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-700 flex items-center font-semibold">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                    Total Transport Cost:
                  </span>
                  <span className="font-bold text-purple-700">₹{results.logistics.totalTransportCost.toFixed(2)}</span>
                </div>
              </div>
              
              <div className="mt-3 pt-2 border-t border-purple-200">
                <div className="flex justify-between items-center text-xs text-purple-800">
                  <span>Volume: {results.logistics.totalVolume?.toFixed(2) || '0.00'} m³</span>
                  <span>Weight: {results.logistics.totalWeight?.toFixed(2) || '0.00'} kg</span>
                </div>
              </div>
            </div>
            
            {/* CO2 Savings */}
            <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-md border border-green-200 shadow-sm">
              <h3 className="text-lg font-medium mb-3 text-green-800 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                CO₂ Emissions Savings
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center border-b border-green-200 pb-1">
                  <span className="text-gray-600 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                    Households Served:
                  </span>
                  <span className="font-medium">{results.emissions.numHouseholds}</span>
                </div>
                <div className="flex justify-between items-center border-b border-green-200 pb-1">
                  <span className="text-gray-600 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Individual Emissions:
                  </span>
                  <span className="font-medium text-red-500">{results.emissions.emissionIndividual.toFixed(2)} kg</span>
                </div>
                <div className="flex justify-between items-center border-b border-green-200 pb-1">
                  <span className="text-gray-600 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Bulk Delivery Emissions:
                  </span>
                  <span className="font-medium text-green-500">{results.emissions.emissionBulk.toFixed(2)} kg</span>
                </div>
                <div className="flex justify-between items-center border-b border-green-200 pb-1">
                  <span className="text-gray-700 flex items-center font-semibold">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
                    </svg>
                    CO₂ Saved:
                  </span>
                  <span className="font-bold text-green-600">
                    {results.emissions.emissionSaved.toFixed(2)} kg
                  </span>
                </div>
                <div className="flex justify-between items-center pt-1">
                  <span className="text-gray-700 flex items-center font-semibold">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                    Emission Reduction:
                  </span>
                  <span className="font-bold text-green-600">
                    {results.emissions.relativeReduction.toFixed(1)}%
                  </span>
                </div>
              </div>
              <div className="mt-3 pt-2 border-t border-green-200">
                <p className="text-xs text-green-800">
                  Equivalent to planting {Math.ceil(results.emissions.emissionSaved / 22)} trees
                </p>
                <div className="flex mt-1">
                  {Array.from({ length: Math.min(5, Math.ceil(results.emissions.emissionSaved / 22)) }).map((_, i) => (
                    <svg key={i} className="h-4 w-4 text-green-600 mr-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2L8 8H3L7 13L5 19L12 15L19 19L17 13L21 8H16L12 2Z"/>
                    </svg>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          {/* Product Details Table */}
          <h3 className="text-lg font-medium mb-3">Product Details</h3>
          <div className="overflow-x-auto">
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
                    Discount (%)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Final Price (₹)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Profit (₹)
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {results.optimization.productDetails.map((product, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {product.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      ₹{product.retailPrice.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {(product.discount * 100).toFixed(2)}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      ₹{product.finalPrice.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {product.quantity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      ₹{product.profit.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default LogisticsOptimizer;
