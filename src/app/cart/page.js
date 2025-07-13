'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import { 
  FaTrash, 
  FaLeaf, 
  FaTruck, 
  FaArrowRight, 
  FaShoppingCart, 
  FaAngleRight,
  FaPlus,
  FaMinus,
  FaCreditCard,
  FaMapMarkerAlt
} from 'react-icons/fa';
import { useToast } from '@/components/Toast';

export default function Cart() {
  const router = useRouter();
  const { showToast } = useToast();
  const [cart, setCart] = useState({ items: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [carbonFootprint, setCarbonFootprint] = useState(null);
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/auth/login');
      return;
    }

    // Fetch cart and carbon footprint data
    fetchCart();
    fetchCarbonFootprint();
  }, [router]);

  const fetchCart = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/cart', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setCart(response.data);
    } catch (error) {
      console.error('Error fetching cart:', error);
      setError('Failed to load cart. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const fetchCarbonFootprint = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/cart/carbon-footprint', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setCarbonFootprint(response.data);
    } catch (error) {
      console.error('Error fetching carbon footprint data:', error);
    }
  };

  const handleQuantityChange = async (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        'http://localhost:5000/api/cart/update-item',
        {
          productId: itemId,
          quantity: newQuantity
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      // Update local cart state
      setCart(prevCart => ({
        ...prevCart,
        items: prevCart.items.map(item => 
          item.product._id === itemId 
            ? { ...item, quantity: newQuantity } 
            : item
        )
      }));

      // Refresh carbon footprint data
      fetchCarbonFootprint();
    } catch (error) {
      console.error('Error updating cart:', error);
      showToast('Failed to update item quantity', 'error');
    }
  };

  const handleRemoveItem = async (itemId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/cart/remove-item/${itemId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      // Update local cart state
      setCart(prevCart => ({
        ...prevCart,
        items: prevCart.items.filter(item => item.product._id !== itemId)
      }));

      // Refresh carbon footprint data
      fetchCarbonFootprint();
    } catch (error) {
      console.error('Error removing item:', error);
      showToast('Failed to remove item from cart', 'error');
    }
  };

  const handleCheckout = async () => {
    if (cart.items.length === 0) {
      showToast('Your cart is empty', 'error');
      return;
    }
    
    setIsCheckingOut(true);
    
    try {
      const token = localStorage.getItem('token');
      
      // Get the user's info to use for shipping address
      const userResponse = await axios.get(
        'http://localhost:5000/api/users/me',
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      const userData = userResponse.data;
      const userAddress = userData.address || {};
      
      // Create the order
      const response = await axios.post(
        'http://localhost:5000/api/orders',
        {
          shippingAddress: {
            street: userAddress.street || '',
            city: userAddress.city || '',
            state: userAddress.state || '',
            zipCode: userAddress.zipCode || ''
          },
          paymentMethod: 'credit_card' // Default payment method
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      // Clear local cart state
      setCart({ items: [] });
      
      // Show success message
      showToast('Order placed successfully!', 'success');
      
      // Redirect to order confirmation
      const orderId = response.data.order?._id;
      
      if (orderId) {
        router.push(`/orders/${orderId}`);
      } else {
        console.error('No order ID in response:', response.data);
        // If we got a successful response but no order ID, check if order is directly in data
        if (response.data._id) {
          router.push(`/orders/${response.data._id}`);
        } else {
          router.push('/dashboard'); // Fallback to dashboard
        }
      }
    } catch (error) {
      console.error('Error during checkout:', error);
      let errorMessage = 'Checkout failed. Please try again.';
      
      if (error.response) {
        console.error('Error response status:', error.response.status);
        console.error('Error response data:', error.response.data);
        errorMessage = error.response.data.message || errorMessage;
        
        // More specific error messages based on status code
        if (error.response.status === 500) {
          errorMessage = 'Server error. Please contact support if this persists.';
        } else if (error.response.status === 401) {
          errorMessage = 'Your session has expired. Please login again.';
          router.push('/auth/login');
        }
      }
      
      showToast(errorMessage, 'error');
    } finally {
      setIsCheckingOut(false);
    }
  };

  // Calculate cart totals
  const calculateSubtotal = () => {
    return cart.items.reduce((total, item) => {
      // Use discounted price if available, otherwise use regular price
      const priceToUse = (item.product.discountedPrice && item.product.discountedPrice < item.product.price) 
        ? item.product.discountedPrice 
        : item.product.price;
      return total + (priceToUse * item.quantity);
    }, 0);
  };

  const subtotal = calculateSubtotal();
  const shipping = subtotal > 0 ? 5.99 : 0;
  const discount = cart.communityDiscount || 0;
  const total = subtotal + shipping - discount;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <motion.div 
        className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.4 }}
          >
            <h1 className="text-3xl font-bold text-gray-800 flex items-center">
              <span className="bg-primary-50 p-2 rounded-full mr-3 text-primary-600">
                <FaShoppingCart className="h-6 w-6" />
              </span>
              Your Shopping Cart
            </h1>
            {cart && cart.items && !loading && !error && (
              <p className="text-gray-600 mt-2">
                You have {cart.items.length} {cart.items.length === 1 ? 'item' : 'items'} in your cart
              </p>
            )}
          </motion.div>
          
          <motion.div 
            className="mt-4 md:mt-0"
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.4 }}
          >
            <button
              onClick={() => router.push('/dashboard')}
              className="inline-flex items-center text-primary-600 bg-white border border-primary-200 px-4 py-2 rounded-lg hover:bg-primary-50 transition-colors duration-200 shadow-sm"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Continue Shopping
            </button>
          </motion.div>
        </div>

        {loading ? (
          <motion.div 
            className="flex flex-col justify-center items-center h-64 bg-white rounded-xl shadow-sm p-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600 mb-4"></div>
            <p className="text-gray-500 font-medium">Loading your cart...</p>
          </motion.div>
        ) : error ? (
          <motion.div 
            className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl shadow-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p>{error}</p>
            </div>
          </motion.div>
        ) : cart.items.length > 0 ? (
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Cart Items */}
            <div className="lg:w-2/3">
              <motion.div 
                className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                <div className="hidden md:grid md:grid-cols-6 bg-gray-50 p-4 font-medium text-gray-700 border-b border-gray-100">
                  <div className="md:col-span-3 px-2">Product</div>
                  <div className="text-center">Price</div>
                  <div className="text-center">Quantity</div>
                  <div className="text-center">Total</div>
                </div>

                {cart.items.map(item => (
                  <motion.div 
                    key={item.product._id} 
                    className="border-t border-gray-100 p-5 relative hover:bg-gray-50 transition-colors duration-150"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="md:grid md:grid-cols-6 md:items-center gap-6">
                      <div className="md:col-span-3 flex items-center gap-4 mb-4 md:mb-0">
                        <div className="h-24 w-24 bg-gray-100 rounded-lg flex-shrink-0 overflow-hidden border border-gray-200 p-2">
                          {item.product.imageUrl ? (
                            <img
                              src={item.product.imageUrl}
                              alt={item.product.name}
                              className="h-full w-full object-contain"
                            />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center text-gray-400">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </div>
                          )}
                        </div>
                        <div>
                          <h3 className="font-medium text-lg text-gray-800">{item.product.name}</h3>
                          <div className="text-sm text-gray-500 mt-1">{item.product.category}</div>
                          <div className="flex items-center flex-wrap mt-2 gap-2">
                            {item.product.ecoFriendly && (
                              <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full flex items-center">
                                <FaLeaf className="mr-1 text-green-600" /> Eco-Friendly
                              </span>
                            )}
                            <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                              {item.product.unit || 'Each'}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="md:text-center mb-3 md:mb-0">
                        <div className="md:hidden text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Price</div>
                        {item.product.discountedPrice && item.product.discountedPrice < item.product.price ? (
                          <div>
                            <div className="font-medium text-gray-700">
                              ${item.product.discountedPrice.toFixed(2)}
                            </div>
                            <div className="text-xs text-gray-500 line-through">
                              ${item.product.price.toFixed(2)}
                            </div>
                            <div className="text-xs text-green-600 font-medium">
                              Save {item.product.discountPercentage}%
                            </div>
                          </div>
                        ) : (
                          <div className="font-medium text-gray-700">
                            ${item.product.price.toFixed(2)}
                          </div>
                        )}
                      </div>

                      <div className="md:text-center mb-3 md:mb-0">
                        <div className="md:hidden text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Quantity</div>
                        <div className="flex items-center md:justify-center">
                          <button
                            className="p-1.5 border border-gray-300 rounded-l-lg hover:bg-gray-100 text-gray-600 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                            onClick={() => handleQuantityChange(item.product._id, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                            aria-label="Decrease quantity"
                          >
                            <FaMinus size={12} />
                          </button>
                          <span className="px-4 py-1.5 border-t border-b border-gray-300 bg-white text-gray-700 min-w-[40px] text-center">
                            {item.quantity}
                          </span>
                          <button
                            className="p-1.5 border border-gray-300 rounded-r-lg hover:bg-gray-100 text-gray-600 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                            onClick={() => handleQuantityChange(item.product._id, item.quantity + 1)}
                            aria-label="Increase quantity"
                          >
                            <FaPlus size={12} />
                          </button>
                        </div>
                      </div>

                      <div className="md:text-center flex items-center justify-between md:justify-center">
                        <div>
                          <div className="md:hidden text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Total</div>
                          {item.product.discountedPrice && item.product.discountedPrice < item.product.price ? (
                            <div>
                              <span className="font-bold text-gray-800">${(item.product.discountedPrice * item.quantity).toFixed(2)}</span>
                              <div className="text-xs text-gray-500 line-through">
                                ${(item.product.price * item.quantity).toFixed(2)}
                              </div>
                            </div>
                          ) : (
                            <span className="font-bold text-gray-800">${(item.product.price * item.quantity).toFixed(2)}</span>
                          )}
                        </div>
                        <button
                          className="text-red-500 hover:bg-red-50 p-2 rounded-full hover:text-red-700 md:ml-4 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                          onClick={() => handleRemoveItem(item.product._id)}
                          aria-label="Remove item"
                        >
                          <FaTrash size={14} />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </div>

            {/* Order Summary */}
            <div className="lg:w-1/3">
              <motion.div 
                className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
              >
                <div className="flex items-center mb-4">
                  <div className="h-10 w-10 bg-primary-50 rounded-lg flex items-center justify-center mr-3">
                    <FaCreditCard className="text-primary-600" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-800">Order Summary</h2>
                </div>
                
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal ({cart.items.length} {cart.items.length === 1 ? 'item' : 'items'})</span>
                    <span className="font-medium text-gray-800">${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Shipping</span>
                    <span className="font-medium text-gray-800">${shipping.toFixed(2)}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span className="flex items-center">
                        <FaUsers size={12} className="mr-1.5" /> 
                        Community Discount
                      </span>
                      <span className="font-medium">-${discount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="border-t border-gray-100 pt-3 mt-3 font-semibold flex justify-between text-lg">
                    <span>Total</span>
                    <span className="text-primary-700">${total.toFixed(2)}</span>
                  </div>
                </div>
                
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <button
                    className="w-full py-3 px-4 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors duration-200 flex items-center justify-center mb-4 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-60 disabled:cursor-not-allowed"
                    onClick={handleCheckout}
                    disabled={isCheckingOut || cart.items.length === 0}
                  >
                    {isCheckingOut ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing Order...
                      </>
                    ) : (
                      <>
                        <FaCreditCard className="mr-2" />
                        Proceed to Checkout
                      </>
                    )}
                  </button>
                </motion.div>
                
                {/* Delivery Information */}
                <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center mb-3">
                    <FaTruck className="text-primary-600 mr-2" />
                    <h3 className="font-semibold text-gray-800">Delivery Information</h3>
                  </div>
                  
                  <div className="flex items-start mb-3">
                    <FaMapMarkerAlt className="text-gray-400 mt-0.5 mr-2 flex-shrink-0" />
                    <div className="text-sm text-gray-600">
                      Delivery to your saved address. You can change this during checkout.
                    </div>
                  </div>
                  
                  <div className="text-xs text-gray-500 border-t border-gray-200 pt-2 mt-2">
                    Standard shipping: 2-4 business days
                  </div>
                </div>
                
                {/* Carbon Footprint Comparison */}
                {carbonFootprint && (
                  <motion.div 
                    className="mt-6 p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200 shadow-sm"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5, duration: 0.4 }}
                  >
                    <div className="flex items-center mb-3">
                      <div className="h-8 w-8 bg-green-200 rounded-full flex items-center justify-center mr-2">
                        <FaLeaf className="text-green-600" />
                      </div>
                      <h3 className="font-semibold text-gray-800">Carbon Footprint Impact</h3>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center">
                          <div className="h-3 w-3 bg-red-400 rounded-full mr-2"></div>
                          <span>Individual Delivery:</span>
                        </div>
                        <span className="font-medium">{carbonFootprint.individualDelivery?.toFixed(2) || '0.00'} kg CO2</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="flex items-center">
                          <div className="h-3 w-3 bg-green-500 rounded-full mr-2"></div>
                          <span>Bulk Delivery:</span>
                        </div>
                        <span className="text-green-700 font-medium">{carbonFootprint.bulkDelivery?.toFixed(2) || '0.00'} kg CO2</span>
                      </div>
                      <div className="flex justify-between font-medium pt-2 border-t border-green-200 mt-2">
                        <span>You're Saving:</span>
                        <span className="text-green-700 font-bold">{((carbonFootprint.individualDelivery || 0) - (carbonFootprint.bulkDelivery || 0)).toFixed(2)} kg CO2</span>
                      </div>
                    </div>
                    
                    <div className="mt-4 h-3 bg-gray-200 rounded-full overflow-hidden">
                      <motion.div 
                        className="h-full bg-green-500"
                        initial={{ width: 0 }}
                        animate={{ 
                          width: `${carbonFootprint.individualDelivery && carbonFootprint.individualDelivery !== 0 
                            ? ((carbonFootprint.bulkDelivery || 0) / carbonFootprint.individualDelivery) * 100 
                            : 0}%` 
                        }}
                        transition={{ delay: 0.8, duration: 1 }}
                      ></motion.div>
                    </div>
                    
                    <div className="mt-4 text-sm text-center bg-white p-2 rounded-lg border border-green-200">
                      <span className="font-medium">Environmental Impact:</span> {(((carbonFootprint.individualDelivery || 0) - (carbonFootprint.bulkDelivery || 0)) * 2.4).toFixed(1)} miles not driven by car
                    </div>
                  </motion.div>
                )}
              </motion.div>
            </div>
          </div>
        ) : (
          <motion.div 
            className="bg-white rounded-xl shadow-sm p-8 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="inline-flex h-24 w-24 items-center justify-center mb-6 bg-gray-100 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-2xl font-semibold mb-3 text-gray-800">Your cart is empty</h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Looks like you haven't added any products to your cart yet. Start exploring our products to add items to your cart.
            </p>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <button
                className="px-6 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors duration-200 inline-flex items-center shadow-sm"
                onClick={() => router.push('/dashboard')}
              >
                Browse Products <FaArrowRight className="ml-2" />
              </button>
            </motion.div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
