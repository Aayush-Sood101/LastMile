'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Navbar from '@/components/Navbar';
import { FaUsers, FaUserPlus, FaUserMinus, FaCheckCircle, FaTimesCircle, FaLeaf, FaTruck, FaShoppingBag } from 'react-icons/fa';

export default function CommunityDetail({ params }) {
  const router = useRouter();
  const { id } = params;
  const [community, setCommunity] = useState(null);
  const [joinRequests, setJoinRequests] = useState([]);
  const [members, setMembers] = useState([]);
  const [communityOrders, setCommunityOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    if (!token || !user || !id) {
      router.push('/auth/login');
      return;
    }

    // Fetch community data
    fetchCommunityData();
  }, [id, router]);

  const fetchCommunityData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user'));
      
      // Get community details
      const communityResponse = await axios.get(
        `http://localhost:5000/api/communities/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setCommunity(communityResponse.data);
      
      // Check if current user is the admin of this community
      if (communityResponse.data.createdBy && communityResponse.data.createdBy._id === user._id) {
        setIsAdmin(true);
        
        // If admin, fetch join requests
        const requestsResponse = await axios.get(
          `http://localhost:5000/api/communities/${id}/join-requests`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        setJoinRequests(requestsResponse.data);
      }
      
      // Get members
      const membersResponse = await axios.get(
        `http://localhost:5000/api/communities/${id}/members`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setMembers(membersResponse.data);
      
      // Get orders for this community
      const ordersResponse = await axios.get(
        `http://localhost:5000/api/orders/community/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setCommunityOrders(ordersResponse.data);
      
    } catch (error) {
      console.error('Error fetching community data:', error);
      setError('Failed to load community data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinRequest = async (requestId, status) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `http://localhost:5000/api/communities/${id}/requests/${requestId}`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Refresh join requests
      const requestsResponse = await axios.get(
        `http://localhost:5000/api/communities/${id}/join-requests`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setJoinRequests(requestsResponse.data);
      
      // If approved, refresh members list
      if (status === 'approved') {
        const membersResponse = await axios.get(
          `http://localhost:5000/api/communities/${id}/members`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        setMembers(membersResponse.data);
      }
    } catch (error) {
      console.error('Error handling join request:', error);
      alert('Failed to process join request');
    }
  };

  // Calculate total carbon saved by the community
  const calculateTotalCarbonSaved = () => {
    return communityOrders.reduce((total, order) => {
      return total + (order.carbonSaved || 0);
    }, 0);
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
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600"></div>
          </div>
        ) : error ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        ) : community ? (
          <div>
            {/* Community Header */}
            <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
              <div className="flex flex-col md:flex-row justify-between">
                <div>
                  <div className="flex items-center">
                    <h1 className="text-3xl font-bold text-gray-800 mr-3">{community.name}</h1>
                    {community.approved ? (
                      <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                        Active
                      </span>
                    ) : (
                      <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
                        Pending Approval
                      </span>
                    )}
                  </div>
                  
                  <p className="text-gray-600 mt-2">
                    {typeof community.location === 'object' 
                      ? `${community.location.address || ''} ${community.location.city || ''} ${community.location.state || ''} ${community.location.zipCode || ''}`.trim()
                      : community.location}
                  </p>
                  <p className="text-gray-700 mt-4 max-w-3xl">{community.description}</p>
                  
                  <div className="mt-4 flex items-center space-x-4 text-sm text-gray-600">
                    <div className="flex items-center">
                      <FaUsers className="mr-1" /> {members.length} members
                    </div>
                    <div className="flex items-center">
                      <FaShoppingBag className="mr-1" /> {communityOrders.length} orders
                    </div>
                    <div className="flex items-center">
                      <FaLeaf className="mr-1 text-green-600" /> {calculateTotalCarbonSaved().toFixed(2)} kg CO2 saved
                    </div>
                  </div>
                </div>
                
                {isAdmin && (
                  <div className="mt-4 md:mt-0 md:ml-4">
                    <div className="inline-flex items-center bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                      <FaCrown className="mr-1 text-yellow-500" /> Community Admin
                    </div>
                    
                    {joinRequests.length > 0 && (
                      <div className="mt-2 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm inline-flex items-center">
                        <FaUserPlus className="mr-1" /> {joinRequests.length} pending join {joinRequests.length === 1 ? 'request' : 'requests'}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
            
            {/* Tabs */}
            <div className="flex border-b mb-6">
              <button
                className={`px-4 py-2 font-medium ${
                  activeTab === 'overview' ? 'text-green-600 border-b-2 border-green-600' : 'text-gray-600'
                }`}
                onClick={() => setActiveTab('overview')}
              >
                Overview
              </button>
              <button
                className={`px-4 py-2 font-medium ${
                  activeTab === 'members' ? 'text-green-600 border-b-2 border-green-600' : 'text-gray-600'
                }`}
                onClick={() => setActiveTab('members')}
              >
                Members
              </button>
              <button
                className={`px-4 py-2 font-medium ${
                  activeTab === 'orders' ? 'text-green-600 border-b-2 border-green-600' : 'text-gray-600'
                }`}
                onClick={() => setActiveTab('orders')}
              >
                Orders
              </button>
              {isAdmin && (
                <button
                  className={`px-4 py-2 font-medium ${
                    activeTab === 'requests' ? 'text-green-600 border-b-2 border-green-600' : 'text-gray-600'
                  }`}
                  onClick={() => setActiveTab('requests')}
                >
                  Join Requests {joinRequests.length > 0 && `(${joinRequests.length})`}
                </button>
              )}
            </div>
            
            {/* Tab Content */}
            {activeTab === 'overview' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h2 className="text-xl font-semibold mb-4">Community Details</h2>
                  
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-gray-500 text-sm">Created On</h3>
                      <p>{formatDate(community.createdAt)}</p>
                    </div>
                    
                    <div>
                      <h3 className="text-gray-500 text-sm">Admin</h3>
                      <p>{community.createdBy?.name || 'Unknown'}</p>
                    </div>
                    
                    {community.rules && (
                      <div>
                        <h3 className="text-gray-500 text-sm">Community Rules</h3>
                        <p className="whitespace-pre-line">{community.rules}</p>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h2 className="text-xl font-semibold mb-4">Environmental Impact</h2>
                  
                  <div className="space-y-6">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm text-gray-500">Carbon Savings</span>
                        <span className="text-sm text-green-600 font-medium">
                          {calculateTotalCarbonSaved().toFixed(2)} kg CO2
                        </span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full">
                        <div className="h-full bg-green-600 rounded-full" style={{width: '75%'}}></div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-gray-500 text-sm mb-2">Equivalent to</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-green-50 p-4 rounded-lg text-center">
                          <div className="text-2xl font-bold text-green-700 mb-1">
                            {(calculateTotalCarbonSaved() * 2.4).toFixed(1)}
                          </div>
                          <div className="text-xs text-gray-500">Miles not driven</div>
                        </div>
                        <div className="bg-green-50 p-4 rounded-lg text-center">
                          <div className="text-2xl font-bold text-green-700 mb-1">
                            {Math.round(calculateTotalCarbonSaved() / 0.027)}
                          </div>
                          <div className="text-xs text-gray-500">Smartphone charges</div>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-gray-500 text-sm mb-2">Delivery Reduction</h3>
                      <p className="text-sm">
                        By grouping deliveries, this community has reduced the number of individual
                        deliveries by approximately {communityOrders.length * 4} trips.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {activeTab === 'members' && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-semibold mb-4">Community Members</h2>
                
                {members.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {members.map(member => (
                      <div key={member._id} className="border rounded-lg p-4 flex items-center">
                        <div className="w-10 h-10 bg-green-100 text-green-800 rounded-full flex items-center justify-center mr-3">
                          {member.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h3 className="font-medium">{member.name}</h3>
                          <p className="text-sm text-gray-600">
                            {member._id === community.createdBy?._id ? 'Admin' : 'Member'}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600">No members found</p>
                )}
              </div>
            )}
            
            {activeTab === 'orders' && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-semibold mb-4">Community Orders</h2>
                
                {communityOrders.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Order ID
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Member
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Date
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Items
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Total
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Carbon Saved
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {communityOrders.map(order => (
                          <tr key={order._id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">
                                {order._id.substring(0, 8)}...
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {order.user?.name || 'Unknown'}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-500">
                                {formatDate(order.createdAt)}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-500">
                                {order.items?.length || 0} items
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium">
                                ${order.totalAmount?.toFixed(2) || '0.00'}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-green-600">
                                {order.carbonSaved?.toFixed(2) || '0.00'} kg
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-gray-600">No orders have been placed in this community yet</p>
                )}
              </div>
            )}
            
            {activeTab === 'requests' && isAdmin && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-semibold mb-4">Pending Join Requests</h2>
                
                {joinRequests.length > 0 ? (
                  <div className="space-y-6">
                    {joinRequests.map(request => (
                      <div key={request._id} className="border rounded-lg p-4">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div>
                            <div className="flex items-center">
                              <div className="w-10 h-10 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center mr-3">
                                {request.user.name.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <h3 className="font-medium">{request.user.name}</h3>
                                <p className="text-sm text-gray-600">{request.user.email}</p>
                              </div>
                            </div>
                            
                            <div className="mt-3">
                              <p className="text-sm text-gray-700">
                                <span className="font-medium">Reason for joining: </span>
                                {request.reason}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                Requested on {formatDate(request.createdAt)}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex space-x-3">
                            <button
                              className="flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md"
                              onClick={() => handleJoinRequest(request._id, 'approved')}
                            >
                              <FaCheckCircle className="mr-2" /> Approve
                            </button>
                            
                            <button
                              className="flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md"
                              onClick={() => handleJoinRequest(request._id, 'rejected')}
                            >
                              <FaTimesCircle className="mr-2" /> Reject
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600">No pending join requests</p>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm p-8 text-center">
            <h3 className="text-xl font-semibold mb-2">Community not found</h3>
            <p className="text-gray-600 mb-4">
              The community you're looking for doesn't exist or you don't have permission to view it.
            </p>
            <button
              className="btn-primary"
              onClick={() => router.push('/communities')}
            >
              Back to Communities
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
