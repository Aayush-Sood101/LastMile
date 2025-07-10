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
    location: '',
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
  }, [router]);

  const fetchCommunities = async () => {
    setLoading(true);
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

      setCommunities(communitiesResponse.data);
      
      // Extract user's communities
      if (userResponse.data.communities) {
        setUserCommunities(userResponse.data.communities);
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
    setCreateFormData({
      ...createFormData,
      [name]: value,
    });
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
        location: '',
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
    
    if (!selectedCommunity) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `http://localhost:5000/api/communities/${selectedCommunity._id}/join`,
        { reason: joinReason },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Reset and close modal
      setJoinReason('');
      setSelectedCommunity(null);
      setShowJoinModal(false);
      
      alert('Join request submitted successfully!');
      
    } catch (error) {
      console.error('Error submitting join request:', error);
      alert('Failed to submit join request. Please try again.');
    }
  };

  const openJoinModal = (community) => {
    setSelectedCommunity(community);
    setShowJoinModal(true);
  };

  const isMemberOf = (communityId) => {
    return userCommunities.some(c => c === communityId);
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
                    {community.approved ? (
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
                      disabled={!community.approved}
                    >
                      <FaUserPlus className="mr-2" /> 
                      {community.approved ? 'Request to Join' : 'Pending Approval'}
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
                <label htmlFor="location" className="block text-gray-700 font-medium mb-2">
                  Location
                </label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={createFormData.location}
                  onChange={handleCreateInputChange}
                  required
                  className="input-field"
                  placeholder="e.g. 123 Main Street, City, State"
                />
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
