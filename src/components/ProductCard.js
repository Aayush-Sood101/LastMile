'use client';

import { useState } from 'react';
import axios from 'axios';
import { FaCartPlus, FaLeaf } from 'react-icons/fa';

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
    <div className="card relative flex flex-col h-full">
      {product.ecoFriendly && (
        <span className="absolute top-2 right-2 bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs flex items-center">
          <FaLeaf className="mr-1" /> Eco Friendly
        </span>
      )}
      
      <div className="h-48 bg-gray-200 rounded-lg mb-4 flex items-center justify-center">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="h-full w-full object-contain rounded-lg"
          />
        ) : (
          <span className="text-gray-500">No Image</span>
        )}
      </div>
      
      <h3 className="text-lg font-semibold mb-2">{product.name}</h3>
      
      <div className="text-gray-700 mb-2">
        {product.description?.length > 100
          ? `${product.description.substring(0, 100)}...`
          : product.description}
      </div>
      
      <div className="mt-auto">
        <div className="flex items-center justify-between mb-3">
          <span className="text-lg font-bold text-green-700">${product.price.toFixed(2)}</span>
          <span className="text-sm text-gray-500">{product.category}</span>
        </div>
        
        <div className="flex items-center">
          <div className="flex border rounded-md mr-2">
            <button
              className="px-3 py-1 border-r hover:bg-gray-100"
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              disabled={isAdding}
            >
              -
            </button>
            <span className="px-3 py-1">{quantity}</span>
            <button
              className="px-3 py-1 border-l hover:bg-gray-100"
              onClick={() => setQuantity(quantity + 1)}
              disabled={isAdding}
            >
              +
            </button>
          </div>
          
          <button
            className="btn-primary flex-grow flex items-center justify-center"
            onClick={handleAddToCart}
            disabled={isAdding}
          >
            <FaCartPlus className="mr-1" />
            {isAdding ? 'Adding...' : 'Add to Cart'}
          </button>
        </div>
      </div>
    </div>
  );
}
