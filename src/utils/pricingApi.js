import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

/**
 * Utility functions for interacting with the pricing API
 */
export const PricingAPI = {
  /**
   * Get optimal pricing suggestions based on product data
   * 
   * @param {Object} data Product data for optimization
   * @returns {Promise} Promise resolving to optimization results
   */
  getOptimalPricing: async (data) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${API_URL}/pricing/optimize`, data, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error optimizing prices:', error);
      throw error;
    }
  },

  /**
   * Save optimized pricing data for a set of products
   * 
   * @param {Object} data Pricing data to save
   * @returns {Promise} Promise resolving to saved data
   */
  savePricingStrategy: async (data) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${API_URL}/pricing/save`, data, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error saving pricing strategy:', error);
      throw error;
    }
  }
};
