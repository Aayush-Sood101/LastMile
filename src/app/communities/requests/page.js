'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { communityService } from '@/services/api';
import Link from 'next/link';

export default function MembershipRequests() {
  const { user, isAuthenticated } = useAuth();
  const [community, setCommunity] = useState(null);
  const [membershipRequests, setMembershipRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load community and membership requests
  useEffect(() => {
    const loadData = async () => {
      if (!isAuthenticated || !user?.isCommunityAdmin || !user?.community) {
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        // Get community details
        const communityData = await communityService.getCommunityById(user.community);
        setCommunity(communityData);
        
        // Get membership requests
        const requests = await communityService.getMembershipRequests(user.community);
        setMembershipRequests(requests);
      } catch (err) {
        console.error('Error loading data:', err);
        setError('Failed to load membership requests');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [isAuthenticated, user]);

  // Handle membership request
  const handleMembershipRequest = async (userId, status) => {
    try {
      await communityService.handleMembershipRequest(user.community, userId, status);
      
      // Update the local state
      setMembershipRequests(prev => prev.filter(request => request.user._id !== userId));
    } catch (err) {
      console.error('Error handling membership request:', err);
      setError('Failed to process request');
    }
  };

  // Render loading state
  if (loading) {
    return (
      <div className="container mx-auto max-w-6xl px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Membership Requests</h1>
        <div className="flex justify-center items-center py-16">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  // User not authenticated or not a community admin
  if (!isAuthenticated || !user?.isCommunityAdmin) {
    return (
      <div className="container mx-auto max-w-6xl px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Membership Requests</h1>
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <h2 className="text-2xl font-semibold mb-4">Access Denied</h2>
          <p className="text-gray-600 mb-6">
            You need to be a community admin to view this page.
          </p>
          <Link
            href="/dashboard"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">Membership Requests</h1>
      {community && (
        <p className="text-gray-600 mb-6">
          {community.name} · {community.members.length} members
        </p>
      )}
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}
      
      {membershipRequests.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <h2 className="text-xl font-semibold mb-4">No Pending Requests</h2>
          <p className="text-gray-600">
            There are no pending membership requests for your community.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date Requested</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {membershipRequests.map((request) => (
                <tr key={request.user._id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {request.user.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {request.user.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(request.requestDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-3">
                      <button
                        onClick={() => handleMembershipRequest(request.user._id, 'approved')}
                        className="text-green-600 hover:text-green-900"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleMembershipRequest(request.user._id, 'rejected')}
                        className="text-red-600 hover:text-red-900"
                      >
                        Reject
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      <div className="mt-8 flex justify-end">
        <Link
          href="/dashboard"
          className="inline-block bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-6 rounded-lg transition-colors"
        >
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
