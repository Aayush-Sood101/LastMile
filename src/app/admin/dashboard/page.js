'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { 
  FaUsers, 
  FaUserCheck, 
  FaChartLine, 
  FaBoxes, 
  FaLeaf, 
  FaStore, 
  FaSignOutAlt,
  FaCheck,
  FaTimes,
  FaShoppingCart
} from 'react-icons/fa';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Title } from 'chart.js';
import { Doughnut, Line } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Title);

export default function AdminDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [dashboardData, setDashboardData] = useState(null);
  const [communityRequests, setCommunityRequests] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check if walmart admin is logged in
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    if (!token || user.role !== 'walmart') {
      router.push('/');
      return;
    }

    // Load initial data based on active tab
    loadTabData(activeTab);
  }, [router]);

  const loadTabData = async (tab) => {
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('token');
      
      switch (tab) {
        case 'dashboard':
          // Fetch both dashboard data and user stats
          const [dashboardResponse, userStatsResponse] = await Promise.all([
            axios.get(
              'http://localhost:5000/api/admin/dashboard',
              { headers: { Authorization: `Bearer ${token}` } }
            ),
            axios.get(
              'http://localhost:5000/api/admin/user-stats',
              { headers: { Authorization: `Bearer ${token}` } }
            )
          ]);
          
          // Merge the dashboard data with user stats
          setDashboardData({
            ...dashboardResponse.data,
            userStats: {
              total: userStatsResponse.data.totalUsers,
              communityUsers: userStatsResponse.data.communityUsers,
              nonCommunityUsers: userStatsResponse.data.nonCommunityUsers,
              newThisMonth: userStatsResponse.data.newThisMonth || 0 // This might not be provided by the API
            }
          });
          break;
          
        case 'communities':
          const communitiesResponse = await axios.get(
            'http://localhost:5000/api/admin/community-requests',
            { headers: { Authorization: `Bearer ${token}` } }
          );
          setCommunityRequests(communitiesResponse.data);
          break;
          
        case 'orders':
          const ordersResponse = await axios.get(
            'http://localhost:5000/api/admin/orders',
            { headers: { Authorization: `Bearer ${token}` } }
          );
          setOrders(ordersResponse.data);
          break;
      }
    } catch (error) {
      console.error('Error loading admin data:', error);
      setError('Failed to load data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    loadTabData(tab);
  };

  const handleApproveCommunity = async (communityId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `http://localhost:5000/api/communities/${communityId}/approve`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Refresh community requests data
      loadTabData('communities');
    } catch (error) {
      console.error('Error approving community:', error);
      alert('Failed to approve community');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <div className="w-64 bg-green-800 text-white h-screen sticky top-0 hidden md:block">
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-1">Walmart Admin</h2>
          <p className="text-green-200 text-sm mb-8">Bulk Order Dashboard</p>
          
          <nav>
            <button 
              className={`flex items-center space-x-3 w-full p-3 rounded-lg mb-2 text-left ${activeTab === 'dashboard' ? 'bg-green-700' : 'hover:bg-green-700'}`}
              onClick={() => handleTabChange('dashboard')}
            >
              <FaChartLine /> <span>Dashboard</span>
            </button>
            
            <button 
              className={`flex items-center space-x-3 w-full p-3 rounded-lg mb-2 text-left ${activeTab === 'communities' ? 'bg-green-700' : 'hover:bg-green-700'}`}
              onClick={() => handleTabChange('communities')}
            >
              <FaUsers /> <span>Communities</span>
            </button>
            
            <button 
              className={`flex items-center space-x-3 w-full p-3 rounded-lg mb-2 text-left ${activeTab === 'orders' ? 'bg-green-700' : 'hover:bg-green-700'}`}
              onClick={() => handleTabChange('orders')}
            >
              <FaBoxes /> <span>Orders</span>
            </button>
            
            <button 
              className={`flex items-center space-x-3 w-full p-3 rounded-lg mb-2 text-left ${activeTab === 'products' ? 'bg-green-700' : 'hover:bg-green-700'}`}
              onClick={() => handleTabChange('products')}
            >
              <FaStore /> <span>Products</span>
            </button>
          </nav>
        </div>
        
        <div className="mt-auto p-4 border-t border-green-700">
          <button 
            className="flex items-center space-x-2 text-green-200 hover:text-white w-full"
            onClick={handleLogout}
          >
            <FaSignOutAlt /> <span>Log Out</span>
          </button>
        </div>
      </div>

      {/* Mobile header */}
      <div className="md:hidden fixed top-0 left-0 right-0 bg-green-800 text-white z-10">
        <div className="flex items-center justify-between p-4">
          <h2 className="text-xl font-bold">Walmart Admin</h2>
          
          <button 
            className="bg-green-700 p-2 rounded"
            onClick={() => document.getElementById('mobileMenu').classList.toggle('hidden')}
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
        
        <div id="mobileMenu" className="hidden">
          <div className="p-4 space-y-3">
            <button 
              className={`flex items-center space-x-3 w-full p-3 rounded-lg ${activeTab === 'dashboard' ? 'bg-green-700' : ''}`}
              onClick={() => handleTabChange('dashboard')}
            >
              <FaChartLine /> <span>Dashboard</span>
            </button>
            
            <button 
              className={`flex items-center space-x-3 w-full p-3 rounded-lg ${activeTab === 'communities' ? 'bg-green-700' : ''}`}
              onClick={() => handleTabChange('communities')}
            >
              <FaUsers /> <span>Communities</span>
            </button>
            
            <button 
              className={`flex items-center space-x-3 w-full p-3 rounded-lg ${activeTab === 'orders' ? 'bg-green-700' : ''}`}
              onClick={() => handleTabChange('orders')}
            >
              <FaBoxes /> <span>Orders</span>
            </button>
            
            <button 
              className={`flex items-center space-x-3 w-full p-3 rounded-lg ${activeTab === 'products' ? 'bg-green-700' : ''}`}
              onClick={() => handleTabChange('products')}
            >
              <FaStore /> <span>Products</span>
            </button>
            
            <button 
              className="flex items-center space-x-3 w-full p-3 rounded-lg text-green-200"
              onClick={handleLogout}
            >
              <FaSignOutAlt /> <span>Log Out</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 md:ml-64 md:mt-0 mt-16 min-h-screen">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600"></div>
          </div>
        ) : error ? (
          <div className="p-6">
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          </div>
        ) : (
          <>
            {/* Dashboard Tab */}
            {activeTab === 'dashboard' && dashboardData && (
              <div className="p-6">
                <h1 className="text-3xl font-bold text-gray-800 mb-6">Walmart Admin Dashboard</h1>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  {/* KPI Cards */}
                  <div className="bg-white rounded-xl shadow-sm p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-500 text-sm">Total Users</p>
                        <h3 className="text-3xl font-bold">{dashboardData.userStats?.total || 'N/A'}</h3>
                      </div>
                      <div className="bg-blue-100 p-3 rounded-full text-blue-600">
                        <FaUsers className="text-xl" />
                      </div>
                    </div>
                    <div className="mt-4 text-sm text-gray-600">
                      <span className="text-green-600">+{dashboardData.userStats?.newThisMonth || 0}</span> new this month
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-xl shadow-sm p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-500 text-sm">Communities</p>
                        <h3 className="text-3xl font-bold">{dashboardData.communityStats?.total || dashboardData.pendingCommunitiesCount || 0}</h3>
                      </div>
                      <div className="bg-green-100 p-3 rounded-full text-green-600">
                        <FaUserCheck className="text-xl" />
                      </div>
                    </div>
                    <div className="mt-4 text-sm text-gray-600">
                      <span className="text-yellow-600">{dashboardData.communityStats?.pending || dashboardData.pendingCommunitiesCount || 0}</span> pending approval
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-xl shadow-sm p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-500 text-sm">Total Orders</p>
                        <h3 className="text-3xl font-bold">
                          {dashboardData.orderStats?.total || 
                           ((dashboardData.orderStats?.individual?.count || 0) + 
                            (dashboardData.orderStats?.group?.count || 0))}
                        </h3>
                      </div>
                      <div className="bg-purple-100 p-3 rounded-full text-purple-600">
                        <FaShoppingCart className="text-xl" />
                      </div>
                    </div>
                    <div className="mt-4 text-sm text-gray-600">
                      <span className="text-green-600">
                        ${(dashboardData.orderStats?.totalRevenue || 
                           (dashboardData.orderStats?.individual?.totalValue || 0) + 
                           (dashboardData.orderStats?.group?.totalValue || 0)).toLocaleString()}
                      </span> revenue
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-xl shadow-sm p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-500 text-sm">Carbon Saved</p>
                        <h3 className="text-3xl font-bold">
                          {Math.round(dashboardData.carbonStats?.totalSaved || 
                                     dashboardData.totalCarbonFootprintSaved || 0)} kg
                        </h3>
                      </div>
                      <div className="bg-green-100 p-3 rounded-full text-green-600">
                        <FaLeaf className="text-xl" />
                      </div>
                    </div>
                    <div className="mt-4 text-sm text-gray-600">
                      = {Math.round((dashboardData.carbonStats?.totalSaved || 
                                   dashboardData.totalCarbonFootprintSaved || 0) * 2.4)} miles not driven
                    </div>
                  </div>
                </div>
                
                {/* Carbon Footprint and Orders Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                  <div className="bg-white rounded-xl shadow-sm p-6">
                    <h3 className="text-xl font-semibold mb-6">Carbon Footprint Impact</h3>
                    
                    <div className="h-64">
                      <Doughnut 
                        data={{
                          labels: ['Carbon Saved', 'Carbon Used'],
                          datasets: [
                            {
                              data: [
                                dashboardData.carbonStats?.totalSaved || dashboardData.totalCarbonFootprintSaved || 0,
                                dashboardData.carbonStats?.totalUsed || 0
                              ],
                              backgroundColor: ['#16a34a', '#cbd5e1'],
                              borderColor: ['#16a34a', '#cbd5e1'],
                              borderWidth: 1,
                            },
                          ],
                        }}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: {
                            legend: {
                              position: 'bottom',
                            },
                          },
                        }}
                      />
                    </div>
                    
                    <div className="mt-4 text-center text-sm text-gray-600">
                      <p>Total Deliveries: {dashboardData.orderStats.total}</p>
                      <p>Individual Deliveries Saved: {dashboardData.orderStats.individualDeliveriesSaved}</p>
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-xl shadow-sm p-6">
                    <h3 className="text-xl font-semibold mb-6">Orders Over Time</h3>
                    
                    <div className="h-64">
                      <Line 
                        data={{
                          labels: (dashboardData.orderStats?.timeline || []).map(item => item?.month || ''),
                          datasets: [
                            {
                              label: 'Orders',
                              data: (dashboardData.orderStats?.timeline || []).map(item => item?.count || 0),
                              fill: false,
                              borderColor: '#16a34a',
                              tension: 0.1,
                              backgroundColor: '#16a34a',
                            },
                          ],
                        }}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: {
                            legend: {
                              display: false,
                            },
                          },
                          scales: {
                            y: {
                              beginAtZero: true,
                              ticks: {
                                precision: 0,
                              },
                            },
                          },
                        }}
                      />
                    </div>
                  </div>
                </div>
                
                {/* Community Activity */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h3 className="text-xl font-semibold mb-4">Top Communities</h3>
                  
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Community Name
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Members
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Orders
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Carbon Saved
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Location
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {(dashboardData.topCommunities || dashboardData.communityCarbonData || []).map((community) => (
                          <tr key={community._id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">
                                {community.name}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-500">
                                {community.memberCount || 'N/A'}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-500">
                                {community.orderCount || 'N/A'}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-500">
                                {(community.carbonSaved || community.totalCarbonFootprintSaved || 0).toFixed(2)} kg
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-500">
                                {community.location || 'N/A'}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
            
            {/* Communities Tab */}
            {activeTab === 'communities' && (
              <div className="p-6">
                <h1 className="text-3xl font-bold text-gray-800 mb-6">Community Management</h1>
                
                {communityRequests.length > 0 ? (
                  <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b">
                      <h3 className="text-lg font-semibold">Pending Community Approval Requests</h3>
                    </div>
                    
                    <div className="divide-y">
                      {communityRequests.map(request => (
                        <div key={request._id} className="p-6">
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                              <h4 className="text-lg font-semibold">{request.name}</h4>
                              <p className="text-gray-600 text-sm mb-2">{request.location}</p>
                              <p className="text-gray-700">{request.description}</p>
                              
                              {request.createdBy && (
                                <div className="mt-2">
                                  <span className="text-sm text-gray-500">
                                    Requested by: {request.createdBy.name} ({request.createdBy.email})
                                  </span>
                                </div>
                              )}
                            </div>
                            
                            <div className="flex space-x-3">
                              <button
                                className="flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md"
                                onClick={() => handleApproveCommunity(request._id)}
                              >
                                <FaCheck className="mr-2" /> Approve
                              </button>
                              
                              <button
                                className="flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md"
                              >
                                <FaTimes className="mr-2" /> Reject
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="bg-white rounded-xl shadow-sm p-8 text-center">
                    <h3 className="text-xl font-semibold mb-2">No pending community requests</h3>
                    <p className="text-gray-600">
                      All community requests have been processed
                    </p>
                  </div>
                )}
              </div>
            )}
            
            {/* Orders Tab */}
            {activeTab === 'orders' && (
              <div className="p-6">
                <h1 className="text-3xl font-bold text-gray-800 mb-6">Order Management</h1>
                
                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                  <div className="px-6 py-4 border-b">
                    <h3 className="text-lg font-semibold">Recent Orders</h3>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Order ID
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Customer
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Community
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Date
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Total
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Carbon Saved
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {orders.map((order) => (
                          <tr key={order._id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {order._id.substring(0, 8)}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">
                                {order.user?.name || 'Unknown'}
                              </div>
                              <div className="text-sm text-gray-500">
                                {order.user?.email || 'No email'}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {order.community?.name || 'Individual Order'}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-500">
                                {new Date(order.createdAt).toLocaleDateString()}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">
                                ${order.totalAmount?.toFixed(2) || '0.00'}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                ${order.status === 'processing' ? 'bg-yellow-100 text-yellow-800' : 
                                  order.status === 'delivered' ? 'bg-green-100 text-green-800' : 
                                  'bg-blue-100 text-blue-800'}`}>
                                {order.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-500">
                                {order.carbonSaved?.toFixed(2) || '0.00'} kg
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
            
            {/* Products Tab */}
            {activeTab === 'products' && (
              <div className="p-6">
                <h1 className="text-3xl font-bold text-gray-800 mb-6">Product Management</h1>
                
                <div className="bg-white rounded-xl shadow-sm p-8 text-center">
                  <h3 className="text-xl font-semibold mb-2">Product Management</h3>
                  <p className="text-gray-600 mb-4">
                    This feature is coming soon. You'll be able to add, edit, and delete products.
                  </p>
                  <button className="btn-primary" disabled>
                    Add New Product
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
