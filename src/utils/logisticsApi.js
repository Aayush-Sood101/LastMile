/**
 * Logistics API utilities for the LastMile application
 */

/**
 * Optimize discounts with logistics constraints
 * @param {Object} params - Optimization parameters
 * @returns {Promise} - Promise resolving to optimization results
 */
export const optimizeDiscountsWithLogistics = async (params) => {
  try {
    const response = await fetch('/api/logistics/optimize', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-auth-token': localStorage.getItem('token')
      },
      body: JSON.stringify(params)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.msg || 'Failed to optimize discounts');
    }

    return await response.json();
  } catch (error) {
    console.error('Error optimizing discounts:', error);
    throw error;
  }
};

/**
 * Get CO2 savings for an order
 * @param {String} orderId - Order ID to calculate CO2 savings for
 * @param {Object} params - Additional parameters (optional)
 * @returns {Promise} - Promise resolving to CO2 savings data
 */
export const getCO2Savings = async (orderId, params = {}) => {
  try {
    // Build query string from params
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      queryParams.append(key, value);
    });

    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
    const response = await fetch(`/api/logistics/co2-savings/${orderId}${queryString}`, {
      method: 'GET',
      headers: {
        'x-auth-token': localStorage.getItem('token')
      }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.msg || 'Failed to get CO2 savings');
    }

    return await response.json();
  } catch (error) {
    console.error('Error getting CO2 savings:', error);
    throw error;
  }
};
