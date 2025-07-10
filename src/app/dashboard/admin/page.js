'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { adminService, walmartAdminService, deliveryCycleService } from '@/services/api';

export default function AdminDashboard() {
  const { user, isAuthenticated, loading, isWalmart } = useAuth();
  const router = useRouter();
  
  const [dashboardData, setDashboardData] = useState(null);
  const [pendingCommunities, setPendingCommunities] = useState([]);
  const [allCommunities, setAllCommunities] = useState([]);
  const [upcomingDeliveries, setUpcomingDeliveries] = useState([]);
  const [selectedDelivery, setSelectedDelivery] = useState(null);
  const [productRequirements, setProductRequirements] = useState([]);
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
          
          // Fetch all communities
          const allCommunitiesResult = await walmartAdminService.getAllCommunities();
          setAllCommunities(allCommunitiesResult);
          
          // Fetch upcoming deliveries
          const upcomingDeliveriesResult = await deliveryCycleService.getUpcomingDeliveryCycles();
          setUpcomingDeliveries(upcomingDeliveriesResult);
          
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

  // Handle delivery cycle status update
  const handleUpdateDeliveryStatus = async (deliveryId, status) => {
    try {
      await deliveryCycleService.updateDeliveryCycleStatus(deliveryId, status);
      
      // Update local state
      setUpcomingDeliveries(prev => 
        prev.map(delivery => 
          delivery._id === deliveryId 
            ? { ...delivery, status } 
            : delivery
        )
      );
      
      if (selectedDelivery?._id === deliveryId) {
        setSelectedDelivery(prev => ({ ...prev, status }));
      }
    } catch (err) {
      setError('Failed to update delivery status');
      console.error('Update delivery status error:', err);
    }
  };

  // Handle community approval
  const handleApproveCommunity = async (communityId) => {
    try {
      await adminService.approveCommunity(communityId);
      
      // Update local state
      setPendingCommunities(prev => 
        prev.filter(community => community._id !== communityId)
      );
    } catch (err) {
      setError('Failed to approve community');
      console.error('Approve community error:', err);
    }
  };

  // Handle selecting a delivery to view requirements
  const handleViewRequirements = async (deliveryId) => {
    try {
      const delivery = upcomingDeliveries.find(d => d._id === deliveryId);
      setSelectedDelivery(delivery);
      
      const { productRequirements: requirements } = await deliveryCycleService.getProductRequirements(deliveryId);
      setProductRequirements(requirements);
    } catch (err) {
      setError('Failed to fetch product requirements');
      console.error('Product requirements error:', err);
    }
  };

  // Create a new delivery cycle
  const handleCreateDeliveryCycle = async (communityId) => {
    try {
      // Calculate a date 7 days from now
      const date = new Date();
      date.setDate(date.getDate() + 7);
      
      await deliveryCycleService.createDeliveryCycle({
        communityId,
        scheduledDate: date.toISOString()
      });
      
      // Refresh upcoming deliveries
      const upcomingDeliveriesResult = await deliveryCycleService.getUpcomingDeliveryCycles();
      setUpcomingDeliveries(upcomingDeliveriesResult);
    } catch (err) {
      setError('Failed to create delivery cycle');
      console.error('Create delivery cycle error:', err);
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
            Manage communities, delivery cycles, and monitor performance
          </p>
        </div>

        {/* Error message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* Stats Cards */}
        {dashboardData && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-gray-500 text-sm uppercase">Carbon Footprint Saved</h3>
              <p className="text-2xl font-semibold mt-1">
                {dashboardData.totalCarbonFootprintSaved.toFixed(1)} kg CO₂
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-gray-500 text-sm uppercase">Pending Communities</h3>
              <p className="text-2xl font-semibold mt-1">
                {pendingCommunities.length}
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-gray-500 text-sm uppercase">Upcoming Deliveries</h3>
              <p className="text-2xl font-semibold mt-1">
                {upcomingDeliveries.length}
              </p>
            </div>
          </div>
        )}

        {/* Pending Community Approvals */}
        <div className="mb-10">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Community Requests</h2>
          </div>
          
          {pendingCommunities.length === 0 ? (
            <div className="bg-white p-6 rounded-lg shadow-md">
              <p className="text-gray-500">No pending community requests</p>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Community</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Admin</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {pendingCommunities.map((community) => (
                    <tr key={community._id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900">
                          {community.name}
                        </div>
                        <div className="text-gray-500 text-sm">
                          {community.description.substring(0, 40)}...
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{community.admin.name}</div>
                        <div className="text-sm text-gray-500">{community.admin.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{community.location.city}</div>
                        <div className="text-sm text-gray-500">{community.location.zipCode}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(community.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleApproveCommunity(community._id)}
                          className="text-green-600 hover:text-green-900"
                        >
                          Approve
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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

        {/* Delivery Cycles */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Upcoming Delivery Cycles</h2>
          </div>
          
          {upcomingDeliveries.length === 0 ? (
            <div className="bg-white p-6 rounded-lg shadow-md">
              <p className="text-gray-500">No upcoming delivery cycles</p>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Community</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {upcomingDeliveries.map((delivery) => (
                    <tr key={delivery._id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900">
                          {delivery.community.name}
                        </div>
                        <div className="text-gray-500 text-sm">
                          {delivery.community.location?.zipCode}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(delivery.scheduledDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                          ${delivery.status === 'scheduled' ? 'bg-yellow-100 text-yellow-800' : 
                            delivery.status === 'in-progress' ? 'bg-blue-100 text-blue-800' : 
                            delivery.status === 'completed' ? 'bg-green-100 text-green-800' : 
                            'bg-red-100 text-red-800'}`}>
                          {delivery.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-3">
                          <button
                            onClick={() => handleViewRequirements(delivery._id)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            View Requirements
                          </button>
                          {delivery.status === 'scheduled' && (
                            <button
                              onClick={() => handleUpdateDeliveryStatus(delivery._id, 'in-progress')}
                              className="text-green-600 hover:text-green-900"
                            >
                              Start
                            </button>
                          )}
                          {delivery.status === 'in-progress' && (
                            <button
                              onClick={() => handleUpdateDeliveryStatus(delivery._id, 'completed')}
                              className="text-green-600 hover:text-green-900"
                            >
                              Complete
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Communities */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Active Communities</h2>
          </div>
          
          {allCommunities.filter(c => c.isApproved).length === 0 ? (
            <div className="bg-white p-6 rounded-lg shadow-md">
              <p className="text-gray-500">No active communities</p>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Community</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Members</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Upcoming Delivery</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {allCommunities
                    .filter(community => community.isApproved)
                    .map((community) => (
                    <tr key={community._id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900">
                          {community.name}
                        </div>
                        <div className="text-gray-500 text-sm">
                          {community.location.city}, {community.location.zipCode}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {community.memberCount || community.members?.length || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {community.upcomingDelivery ? (
                          <div className="text-sm text-gray-900">
                            {new Date(community.upcomingDelivery.date).toLocaleDateString()}
                            <span className={`ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                              ${community.upcomingDelivery.status === 'scheduled' ? 'bg-yellow-100 text-yellow-800' : 
                                community.upcomingDelivery.status === 'in-progress' ? 'bg-blue-100 text-blue-800' : 
                                'bg-red-100 text-red-800'}`}>
                              {community.upcomingDelivery.status}
                            </span>
                          </div>
                        ) : (
                          <span className="text-gray-500">None scheduled</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        {!community.upcomingDelivery && (
                          <button
                            onClick={() => handleCreateDeliveryCycle(community._id)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            Schedule Delivery
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Product Requirements Modal */}
        {selectedDelivery && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-full max-w-4xl shadow-lg rounded-md bg-white">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">
                  Product Requirements for {selectedDelivery.community.name}
                </h3>
                <button
                  onClick={() => setSelectedDelivery(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="mt-4">
                <div className="flex justify-between mb-2">
                  <div className="text-gray-700">
                    <strong>Delivery Date:</strong> {new Date(selectedDelivery.scheduledDate).toLocaleDateString()}
                  </div>
                  <div className="text-gray-700">
                    <strong>Status:</strong> {selectedDelivery.status}
                  </div>
                </div>
                
                {productRequirements.length === 0 ? (
                  <p className="text-gray-500 py-4">No products in this delivery</p>
                ) : (
                  <table className="min-w-full divide-y divide-gray-200 mt-4">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total Price</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {productRequirements.map((item) => (
                        <tr key={item.product._id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {item.product.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {item.product.category}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                            {item.quantity}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                            ${item.totalPrice.toFixed(2)}
                          </td>
                        </tr>
                      ))}
                      <tr className="bg-gray-50">
                        <td colSpan="3" className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          Total:
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-bold">
                          ${productRequirements.reduce((sum, item) => sum + item.totalPrice, 0).toFixed(2)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                )}
              </div>
              
              <div className="mt-4 flex justify-end">
                <button
                  onClick={() => setSelectedDelivery(null)}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded mr-2"
                >
                  Close
                </button>
                
                {selectedDelivery.status === 'scheduled' && (
                  <button
                    onClick={() => {
                      handleUpdateDeliveryStatus(selectedDelivery._id, 'in-progress');
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                  >
                    Start Delivery
                  </button>
                )}
                
                {selectedDelivery.status === 'in-progress' && (
                  <button
                    onClick={() => {
                      handleUpdateDeliveryStatus(selectedDelivery._id, 'completed');
                    }}
                    className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                  >
                    Mark as Completed
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
