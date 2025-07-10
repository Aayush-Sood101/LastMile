'use client';

import { useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { FaCartPlus, FaLeaf, FaStar, FaPlus, FaMinus, FaShoppingBasket } from 'react-icons/fa';

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
        'http://localhost:5000/api/cart/add-item',
        {
          productId: product._id,
          quantity: quantity
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
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
      className="bg-white rounded-2xl overflow-hidden shadow-lg h-full flex flex-col"
    >
      <div className="relative">
        <div className="h-64 bg-gray-100 overflow-hidden">
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              className="h-full w-full object-cover transform hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
              <FaShoppingBasket className="text-gray-400 h-16 w-16" />
            </div>
          )}
        </div>
        
        {product.ecoFriendly && (
          <div className="absolute top-4 right-4">
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center shadow-md">
              <FaLeaf className="mr-1" /> Eco-Friendly
            </div>
          </div>
        )}
      </div>
      
      <div className="p-6 flex-grow flex flex-col">
        <div className="mb-2 flex items-start justify-between">
          <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">{product.name}</h3>
          <div className="flex items-center ml-2">
            <div className="font-bold text-emerald-600">${product.price.toFixed(2)}</div>
          </div>
        </div>
        
        <div className="flex items-center mb-2 text-amber-500">
          {[...Array(5)].map((_, i) => (
            <FaStar key={i} className={i < Math.floor(product.rating || 4) ? "text-amber-400" : "text-gray-300"} size={14} />
          ))}
          <span className="ml-1 text-xs text-gray-600">({product.reviews || Math.floor(Math.random() * 50) + 5})</span>
        </div>
        
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{product.description || "Fresh and high-quality product available for bulk ordering."}</p>
        
        <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100">
          <div className="flex items-center border rounded-lg overflow-hidden">
            <button 
              onClick={() => quantity > 1 && setQuantity(quantity - 1)}
              className="px-3 py-2 bg-gray-50 hover:bg-gray-100 text-gray-600"
              disabled={quantity <= 1}
            >
              <FaMinus size={12} />
            </button>
            <span className="px-3 py-2 bg-white text-gray-900 font-medium">{quantity}</span>
            <button 
              onClick={() => setQuantity(quantity + 1)}
              className="px-3 py-2 bg-gray-50 hover:bg-gray-100 text-gray-600"
            >
              <FaPlus size={12} />
            </button>
          </div>
          
          <button
            onClick={handleAddToCart}
            disabled={isAdding}
            className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-lg flex items-center shadow-md transition-all duration-200"
          >
            {isAdding ? (
              <div className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Adding
              </div>
            ) : (
              <>
                <FaCartPlus className="mr-1" /> Add
              </>
            )}
          </button>
        </div>
      </div>
    </motion.div>
  );
}
