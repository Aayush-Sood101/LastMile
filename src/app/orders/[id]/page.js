'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import React from 'react';
import axios from 'axios';
import Navbar from '@/components/Navbar';
import { useToast } from '@/components/Toast';
import { FaCheckCircle, FaTruck, FaBox, FaLeaf, FaMapMarkerAlt, FaCreditCard, FaCalendarAlt, FaUsers } from 'react-icons/fa';

export default function OrderDetails({ params }) {
  const router = useRouter();
  const unwrappedParams = React.use(params);
  const { id } = unwrappedParams;
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { showToast } = useToast();

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/auth/login');
      return;
    }

    // Fetch order details
    fetchOrderDetails();
  }, [id, router]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await axios.get(
        `http://localhost:5000/api/orders/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setOrder(response.data);
      showToast('Order details loaded successfully', 'info');
    } catch (error) {
      console.error('Error fetching order details:', error);
      setError('Failed to load order details. Please try again later.');
      showToast('Failed to load order details', 'error');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'processing':
        return 'text-blue-600';
      case 'shipped':
        return 'text-yellow-600';
      case 'delivered':
        return 'text-green-600';
      case 'cancelled':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'processing':
        return 'Processing';
      case 'shipped':
        return 'Shipped';
      case 'delivered':
        return 'Delivered';
      case 'cancelled':
        return 'Cancelled';
      default:
        return 'Unknown Status';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-6xl mx-auto px-4 py-8">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600"></div>
          </div>
        ) : error ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        ) : order ? (
          <div>
            {/* Order Confirmation Header */}
            <div className="bg-white rounded-xl shadow-sm p-6 mb-6 text-center">
              <div className="mx-auto w-16 h-16 flex items-center justify-center bg-green-100 text-green-600 rounded-full mb-4">
                <FaCheckCircle className="w-8 h-8" />
              </div>
              <h1 className="text-3xl font-bold text-gray-800">Order Confirmed!</h1>
              <p className="text-gray-600 mt-2">
                Thank you for your order. We've received your order and will process it shortly.
              </p>
              <div className="mt-4 inline-block bg-gray-100 px-4 py-2 rounded-lg">
                <span className="text-gray-500">Order ID: </span>
                <span className="font-medium">{order._id}</span>
              </div>
            </div>
            
            {/* Order Status */}
            <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">Order Status</h2>
              
              <div className="flex items-center">
                <div className={`text-2xl ${getStatusColor(order.status)}`}>
                  {order.status === 'processing' && <FaBox />}
                  {order.status === 'shipped' && <FaTruck />}
                  {order.status === 'delivered' && <FaCheckCircle />}
                  {order.status === 'cancelled' && <FaTimesCircle />}
                </div>
                <div className="ml-3">
                  <p className={`font-semibold ${getStatusColor(order.status)}`}>{getStatusLabel(order.status)}</p>
                  <p className="text-sm text-gray-600">Last updated: {formatDate(order.updatedAt || order.createdAt)}</p>
                </div>
              </div>
              
              <div className="mt-6 border-t pt-6">
                <div className="flex items-center text-sm">
                  <FaCalendarAlt className="text-gray-500 mr-2" />
                  <span className="text-gray-700">Order Date: </span>
                  <span className="ml-2 font-medium">{formatDate(order.createdAt)}</span>
                </div>
                
                {order.paymentMethod && (
                  <div className="flex items-center text-sm mt-3">
                    <FaCreditCard className="text-gray-500 mr-2" />
                    <span className="text-gray-700">Payment Method: </span>
                    <span className="ml-2 font-medium capitalize">{order.paymentMethod}</span>
                  </div>
                )}
                
                {order.shippingAddress && (
                  <div className="flex items-center text-sm mt-3">
                    <FaMapMarkerAlt className="text-gray-500 mr-2 flex-shrink-0" />
                    <div>
                      <span className="text-gray-700">Shipping Address: </span>
                      <span className="ml-2 font-medium">
                        {typeof order.shippingAddress === 'object' 
                          ? `${order.shippingAddress.street || ''}, ${order.shippingAddress.city || ''}, ${order.shippingAddress.state || ''} ${order.shippingAddress.zipCode || ''}`.trim()
                          : order.shippingAddress}
                      </span>
                    </div>
                  </div>
                )}
                
                {order.isGroupOrder && (
                  <div className="flex items-center text-sm mt-3">
                    <FaUsers className="text-gray-500 mr-2" />
                    <span className="text-gray-700">Community Order: </span>
                    <span className="ml-2 font-medium">Yes</span>
                  </div>
                )}
                
                {order.carbonFootprintSaved && order.carbonFootprintSaved > 0 && (
                  <div className="flex items-center text-sm mt-3">
                    <FaLeaf className="text-green-600 mr-2" />
                    <span className="text-gray-700">Carbon Saved: </span>
                    <span className="ml-2 font-medium text-green-600">
                      {(order.carbonFootprintSaved || 0).toFixed(2)} kg
                    </span>
                  </div>
                )}
              </div>
            </div>
            
            {/* Order Items */}
            <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">Order Items</h2>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Product
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Quantity
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Price
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {order.items && order.items.map((item, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {item.product && item.product.imageUrl && (
                              <img 
                                src={item.product.imageUrl} 
                                alt={item.product?.name || 'Product'} 
                                className="w-10 h-10 object-cover rounded-md mr-3"
                              />
                            )}
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {item.product?.name || 'Unknown Product'}
                              </div>
                              <div className="text-xs text-gray-500">
                                {item.product?.category || 'Uncategorized'}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{item.quantity || 1}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">${(item.price || (item.product && item.product.price) || 0).toFixed(2)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium">
                            ${((item.price || (item.product && item.product.price) || 0) * (item.quantity || 1)).toFixed(2)}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {/* Order Summary */}
              <div className="mt-6 border-t pt-6">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="font-medium">${order.subtotalPrice?.toFixed(2) || (order.totalAmount?.toFixed(2) || '0.00')}</span>
                </div>
                
                {order.discountAmount && order.discountAmount > 0 && (
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">Discount:</span>
                    <span className="font-medium text-green-600">-${(order.discountAmount || 0).toFixed(2)}</span>
                  </div>
                )}
                
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Shipping:</span>
                  <span className="font-medium">${order.shippingPrice?.toFixed(2) || '0.00'}</span>
                </div>
                
                <div className="flex justify-between mt-4 pt-4 border-t">
                  <span className="font-bold text-lg">Total:</span>
                  <span className="font-bold text-lg">${order.totalAmount?.toFixed(2) || '0.00'}</span>
                </div>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex flex-col md:flex-row justify-center gap-4 mt-6">
              <button
                className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg"
                onClick={() => router.push('/dashboard')}
              >
                Go to Dashboard
              </button>
              
              <button
                className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium rounded-lg"
                onClick={() => router.push('/products')}
              >
                Continue Shopping
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm p-8 text-center">
            <h3 className="text-xl font-semibold mb-2">Order not found</h3>
            <p className="text-gray-600 mb-4">
              The order you're looking for doesn't exist or you don't have permission to view it.
            </p>
            <button
              className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg"
              onClick={() => router.push('/dashboard')}
            >
              Go to Dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
