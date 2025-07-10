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
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
        {error}
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-8 text-center">
        <h3 className="text-xl font-semibold mb-2">No Orders Yet</h3>
        <p className="text-gray-600 mb-4">
          You haven't placed any orders yet.
        </p>
        <button
          className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg"
          onClick={() => router.push('/products')}
        >
          Start Shopping
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <h2 className="text-xl font-semibold p-6 border-b">Your Orders</h2>
      
      <div className="divide-y">
        {orders.map(order => (
          <div 
            key={order._id} 
            className="p-6 hover:bg-gray-50 cursor-pointer"
            onClick={() => router.push(`/orders/${order._id}`)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="mr-4">
                  {getStatusIcon(order.status)}
                </div>
                <div>
                  <div className="font-medium">Order #{order._id.substring(0, 8)}...</div>
                  <div className="text-sm text-gray-500">{formatDate(order.createdAt)}</div>
                </div>
              </div>
              
              <div className="flex items-center">
                <div className="mr-4 text-right">
                  <div className="font-medium">${order.totalAmount.toFixed(2)}</div>
                  <div className="text-sm">
                    <span className={`inline-block px-2 py-1 rounded-full text-xs ${getStatusClass(order.status)}`}>
                      {order.status}
                    </span>
                  </div>
                </div>
                <FaAngleRight className="text-gray-400" />
              </div>
            </div>
            
            <div className="mt-2 text-sm text-gray-500">
              {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
              {order.isGroupOrder && ' • Community Order'}
            </div>
          </div>
        ))}
      </div>
      
      {orders.length > 5 && (
        <div className="p-4 text-center">
          <button 
            className="text-green-600 hover:text-green-700 font-medium"
            onClick={() => router.push('/orders')}
          >
            View All Orders
          </button>
        </div>
      )}
    </div>
  );
}
