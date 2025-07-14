'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import PageHeader from '@/components/PageHeader';
import { Card, CardBody, Button } from '@/components/Card';
import { useToast } from '@/components/Toast';
import { API_URL } from '@/utils/apiConfig';
import { 
  FaBox, 
  FaTruck, 
  FaCheckCircle, 
  FaTimesCircle, 
  FaAngleRight, 
  FaSearch,
  FaFilter,
  FaSort,
  FaShoppingBag,
  FaCalendarAlt
} from 'react-icons/fa';

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
        `${API_URL}/api/orders`,
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
        (order._id && order._id.toLowerCase().includes(term)) ||
        (order.items && Array.isArray(order.items) && order.items.some(item => 
          item && item.product && item.product.name && 
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
    // Use default status if none is provided
    if (!status) status = 'pending';
    
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

  // Filter button component for a more consistent UI
  function FilterButton({ children, active, onClick, color = 'emerald', icon = null }) {
    const colorClasses = {
      emerald: active ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200',
      blue: active ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200',
      yellow: active ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200',
      red: active ? 'bg-gradient-to-r from-red-500 to-red-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200',
    };

    return (
      <button
        className={`px-5 py-3 rounded-xl text-sm font-medium transition-all duration-200 shadow-sm flex items-center ${colorClasses[color]}`}
        onClick={onClick}
      >
        {icon}
        {children}
      </button>
    );
  }

  // Order card component for a cleaner implementation
  function OrderCard({ order, index, formatDate, getStatusIcon, getStatusClass, onClick }) {
    return (
      <Card animate delay={index * 0.05}>
        <div 
          className="p-6 cursor-pointer"
          onClick={onClick}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center">
              <div className="mr-4 p-3 rounded-full bg-gradient-to-br from-gray-50 to-gray-100 shadow-inner">
                {getStatusIcon(order.status)}
              </div>
              <div>
                <div className="font-semibold text-lg">Order #{order._id.substring(0, 8)}...</div>
                <div className="flex items-center text-gray-500 text-sm mt-1">
                  <FaCalendarAlt className="mr-1.5" size={14} />
                  {formatDate(order.createdAt)}
                </div>
              </div>
            </div>
            
            <div className="flex items-center sm:text-right">
              <div>
                <div className="font-bold text-xl text-gray-900">${(order.totalAmount || 0).toFixed(2)}</div>
                <div className="mt-1">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusClass(order.status || 'pending')}`}>
                    {(order.status || 'pending').charAt(0).toUpperCase() + (order.status || 'pending').slice(1)}
                  </span>
                </div>
              </div>
              <div className="ml-6 p-2 rounded-full bg-emerald-50">
                <FaAngleRight className="text-emerald-500" />
              </div>
            </div>
          </div>
          
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <div>
                <span className="font-medium">{order.items?.length || 0}</span> {(order.items?.length || 0) === 1 ? 'item' : 'items'}
              </div>
              {order.isGroupOrder && (
                <div className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
                  Community Order
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <PageHeader 
          title="Your Orders" 
          subtitle="Track, manage and review your purchases" 
        />
        
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-emerald-500 mb-4"></div>
            <p className="text-gray-500">Loading your orders...</p>
          </div>
        ) : error ? (
          <Card className="mb-6 border-l-4 border-red-500">
            <CardBody className="flex">
              <div className="flex-shrink-0">
                <FaTimesCircle className="h-5 w-5 text-red-500" />
              </div>
              <div className="ml-3">
                <h3 className="text-red-800 font-medium">Something went wrong</h3>
                <p className="text-red-700 mt-1">{error}</p>
              </div>
            </CardBody>
          </Card>
        ) : orders.length === 0 ? (
          <Card className="max-w-2xl mx-auto text-center p-12">
            <CardBody>
              <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <FaShoppingBag className="h-10 w-10 text-emerald-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">No Orders Yet</h3>
              <p className="text-gray-600 mb-8">
                Start your shopping journey and enjoy community-based bulk discounts!
              </p>
              <Button
                variant="primary"
                size="lg"
                onClick={() => router.push('/dashboard')}
              >
                Explore Products
              </Button>
            </CardBody>
          </Card>
        ) : (
          <>
            <Card className="mb-8">
              <CardBody>
                <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-6">
                  {/* Search */}
                  <div className="relative flex-1">
                    <input
                      type="text"
                      placeholder="Search by order ID or product name..."
                      className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 outline-none"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  </div>
                  
                  {/* Filter */}
                  <div className="flex flex-wrap gap-3">
                    <FilterButton 
                      active={filter === 'all'} 
                      onClick={() => setFilter('all')}
                      color="emerald"
                    >
                      All
                    </FilterButton>
                    <FilterButton 
                      active={filter === 'processing'} 
                      onClick={() => setFilter('processing')}
                      color="blue"
                      icon={<FaBox className="mr-2" />}
                    >
                      Processing
                    </FilterButton>
                    <FilterButton 
                      active={filter === 'shipped'} 
                      onClick={() => setFilter('shipped')}
                      color="yellow"
                      icon={<FaTruck className="mr-2" />}
                    >
                      Shipped
                    </FilterButton>
                    <FilterButton 
                      active={filter === 'delivered'} 
                      onClick={() => setFilter('delivered')}
                      color="emerald"
                      icon={<FaCheckCircle className="mr-2" />}
                    >
                      Delivered
                    </FilterButton>
                    <FilterButton 
                      active={filter === 'cancelled'} 
                      onClick={() => setFilter('cancelled')}
                      color="red"
                      icon={<FaTimesCircle className="mr-2" />}
                    >
                      Cancelled
                    </FilterButton>
                  </div>
                </div>
              </CardBody>
            </Card>
            
            <div className="space-y-4">
              {filteredOrders.length > 0 ? (
                filteredOrders.map((order, index) => (
                  <OrderCard 
                    key={order._id} 
                    order={order}
                    index={index}
                    formatDate={formatDate}
                    getStatusIcon={getStatusIcon}
                    getStatusClass={getStatusClass}
                    onClick={() => router.push(`/orders/${order._id}`)}
                  />
                ))
              ) : (
                <Card className="text-center p-10">
                  <CardBody>
                    <FaFilter className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">No Orders Found</h3>
                    <p className="text-gray-500">Try adjusting your filters or search term.</p>
                  </CardBody>
                </Card>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
