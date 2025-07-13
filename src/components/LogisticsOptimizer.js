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
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('/api/products', {
          headers: {
            'x-auth-token': localStorage.getItem('token')
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setProducts(data);
        }
      } catch (error) {
        console.error('Error fetching products:', error);
        toast.error('Failed to load products');
      }
    };
    
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
    const product = products.find(p => p._id === productForm.productId);
    
    if (!product) {
      toast.error('Please select a valid product');
      return;
    }
    
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
    } else {
      // Add new product
      setSelectedProducts(prev => [
        ...prev,
        {
          productId: product._id,
          name: product.name,
          price: product.price,
          costPrice: product.costPrice || (product.price * 0.7),
          operationalCost: product.operationalCost || 5,
          quantity: productForm.quantity,
          volume: productForm.volume,
          weight: productForm.weight
        }
      ]);
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
    
    setLoading(true);
    
    try {
      // Prepare data for API
      const optimizationData = {
        productIds: selectedProducts.map(p => p.productId),
        quantities: selectedProducts.map(p => p.quantity),
        volumePerUnit: selectedProducts.map(p => p.volume),
        weightPerUnit: selectedProducts.map(p => p.weight),
        targetMargin: params.targetMargin,
        maxDiscount: params.maxDiscount,
        distanceKm: params.distanceKm,
        costPerKm: params.costPerKm,
        numHouseholds: params.numHouseholds
      };
      
      const result = await optimizeDiscountsWithLogistics(optimizationData);
      setResults(result);
      toast.success('Optimization completed successfully');
    } catch (error) {
      console.error('Optimization error:', error);
      toast.error(error.message || 'Failed to optimize');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="container mx-auto p-4">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-4">Logistics & Discount Optimizer</h1>
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
          
          <button
            type="button"
            onClick={handleAddProduct}
            className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition"
          >
            Add Product
          </button>
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
          
          <div className="mt-6">
            <button
              type="button"
              onClick={handleOptimize}
              disabled={loading}
              className={`w-full ${
                loading ? 'bg-gray-400' : 'bg-green-500 hover:bg-green-600'
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
            <div className="bg-gray-50 p-4 rounded-md">
              <h3 className="text-lg font-medium mb-3">Financial Summary</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Revenue:</span>
                  <span className="font-medium">₹{results.optimization.totalRevenue.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Profit:</span>
                  <span className="font-medium">₹{results.optimization.totalProfit.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Profit Margin:</span>
                  <span className="font-medium">{(results.optimization.finalMargin * 100).toFixed(2)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Transport Cost:</span>
                  <span className="font-medium">₹{results.optimization.transportCost.toFixed(2)}</span>
                </div>
              </div>
            </div>
            
            {/* Logistics Information */}
            <div className="bg-gray-50 p-4 rounded-md">
              <h3 className="text-lg font-medium mb-3">Logistics</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Trucks Required:</span>
                  <span className="font-medium">{results.logistics.numTrucks}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Delivery Distance:</span>
                  <span className="font-medium">{results.logistics.distanceKm} km</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Cost per km:</span>
                  <span className="font-medium">₹{results.logistics.costPerKm}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Transport Cost:</span>
                  <span className="font-medium">₹{results.logistics.totalTransportCost.toFixed(2)}</span>
                </div>
              </div>
            </div>
            
            {/* CO2 Savings */}
            <div className="bg-gray-50 p-4 rounded-md">
              <h3 className="text-lg font-medium mb-3">CO₂ Emissions Savings</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Households Served:</span>
                  <span className="font-medium">{results.emissions.numHouseholds}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Individual Emissions:</span>
                  <span className="font-medium">{results.emissions.emissionIndividual.toFixed(2)} kg CO₂</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Bulk Delivery Emissions:</span>
                  <span className="font-medium">{results.emissions.emissionBulk.toFixed(2)} kg CO₂</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">CO₂ Saved:</span>
                  <span className="font-medium text-green-600">
                    {results.emissions.emissionSaved.toFixed(2)} kg CO₂
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Emission Reduction:</span>
                  <span className="font-medium text-green-600">
                    {results.emissions.relativeReduction.toFixed(2)}%
                  </span>
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
