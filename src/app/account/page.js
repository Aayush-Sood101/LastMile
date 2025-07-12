'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import OrdersList from '@/components/OrdersList';
import { useToast } from '@/components/Toast';
import { FaUserEdit, FaLeaf, FaShoppingBag, FaUsers, FaClipboardList, FaEnvelope, FaPhone, FaMapMarkerAlt } from 'react-icons/fa';

export default function Account() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [carbonStats, setCarbonStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('profile');
  const [editMode, setEditMode] = useState(false);
  const { showToast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    address: '',
    phone: '',
  });

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/auth/login');
      return;
    }

    // Fetch user data
    fetchUserData();
  }, [router]);

  const fetchUserData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      // Get user profile
      const userResponse = await axios.get('http://localhost:5000/api/users/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setUser(userResponse.data);
      setFormData({
        name: userResponse.data.name || '',
        email: userResponse.data.email || '',
        address: userResponse.data.address || '',
        phone: userResponse.data.phone || '',
      });
      
      // Get user orders
      const ordersResponse = await axios.get('http://localhost:5000/api/orders', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setOrders(ordersResponse.data);
      
      // Get carbon stats
      const carbonResponse = await axios.get('http://localhost:5000/api/orders/carbon-stats/user', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setCarbonStats(carbonResponse.data);
      
    } catch (error) {
      console.error('Error fetching user data:', error);
      setError('Failed to load user data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        'http://localhost:5000/api/users/me',
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Update local user data
      setUser({
        ...user,
        ...formData
      });
      
      // Update localStorage user data
      const localUser = JSON.parse(localStorage.getItem('user') || '{}');
      localStorage.setItem('user', JSON.stringify({
        ...localUser,
        name: formData.name,
        email: formData.email,
      }));
      
      setEditMode(false);
      showToast('Profile updated successfully!', 'success');
    } catch (error) {
      console.error('Error updating profile:', error);
      showToast('Failed to update profile. Please try again.', 'error');
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <motion.div 
        className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.4 }}
          >
            <h1 className="text-3xl font-bold text-gray-800 flex items-center">
              <span className="bg-primary-50 p-2 rounded-full mr-3 text-primary-600">
                <FaUserEdit className="h-6 w-6" />
              </span>
              My Account
            </h1>
            <p className="text-gray-600 mt-2">Manage your profile and explore your order history</p>
          </motion.div>
          
          {!loading && !error && user && (
            <motion.div 
              className="mt-4 md:mt-0"
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.4 }}
            >
              <div className="inline-flex items-center px-4 py-2 bg-primary-50 text-primary-700 rounded-full shadow-sm">
                <span className="font-semibold">{user.communities?.length || 0}</span>
                <span className="mx-2">•</span>
                <span className="flex items-center"><FaUsers className="mr-1" /> Communities</span>
              </div>
            </motion.div>
          )}
        </div>
        
        {loading ? (
          <motion.div 
            className="flex flex-col justify-center items-center h-64 bg-white rounded-xl shadow-sm p-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600 mb-4"></div>
            <p className="text-gray-500 font-medium">Loading your account information...</p>
          </motion.div>
        ) : error ? (
          <motion.div 
            className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl shadow-sm mb-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p>{error}</p>
            </div>
          </motion.div>
        ) : user ? (
          <div>
            {/* Tabs */}
            <div className="flex flex-wrap bg-white rounded-t-xl shadow-sm border border-gray-100 overflow-hidden">
              <button
                className={`px-6 py-4 font-medium text-sm flex items-center transition-all duration-200 ${
                  activeTab === 'profile' 
                    ? 'text-primary-600 border-b-2 border-primary-600 bg-primary-50/30' 
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                }`}
                onClick={() => setActiveTab('profile')}
              >
                <FaUserEdit className={`mr-2 ${activeTab === 'profile' ? 'text-primary-600' : 'text-gray-400'}`} /> 
                Profile
              </button>
              <button
                className={`px-6 py-4 font-medium text-sm flex items-center transition-all duration-200 ${
                  activeTab === 'orders' 
                    ? 'text-primary-600 border-b-2 border-primary-600 bg-primary-50/30' 
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                }`}
                onClick={() => setActiveTab('orders')}
              >
                <FaShoppingBag className={`mr-2 ${activeTab === 'orders' ? 'text-primary-600' : 'text-gray-400'}`} /> 
                My Orders
              </button>
              <button
                className={`px-6 py-4 font-medium text-sm flex items-center transition-all duration-200 ${
                  activeTab === 'impact' 
                    ? 'text-primary-600 border-b-2 border-primary-600 bg-primary-50/30' 
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                }`}
                onClick={() => setActiveTab('impact')}
              >
                <FaLeaf className={`mr-2 ${activeTab === 'impact' ? 'text-primary-600' : 'text-gray-400'}`} /> 
                Environmental Impact
              </button>
            </div>
            
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <motion.div 
                className="bg-white rounded-b-xl shadow-sm p-6"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
                  <div className="flex items-center mb-4 md:mb-0">
                    <div className="h-12 w-12 bg-primary-100 rounded-lg flex items-center justify-center mr-4">
                      <FaUserEdit className="h-6 w-6 text-primary-600" />
                    </div>
                    <h2 className="text-xl font-semibold text-gray-800">Profile Information</h2>
                  </div>
                  
                  {!editMode && (
                    <button
                      className="flex items-center text-sm bg-primary-50 text-primary-700 px-4 py-2 rounded-lg hover:bg-primary-100 transition-colors duration-200"
                      onClick={() => setEditMode(true)}
                    >
                      <FaUserEdit className="mr-2" /> Edit Profile
                    </button>
                  )}
                </div>
                
                {editMode ? (
                  <motion.form 
                    onSubmit={handleUpdateProfile}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="name" className="block text-gray-700 font-medium mb-2">
                          Full Name
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            required
                            className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-primary-500 focus:ring focus:ring-primary-200 focus:ring-opacity-50 transition-all duration-200"
                            placeholder="Your full name"
                          />
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <FaUserEdit className="text-gray-400" />
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <label htmlFor="email" className="block text-gray-700 font-medium mb-2">
                          Email Address
                        </label>
                        <div className="relative">
                          <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            required
                            className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-50 text-gray-500 focus:border-primary-500 focus:ring focus:ring-primary-200 focus:ring-opacity-50 transition-all duration-200"
                            readOnly
                          />
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <FaEnvelope className="text-gray-400" />
                          </div>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                      </div>
                      
                      <div>
                        <label htmlFor="address" className="block text-gray-700 font-medium mb-2">
                          Address
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            id="address"
                            name="address"
                            value={formData.address}
                            onChange={handleInputChange}
                            required
                            className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-primary-500 focus:ring focus:ring-primary-200 focus:ring-opacity-50 transition-all duration-200"
                            placeholder="Your delivery address"
                          />
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <FaMapMarkerAlt className="text-gray-400" />
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <label htmlFor="phone" className="block text-gray-700 font-medium mb-2">
                          Phone Number
                        </label>
                        <div className="relative">
                          <input
                            type="tel"
                            id="phone"
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            required
                            className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-primary-500 focus:ring focus:ring-primary-200 focus:ring-opacity-50 transition-all duration-200"
                            placeholder="Your phone number"
                          />
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <FaPhone className="text-gray-400" />
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-8 flex justify-end space-x-4">
                      <button
                        type="button"
                        className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-all duration-200"
                        onClick={() => {
                          setEditMode(false);
                          setFormData({
                            name: user.name || '',
                            email: user.email || '',
                            address: user.address || '',
                            phone: user.phone || '',
                          });
                        }}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-6 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-all duration-200 flex items-center"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Save Changes
                      </button>
                    </div>
                  </motion.form>
                ) : (
                  <motion.div 
                    className="rounded-xl border border-gray-100"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
                      <div className="p-5 border-b md:border-r md:border-b-0 border-gray-100">
                        <div className="flex items-center mb-2">
                          <FaUserEdit className="text-primary-500 mr-2" />
                          <h3 className="text-sm font-medium text-gray-500">Full Name</h3>
                        </div>
                        <p className="font-medium text-lg text-gray-800">{user.name}</p>
                      </div>
                      
                      <div className="p-5 border-b md:border-b-0 border-gray-100">
                        <div className="flex items-center mb-2">
                          <FaEnvelope className="text-primary-500 mr-2" />
                          <h3 className="text-sm font-medium text-gray-500">Email Address</h3>
                        </div>
                        <p className="font-medium text-lg text-gray-800">{user.email}</p>
                      </div>
                      
                      <div className="p-5 border-b md:border-r border-gray-100">
                        <div className="flex items-center mb-2">
                          <FaMapMarkerAlt className="text-primary-500 mr-2" />
                          <h3 className="text-sm font-medium text-gray-500">Address</h3>
                        </div>
                        <p className="font-medium text-lg text-gray-800">{user.address || 'Not provided'}</p>
                      </div>
                      
                      <div className="p-5 border-b border-gray-100">
                        <div className="flex items-center mb-2">
                          <FaPhone className="text-primary-500 mr-2" />
                          <h3 className="text-sm font-medium text-gray-500">Phone Number</h3>
                        </div>
                        <p className="font-medium text-lg text-gray-800">{user.phone || 'Not provided'}</p>
                      </div>
                      
                      <div className="p-5 md:border-r border-gray-100">
                        <div className="flex items-center mb-2">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-primary-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <h3 className="text-sm font-medium text-gray-500">Account Created</h3>
                        </div>
                        <p className="font-medium text-lg text-gray-800">{formatDate(user.createdAt)}</p>
                      </div>
                      
                      <div className="p-5">
                        <div className="flex items-center mb-2">
                          <FaUsers className="text-primary-500 mr-2" />
                          <h3 className="text-sm font-medium text-gray-500">Communities</h3>
                        </div>
                        <div className="flex items-center">
                          <span className="bg-primary-100 text-primary-800 text-lg font-semibold px-3 py-1 rounded-full">
                            {user.communities?.length || 0}
                          </span>
                          <span className="ml-2 text-gray-600">active communities</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            )}
            
            {/* Orders Tab */}
            {activeTab === 'orders' && (
              <div className="bg-white rounded-xl shadow-sm">
                <OrdersList />
              </div>
            )}
            
            {/* Environmental Impact Tab */}
            {activeTab === 'impact' && (
              <motion.div 
                className="bg-white rounded-b-xl shadow-sm p-6"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
                  <div className="flex items-center mb-4 md:mb-0">
                    <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                      <FaLeaf className="h-6 w-6 text-green-600" />
                    </div>
                    <h2 className="text-xl font-semibold text-gray-800">Your Environmental Impact</h2>
                  </div>
                </div>
                
                {carbonStats ? (
                  <motion.div 
                    className="space-y-8"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.4 }}
                  >
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <motion.div 
                        className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 text-center shadow-sm border border-green-200"
                        whileHover={{ y: -5, transition: { duration: 0.2 } }}
                      >
                        <div className="mb-4 rounded-full bg-green-200/50 h-16 w-16 mx-auto flex items-center justify-center">
                          <FaLeaf className="text-green-600 text-3xl" />
                        </div>
                        <div className="text-3xl font-bold text-green-700 mb-1">
                          {carbonStats.totalSaved?.toFixed(2) || '0.00'}
                        </div>
                        <div className="text-sm font-medium text-green-800">
                          kg CO2 Saved
                        </div>
                      </motion.div>
                      
                      <motion.div 
                        className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 text-center shadow-sm border border-gray-200"
                        whileHover={{ y: -5, transition: { duration: 0.2 } }}
                      >
                        <div className="mb-4 rounded-full bg-gray-200/50 h-16 w-16 mx-auto flex items-center justify-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                          </svg>
                        </div>
                        <div className="text-3xl font-bold text-gray-700 mb-1">
                          {carbonStats.ordersPlaced || 0}
                        </div>
                        <div className="text-sm font-medium text-gray-600">
                          Total Orders Placed
                        </div>
                      </motion.div>
                      
                      <motion.div 
                        className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 text-center shadow-sm border border-blue-200"
                        whileHover={{ y: -5, transition: { duration: 0.2 } }}
                      >
                        <div className="mb-4 rounded-full bg-blue-200/50 h-16 w-16 mx-auto flex items-center justify-center">
                          <FaUsers className="text-blue-600 text-3xl" />
                        </div>
                        <div className="text-3xl font-bold text-blue-700 mb-1">
                          {carbonStats.communityOrdersCount || 0}
                        </div>
                        <div className="text-sm font-medium text-blue-600">
                          Community Orders
                        </div>
                      </motion.div>
                    </div>
                    
                    <motion.div 
                      className="bg-white rounded-xl border border-gray-200 shadow-sm p-6"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3, duration: 0.4 }}
                    >
                      <h3 className="font-semibold text-lg mb-6 flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                        </svg>
                        Environmental Equivalents
                      </h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="flex flex-col items-center p-4 border border-gray-100 rounded-xl bg-gray-50/50 text-center">
                          <div className="flex-shrink-0 bg-green-100 h-14 w-14 rounded-full flex items-center justify-center mb-3">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                          </div>
                          <div className="font-semibold text-xl mb-1">
                            {((carbonStats.totalSaved || 0) * 0.12).toFixed(1)} kWh
                          </div>
                          <div className="text-sm text-gray-600">
                            Electricity saved
                          </div>
                        </div>
                        
                        <div className="flex flex-col items-center p-4 border border-gray-100 rounded-xl bg-gray-50/50 text-center">
                          <div className="flex-shrink-0 bg-green-100 h-14 w-14 rounded-full flex items-center justify-center mb-3">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                          </div>
                          <div className="font-semibold text-xl mb-1">
                            {((carbonStats.totalSaved || 0) * 2.4).toFixed(1)} miles
                          </div>
                          <div className="text-sm text-gray-600">
                            Car travel avoided
                          </div>
                        </div>
                        
                        <div className="flex flex-col items-center p-4 border border-gray-100 rounded-xl bg-gray-50/50 text-center">
                          <div className="flex-shrink-0 bg-green-100 h-14 w-14 rounded-full flex items-center justify-center mb-3">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                          <div className="font-semibold text-xl mb-1">
                            {((carbonStats.totalSaved || 0) * 0.05).toFixed(1)} trees
                          </div>
                          <div className="text-sm text-gray-600">
                            Equivalent yearly CO2 absorption
                          </div>
                        </div>
                        
                        <div className="flex flex-col items-center p-4 border border-gray-100 rounded-xl bg-gray-50/50 text-center">
                          <div className="flex-shrink-0 bg-green-100 h-14 w-14 rounded-full flex items-center justify-center mb-3">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                          </div>
                          <div className="font-semibold text-xl mb-1">
                            {((carbonStats.totalSaved || 0) * 0.75).toFixed(1)} kg
                          </div>
                          <div className="text-sm text-gray-600">
                            Carbon emissions prevented
                          </div>
                        </div>
                      </div>
                    </motion.div>
                    
                    <motion.div 
                      className="bg-white rounded-xl border border-gray-200 shadow-sm p-6"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4, duration: 0.4 }}
                    >
                      <h3 className="font-semibold text-lg mb-6 flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                        Your Impact Breakdown
                      </h3>
                      
                      <div className="space-y-6">
                        <div>
                          <div className="flex justify-between mb-2">
                            <div className="flex items-center">
                              <div className="h-4 w-4 rounded-full bg-red-500 mr-2"></div>
                              <span className="font-medium">Individual Deliveries CO2</span>
                            </div>
                            <span className="font-semibold text-red-600">{carbonStats.individualDeliveries?.toFixed(2) || '0.00'} kg</span>
                          </div>
                          <div className="h-3 bg-gray-100 rounded-full overflow-hidden shadow-inner">
                            <motion.div 
                              className="h-full bg-red-500 rounded-full"
                              initial={{ width: 0 }}
                              animate={{ width: '100%' }}
                              transition={{ duration: 1, delay: 0.5 }}
                            ></motion.div>
                          </div>
                        </div>
                        
                        <div>
                          <div className="flex justify-between mb-2">
                            <div className="flex items-center">
                              <div className="h-4 w-4 rounded-full bg-green-500 mr-2"></div>
                              <span className="font-medium">Bulk Deliveries CO2</span>
                            </div>
                            <span className="font-semibold text-green-600">{carbonStats.bulkDeliveries?.toFixed(2) || '0.00'} kg</span>
                          </div>
                          <div className="h-3 bg-gray-100 rounded-full overflow-hidden shadow-inner">
                            <motion.div 
                              className="h-full bg-green-500 rounded-full" 
                              initial={{ width: 0 }}
                              animate={{ 
                                width: `${carbonStats.individualDeliveries && carbonStats.individualDeliveries !== 0 
                                  ? ((carbonStats.bulkDeliveries || 0) / carbonStats.individualDeliveries) * 100 
                                  : 0}%`
                              }}
                              transition={{ duration: 1, delay: 0.8 }}
                            ></motion.div>
                          </div>
                        </div>
                        
                        <motion.div 
                          className="text-center mt-6 p-4 bg-gradient-to-r from-primary-50 to-green-50 rounded-xl border border-green-100"
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 1, duration: 0.5 }}
                        >
                          <p className="text-xl">
                            You've reduced your carbon footprint by{' '}
                            <span className="text-green-600 font-bold text-2xl">
                              {carbonStats.individualDeliveries && carbonStats.individualDeliveries !== 0 
                                ? (((carbonStats.individualDeliveries - (carbonStats.bulkDeliveries || 0)) / carbonStats.individualDeliveries) * 100).toFixed(1) 
                                : '0.0'}%
                            </span>
                          </p>
                          <p className="text-gray-600 mt-2">
                            By choosing community bulk orders over individual deliveries
                          </p>
                        </motion.div>
                      </div>
                    </motion.div>
                  </motion.div>
                ) : (
                  <motion.div 
                    className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-300"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.4 }}
                  >
                    <div className="inline-flex h-20 w-20 rounded-full bg-gray-100 p-4 mb-4">
                      <FaLeaf className="h-full w-full text-gray-300" />
                    </div>
                    <h3 className="mt-4 text-xl font-medium text-gray-800">No impact data yet</h3>
                    <p className="mt-2 text-gray-500 max-w-md mx-auto">
                      Place an order to start tracking your environmental impact. Each order through LastMile helps reduce carbon emissions.
                    </p>
                    <div className="mt-8">
                      <button
                        className="px-6 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-all duration-200 flex items-center mx-auto"
                        onClick={() => router.push('/dashboard')}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                        </svg>
                        Start Shopping
                      </button>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm p-8 text-center">
            <h3 className="text-xl font-semibold mb-2">User not found</h3>
            <p className="text-gray-600 mb-4">
              There was a problem loading your account information.
            </p>
            <button
              className="btn-primary"
              onClick={() => router.push('/auth/login')}
            >
              Back to Login
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
