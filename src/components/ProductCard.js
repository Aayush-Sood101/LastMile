'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { useCommunityCart } from '@/context/CommunityCartContext';
import { useAuth } from '@/context/AuthContext';

export default function ProductCard({ product }) {
  const [quantity, setQuantity] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isAddingToCommunityCart, setIsAddingToCommunityCart] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);
  const [addedToCommunityCart, setAddedToCommunityCart] = useState(false);
  const { addItem } = useCart();
  const { addItem: addToCommunityCart } = useCommunityCart();
  const { isAuthenticated, user } = useAuth();

  // Handle quantity change
  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value);
    setQuantity(value > 0 ? value : 1);
  };

  // Add to cart handler
  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      // Redirect to login
      window.location.href = `/login?redirect=${encodeURIComponent(window.location.pathname)}`;
      return;
    }
    
    setIsAddingToCart(true);
    try {
      const result = await addItem(product._id, quantity);
      if (result.success) {
        setAddedToCart(true);
        // Reset the added to cart status after 3 seconds
        setTimeout(() => setAddedToCart(false), 3000);
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
    } finally {
      setIsAddingToCart(false);
    }
  };

  // Add to community cart handler
  const handleAddToCommunityCart = async () => {
    if (!isAuthenticated) {
      // Redirect to login
      window.location.href = `/login?redirect=${encodeURIComponent(window.location.pathname)}`;
      return;
    }
    
    setIsAddingToCommunityCart(true);
    try {
      const result = await addToCommunityCart(product._id, quantity);
      if (result.success) {
        setAddedToCommunityCart(true);
        // Reset the added to community cart status after 3 seconds
        setTimeout(() => setAddedToCommunityCart(false), 3000);
      }
    } catch (error) {
      console.error('Error adding to community cart:', error);
    } finally {
      setIsAddingToCommunityCart(false);
    }
  };

  // Community discount badge
  const CommunityDiscountBadge = () => {
    if (product.communityDiscountPercentage && product.communityDiscountPercentage > 0) {
      return (
        <div className="absolute top-2 left-2 bg-green-500 text-white text-xs font-semibold px-2 py-1 rounded-full">
          Community Discount: {product.communityDiscountPercentage}%
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden transition-transform hover:shadow-lg hover:scale-[1.02]">
      <div className="relative">
        {/* Product Image */}
        <Link href={`/products/${product._id}`}>
          <div className="relative h-48 w-full overflow-hidden">
            <Image
              src={product.imageUrl || '/placeholder-product.jpg'}
              alt={product.name}
              fill
              style={{ objectFit: 'cover' }}
              className="transition-transform hover:scale-105"
            />
          </div>
        </Link>
        
        {/* Community Discount Badge */}
        <CommunityDiscountBadge />
      </div>
      
      <div className="p-4">
        {/* Product Name */}
        <Link href={`/products/${product._id}`}>
          <h3 className="text-lg font-semibold mb-1 text-gray-800 hover:text-blue-600 transition-colors">
            {product.name}
          </h3>
        </Link>
        
        {/* Product Category */}
        <p className="text-sm text-gray-500 mb-2">
          {product.category}
        </p>
        
        {/* Product Description - truncated */}
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
          {product.description}
        </p>
        
        {/* Pricing */}
        <div className="flex justify-between items-center mb-3">
          <div>
            {product.originalPrice && product.originalPrice > product.price ? (
              <div className="flex items-center space-x-2">
                <span className="text-lg font-bold text-gray-900">
                  ${product.price.toFixed(2)}
                </span>
                <span className="text-sm text-gray-500 line-through">
                  ${product.originalPrice.toFixed(2)}
                </span>
              </div>
            ) : (
              <span className="text-lg font-bold text-gray-900">
                ${product.price.toFixed(2)}
              </span>
            )}
          </div>
          
          {/* Rating Stars */}
          {product.rating && (
            <div className="flex items-center">
              <span className="text-yellow-400 mr-1">★</span>
              <span className="text-sm text-gray-600">{product.rating}</span>
            </div>
          )}
        </div>
        
        {/* Quantity and Add to Cart */}
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center">
            <label htmlFor={`quantity-${product._id}`} className="sr-only">
              Quantity
            </label>
            <input
              type="number"
              id={`quantity-${product._id}`}
              min="1"
              value={quantity}
              onChange={handleQuantityChange}
              className="w-16 p-2 border border-gray-300 rounded-md text-center"
            />
          </div>
          
          <div className="flex space-x-2">
            <button
              onClick={handleAddToCart}
              disabled={isAddingToCart}
              className={`py-2 px-3 rounded-md transition-colors ${
                addedToCart
                  ? 'bg-green-500 text-white'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              {isAddingToCart ? (
                <span>Adding...</span>
              ) : addedToCart ? (
                <span>Added ✓</span>
              ) : (
                <span>Add to Cart</span>
              )}
            </button>
            
            {user?.community && (
              <button
                onClick={handleAddToCommunityCart}
                disabled={isAddingToCommunityCart}
                className={`py-2 px-3 rounded-md transition-colors ${
                  addedToCommunityCart
                    ? 'bg-green-500 text-white'
                    : 'bg-purple-600 hover:bg-purple-700 text-white'
                }`}
              >
                {isAddingToCommunityCart ? (
                  <span>Adding...</span>
                ) : addedToCommunityCart ? (
                  <span>Added ✓</span>
                ) : (
                  <span>Community</span>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}