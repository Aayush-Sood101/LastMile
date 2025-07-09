'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { communityService } from '@/services/api';

export default function CommunitiesPage() {
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();
  
  const [communities, setCommunities] = useState([]);
  const [userCommunity, setUserCommunity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredCommunities, setFilteredCommunities] = useState([]);
  
  // Fetch communities
  useEffect(() => {
    const fetchCommunities = async () => {
      try {
        setLoading(true);
        
        // Fetch all approved communities
        const data = await communityService.getAllCommunities();
        setCommunities(data);
        setFilteredCommunities(data);
        
        // Check if user is in a community
        if (isAuthenticated && user?.communityId) {
          try {
            const userCommunityData = await communityService.getCommunityById(user.communityId);
            setUserCommunity(userCommunityData);
          } catch (err) {
            console.error('Error fetching user community:', err);
          }
        }
      } catch (err) {
        setError('Failed to load communities');
        console.error('Communities fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchCommunities();
  }, [isAuthenticated, user]);
  
  // Filter communities when search term changes
  useEffect(() => {
    if (!searchTerm) {
      setFilteredCommunities(communities);
      return;
    }
    
    const term = searchTerm.toLowerCase();
    const filtered = communities.filter(
      community => 
        community.name.toLowerCase().includes(term) || 
        community.description.toLowerCase().includes(term) ||
        community.location.city.toLowerCase().includes(term) ||
        community.location.state.toLowerCase().includes(term) ||
        community.location.zipCode.includes(term)
    );
    
    setFilteredCommunities(filtered);
  }, [searchTerm, communities]);
  
  // Handle join community request
  const handleJoinCommunity = async (communityId) => {
    if (!isAuthenticated) {
      router.push(`/login?redirect=/communities`);
      return;
    }
    
    try {
      await communityService.joinCommunity(communityId);
      alert('Join request sent successfully! The community admin will review your request.');
    } catch (err) {
      setError('Failed to send join request');
      console.error('Join community error:', err);
    }
  };
  
  return (
    <main className="py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        <h1 className="text-3xl font-bold mb-2">Communities</h1>
        <p className="text-gray-600 mb-8">
          Join a community to save money on deliveries and reduce carbon emissions.
        </p>
        
        {/* Error message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}
        
        {/* User's Community */}
        {userCommunity && (
          <div className="bg-blue-50 rounded-lg p-6 mb-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
              <div>
                <h2 className="text-lg font-semibold text-blue-800">Your Community</h2>
                <p className="text-blue-600">You're a member of {userCommunity.name}</p>
              </div>
              <Link 
                href={`/communities/${userCommunity._id}`}
                className="mt-4 md:mt-0 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md text-sm font-medium"
              >
                View Community
              </Link>
            </div>
          </div>
        )}
        
        {/* Search and Create */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div className="w-full md:w-1/2 mb-4 md:mb-0">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search communities by name, location..."
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          {!userCommunity && (
            <Link 
              href="/communities/create"
              className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded-md font-medium"
            >
              Create Community
            </Link>
          )}
        </div>
        
        {/* Communities List */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : filteredCommunities.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCommunities.map(community => (
              <div 
                key={community._id} 
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-2">{community.name}</h3>
                  <div className="flex items-center text-gray-600 text-sm mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {community.location.city}, {community.location.state}
                  </div>
                  <p className="text-gray-600 mb-4 line-clamp-3">
                    {community.description}
                  </p>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 text-sm">{community.members || 0} members</span>
                    {userCommunity ? (
                      userCommunity._id === community._id ? (
                        <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                          Member
                        </span>
                      ) : (
                        <Link 
                          href={`/communities/${community._id}`}
                          className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                        >
                          View Details
                        </Link>
                      )
                    ) : (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleJoinCommunity(community._id)}
                          className="bg-blue-600 hover:bg-blue-700 text-white py-1 px-3 rounded-md text-sm"
                        >
                          Join
                        </button>
                        <Link 
                          href={`/communities/${community._id}`}
                          className="text-blue-600 hover:text-blue-800 font-medium text-sm py-1"
                        >
                          Details
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-gray-50 rounded-lg p-8 text-center">
            <p className="text-gray-600 text-lg mb-4">
              {searchTerm 
                ? 'No communities match your search criteria.' 
                : 'No communities available in your area yet.'}
            </p>
            {!userCommunity && (
              <Link 
                href="/communities/create"
                className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded-md font-medium"
              >
                Create Community
              </Link>
            )}
          </div>
        )}
        
        {/* Create Community Promotion */}
        {!userCommunity && !loading && (
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg p-8 mt-12">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="md:w-2/3 mb-6 md:mb-0">
                <h2 className="text-2xl font-bold mb-4">Start Your Own Community</h2>
                <p className="mb-2">
                  Create a community for your apartment complex, neighborhood, or dormitory.
                  Get discounts on deliveries and reduce your carbon footprint.
                </p>
                <ul className="list-disc pl-5 mb-4">
                  <li>Save up to 5% on every order</li>
                  <li>Reduce carbon emissions with fewer deliveries</li>
                  <li>Build connections with neighbors</li>
                  <li>Track your environmental impact</li>
                </ul>
              </div>
              <Link 
                href="/communities/create"
                className="bg-white text-blue-600 hover:bg-gray-100 py-3 px-6 rounded-md font-semibold"
              >
                Create Community
              </Link>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
