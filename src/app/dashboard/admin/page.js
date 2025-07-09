'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { adminService } from '@/services/api';

export default function AdminDashboard() {
  const { user, isAuthenticated, loading, isWalmart } = useAuth();
  const router = useRouter();
  
  const [dashboardData, setDashboardData] = useState(null);
  const [pendingCommunities, setPendingCommunities] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState(null);

  // Redirect if not authenticated or not a Walmart admin
  useEffect(() => {
    if (!loading && (!isAuthenticated || !isWalmart)) {
      router.push('/login');
    }
  }, [isAuthenticated, isWalmart, loading, router]);

  // Fetch admin dashboard data
  useEffect(() => {
    if (isAuthenticated && isWalmart) {
      const fetchData = async () => {
        try {
          setLoadingData(true);
          
          // Fetch dashboard overview data
          const dashboardData = await adminService.getDashboardData();
          setDashboardData(dashboardData);
          
          // Fetch pending community approval requests
          const communitiesData = await adminService.getCommunityRequests();
          setPendingCommunities(communitiesData);
          
        } catch (err) {
          setError('Failed to load admin dashboard data');
          console.error('Admin dashboard data error:', err);
        } finally {
          setLoadingData(false);
        }
      };
      
      fetchData();
    }
  }, [isAuthenticated, isWalmart]);

  // Handle community approval/rejection
  const handleCommunityApproval = async (communityId, status) => {
    try {
      await adminService.approveCommunity(communityId, status);
      
      // Update the list to remove the approved/rejected community
      setPendingCommunities(pendingCommunities.filter(community => community._id !== communityId));
      
    } catch (err) {
      setError(`Failed to ${status} community`);
      console.error(`Community ${status} error:`, err);
    }
  };

  if (loading || !isAuthenticated || !isWalmart) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <main className="py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Admin Dashboard Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Walmart Admin Dashboard</h1>
          <p className="text-gray-600">
            Manage communities, view orders, and track environmental impact
          </p>
        </div>

        {/* Error message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* Stats Cards */}
        {loadingData ? (
          <div className="flex justify-center py-10">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : dashboardData ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {/* Total Communities */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-gray-500 text-sm uppercase">Communities</h3>
                  <p className="text-2xl font-semibold mt-1">{dashboardData.totalCommunities}</p>
                </div>
                <div className="bg-blue-100 p-3 rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
              </div>
              <div className="mt-4 text-sm text-gray-600">
                <p>{dashboardData.pendingCommunities} pending approvals</p>
              </div>
            </div>
            
            {/* Total Users */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-gray-500 text-sm uppercase">Users</h3>
                  <p className="text-2xl font-semibold mt-1">{dashboardData.totalUsers}</p>
                </div>
                <div className="bg-purple-100 p-3 rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              </div>
              <div className="mt-4 text-sm text-gray-600">
                <p>{dashboardData.newUsersThisMonth} new this month</p>
              </div>
            </div>
            
            {/* Total Orders */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-gray-500 text-sm uppercase">Total Orders</h3>
                  <p className="text-2xl font-semibold mt-1">{dashboardData.totalOrders}</p>
                </div>
                <div className="bg-orange-100 p-3 rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                </div>
              </div>
              <div className="mt-4 text-sm text-gray-600">
                <p>${dashboardData.totalRevenue?.toFixed(2)} total revenue</p>
              </div>
            </div>
            
            {/* Carbon Footprint */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-gray-500 text-sm uppercase">Carbon Footprint Saved</h3>
                  <p className="text-2xl font-semibold mt-1">{dashboardData.totalCarbonSaved?.toFixed(2)} kg</p>
                </div>
                <div className="bg-green-100 p-3 rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="mt-4 text-sm text-gray-600">
                <p>Equivalent to planting {(dashboardData.totalCarbonSaved / 20).toFixed(0)} trees</p>
              </div>
            </div>
          </div>
        ) : null}

        {/* Pending Community Approvals */}
        <div className="mb-10">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Pending Community Approvals</h2>
            <Link 
              href="/dashboard/admin/communities" 
              className="text-blue-600 hover:text-blue-800 font-semibold"
            >
              View All →
            </Link>
          </div>
          
          {loadingData ? (
            <div className="flex justify-center py-10">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : pendingCommunities.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white rounded-lg shadow">
                <thead>
                  <tr className="bg-gray-100 text-gray-700 uppercase text-sm">
                    <th className="py-3 px-4 text-left">Community Name</th>
                    <th className="py-3 px-4 text-left">Location</th>
                    <th className="py-3 px-4 text-left">Admin</th>
                    <th className="py-3 px-4 text-left">Date Requested</th>
                    <th className="py-3 px-4 text-left">Action</th>
                  </tr>
                </thead>
                <tbody className="text-gray-600 text-sm">
                  {pendingCommunities.map(community => (
                    <tr key={community._id} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="py-4 px-4 font-medium">{community.name}</td>
                      <td className="py-4 px-4">{community.location.city}, {community.location.state}</td>
                      <td className="py-4 px-4">{community.admin.name}</td>
                      <td className="py-4 px-4">{new Date(community.createdAt).toLocaleDateString()}</td>
                      <td className="py-4 px-4">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleCommunityApproval(community._id, 'approved')}
                            className="bg-green-500 hover:bg-green-600 text-white py-1 px-3 rounded-md text-xs"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleCommunityApproval(community._id, 'rejected')}
                            className="bg-red-500 hover:bg-red-600 text-white py-1 px-3 rounded-md text-xs"
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
          ) : (
            <div className="bg-gray-50 rounded-lg p-6 text-center">
              <p className="text-gray-600">No pending community approval requests.</p>
            </div>
          )}
        </div>

        {/* Recent Orders */}
        <div className="mb-10">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Recent Orders</h2>
            <Link 
              href="/dashboard/admin/orders" 
              className="text-blue-600 hover:text-blue-800 font-semibold"
            >
              View All →
            </Link>
          </div>
          
          {loadingData ? (
            <div className="flex justify-center py-10">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : dashboardData && dashboardData.recentOrders ? (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white rounded-lg shadow">
                <thead>
                  <tr className="bg-gray-100 text-gray-700 uppercase text-sm">
                    <th className="py-3 px-4 text-left">Order ID</th>
                    <th className="py-3 px-4 text-left">User</th>
                    <th className="py-3 px-4 text-left">Community</th>
                    <th className="py-3 px-4 text-left">Date</th>
                    <th className="py-3 px-4 text-right">Amount</th>
                    <th className="py-3 px-4 text-left">Status</th>
                    <th className="py-3 px-4 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="text-gray-600 text-sm">
                  {dashboardData.recentOrders.map(order => (
                    <tr key={order._id} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="py-4 px-4">#{order._id.slice(-6)}</td>
                      <td className="py-4 px-4">{order.user.name}</td>
                      <td className="py-4 px-4">{order.community ? order.community.name : 'N/A'}</td>
                      <td className="py-4 px-4">{new Date(order.createdAt).toLocaleDateString()}</td>
                      <td className="py-4 px-4 text-right">${order.totalAmount.toFixed(2)}</td>
                      <td className="py-4 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          order.status === 'delivered' 
                            ? 'bg-green-100 text-green-800' 
                            : order.status === 'processing'
                            ? 'bg-yellow-100 text-yellow-800'
                            : order.status === 'shipped'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <Link 
                          href={`/dashboard/admin/orders/${order._id}`}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          Details →
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="bg-gray-50 rounded-lg p-6 text-center">
              <p className="text-gray-600">No orders available.</p>
            </div>
          )}
        </div>

        {/* Carbon Footprint Impact */}
        <div className="mb-10">
          <div className="bg-green-50 rounded-lg p-8">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <div className="md:w-2/3 mb-6 md:mb-0">
                <h2 className="text-2xl font-bold text-green-800 mb-2">Environmental Impact</h2>
                <p className="text-green-700 mb-1">
                  Neighborhood Bulk Order Coordinator has helped reduce carbon emissions significantly.
                </p>
                <p className="text-green-700 mb-4">
                  Our community-based model has prevented {dashboardData?.totalDeliveries || 0} individual deliveries 
                  and saved {dashboardData?.totalCarbonSaved?.toFixed(2) || 0} kg of CO2 emissions.
                </p>
                <div className="flex items-center">
                  <div className="flex items-center mr-6">
                    <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                    <span className="text-sm text-green-700">Carbon Saved</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
                    <span className="text-sm text-green-700">Deliveries Saved</span>
                  </div>
                </div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow">
                <div className="text-center">
                  <p className="text-xl font-semibold text-green-700">Total Equivalent</p>
                  <p className="text-3xl font-bold text-green-800">
                    {((dashboardData?.totalCarbonSaved || 0) / 20).toFixed(0)} Trees
                  </p>
                  <p className="text-sm text-green-600">Yearly CO₂ absorption</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
