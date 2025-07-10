'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Navbar from '@/components/Navbar';
import OrdersList from '@/components/OrdersList';
import { useToast } from '@/components/Toast';
import { FaUserEdit, FaLeaf, FaShoppingBag, FaUsers, FaClipboardList } from 'react-icons/fa';

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
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">My Account</h1>
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600"></div>
          </div>
        ) : error ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        ) : user ? (
          <div>
            {/* Tabs */}
            <div className="flex border-b mb-6">
              <button
                className={`px-4 py-2 font-medium flex items-center ${
                  activeTab === 'profile' ? 'text-green-600 border-b-2 border-green-600' : 'text-gray-600'
                }`}
                onClick={() => setActiveTab('profile')}
              >
                <FaUserEdit className="mr-2" /> Profile
              </button>
              <button
                className={`px-4 py-2 font-medium flex items-center ${
                  activeTab === 'orders' ? 'text-green-600 border-b-2 border-green-600' : 'text-gray-600'
                }`}
                onClick={() => setActiveTab('orders')}
              >
                <FaClipboardList className="mr-2" /> My Orders
              </button>
              <button
                className={`px-4 py-2 font-medium flex items-center ${
                  activeTab === 'impact' ? 'text-green-600 border-b-2 border-green-600' : 'text-gray-600'
                }`}
                onClick={() => setActiveTab('impact')}
              >
                <FaLeaf className="mr-2" /> Environmental Impact
              </button>
            </div>
            
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold">Profile Information</h2>
                  
                  {!editMode && (
                    <button
                      className="flex items-center text-sm text-green-600 hover:text-green-800"
                      onClick={() => setEditMode(true)}
                    >
                      <FaUserEdit className="mr-1" /> Edit Profile
                    </button>
                  )}
                </div>
                
                {editMode ? (
                  <form onSubmit={handleUpdateProfile}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="name" className="block text-gray-700 font-medium mb-2">
                          Full Name
                        </label>
                        <input
                          type="text"
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          required
                          className="input-field"
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="email" className="block text-gray-700 font-medium mb-2">
                          Email Address
                        </label>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          required
                          className="input-field"
                          readOnly
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="address" className="block text-gray-700 font-medium mb-2">
                          Address
                        </label>
                        <input
                          type="text"
                          id="address"
                          name="address"
                          value={formData.address}
                          onChange={handleInputChange}
                          required
                          className="input-field"
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="phone" className="block text-gray-700 font-medium mb-2">
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          id="phone"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          required
                          className="input-field"
                        />
                      </div>
                    </div>
                    
                    <div className="mt-6 flex justify-end space-x-4">
                      <button
                        type="button"
                        className="btn-secondary"
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
                        className="btn-primary"
                      >
                        Save Changes
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-sm text-gray-500">Full Name</h3>
                      <p className="font-medium">{user.name}</p>
                    </div>
                    
                    <div>
                      <h3 className="text-sm text-gray-500">Email Address</h3>
                      <p className="font-medium">{user.email}</p>
                    </div>
                    
                    <div>
                      <h3 className="text-sm text-gray-500">Address</h3>
                      <p className="font-medium">{user.address || 'Not provided'}</p>
                    </div>
                    
                    <div>
                      <h3 className="text-sm text-gray-500">Phone Number</h3>
                      <p className="font-medium">{user.phone || 'Not provided'}</p>
                    </div>
                    
                    <div>
                      <h3 className="text-sm text-gray-500">Account Created</h3>
                      <p className="font-medium">{formatDate(user.createdAt)}</p>
                    </div>
                    
                    <div>
                      <h3 className="text-sm text-gray-500">Communities</h3>
                      <div className="flex items-center">
                        <FaUsers className="mr-2 text-green-600" />
                        <span>{user.communities?.length || 0} communities</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {/* Orders Tab */}
            {activeTab === 'orders' && (
              <div className="bg-white rounded-xl shadow-sm">
                <OrdersList />
              </div>
            )}
            
            {/* Environmental Impact Tab */}
            {activeTab === 'impact' && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-semibold mb-6">Your Environmental Impact</h2>
                
                {carbonStats ? (
                  <div className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="bg-green-50 rounded-lg p-6 text-center">
                        <FaLeaf className="mx-auto text-green-600 text-4xl mb-2" />
                        <div className="text-3xl font-bold text-green-700 mb-1">
                          {carbonStats.totalSaved?.toFixed(2) || '0.00'}
                        </div>
                        <div className="text-sm text-gray-600">
                          kg CO2 Saved
                        </div>
                      </div>
                      
                      <div className="bg-gray-50 rounded-lg p-6 text-center">
                        <div className="text-3xl font-bold text-gray-700 mb-1">
                          {carbonStats.ordersPlaced || 0}
                        </div>
                        <div className="text-sm text-gray-600">
                          Total Orders Placed
                        </div>
                      </div>
                      
                      <div className="bg-blue-50 rounded-lg p-6 text-center">
                        <div className="text-3xl font-bold text-blue-700 mb-1">
                          {carbonStats.communityOrdersCount || 0}
                        </div>
                        <div className="text-sm text-gray-600">
                          Community Orders
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="font-medium text-lg mb-4">Environmental Equivalents</h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="flex items-center p-4 border rounded-lg">
                          <div className="flex-shrink-0 bg-green-100 h-12 w-12 rounded-full flex items-center justify-center mr-4">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                          </div>
                          <div>
                            <div className="font-medium">
                              {((carbonStats.totalSaved || 0) * 0.12).toFixed(1)} kWh
                            </div>
                            <div className="text-sm text-gray-600">
                              Electricity saved
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center p-4 border rounded-lg">
                          <div className="flex-shrink-0 bg-green-100 h-12 w-12 rounded-full flex items-center justify-center mr-4">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                          </div>
                          <div>
                            <div className="font-medium">
                              {((carbonStats.totalSaved || 0) * 2.4).toFixed(1)} miles
                            </div>
                            <div className="text-sm text-gray-600">
                              Car travel avoided
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="font-medium text-lg mb-4">Your Impact Breakdown</h3>
                      
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between mb-1">
                            <span>Individual Deliveries CO2</span>
                            <span>{carbonStats.individualDeliveries?.toFixed(2) || '0.00'} kg</span>
                          </div>
                          <div className="h-3 bg-gray-200 rounded-full">
                            <div className="h-full bg-red-500 rounded-full" style={{width: '100%'}}></div>
                          </div>
                        </div>
                        
                        <div>
                          <div className="flex justify-between mb-1">
                            <span>Bulk Deliveries CO2</span>
                            <span>{carbonStats.bulkDeliveries?.toFixed(2) || '0.00'} kg</span>
                          </div>
                          <div className="h-3 bg-gray-200 rounded-full">
                            <div className="h-full bg-green-500 rounded-full" style={{
                              width: `${carbonStats.individualDeliveries && carbonStats.individualDeliveries !== 0 
                                ? ((carbonStats.bulkDeliveries || 0) / carbonStats.individualDeliveries) * 100 
                                : 0}%`
                            }}></div>
                          </div>
                        </div>
                        
                        <div className="text-center mt-6">
                          <p className="text-lg">
                            You've reduced your carbon footprint by{' '}
                            <span className="text-green-600 font-bold">
                              {carbonStats.individualDeliveries && carbonStats.individualDeliveries !== 0 
                                ? (((carbonStats.individualDeliveries - (carbonStats.bulkDeliveries || 0)) / carbonStats.individualDeliveries) * 100).toFixed(1) 
                                : '0.0'}%
                            </span>
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FaLeaf className="mx-auto h-12 w-12 text-gray-300" />
                    <h3 className="mt-2 text-lg font-medium text-gray-900">No impact data yet</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Place an order to start tracking your environmental impact.
                    </p>
                    <div className="mt-6">
                      <button
                        className="btn-primary"
                        onClick={() => router.push('/dashboard')}
                      >
                        Start Shopping
                      </button>
                    </div>
                  </div>
                )}
              </div>
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
      </div>
    </div>
  );
}
