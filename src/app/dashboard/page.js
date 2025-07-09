'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import { productService, communityService, orderService } from '@/services/api';

export default function Dashboard() {
  const { user, isAuthenticated, loading } = useAuth();
  const router = useRouter();
  
  const [products, setProducts] = useState([]);
  const [communities, setCommunities] = useState([]);
  const [userCommunity, setUserCommunity] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [carbonStats, setCarbonStats] = useState(null);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, loading, router]);

  // Fetch data
  useEffect(() => {
    if (isAuthenticated && user) {
      const fetchData = async () => {
        try {
          setLoadingData(true);
          
          // Fetch products
          const productsData = await productService.getAllProducts();
          setProducts(productsData.slice(0, 4)); // Get first 4 products
          
          // Fetch communities
          const communitiesData = await communityService.getAllCommunities();
          setCommunities(communitiesData);
          
          // Check if user is in any community
          if (user.communityId) {
            try {
              const userCommunityData = await communityService.getCommunityById(user.communityId);
              setUserCommunity(userCommunityData);
            } catch (err) {
              console.error('Error fetching user community:', err);
            }
          }
          
          // Fetch recent orders
          try {
            const ordersData = await orderService.getUserOrders();
            setRecentOrders(ordersData.slice(0, 3)); // Get 3 most recent orders
          } catch (err) {
            console.error('Error fetching orders:', err);
          }
          
          // Fetch carbon stats
          try {
            const carbonData = await orderService.getUserCarbonStats();
            setCarbonStats(carbonData);
          } catch (err) {
            console.error('Error fetching carbon stats:', err);
          }
          
        } catch (err) {
          setError('Failed to load dashboard data');
          console.error('Dashboard data error:', err);
        } finally {
          setLoadingData(false);
        }
      };
      
      fetchData();
    }
  }, [isAuthenticated, user]);

  if (loading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <main className="py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Welcome, {user?.name || 'User'}!</h1>
          <p className="text-gray-600">
            {userCommunity 
              ? `You're part of the ${userCommunity.name} community`
              : 'Join a community to get discounts and reduce your carbon footprint'}
          </p>
        </div>

        {/* Error message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Community Membership */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-gray-500 text-sm uppercase">Community Status</h3>
                <p className="text-2xl font-semibold mt-1">
                  {userCommunity ? userCommunity.name : 'Not a member'}
                </p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
            <div className="mt-4">
              {!userCommunity ? (
                <div>
                  <Link 
                    href="/communities" 
                    className="text-blue-600 hover:text-blue-800 font-semibold"
                  >
                    Browse Communities →
                  </Link>
                </div>
              ) : (
                <div>
                  <Link 
                    href={`/communities/${userCommunity._id}`} 
                    className="text-blue-600 hover:text-blue-800 font-semibold"
                  >
                    View Community →
                  </Link>
                </div>
              )}
            </div>
          </div>
          
          {/* Recent Orders */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-gray-500 text-sm uppercase">Orders</h3>
                <p className="text-2xl font-semibold mt-1">{recentOrders.length || 0} recent</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
            </div>
            <div className="mt-4">
              <Link 
                href="/orders" 
                className="text-blue-600 hover:text-blue-800 font-semibold"
              >
                View All Orders →
              </Link>
            </div>
          </div>
          
          {/* Carbon Footprint */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-gray-500 text-sm uppercase">Carbon Footprint Saved</h3>
                <p className="text-2xl font-semibold mt-1">
                  {carbonStats ? `${carbonStats.totalSaved.toFixed(2)} kg` : '0 kg'}
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="mt-4 text-sm text-gray-600">
              {carbonStats ? (
                <p>Equivalent to planting {(carbonStats.totalSaved / 20).toFixed(1)} trees</p>
              ) : (
                <p>Make your first community order to start saving</p>
              )}
            </div>
          </div>
        </div>

        {/* Products Section */}
        <div className="mb-10">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Featured Products</h2>
            <Link 
              href="/products" 
              className="text-blue-600 hover:text-blue-800 font-semibold"
            >
              View All →
            </Link>
          </div>
          
          {loadingData ? (
            <div className="flex justify-center py-10">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {products.map(product => (
                <div key={product._id} className="bg-white rounded-lg shadow-md overflow-hidden">
                  <Link href={`/products/${product._id}`}>
                    <div className="relative h-48 w-full">
                      <Image
                        src={product.imageUrl || '/placeholder-product.jpg'}
                        alt={product.name}
                        fill
                        style={{ objectFit: 'cover' }}
                      />
                    </div>
                  </Link>
                  <div className="p-4">
                    <Link href={`/products/${product._id}`}>
                      <h3 className="font-semibold text-gray-800 mb-1 hover:text-blue-600">{product.name}</h3>
                    </Link>
                    <p className="text-sm text-gray-500 mb-2">{product.category}</p>
                    <div className="flex justify-between items-center">
                      <span className="font-bold">${product.price.toFixed(2)}</span>
                      <Link 
                        href={`/products/${product._id}`}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        View →
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Communities Section */}
        {!userCommunity && (
          <div className="mb-10">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Communities Near You</h2>
              <Link 
                href="/communities" 
                className="text-blue-600 hover:text-blue-800 font-semibold"
              >
                View All →
              </Link>
            </div>
            
            {loadingData ? (
              <div className="flex justify-center py-10">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : communities.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {communities.slice(0, 3).map(community => (
                  <div key={community._id} className="bg-white rounded-lg shadow-md overflow-hidden">
                    <div className="p-6">
                      <h3 className="font-semibold text-xl mb-2">{community.name}</h3>
                      <p className="text-gray-500 mb-3">{community.location.city}, {community.location.state}</p>
                      <p className="text-gray-600 mb-4 line-clamp-2">{community.description}</p>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">{community.members} members</span>
                        <Link 
                          href={`/communities/${community._id}`}
                          className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md text-sm"
                        >
                          View Details
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-gray-50 rounded-lg p-6 text-center">
                <p className="text-gray-600 mb-4">No communities found in your area yet.</p>
                <Link 
                  href="/communities/create" 
                  className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md"
                >
                  Create Community
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Recent Orders Section */}
        <div className="mb-10">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Recent Orders</h2>
            <Link 
              href="/orders" 
              className="text-blue-600 hover:text-blue-800 font-semibold"
            >
              View All →
            </Link>
          </div>
          
          {loadingData ? (
            <div className="flex justify-center py-10">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : recentOrders.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white rounded-lg shadow">
                <thead>
                  <tr className="bg-gray-100 text-gray-700 uppercase text-sm">
                    <th className="py-3 px-4 text-left">Order ID</th>
                    <th className="py-3 px-4 text-left">Date</th>
                    <th className="py-3 px-4 text-left">Items</th>
                    <th className="py-3 px-4 text-right">Total</th>
                    <th className="py-3 px-4 text-left">Status</th>
                    <th className="py-3 px-4 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="text-gray-600 text-sm">
                  {recentOrders.map(order => (
                    <tr key={order._id} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="py-4 px-4">#{order._id.slice(-6)}</td>
                      <td className="py-4 px-4">{new Date(order.createdAt).toLocaleDateString()}</td>
                      <td className="py-4 px-4">{order.items.length} items</td>
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
                          href={`/orders/${order._id}`}
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
              <p className="text-gray-600 mb-4">You haven't placed any orders yet.</p>
              <Link 
                href="/products" 
                className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md"
              >
                Browse Products
              </Link>
            </div>
          )}
        </div>

        {/* Create Community CTA */}
        {!userCommunity && (
          <div className="bg-blue-50 rounded-lg p-8 mb-10">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <div className="md:w-2/3 mb-6 md:mb-0">
                <h2 className="text-2xl font-bold mb-2">Start Your Own Community</h2>
                <p className="text-gray-600">
                  Create a community for your apartment complex, neighborhood, or dormitory.
                  Save money on deliveries and reduce carbon emissions together.
                </p>
              </div>
              <Link 
                href="/communities/create" 
                className="bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-md"
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
