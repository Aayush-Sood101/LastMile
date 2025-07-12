'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import React from 'react';
import Navbar from '@/components/Navbar';
import { FaUsers, FaUserPlus, FaUserMinus, FaCheckCircle, FaTimesCircle, FaLeaf, FaTruck, FaShoppingBag, FaCrown } from 'react-icons/fa';

export default function CommunityDetail({ params }) {
  const router = useRouter();
  // Unwrap params using React.use() as recommended by Next.js
  const unwrappedParams = React.use(params);
  const { id } = unwrappedParams;
  const [community, setCommunity] = useState(null);
  const [joinRequests, setJoinRequests] = useState([]);
  const [members, setMembers] = useState([]);
  const [communityOrders, setCommunityOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [requestProcessing, setRequestProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState({ type: '', message: '' });

  // State to track URL search params
  const [urlSearch, setUrlSearch] = useState('');
  
  // Set initial tab based on URL parameter - do this before the first render
  useEffect(() => {
    // Check if there's a tab parameter in the URL
    if (typeof window !== 'undefined') {
      // Update the URL search state
      setUrlSearch(window.location.search);
      
      const urlParams = new URLSearchParams(window.location.search);
      const tabParam = urlParams.get('tab');
      console.log('URL Parameters:', window.location.search);
      console.log('Tab parameter:', tabParam);
      
      // If coming from notification and tab is join-requests
      if (tabParam === 'join-requests' && id) {
        console.log('Tab parameter triggered immediate data fetch');
        
        // First fetch community data to determine if user is admin
        const checkAdminStatus = async () => {
          try {
            const token = localStorage.getItem('token');
            const user = JSON.parse(localStorage.getItem('user'));
            
            if (!token || !user) {
              console.log("No user token found, redirecting to login");
              router.push('/auth/login');
              return;
            }
            
            // Fetch community details first to determine admin status
            await fetchCommunityData();
            
            // After fetch completes, isAdmin state should be updated
            // Only show requests tab if user is admin
            if (isAdmin) {
              console.log('User confirmed as admin, setting tab to requests');
              setActiveTab('requests');
            } else {
              console.log('User is not admin, showing overview instead');
              setActiveTab('overview');
            }
          } catch (error) {
            console.error("Error checking admin status:", error);
          }
        };
        
        checkAdminStatus();
      }
    }
  }, [id, router]);

  // Listen for URL changes after component is mounted
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Function to handle URL changes
      const handleUrlChange = () => {
        setUrlSearch(window.location.search);
        const urlParams = new URLSearchParams(window.location.search);
        const tabParam = urlParams.get('tab');
        
        if (tabParam === 'join-requests') {
          console.log('URL changed to join-requests tab');
          
          // Only set active tab to requests if user is admin
          if (isAdmin) {
            console.log('User is admin, can show join requests tab');
            setActiveTab('requests');
          } else {
            console.log('User is not admin, cannot show join requests tab');
            setActiveTab('overview');
          }
        }
      };
      
      // Add event listener for popstate (browser back/forward)
      window.addEventListener('popstate', handleUrlChange);
      
      // Clean up
      return () => {
        window.removeEventListener('popstate', handleUrlChange);
      };
    }
  }, [isAdmin]);
  
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
    
    // If this URL was accessed via a notification AND user is admin, scroll to the requests section
    if ((activeTab === 'requests' || 
        (typeof window !== 'undefined' && 
         new URLSearchParams(urlSearch).get('tab') === 'join-requests')) && 
        isAdmin) {
      
      console.log("Need to scroll to requests section - user is admin");
      
      // Try multiple times as the section might not be rendered immediately
      const scrollAttempts = [100, 500, 1000, 2000]; // Try at different intervals
      
      scrollAttempts.forEach(delay => {
        setTimeout(() => {
          console.log(`Attempting to scroll to requests section (${delay}ms)`);
          const requestsSection = document.getElementById('join-requests-section');
          if (requestsSection) {
            console.log('Found requests section, scrolling');
            requestsSection.scrollIntoView({ behavior: 'smooth' });
            
            // Apply a temporary highlight
            requestsSection.classList.add('ring-2', 'ring-green-500', 'transition-all', 'duration-500');
            setTimeout(() => {
              requestsSection.classList.remove('ring-2', 'ring-green-500');
            }, 3000);
          } else {
            console.log('Requests section element not found - might need to fetch admin status first');
          }
        }, delay);
      });
    } else if (typeof window !== 'undefined' && 
               new URLSearchParams(urlSearch).get('tab') === 'join-requests' && 
               !isAdmin) {
      console.log("User tried to access requests tab but is not admin - showing overview instead");
      setActiveTab('overview');
    }
    
    // Set up periodic refresh to check for approval status changes
    const refreshInterval = setInterval(() => {
      fetchCommunityData();
    }, 30000); // Check every 30 seconds
    
    // Clean up interval on component unmount
    return () => clearInterval(refreshInterval);
  }, [id, router, activeTab, urlSearch]);

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
      // Multiple ways to check admin status - both by comparing admin IDs and checking user flag
      const adminId = communityResponse.data.admin && 
          (typeof communityResponse.data.admin === 'object' 
            ? communityResponse.data.admin._id 
            : communityResponse.data.admin);
            
      const isUserAdmin = (adminId && adminId === user._id) || user.isCommunityAdmin;
      
      console.log("Admin ID from community:", adminId);
      console.log("Current user ID:", user._id);
      console.log("User isCommunityAdmin flag:", user.isCommunityAdmin);
      console.log("User is admin of community:", isUserAdmin);
      
      setIsAdmin(isUserAdmin);
      
      // If admin, fetch join requests
      if (isUserAdmin) {
        console.log('User is admin of this community, fetching join requests');
        try {
          const requestsResponse = await axios.get(
            `http://localhost:5000/api/communities/${id}/membership-requests`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          
          // Log the requests data for debugging
          console.log('Join requests response:', requestsResponse.data);
          console.log('Join requests length:', requestsResponse.data?.length);
          
          // Make sure we're setting an array even if the response is empty
          if (Array.isArray(requestsResponse.data)) {
            console.log("Setting joinRequests state with data:", requestsResponse.data);
            setJoinRequests(requestsResponse.data);
            
            // Force the active tab to requests if there are pending requests and coming from notification
            if (requestsResponse.data.length > 0 && 
                new URLSearchParams(window.location.search).get('tab') === 'join-requests') {
              console.log("Setting active tab to requests due to pending requests from notification");
              setActiveTab('requests');
            }
          } else {
            console.warn('Membership requests response is not an array:', requestsResponse.data);
            setJoinRequests([]);
          }
        } catch (requestError) {
          console.error('Error fetching join requests:', requestError);
          setJoinRequests([]);
        }
      } else {
        console.log('User is not admin, not fetching join requests');
      }
      
      // Get members from the community object instead of a separate endpoint
      if (communityResponse.data && communityResponse.data.members) {
        // If the community data already includes populated members
        if (Array.isArray(communityResponse.data.members) && 
            communityResponse.data.members.length > 0 && 
            typeof communityResponse.data.members[0] === 'object') {
          setMembers(communityResponse.data.members);
        } else {
          // If members are just IDs, we need to fetch the member details
          try {
            // Fetch only if there are member IDs
            if (communityResponse.data.members.length > 0) {
              const membersData = await Promise.all(
                communityResponse.data.members.map(async (memberId) => {
                  const userResponse = await axios.get(
                    `http://localhost:5000/api/users/${memberId}`,
                    { headers: { Authorization: `Bearer ${token}` } }
                  );
                  return userResponse.data;
                })
              );
              setMembers(membersData);
            } else {
              setMembers([]);
            }
          } catch (memberError) {
            console.error('Error fetching member details:', memberError);
            setMembers([]);
          }
        }
      } else {
        setMembers([]);
      }
      
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

  const handleJoinRequest = async (requestId, status, userId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found. Please login again.');
      }
      
      console.log("All join requests in state:", joinRequests);
      
      // Get the request details before updating
      const request = joinRequests.find(req => req._id === requestId);
      console.log("Found request by ID:", request);
      
      if (!request) {
        console.error('Request not found:', requestId);
        throw new Error('Join request not found. Please refresh the page and try again.');
      }
      
      // Make sure we have a valid user ID
      const targetUserId = userId || (request.user && request.user._id);
      
      if (!targetUserId) {
        console.error('User ID is missing from request:', request);
        throw new Error('User ID not found in the request. Please refresh and try again.');
      }
      
      console.log('Processing request:', requestId, 'with status:', status, 'for user:', targetUserId);
      
      // Use the membership-requests endpoint with the user ID
      try {
        const endpoint = `http://localhost:5000/api/communities/${id}/membership-requests/${targetUserId}`;
        console.log(`Sending request to: ${endpoint}`);
        
        const response = await axios.put(
          endpoint,
          { status },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        console.log('Request update response:', response.data);
        
        // Update the local state to remove the processed request
        setJoinRequests(prev => prev.filter(req => req._id !== requestId));
        
        return response.data;
      } catch (error) {
        console.error('Error updating request status:', error.response?.data || error.message);
        throw new Error(`Failed to update request status: ${error.response?.data?.message || error.message}`);
      }
      
      // Create a notification for the user
      try {
        console.log('Creating notification for user:', request.user._id);
        const notificationResponse = await axios.post(
          'http://localhost:5000/api/notifications',
          {
            recipient: request.user._id,
            type: status === 'approved' ? 'request_approved' : 'request_rejected',
            title: status === 'approved' ? 'Join Request Approved' : 'Join Request Rejected',
            message: status === 'approved' 
              ? `Your request to join ${community.name} has been approved. You are now a member.`
              : `Your request to join ${community.name} has been rejected.`,
            relatedId: community._id,
            onModel: 'Community'
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        console.log('Notification created:', notificationResponse.data);
      } catch (notifyError) {
        console.error('Error creating notification:', notifyError.response?.data || notifyError.message);
      }
      
      // Refresh join requests
      try {
        const requestsResponse = await axios.get(
          `http://localhost:5000/api/communities/${id}/membership-requests`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        console.log('Updated join requests:', requestsResponse.data);
        setJoinRequests(requestsResponse.data);
      } catch (error) {
        console.error('Error refreshing join requests:', error);
      }
      
      // If approved, refresh community data to get updated members list
      if (status === 'approved') {
        // Fetch updated community data to get the current members
        const communityResponse = await axios.get(
          `http://localhost:5000/api/communities/${id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        if (communityResponse.data && communityResponse.data.members) {
          // If the community data already includes populated members
          if (Array.isArray(communityResponse.data.members) && 
              communityResponse.data.members.length > 0 && 
              typeof communityResponse.data.members[0] === 'object') {
            setMembers(communityResponse.data.members);
          } else {
            // If members are just IDs, we need to fetch the member details
            try {
              // Fetch only if there are member IDs
              if (communityResponse.data.members.length > 0) {
                const membersData = await Promise.all(
                  communityResponse.data.members.map(async (memberId) => {
                    const userResponse = await axios.get(
                      `http://localhost:5000/api/users/${memberId}`,
                      { headers: { Authorization: `Bearer ${token}` } }
                    );
                    return userResponse.data;
                  })
                );
                setMembers(membersData);
              }
            } catch (memberError) {
              console.error('Error fetching member details:', memberError);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error handling join request:', error);
      throw error; // Propagate the error so it can be handled by the button click handler
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
                    {community.isApproved ? (
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
              </button>                {isAdmin && (
                <button
                  className={`px-4 py-2 font-medium ${
                    activeTab === 'requests' ? 'text-green-600 border-b-2 border-green-600' : 'text-gray-600'
                  }`}
                  onClick={() => {
                    console.log("Join Requests tab clicked, setting active tab to 'requests'");
                    setActiveTab('requests');
                    
                    // Update URL without refreshing page to reflect current tab
                    if (typeof window !== 'undefined') {
                      const url = new URL(window.location);
                      url.searchParams.set('tab', 'join-requests');
                      window.history.pushState({}, '', url);
                      // Update our URL search state
                      setUrlSearch(url.search);
                      console.log("Updated URL with tab parameter:", url.toString());
                    }
                    
                    // Scroll to the requests section
                    setTimeout(() => {
                      const requestsSection = document.getElementById('join-requests-section');
                      if (requestsSection) {
                        console.log("Found requests section, scrolling to it");
                        requestsSection.scrollIntoView({ behavior: 'smooth' });
                      } else {
                        console.log("Could not find join-requests-section element");
                      }
                    }, 100);
                  }}
                >
                  Join Requests {joinRequests.length > 0 && (
                    <span className="bg-red-500 text-white rounded-full ml-2 px-2 py-0.5 text-xs">
                      {joinRequests.length}
                    </span>
                  )}
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
              <div id="join-requests-section" className={`bg-white rounded-xl shadow-sm p-6 ${
                new URLSearchParams(urlSearch).get('tab') === 'join-requests' 
                  ? 'ring-2 ring-green-500 transition-all duration-500' 
                  : ''
              }`}>
                <h2 className="text-xl font-semibold mb-4">Pending Join Requests</h2>
                
                {/* Status message for request processing */}
                {statusMessage.message && (
                  <div className={`mb-4 p-4 rounded-md flex items-center ${
                    statusMessage.type === 'success' 
                      ? 'bg-green-100 text-green-800 border border-green-300' 
                      : statusMessage.type === 'error'
                      ? 'bg-red-100 text-red-800 border border-red-300'
                      : 'bg-blue-100 text-blue-800 border border-blue-300'
                  }`}>
                    {statusMessage.type === 'success' && (
                      <FaCheckCircle className="mr-2 text-green-500" />
                    )}
                    {statusMessage.type === 'error' && (
                      <FaTimesCircle className="mr-2 text-red-500" />
                    )}
                    {statusMessage.type === 'processing' && (
                      <div className="mr-2 w-4 h-4 border-2 border-blue-500 border-t-blue-200 rounded-full animate-spin"></div>
                    )}
                    {statusMessage.message}
                  </div>
                )}
                
                {loading ? (
                  <div className="flex justify-center items-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600"></div>
                  </div>
                ) : joinRequests && joinRequests.length > 0 ? (
                  <div className="space-y-6">
                    {console.log("Rendering join requests:", joinRequests)}
                    {joinRequests.map(request => (
                      <div key={request._id} className="border rounded-lg p-4">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div>
                            <div className="flex items-center">
                              <div className="w-10 h-10 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center mr-3">
                                {request.user && request.user.name ? request.user.name.charAt(0).toUpperCase() : '?'}
                              </div>
                              <div>
                                <h3 className="font-medium">{request.user && request.user.name ? request.user.name : 'Unknown User'}</h3>
                                <p className="text-sm text-gray-600">{request.user && request.user.email ? request.user.email : 'No email available'}</p>
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
                              disabled={requestProcessing}
                              onClick={async () => {
                                try {
                                  // Validate required data before proceeding
                                  if (!request.user || !request.user._id) {
                                    throw new Error('User information is missing. Please refresh the page.');
                                  }
                                  
                                  setRequestProcessing(true);
                                  setStatusMessage({ type: 'processing', message: 'Processing request...' });
                                  
                                  console.log(`Approving request for user: ${request.user._id}`);
                                  await handleJoinRequest(request._id, 'approved', request.user._id);
                                  
                                  setStatusMessage({ 
                                    type: 'success', 
                                    message: `${request.user.name || 'User'}'s request has been approved` 
                                  });
                                  
                                  // Refresh the join requests list
                                  fetchCommunityData();
                                  
                                  setTimeout(() => setStatusMessage({ type: '', message: '' }), 3000);
                                } catch (error) {
                                  console.error('Error approving request:', error);
                                  setStatusMessage({ 
                                    type: 'error', 
                                    message: `Error: ${error.message}` 
                                  });
                                  setTimeout(() => setStatusMessage({ type: '', message: '' }), 5000);
                                } finally {
                                  setRequestProcessing(false);
                                }
                              }}
                            >
                              <FaCheckCircle className="mr-2" /> 
                              {requestProcessing ? 'Processing...' : 'Approve'}
                            </button>
                            
                            <button
                              className="flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md"
                              disabled={requestProcessing}
                              onClick={async () => {
                                try {
                                  // Validate required data before proceeding
                                  if (!request.user || !request.user._id) {
                                    throw new Error('User information is missing. Please refresh the page.');
                                  }
                                  
                                  setRequestProcessing(true);
                                  setStatusMessage({ type: 'processing', message: 'Processing request...' });
                                  
                                  console.log(`Rejecting request for user: ${request.user._id}`);
                                  await handleJoinRequest(request._id, 'rejected', request.user._id);
                                  
                                  setStatusMessage({ 
                                    type: 'success', 
                                    message: `${request.user.name || 'User'}'s request has been rejected` 
                                  });
                                  
                                  // Refresh the join requests list
                                  fetchCommunityData();
                                  
                                  setTimeout(() => setStatusMessage({ type: '', message: '' }), 3000);
                                } catch (error) {
                                  console.error('Error rejecting request:', error);
                                  setStatusMessage({ 
                                    type: 'error', 
                                    message: `Error: ${error.message}` 
                                  });
                                  setTimeout(() => setStatusMessage({ type: '', message: '' }), 5000);
                                } finally {
                                  setRequestProcessing(false);
                                }
                              }}
                            >
                              <FaTimesCircle className="mr-2" /> Reject
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div>
                    <p className="text-gray-600 mb-4">No pending join requests</p>
                    <button 
                      onClick={() => fetchCommunityData()}
                      className="text-sm text-blue-600 hover:text-blue-800 underline"
                    >
                      Refresh join requests
                    </button>
                  </div>
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
