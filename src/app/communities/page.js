'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Navbar from '@/components/Navbar';
import { FaUsers, FaUserPlus, FaCrown, FaCheckCircle, FaTimesCircle, FaMapMarkerAlt } from 'react-icons/fa';

export default function Communities() {
  const router = useRouter();
  const [communities, setCommunities] = useState([]);
  const [userCommunities, setUserCommunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [selectedCommunity, setSelectedCommunity] = useState(null);
  const [createFormData, setCreateFormData] = useState({
    name: '',
    description: '',
    location: {
      address: '',
      city: '',
      state: '',
      zipCode: ''
    },
    rules: '',
  });
  const [joinReason, setJoinReason] = useState('');

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/auth/login');
      return;
    }

    // Fetch communities data
    fetchCommunities();
    
    // Set up periodic refresh to check for approval updates
    const refreshInterval = setInterval(() => {
      fetchCommunities();
    }, 30000); // Check every 30 seconds
    
    // Clean up interval on component unmount
    return () => clearInterval(refreshInterval);
  }, [router]);

  const fetchCommunities = async () => {
    try {
      const token = localStorage.getItem('token');
      const [communitiesResponse, userResponse] = await Promise.all([
        axios.get('http://localhost:5000/api/communities', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get('http://localhost:5000/api/users/me', {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      console.log('User data:', userResponse.data);
      console.log('Communities data:', communitiesResponse.data);

      // Check if we have a previous state to compare for approval changes
      const previousCommunities = communities;
      const newCommunities = communitiesResponse.data;
      
      // Update state with new data
      setCommunities(newCommunities);
      
      // Extract user's community
      if (userResponse.data.community) {
        // Handle single community object
        console.log('Setting user community from object:', userResponse.data.community);
        setUserCommunities([userResponse.data.community]);
      } else if (userResponse.data.communities) {
        // For backward compatibility if the API returns communities array
        console.log('Setting user communities from array:', userResponse.data.communities);
        setUserCommunities(userResponse.data.communities);
      } else {
        // Reset if user has no communities
        console.log('User has no communities');
        setUserCommunities([]);
      }
      
      // If there's a previous state and we're not in initial loading
      if (previousCommunities.length > 0 && !loading) {
        // Check for newly approved communities
        const newlyApproved = newCommunities.filter(
          newComm => 
            newComm.isApproved && 
            previousCommunities.some(
              oldComm => oldComm._id === newComm._id && !oldComm.isApproved
            )
        );
        
        // Notify about newly approved communities
        if (newlyApproved.length > 0) {
          // Show an alert for newly approved communities
          newlyApproved.forEach(community => {
            // Show a notification to the user
            alert(`Good news! The community "${community.name}" has been approved and is now active.`);
            console.log(`Community "${community.name}" has been approved!`);
          });
        }
      }
      
    } catch (error) {
      console.error('Error fetching communities:', error);
      setError('Failed to load communities. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateInputChange = (e) => {
    const { name, value } = e.target;
    
    // Handle nested location object fields
    if (name === 'address' || name === 'city' || name === 'state' || name === 'zipCode') {
      setCreateFormData({
        ...createFormData,
        location: {
          ...createFormData.location,
          [name]: value
        }
      });
    } else {
      // Handle other fields normally
      setCreateFormData({
        ...createFormData,
        [name]: value,
      });
    }
  };

  const handleCreateCommunity = async (e) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        'http://localhost:5000/api/communities', 
        createFormData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Reset form and close modal
      setCreateFormData({
        name: '',
        description: '',
        location: {
          address: '',
          city: '',
          state: '',
          zipCode: ''
        },
        rules: '',
      });
      setShowCreateModal(false);
      
      // Refresh communities list
      fetchCommunities();
      
    } catch (error) {
      console.error('Error creating community:', error);
      alert('Failed to create community. Please try again.');
    }
  };

  const handleJoinRequest = async (e) => {
    e.preventDefault();
    
    if (!selectedCommunity) {
      alert('No community selected.');
      return;
    }
    
    // Validate reason field - backend expects this!
    if (!joinReason || joinReason.trim() === '') {
      alert('Please provide a reason for wanting to join the community.');
      return;
    }
    
    try {
      // Debug info
      console.log('Joining community:', selectedCommunity._id);
      console.log('User communities:', userCommunities);
      
      // Get the current user info to double-check membership status
      const token = localStorage.getItem('token');
      const userData = await axios.get(
        'http://localhost:5000/api/users/me',
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      console.log('Current user data before join:', userData.data);
      
      // Check if already a member based on fresh user data
      const userCurrentCommunity = userData.data.community;
      if (userCurrentCommunity && userCurrentCommunity._id === selectedCommunity._id) {
        alert('You are already a member of this community based on server data.');
        setShowJoinModal(false);
        return;
      }
      
      // Check if already a member based on local state
      if (isMemberOf(selectedCommunity._id)) {
        alert('You are already a member of this community based on local data.');
        setShowJoinModal(false);
        return;
      }
      
      // Log the request details before sending
      console.log('Join request details:', {
        communityId: selectedCommunity._id,
        endpoint: `http://localhost:5000/api/communities/${selectedCommunity._id}/join`,
        data: { reason: joinReason.trim() },
        headers: { Authorization: `Bearer ${token && token.substring(0, 10)}...` }
      });
      
      // Make sure the reason field is properly set
      const requestPayload = { 
        reason: joinReason.trim() 
      };
      
      console.log('Final request payload:', requestPayload);
      
      const response = await axios.post(
        `http://localhost:5000/api/communities/${selectedCommunity._id}/join`,
        requestPayload,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      console.log('Join response:', response.data);
      
      // Reset and close modal
      setJoinReason('');
      setSelectedCommunity(null);
      setShowJoinModal(false);
      
      // Refresh communities to get updated membership status
      fetchCommunities();
      
      alert(response.data.message || 'Join request submitted successfully!');
      
    } catch (error) {
      console.error('Error submitting join request:', error);
      
      // Log detailed error information
      console.log('Error response status:', error.response?.status);
      console.log('Error response data:', error.response?.data);
      console.log('Error config:', error.config);
      
      // Get specific error message from the API response if available
      const errorMessage = error.response?.data?.message || 
                          'Failed to submit join request. Please try again.';
      
      // Show error with more context
      alert(`Error ${error.response?.status || ''}: ${errorMessage}`);
    }
  };

  const openJoinModal = (community) => {
    console.log('Opening join modal for community:', community);
    
    // Make sure we have the complete community data
    if (!community || !community._id) {
      alert('Cannot join community: incomplete community data');
      return;
    }
    
    setSelectedCommunity(community);
    setJoinReason(''); // Reset reason field when opening modal
    setShowJoinModal(true);
  };

  const isMemberOf = (communityId) => {
    console.log('Checking if member of community:', communityId);
    console.log('User communities:', userCommunities);
    
    if (!userCommunities || userCommunities.length === 0) {
      console.log('User has no communities, not a member');
      return false;
    }
    
    // For debugging, check each community explicitly
    for (const community of userCommunities) {
      if (community && typeof community === 'object') {
        const isMatch = community._id === communityId;
        console.log(`Comparing object community ${community._id} with ${communityId}: ${isMatch}`);
        if (isMatch) return true;
      } else if (typeof community === 'string') {
        const isMatch = community === communityId;
        console.log(`Comparing string community ${community} with ${communityId}: ${isMatch}`);
        if (isMatch) return true;
      }
    }
    
    console.log('Not a member of this community');
    return false;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 flex items-center">
              <span className="bg-primary-50 p-2 rounded-full mr-3 text-primary-600">
                <FaUsers className="h-6 w-6" />
              </span>
              Communities
            </h1>
            <p className="text-gray-600 mt-2">Join or create a community to coordinate bulk orders and reduce environmental impact</p>
          </div>
          
          <button
            className="mt-4 md:mt-0 px-5 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors duration-200 inline-flex items-center shadow-sm"
            onClick={() => setShowCreateModal(true)}
          >
            <FaUsers className="mr-2" /> Create Community
          </button>
        </div>

        {loading ? (
          <div className="flex flex-col justify-center items-center h-64 bg-white rounded-xl shadow-sm p-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600 mb-4"></div>
            <p className="text-gray-500 font-medium">Loading communities...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl shadow-sm mb-8">
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p>{error}</p>
            </div>
          </div>
        ) : communities.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {communities.map(community => (
              <div 
                key={community._id} 
                className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 hover:shadow-md transition-all duration-200 group"
              >
                <div className="h-24 bg-gradient-to-r from-blue-500 to-primary-500 relative">
                  <div className="absolute inset-0 bg-black/10"></div>
                  {community.isApproved ? (
                    <div className="absolute top-4 right-4 bg-green-100 text-green-800 px-2.5 py-1 rounded-full text-xs font-medium flex items-center">
                      <FaCheckCircle className="mr-1" /> Active
                    </div>
                  ) : (
                    <div className="absolute top-4 right-4 bg-yellow-100 text-yellow-800 px-2.5 py-1 rounded-full text-xs font-medium flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Pending Approval
                    </div>
                  )}
                </div>
                
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-3 group-hover:text-primary-600 transition-colors duration-200">
                    {community.name}
                  </h3>
                  
                  <div className="flex items-start mb-4">
                    <FaMapMarkerAlt className="text-primary-500 mt-1 mr-2 flex-shrink-0" />
                    <p className="text-gray-600 text-sm">
                      {typeof community.location === 'object' 
                        ? `${community.location.city || ''}, ${community.location.state || ''}`.trim()
                        : community.location}
                    </p>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-3 mb-5 min-h-[80px]">
                    <p className="text-gray-700 text-sm line-clamp-3">
                      {community.description}
                    </p>
                  </div>
                  
                  <div className="flex items-center justify-between text-gray-500 text-sm mb-5">
                    <div className="flex items-center">
                      <div className="flex -space-x-2 overflow-hidden mr-2">
                        {[...Array(Math.min(3, community.memberCount || 1))].map((_, index) => (
                          <div key={index} className="inline-block h-6 w-6 rounded-full bg-primary-100 text-primary-600 text-xs flex items-center justify-center ring-2 ring-white">
                            {String.fromCharCode(65 + index)}
                          </div>
                        ))}
                      </div>
                      <span>{community.memberCount || 1} members</span>
                    </div>
                    
                    {community.createdBy && (
                      <div className="flex items-center">
                        <FaCrown className="mr-1 text-amber-500" />
                        <span className="truncate max-w-[100px]" title={community.createdBy.name}>
                          {community.createdBy.name}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  {isMemberOf(community._id) ? (
                    <button
                      className="w-full py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium rounded-lg transition-colors duration-200 flex justify-center items-center"
                      onClick={() => router.push(`/communities/${community._id}`)}
                    >
                      <FaCheckCircle className="mr-2 text-green-600" /> View Community
                    </button>
                  ) : (
                    <button
                      className="w-full py-3 px-4 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors duration-200 flex justify-center items-center disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={() => openJoinModal(community)}
                      disabled={!community.isApproved}
                    >
                      <FaUserPlus className="mr-2" /> 
                      {community.isApproved ? 'Request to Join' : 'Pending Approval'}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm p-8 text-center border border-gray-100">
            <div className="inline-flex h-20 w-20 items-center justify-center mb-6 bg-blue-50 rounded-full">
              <FaUsers className="h-10 w-10 text-blue-300" />
            </div>
            <h3 className="text-xl font-semibold mb-2 text-gray-800">No communities found</h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Be the first to create a community in your neighborhood and start organizing bulk orders!
            </p>
            <button
              className="px-6 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors duration-200 inline-flex items-center shadow-sm"
              onClick={() => setShowCreateModal(true)}
            >
              <FaUsers className="mr-2" /> Create Community
            </button>
          </div>
        )}
      </div>

      {/* Create Community Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto shadow-xl border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <div className="bg-primary-100 text-primary-600 p-2 rounded-lg mr-3">
                  <FaUsers className="h-6 w-6" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800">Create New Community</h2>
              </div>
              <button 
                onClick={() => setShowCreateModal(false)} 
                className="text-gray-500 hover:text-gray-700 focus:outline-none"
                aria-label="Close modal"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form onSubmit={handleCreateCommunity}>
              <div className="mb-5">
                <label htmlFor="name" className="block text-gray-700 font-medium mb-2">
                  Community Name
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={createFormData.name}
                    onChange={handleCreateInputChange}
                    required
                    className="w-full px-4 py-3 pl-10 rounded-lg border border-gray-300 focus:border-primary-500 focus:ring focus:ring-primary-200 focus:ring-opacity-50 transition-all duration-200"
                    placeholder="e.g. Green Acres Apartments"
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                </div>
              </div>
              
              <div className="mb-5">
                <label className="block text-gray-700 font-medium mb-2 flex items-center">
                  <FaMapMarkerAlt className="mr-2 text-primary-600" />
                  Location
                </label>
                <div className="space-y-3">
                  <div>
                    <label htmlFor="address" className="block text-gray-600 text-sm mb-1">
                      Street Address
                    </label>
                    <input
                      type="text"
                      id="address"
                      name="address"
                      value={createFormData.location.address}
                      onChange={handleCreateInputChange}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-primary-500 focus:ring focus:ring-primary-200 focus:ring-opacity-50 transition-all duration-200"
                      placeholder="e.g. 123 Main Street"
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label htmlFor="city" className="block text-gray-600 text-sm mb-1">
                        City
                      </label>
                      <input
                        type="text"
                        id="city"
                        name="city"
                        value={createFormData.location.city}
                        onChange={handleCreateInputChange}
                        required
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-primary-500 focus:ring focus:ring-primary-200 focus:ring-opacity-50 transition-all duration-200"
                        placeholder="e.g. Springfield"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="state" className="block text-gray-600 text-sm mb-1">
                        State
                      </label>
                      <input
                        type="text"
                        id="state"
                        name="state"
                        value={createFormData.location.state}
                        onChange={handleCreateInputChange}
                        required
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-primary-500 focus:ring focus:ring-primary-200 focus:ring-opacity-50 transition-all duration-200"
                        placeholder="e.g. IL"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="zipCode" className="block text-gray-600 text-sm mb-1">
                        ZIP Code
                      </label>
                      <input
                        type="text"
                        id="zipCode"
                        name="zipCode"
                        value={createFormData.location.zipCode}
                        onChange={handleCreateInputChange}
                        required
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-primary-500 focus:ring focus:ring-primary-200 focus:ring-opacity-50 transition-all duration-200"
                        placeholder="e.g. 12345"
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mb-5">
                <label htmlFor="description" className="block text-gray-700 font-medium mb-2 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                  </svg>
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={createFormData.description}
                  onChange={handleCreateInputChange}
                  required
                  rows={3}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-primary-500 focus:ring focus:ring-primary-200 focus:ring-opacity-50 transition-all duration-200"
                  placeholder="Tell us about your community..."
                />
                <p className="text-xs text-gray-500 mt-1">
                  Describe your community, its purpose, and any relevant details for potential members.
                </p>
              </div>
              
              <div className="mb-6">
                <label htmlFor="rules" className="block text-gray-700 font-medium mb-2 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  Community Rules (Optional)
                </label>
                <textarea
                  id="rules"
                  name="rules"
                  value={createFormData.rules}
                  onChange={handleCreateInputChange}
                  rows={3}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-primary-500 focus:ring focus:ring-primary-200 focus:ring-opacity-50 transition-all duration-200"
                  placeholder="Any specific rules or guidelines for your community..."
                />
                <p className="text-xs text-gray-500 mt-1">
                  Guidelines for community participation, ordering, and other important information for members.
                </p>
              </div>
              
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 flex items-start">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-500 mt-0.5 mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="text-sm text-yellow-700">
                    Community creation requests need approval from LastMile before becoming active. This typically takes 1-2 business days.
                  </p>
                  <p className="text-xs text-yellow-600 mt-1">
                    During this time, you'll be the only member of the community and will be automatically designated as the community admin.
                  </p>
                </div>
              </div>
              
              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-all duration-200"
                  onClick={() => setShowCreateModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-all duration-200 flex items-center"
                >
                  <FaUsers className="mr-2" />
                  Create Community
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Join Community Modal */}
      {showJoinModal && selectedCommunity && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className="bg-blue-100 text-blue-600 p-2 rounded-lg mr-3">
                  <FaUserPlus className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-800">Join Community</h2>
                  <p className="text-gray-600 text-sm mt-1">{selectedCommunity.name}</p>
                </div>
              </div>
              <button 
                onClick={() => {
                  setSelectedCommunity(null);
                  setShowJoinModal(false);
                }} 
                className="text-gray-500 hover:text-gray-700 focus:outline-none"
                aria-label="Close modal"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm text-blue-700">
                  Your request will be reviewed by the community admin. You'll be notified when your membership is approved.
                </p>
              </div>
            </div>
            
            <form onSubmit={handleJoinRequest}>
              <div className="mb-6">
                <label htmlFor="reason" className="flex items-center text-gray-700 font-medium mb-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                  Why do you want to join this community?
                </label>
                <textarea
                  id="reason"
                  value={joinReason}
                  onChange={(e) => setJoinReason(e.target.value)}
                  required
                  rows={4}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-primary-500 focus:ring focus:ring-primary-200 focus:ring-opacity-50 transition-all duration-200"
                  placeholder="Briefly tell the community admin why you'd like to join..."
                />
                <p className="text-xs text-gray-500 mt-1">
                  Introduce yourself and explain how you can contribute to the community. This will help the admin evaluate your request.
                </p>
              </div>
              
              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  className="px-5 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-all duration-200"
                  onClick={() => {
                    setSelectedCommunity(null);
                    setShowJoinModal(false);
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-all duration-200 flex items-center"
                >
                  <FaUserPlus className="mr-2" />
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
