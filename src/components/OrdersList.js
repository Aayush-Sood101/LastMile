'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { FaBox, FaTruck, FaCheckCircle, FaTimesCircle, FaAngleRight } from 'react-icons/fa';
import { useToast } from '@/components/Toast';

export default function OrdersList() {
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { showToast } = useToast();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        showToast('Authentication required. Please log in.', 'error');
        router.push('/auth/login');
        return;
      }
      
      const response = await axios.get(
        'http://localhost:5000/api/orders',
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setOrders(response.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setError('Failed to load orders. Please try again later.');
      showToast('Failed to load your orders. Please try again later.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'processing':
        return <FaBox className="text-blue-600" />;
      case 'shipped':
        return <FaTruck className="text-yellow-600" />;
      case 'delivered':
        return <FaCheckCircle className="text-green-600" />;
      case 'cancelled':
        return <FaTimesCircle className="text-red-600" />;
      default:
        return <FaBox className="text-gray-600" />;
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-yellow-100 text-yellow-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600 mb-4"></div>
        <p className="text-gray-500 font-medium">Loading your orders...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl shadow-sm mb-4">
        <div className="flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-8 text-center">
        <div className="inline-flex h-20 w-20 rounded-full bg-gray-100 p-4 mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-full w-full text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold mb-2">No Orders Yet</h3>
        <p className="text-gray-600 mb-6 max-w-md mx-auto">
          You haven't placed any orders yet. Start shopping to see your order history here.
        </p>
        <button
          className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors duration-200 inline-flex items-center"
          onClick={() => router.push('/dashboard')}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
          Start Shopping
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-b-xl shadow-sm overflow-hidden">
      <div className="p-6 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center">
          <div className="h-10 w-10 bg-primary-50 rounded-lg flex items-center justify-center mr-3">
            <FaBox className="text-primary-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-800">Your Orders</h2>
        </div>
        
        <div className="text-sm text-gray-500">
          {orders.length} {orders.length === 1 ? 'order' : 'orders'} total
        </div>
      </div>
      
      <div className="divide-y divide-gray-100">
        {orders.map(order => (
          <div 
            key={order._id} 
            className="p-6 hover:bg-gray-50 transition-colors duration-150 cursor-pointer relative group"
            onClick={() => router.push(`/orders/${order._id}`)}
          >
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div className="flex items-center mb-3 md:mb-0">
                <div className={`h-12 w-12 rounded-xl flex items-center justify-center mr-4 ${
                  order.status === 'delivered' ? 'bg-green-100' :
                  order.status === 'shipped' ? 'bg-yellow-100' :
                  order.status === 'cancelled' ? 'bg-red-100' : 'bg-blue-100'
                }`}>
                  {getStatusIcon(order.status)}
                </div>
                <div>
                  <div className="font-medium text-gray-900">Order #{order._id.substring(0, 8)}</div>
                  <div className="text-sm text-gray-500 mt-1">{formatDate(order.createdAt)}</div>
                </div>
              </div>
              
              <div className="flex items-center justify-between md:justify-end w-full md:w-auto">
                <div className="flex items-center md:mr-6">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusClass(order.status)}`}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </span>
                  {order.isGroupOrder && (
                    <span className="ml-2 inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      Community
                    </span>
                  )}
                </div>
                
                <div className="flex items-center">
                  <div className="font-medium text-lg text-gray-800 mr-3">${order.totalAmount.toFixed(2)}</div>
                  <div className="bg-gray-100 group-hover:bg-gray-200 rounded-full p-2 transition-colors duration-150">
                    <FaAngleRight className="text-gray-600" />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-3 flex flex-wrap items-center">
              <div className="text-sm text-gray-500 mr-4">
                <span className="font-medium text-gray-700">{order.items.length}</span> {order.items.length === 1 ? 'item' : 'items'}
              </div>
              
              {order.items.slice(0, 3).map((item, index) => (
                <div key={index} className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded-md mr-2 mt-2">
                  {item.product.name.length > 15 ? item.product.name.substring(0, 15) + '...' : item.product.name} (x{item.quantity})
                </div>
              ))}
              
              {order.items.length > 3 && (
                <div className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded-md mt-2">
                  +{order.items.length - 3} more
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      
      {orders.length > 5 && (
        <div className="p-6 text-center bg-gray-50 border-t border-gray-100">
          <button 
            className="px-6 py-2 bg-white border border-primary-200 text-primary-700 rounded-lg font-medium hover:bg-primary-50 transition-colors duration-200 inline-flex items-center shadow-sm"
            onClick={() => router.push('/orders')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
            View All Orders
          </button>
        </div>
      )}
    </div>
  );
}
