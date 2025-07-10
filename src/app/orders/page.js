'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Navbar from '@/components/Navbar';
import { useToast } from '@/components/Toast';
import { FaBox, FaTruck, FaCheckCircle, FaTimesCircle, FaAngleRight, FaSearch } from 'react-icons/fa';

export default function Orders() {
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all'); // all, processing, shipped, delivered, cancelled
  const { showToast } = useToast();

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/auth/login');
      return;
    }

    fetchOrders();
  }, [router]);

  useEffect(() => {
    if (orders.length > 0) {
      filterOrders();
    }
  }, [orders, searchTerm, filter]);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await axios.get(
        'http://localhost:5000/api/orders',
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setOrders(response.data);
      setFilteredOrders(response.data);
      showToast(`Loaded ${response.data.length} orders`, 'info');
    } catch (error) {
      console.error('Error fetching orders:', error);
      setError('Failed to load orders. Please try again later.');
      showToast('Failed to load orders. Please try again later.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const filterOrders = () => {
    let result = [...orders];
    
    // Apply status filter
    if (filter !== 'all') {
      result = result.filter(order => order.status === filter);
    }
    
    // Apply search
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      result = result.filter(order => 
        order._id.toLowerCase().includes(term) ||
        (order.items.some(item => 
          item.product.name.toLowerCase().includes(term)
        ))
      );
    }
    
    setFilteredOrders(result);
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Your Orders</h1>
        
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600"></div>
          </div>
        ) : error ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        ) : orders.length === 0 ? (
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
        ) : (
          <>
            <div className="mb-6">
              <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                {/* Search */}
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search orders..."
                    className="input-field pl-10 py-2 pr-4 w-full md:w-80"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <FaSearch className="absolute left-3 top-3 text-gray-400" />
                </div>
                
                {/* Filter */}
                <div className="flex flex-wrap gap-2">
                  <button
                    className={`px-4 py-2 rounded-full text-sm font-medium ${filter === 'all' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-800'}`}
                    onClick={() => setFilter('all')}
                  >
                    All
                  </button>
                  <button
                    className={`px-4 py-2 rounded-full text-sm font-medium ${filter === 'processing' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'}`}
                    onClick={() => setFilter('processing')}
                  >
                    Processing
                  </button>
                  <button
                    className={`px-4 py-2 rounded-full text-sm font-medium ${filter === 'shipped' ? 'bg-yellow-600 text-white' : 'bg-gray-200 text-gray-800'}`}
                    onClick={() => setFilter('shipped')}
                  >
                    Shipped
                  </button>
                  <button
                    className={`px-4 py-2 rounded-full text-sm font-medium ${filter === 'delivered' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-800'}`}
                    onClick={() => setFilter('delivered')}
                  >
                    Delivered
                  </button>
                  <button
                    className={`px-4 py-2 rounded-full text-sm font-medium ${filter === 'cancelled' ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-800'}`}
                    onClick={() => setFilter('cancelled')}
                  >
                    Cancelled
                  </button>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              {filteredOrders.length > 0 ? (
                <div className="divide-y">
                  {filteredOrders.map(order => (
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
              ) : (
                <div className="p-8 text-center">
                  <h3 className="text-lg font-semibold mb-2">No Orders Found</h3>
                  <p className="text-gray-600">Try adjusting your filters or search term.</p>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
