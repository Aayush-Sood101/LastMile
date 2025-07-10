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
      return total + (item.product.price * item.quantity);
    }, 0);
  };

  const subtotal = calculateSubtotal();
  const shipping = subtotal > 0 ? 5.99 : 0;
  const discount = cart.communityDiscount || 0;
  const total = subtotal + shipping - discount;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Your Shopping Cart</h1>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600"></div>
          </div>
        ) : error ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        ) : cart.items.length > 0 ? (
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Cart Items */}
            <div className="lg:w-2/3">
              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="hidden md:grid md:grid-cols-6 bg-gray-100 p-4 font-medium">
                  <div className="md:col-span-3">Product</div>
                  <div className="text-center">Price</div>
                  <div className="text-center">Quantity</div>
                  <div className="text-center">Total</div>
                </div>

                {cart.items.map(item => (
                  <div key={item.product._id} className="border-t first:border-t-0 p-4">
                    <div className="md:grid md:grid-cols-6 md:items-center gap-4">
                      <div className="md:col-span-3 flex items-center gap-4 mb-4 md:mb-0">
                        <div className="h-20 w-20 bg-gray-200 rounded flex-shrink-0">
                          {item.product.imageUrl ? (
                            <img
                              src={item.product.imageUrl}
                              alt={item.product.name}
                              className="h-full w-full object-contain"
                            />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center text-gray-500">
                              No Image
                            </div>
                          )}
                        </div>
                        <div>
                          <h3 className="font-medium">{item.product.name}</h3>
                          <div className="text-sm text-gray-500">{item.product.category}</div>
                          {item.product.ecoFriendly && (
                            <div className="text-green-600 text-sm flex items-center mt-1">
                              <FaLeaf className="mr-1" /> Eco-Friendly
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="md:text-center mb-2 md:mb-0">
                        <div className="md:hidden font-medium text-gray-500">Price:</div>
                        ${item.product.price.toFixed(2)}
                      </div>

                      <div className="md:text-center mb-2 md:mb-0">
                        <div className="md:hidden font-medium text-gray-500">Quantity:</div>
                        <div className="flex items-center md:justify-center">
                          <button
                            className="px-2 py-1 border rounded-l hover:bg-gray-100"
                            onClick={() => handleQuantityChange(item.product._id, item.quantity - 1)}
                          >
                            -
                          </button>
                          <span className="px-3 py-1 border-t border-b">{item.quantity}</span>
                          <button
                            className="px-2 py-1 border rounded-r hover:bg-gray-100"
                            onClick={() => handleQuantityChange(item.product._id, item.quantity + 1)}
                          >
                            +
                          </button>
                        </div>
                      </div>

                      <div className="md:text-center flex items-center justify-between md:justify-center">
                        <div>
                          <div className="md:hidden font-medium text-gray-500">Total:</div>
                          <span className="font-medium">${(item.product.price * item.quantity).toFixed(2)}</span>
                        </div>
                        <button
                          className="text-red-500 hover:text-red-700 md:ml-4"
                          onClick={() => handleRemoveItem(item.product._id)}
                          aria-label="Remove item"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:w-1/3">
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
                
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span>${shipping.toFixed(2)}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Community Discount</span>
                      <span>-${discount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="border-t pt-3 font-semibold flex justify-between">
                    <span>Total</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>
                
                <button
                  className="btn-primary w-full mb-4 flex items-center justify-center"
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
                  ) : 'Proceed to Checkout'}
                </button>
                
                {/* Carbon Footprint Comparison */}
                {carbonFootprint && (
                  <div className="mt-6 p-4 bg-green-50 rounded-lg">
                    <h3 className="font-semibold flex items-center mb-2">
                      <FaLeaf className="mr-2 text-green-600" /> 
                      Carbon Footprint Impact
                    </h3>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Individual Delivery:</span>
                        <span>{carbonFootprint.individualDelivery?.toFixed(2) || '0.00'} kg CO2</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Bulk Delivery:</span>
                        <span className="text-green-700 font-medium">{carbonFootprint.bulkDelivery?.toFixed(2) || '0.00'} kg CO2</span>
                      </div>
                      <div className="flex justify-between font-medium pt-2 border-t">
                        <span>You're Saving:</span>
                        <span className="text-green-700">{((carbonFootprint.individualDelivery || 0) - (carbonFootprint.bulkDelivery || 0)).toFixed(2)} kg CO2</span>
                      </div>
                    </div>
                    
                    <div className="mt-3 h-3 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-green-600"
                        style={{ 
                          width: `${carbonFootprint.individualDelivery && carbonFootprint.individualDelivery !== 0 
                            ? ((carbonFootprint.bulkDelivery || 0) / carbonFootprint.individualDelivery) * 100 
                            : 0}%` 
                        }}
                      ></div>
                    </div>
                    
                    <div className="mt-3 text-xs text-gray-600 text-center">
                      That's equivalent to {(((carbonFootprint.individualDelivery || 0) - (carbonFootprint.bulkDelivery || 0)) * 2.4).toFixed(1)} miles not driven by car
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm p-8 text-center">
            <h3 className="text-xl font-semibold mb-2">Your cart is empty</h3>
            <p className="text-gray-600 mb-6">
              Looks like you haven't added any products to your cart yet.
            </p>
            <button
              className="btn-primary inline-flex items-center"
              onClick={() => router.push('/dashboard')}
            >
              Browse Products <FaArrowRight className="ml-2" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
