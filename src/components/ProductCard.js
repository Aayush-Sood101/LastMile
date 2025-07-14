'use client';

import { useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { FaCartPlus, FaLeaf, FaStar, FaPlus, FaMinus, FaShoppingBasket } from 'react-icons/fa';
import { API_URL, getAuthHeaders } from '@/utils/apiConfig';

export default function ProductCard({ product, onAddToCart }) {
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  
  const handleAddToCart = async () => {
    if (isAdding) return;
    
    setIsAdding(true);
    const token = localStorage.getItem('token');
    
    if (!token) {
      alert('Please log in to add items to your cart');
      setIsAdding(false);
      return;
    }
    
    try {
      await axios.post(
        `${API_URL}/api/cart/add-item`,
        {
          productId: product._id,
          quantity: quantity
        },
        {
          headers: getAuthHeaders()
        }
      );
      
      if (onAddToCart) {
        onAddToCart(product._id, quantity);
      }
      
      setQuantity(1);
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('Failed to add item to cart');
    } finally {
      setIsAdding(false);
    }
  };
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -5 }}
      className="bg-white rounded-xl overflow-hidden shadow-md border border-gray-100 h-full flex flex-col group"
    >
      <div className="relative overflow-hidden">
        <div className="h-60 bg-gray-50 overflow-hidden">
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              className="h-full w-full object-cover transform group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
              <FaShoppingBasket className="text-gray-300 h-16 w-16" />
            </div>
          )}
          <div className="absolute inset-0 bg-black bg-opacity-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </div>
        
        <div className="absolute top-0 left-0 w-full p-4 flex justify-between items-start">
          {product.isNew && (
            <span className="bg-accent-500 text-white text-xs font-bold px-2 py-1 rounded-md uppercase tracking-wide shadow-sm">
              New
            </span>
          )}
          
          {product.ecoFriendly && (
            <div className="ml-auto">
              <div className="bg-gradient-to-r from-green-500 to-green-600 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center shadow-md">
                <FaLeaf className="mr-1 text-green-100" /> Eco-Friendly
              </div>
            </div>
          )}
        </div>
      </div>
      
      <div className="p-5 flex-grow flex flex-col">
        <div className="mb-2 flex items-start justify-between">
          <h3 className="text-lg font-semibold text-gray-900 line-clamp-2 group-hover:text-primary-600 transition-colors">{product.name}</h3>
          <div className="flex flex-col items-end ml-2">
            {product.discountedPrice && product.discountedPrice < product.price ? (
              <>
                <div className="flex items-center bg-primary-50 px-2 py-1 rounded-lg">
                  <div className="font-bold text-primary-700">${product.discountedPrice.toFixed(2)}</div>
                </div>
                <div className="text-sm text-gray-500 line-through mt-1">
                  ${product.price.toFixed(2)}
                </div>
                <div className="text-xs text-green-600 font-medium mt-0.5">
                  Save {product.discountPercentage}%
                </div>
              </>
            ) : (
              <div className="flex items-center bg-primary-50 px-2 py-1 rounded-lg">
                <div className="font-bold text-primary-700">${product.price.toFixed(2)}</div>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex items-center mb-3 text-amber-500">
          {[...Array(5)].map((_, i) => (
            <FaStar key={i} className={i < Math.floor(product.rating || 4) ? "text-amber-400" : "text-gray-200"} size={14} />
          ))}
          <span className="ml-1 text-xs text-gray-500">({product.reviews || Math.floor(Math.random() * 50) + 5} reviews)</span>
        </div>
        
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{product.description || "Fresh and high-quality product available for bulk ordering."}</p>
        
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-auto pt-4 border-t border-gray-100">
          <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
            <button 
              onClick={() => quantity > 1 && setQuantity(quantity - 1)}
              className="px-3 py-2 bg-gray-50 hover:bg-gray-100 text-gray-600 transition-colors duration-150"
              disabled={quantity <= 1}
            >
              <FaMinus size={12} />
            </button>
            <span className="px-4 py-2 bg-white text-gray-900 font-medium">{quantity}</span>
            <button 
              onClick={() => setQuantity(quantity + 1)}
              className="px-3 py-2 bg-gray-50 hover:bg-gray-100 text-gray-600 transition-colors duration-150"
            >
              <FaPlus size={12} />
            </button>
          </div>
          
          <motion.button
            onClick={handleAddToCart}
            disabled={isAdding}
            whileTap={{ scale: 0.97 }}
            className="w-full sm:w-auto px-4 py-2.5 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white rounded-lg flex items-center justify-center shadow-sm transition-all duration-200 border border-primary-600"
          >
            {isAdding ? (
              <div className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Adding...
              </div>
            ) : (
              <>
                <FaCartPlus className="mr-2" /> Add to Cart
              </>
            )}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
