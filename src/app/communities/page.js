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
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Communities</h1>
            <p className="text-gray-600">Join or create a community to coordinate bulk orders</p>
          </div>
          
          <button
            className="btn-primary mt-4 md:mt-0 flex items-center"
            onClick={() => setShowCreateModal(true)}
          >
            <FaUsers className="mr-2" /> Create Community
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600"></div>
          </div>
        ) : error ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        ) : communities.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {communities.map(community => (
              <div key={community._id} className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-xl font-semibold">{community.name}</h3>
                    {community.isApproved ? (
                      <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">Active</span>
                    ) : (
                      <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">Pending Approval</span>
                    )}
                  </div>
                  
                  <div className="flex items-start mb-4">
                    <FaMapMarkerAlt className="text-gray-400 mt-1 mr-2" />
                    <p className="text-gray-600">
                      {typeof community.location === 'object' 
                        ? `${community.location.address || ''} ${community.location.city || ''} ${community.location.state || ''} ${community.location.zipCode || ''}`.trim()
                        : community.location}
                    </p>
                  </div>
                  
                  <p className="text-gray-700 mb-6">
                    {community.description.length > 150 
                      ? `${community.description.substring(0, 150)}...` 
                      : community.description}
                  </p>
                  
                  <div className="flex items-center text-gray-500 text-sm mb-6">
                    <div className="flex items-center">
                      <FaUsers className="mr-1" />
                      <span>{community.memberCount || 1} members</span>
                    </div>
                    {community.createdBy && (
                      <div className="flex items-center ml-4">
                        <FaCrown className="mr-1 text-yellow-500" />
                        <span>Admin: {community.createdBy.name}</span>
                      </div>
                    )}
                  </div>
                  
                  {isMemberOf(community._id) ? (
                    <button
                      className="w-full btn-secondary flex justify-center items-center"
                      onClick={() => router.push(`/communities/${community._id}`)}
                    >
                      <FaCheckCircle className="mr-2" /> Member - View Details
                    </button>
                  ) : (
                    <button
                      className="w-full btn-primary flex justify-center items-center"
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
          <div className="bg-white rounded-xl shadow-sm p-8 text-center">
            <h3 className="text-xl font-semibold mb-2">No communities found</h3>
            <p className="text-gray-600 mb-6">
              Be the first to create a community in your neighborhood!
            </p>
            <button
              className="btn-primary inline-flex items-center"
              onClick={() => setShowCreateModal(true)}
            >
              <FaUsers className="mr-2" /> Create Community
            </button>
          </div>
        )}
      </div>

      {/* Create Community Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">Create New Community</h2>
            
            <form onSubmit={handleCreateCommunity}>
              <div className="mb-4">
                <label htmlFor="name" className="block text-gray-700 font-medium mb-2">
                  Community Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={createFormData.name}
                  onChange={handleCreateInputChange}
                  required
                  className="input-field"
                  placeholder="e.g. Green Acres Apartments"
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-2">
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
                      className="input-field"
                      placeholder="e.g. 123 Main Street"
                    />
                  </div>
                  
                  <div className="grid grid-cols-3 gap-3">
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
                        className="input-field"
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
                        className="input-field"
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
                        className="input-field"
                        placeholder="e.g. 12345"
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mb-4">
                <label htmlFor="description" className="block text-gray-700 font-medium mb-2">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={createFormData.description}
                  onChange={handleCreateInputChange}
                  required
                  rows={3}
                  className="input-field"
                  placeholder="Tell us about your community..."
                />
              </div>
              
              <div className="mb-6">
                <label htmlFor="rules" className="block text-gray-700 font-medium mb-2">
                  Community Rules (Optional)
                </label>
                <textarea
                  id="rules"
                  name="rules"
                  value={createFormData.rules}
                  onChange={handleCreateInputChange}
                  rows={3}
                  className="input-field"
                  placeholder="Any specific rules or guidelines for your community..."
                />
              </div>
              
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
                <div className="flex">
                  <div className="ml-3">
                    <p className="text-sm text-yellow-700">
                      Community creation requests need approval from Walmart before becoming active. This typically takes 1-2 business days.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setShowCreateModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                >
                  Create Community
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Join Community Modal */}
      {showJoinModal && selectedCommunity && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold mb-2">Join {selectedCommunity.name}</h2>
            <p className="text-gray-600 mb-4">Your request will be reviewed by the community admin.</p>
            
            <form onSubmit={handleJoinRequest}>
              <div className="mb-6">
                <label htmlFor="reason" className="block text-gray-700 font-medium mb-2">
                  Why do you want to join this community?
                </label>
                <textarea
                  id="reason"
                  value={joinReason}
                  onChange={(e) => setJoinReason(e.target.value)}
                  required
                  rows={4}
                  className="input-field"
                  placeholder="Briefly tell the community admin why you'd like to join..."
                />
              </div>
              
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => {
                    setSelectedCommunity(null);
                    setShowJoinModal(false);
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                >
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
