'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';

export default function CartPage() {
  const { cart, loading, error, fetchCart, updateItem, removeItem, clearCart, getCarbonFootprint } = useCart();
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();
  
  const [carbonData, setCarbonData] = useState(null);
  const [loadingCarbon, setLoadingCarbon] = useState(false);
  
  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login?redirect=/cart');
    }
  }, [isAuthenticated, router]);
  
  // Fetch cart data when component mounts
  useEffect(() => {
    if (isAuthenticated) {
      fetchCart();
    }
  }, [isAuthenticated, fetchCart]);
  
  // Fetch carbon footprint data
  useEffect(() => {
    if (isAuthenticated && cart.items.length > 0) {
      const fetchCarbonData = async () => {
        setLoadingCarbon(true);
        try {
          const data = await getCarbonFootprint();
          setCarbonData(data);
        } catch (err) {
          console.error('Failed to fetch carbon footprint data:', err);
        } finally {
          setLoadingCarbon(false);
        }
      };
      
      fetchCarbonData();
    }
  }, [isAuthenticated, cart.items.length, getCarbonFootprint]);
  
  // Handle quantity change
  const handleQuantityChange = async (productId, newQuantity) => {
    if (newQuantity < 1) newQuantity = 1;
    await updateItem(productId, newQuantity);
  };
  
  // Handle remove item
  const handleRemoveItem = async (productId) => {
    await removeItem(productId);
  };
  
  // Handle clear cart
  const handleClearCart = async () => {
    if (confirm('Are you sure you want to clear your cart?')) {
      await clearCart();
    }
  };
  
  // Handle checkout
  const handleCheckout = () => {
    router.push('/checkout');
  };
  
  if (!isAuthenticated) {
    return null; // Will redirect to login via useEffect
  }
  
  return (
    <main className="py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        <h1 className="text-3xl font-bold mb-8">Your Cart</h1>
        
        {/* Error message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}
        
        {loading ? (
          <div className="flex justify-center py-10">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : cart.items.length > 0 ? (
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Cart Items */}
            <div className="lg:w-2/3">
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Product
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Price
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Quantity
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {cart.items.map((item) => (
                      <tr key={item.productId} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-16 w-16 relative flex-shrink-0">
                              <Image
                                src={item.imageUrl || '/placeholder-product.jpg'}
                                alt={item.name}
                                fill
                                style={{ objectFit: 'cover' }}
                                className="rounded-md"
                              />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {item.name}
                              </div>
                              <div className="text-sm text-gray-500">
                                {item.category}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">${item.price.toFixed(2)}</div>
                          {item.discount > 0 && (
                            <div className="text-xs text-green-600">
                              {item.discount}% discount applied
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <button
                              onClick={() => handleQuantityChange(item.productId, item.quantity - 1)}
                              className="text-gray-500 hover:text-gray-700 p-1"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                              </svg>
                            </button>
                            <span className="mx-2 w-8 text-center">{item.quantity}</span>
                            <button
                              onClick={() => handleQuantityChange(item.productId, item.quantity + 1)}
                              className="text-gray-500 hover:text-gray-700 p-1"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                              </svg>
                            </button>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            ${(item.price * item.quantity).toFixed(2)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <button
                            onClick={() => handleRemoveItem(item.productId)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                
                <div className="px-6 py-4 border-t border-gray-200">
                  <button
                    onClick={handleClearCart}
                    className="text-red-600 hover:text-red-900 text-sm font-medium"
                  >
                    Clear Cart
                  </button>
                </div>
              </div>
              
              {/* Continue Shopping */}
              <div className="mt-6">
                <Link href="/products" className="text-blue-600 hover:text-blue-800 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Continue Shopping
                </Link>
              </div>
            </div>
            
            {/* Order Summary */}
            <div className="lg:w-1/3">
              <div className="bg-white rounded-lg shadow-md p-6 sticky top-20">
                <h2 className="text-lg font-bold mb-4">Order Summary</h2>
                
                <div className="mb-4">
                  <div className="flex justify-between py-2">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="text-gray-800 font-medium">${cart.totalPrice.toFixed(2)}</span>
                  </div>
                  
                  {user?.communityId && (
                    <div className="flex justify-between py-2 border-b border-gray-200">
                      <span className="text-gray-600">Community Discount</span>
                      <span className="text-green-600">-${(cart.totalPrice * 0.05).toFixed(2)}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between py-2 font-bold text-lg mt-2">
                    <span>Total</span>
                    <span>
                      ${user?.communityId 
                        ? (cart.totalPrice * 0.95).toFixed(2)
                        : cart.totalPrice.toFixed(2)
                      }
                    </span>
                  </div>
                </div>
                
                {/* Carbon Footprint Info */}
                {carbonData && (
                  <div className="bg-green-50 p-4 rounded-md mb-6">
                    <h3 className="font-semibold text-green-800 mb-2">Environmental Impact</h3>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-green-700">Standard Delivery</span>
                      <span className="font-medium text-green-900">{carbonData.standard.toFixed(2)} kg CO₂</span>
                    </div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm text-green-700">Community Delivery</span>
                      <span className="font-medium text-green-900">{carbonData.community.toFixed(2)} kg CO₂</span>
                    </div>
                    <div className="text-center">
                      <span className="bg-green-100 text-green-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                        {((carbonData.standard - carbonData.community) / carbonData.standard * 100).toFixed(0)}% Less Emissions
                      </span>
                    </div>
                  </div>
                )}
                
                {!user?.communityId && (
                  <div className="bg-blue-50 p-4 rounded-md mb-6">
                    <p className="text-sm text-blue-700 mb-2">
                      Join a community to get a 5% discount and reduce your carbon footprint!
                    </p>
                    <Link href="/communities" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                      Find Communities →
                    </Link>
                  </div>
                )}
                
                <button
                  onClick={handleCheckout}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-md font-medium"
                >
                  Proceed to Checkout
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-gray-50 rounded-lg p-10 text-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <h2 className="text-2xl font-semibold mb-2">Your cart is empty</h2>
            <p className="text-gray-600 mb-6">
              Start shopping and add some products to your cart.
            </p>
            <Link 
              href="/products"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md font-medium"
            >
              Browse Products
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
