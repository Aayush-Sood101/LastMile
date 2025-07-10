'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useCommunityCart } from '@/context/CommunityCartContext';
import { communityService } from '@/services/api';
import Link from 'next/link';
import Image from 'next/image';

export default function CommunityCart() {
  const { user } = useAuth();
  const { communityCart, loading, error, updateItem, removeItem, lockCart } = useCommunityCart();
  const [community, setCommunity] = useState(null);
  const [communityLoading, setCommunityLoading] = useState(true);
  const [lockConfirm, setLockConfirm] = useState(false);

  // Load community details
  useEffect(() => {
    const loadCommunity = async () => {
      if (!user?.community) {
        setCommunityLoading(false);
        return;
      }
      
      try {
        setCommunityLoading(true);
        const data = await communityService.getCommunityById(user.community);
        setCommunity(data);
      } catch (err) {
        console.error('Error loading community:', err);
      } finally {
        setCommunityLoading(false);
      }
    };

    loadCommunity();
  }, [user]);

  // Handle quantity change
  const handleQuantityChange = async (productId, quantity) => {
    await updateItem(productId, quantity);
  };

  // Handle remove item
  const handleRemoveItem = async (productId) => {
    await removeItem(productId);
  };

  // Handle lock cart (for community admin)
  const handleLockCart = async () => {
    const result = await lockCart();
    if (result.success) {
      setLockConfirm(false);
    }
  };

  // Render loading state
  if (loading || communityLoading) {
    return (
      <div className="container mx-auto max-w-6xl px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Community Cart</h1>
        <div className="flex justify-center items-center py-16">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  // User not in a community
  if (!user?.community) {
    return (
      <div className="container mx-auto max-w-6xl px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Community Cart</h1>
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <h2 className="text-2xl font-semibold mb-4">You're not a member of any community</h2>
          <p className="text-gray-600 mb-6">
            Join a community to use the community cart feature and save money through group orders.
          </p>
          <Link
            href="/communities"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
          >
            Browse Communities
          </Link>
        </div>
      </div>
    );
  }

  // Empty cart
  if (!communityCart?.items?.length) {
    return (
      <div className="container mx-auto max-w-6xl px-4 py-8">
        <h1 className="text-3xl font-bold mb-2">Community Cart</h1>
        <p className="text-gray-600 mb-6">
          {community?.name} · {community?.members?.length || 0} members
        </p>
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <h2 className="text-2xl font-semibold mb-4">Your community cart is empty</h2>
          <p className="text-gray-600 mb-6">
            Add products to your community cart to save money and reduce carbon footprint.
          </p>
          <Link
            href="/products"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
          >
            Browse Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">Community Cart</h1>
      <p className="text-gray-600 mb-6">
        {community?.name} · {community?.members?.length || 0} members
      </p>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Added By</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {communityCart.items.map((item) => (
                  <tr key={item.product._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0 mr-4">
                          {item.product.imageUrl ? (
                            <Image
                              src={item.product.imageUrl}
                              alt={item.product.name}
                              width={40}
                              height={40}
                              className="object-cover rounded"
                            />
                          ) : (
                            <div className="h-10 w-10 bg-gray-200 rounded flex items-center justify-center text-gray-500">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-6 w-6"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                />
                              </svg>
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">
                            {item.product.name}
                          </div>
                          <div className="text-gray-500 text-sm">
                            {item.product.category}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-gray-900">
                        ${item.product.price.toFixed(2)}
                      </div>
                      <div className="text-green-600 text-sm">
                        Save {item.product.communityDiscountPercentage}%
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleQuantityChange(item.product._id, Math.max(1, item.quantity - 1))}
                          className="text-gray-500 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-full p-1"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M20 12H4"
                            />
                          </svg>
                        </button>
                        <span className="text-gray-700 font-medium">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => handleQuantityChange(item.product._id, item.quantity + 1)}
                          className="text-gray-500 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-full p-1"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 4v16m8-8H4"
                            />
                          </svg>
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.addedBy?.name || 'Unknown'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      <button
                        onClick={() => handleRemoveItem(item.product._id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Cart Summary */}
        <div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Community Cart Summary</h2>
            
            <div className="space-y-4 mb-6">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-medium">${communityCart.totalPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Carbon Footprint Saved:</span>
                <span className="font-medium text-green-600">
                  {((communityCart.totalCarbonFootprint.community) || 0).toFixed(1)} kg CO₂
                </span>
              </div>
              <div className="pt-4 border-t border-gray-200">
                <div className="flex justify-between">
                  <span className="font-semibold">Total Items:</span>
                  <span className="font-semibold">
                    {communityCart.items.reduce((acc, item) => acc + item.quantity, 0)}
                  </span>
                </div>
              </div>
            </div>
            
            {/* Admin Actions */}
            {user.isCommunityAdmin && (
              <div className="space-y-4">
                <div className="pt-4 border-t border-gray-200">
                  <h3 className="text-lg font-semibold mb-2">Admin Actions</h3>
                  {lockConfirm ? (
                    <div>
                      <p className="text-sm text-gray-600 mb-3">
                        Are you sure? This will lock the cart and prepare it for the next delivery cycle.
                      </p>
                      <div className="flex space-x-2">
                        <button
                          onClick={handleLockCart}
                          className="w-full bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded"
                        >
                          Confirm Lock
                        </button>
                        <button
                          onClick={() => setLockConfirm(false)}
                          className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setLockConfirm(true)}
                      className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded"
                    >
                      Lock Cart for Delivery
                    </button>
                  )}
                </div>
              </div>
            )}
            
            <div className="mt-6">
              <Link
                href="/products"
                className="block w-full bg-blue-600 hover:bg-blue-700 text-white text-center py-2 px-4 rounded"
              >
                Add More Products
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
