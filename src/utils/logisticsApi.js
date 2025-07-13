/**
 * Logistics API utilities for the LastMile application
 */
import { mockOptimizeDiscounts } from './mockOptimizer';

// API base URL - use environment variable or default to localhost
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

/**
 * Optimize discounts with logistics constraints
 * @param {Object} params - Optimization parameters
 * @returns {Promise} - Promise resolving to optimization results
 */
export const optimizeDiscountsWithLogistics = async (params) => {
  try {
    const token = localStorage.getItem('token');
    console.log('Optimizing with params:', JSON.stringify(params, null, 2));
    
    // Validate required fields before making the request
    if (!params.productIds || !params.productIds.length) {
      throw new Error('No products selected for optimization');
    }
    
    if (!params.quantities || !params.quantities.length) {
      throw new Error('Product quantities are missing');
    }
    
    if (!params.volumePerUnit || !params.volumePerUnit.length) {
      throw new Error('Product volumes are missing');
    }
    
    if (!params.weightPerUnit || !params.weightPerUnit.length) {
      throw new Error('Product weights are missing');
    }
    
    // Check all arrays are of equal length
    const lengths = [
      params.productIds.length,
      params.quantities.length,
      params.volumePerUnit.length,
      params.weightPerUnit.length
    ];
    
    if (new Set(lengths).size !== 1) {
      throw new Error('Product data arrays must be of equal length');
    }
    
    // Validate target margin and max discount
    if (typeof params.targetMargin !== 'number' || params.targetMargin < 0 || params.targetMargin > 1) {
      throw new Error('Target margin must be a number between 0 and 1');
    }
    
    if (typeof params.maxDiscount !== 'number' || params.maxDiscount < 0 || params.maxDiscount > 1) {
      throw new Error('Max discount must be a number between 0 and 1');
    }
    
    // Validate product IDs are valid ObjectIds
    const validObjectIdPattern = /^[0-9a-fA-F]{24}$/;
    const invalidProductIds = params.productIds.filter(id => !validObjectIdPattern.test(id));
    if (invalidProductIds.length > 0) {
      throw new Error(`Invalid product IDs detected: ${invalidProductIds.join(', ')}`);
    }
    
    // Log detailed debug information
    console.log('Request Headers:', {
      'Content-Type': 'application/json',
      'x-auth-token': token ? 'Present (token masked for security)' : 'Missing',
      'Authorization': token ? 'Bearer token present' : 'Missing'
    });
    
    // Define endpoints to try (in order)
    const endpoints = [
      '/api/logistics/optimize',              // Next.js API route
      `${API_BASE_URL}/api/logistics/optimize` // Direct backend
    ];
    
    let response = null;
    let error = null;
    let successfulEndpoint = null;
    
    // Try each endpoint until one works
    for (const endpoint of endpoints) {
      console.log(`Trying to optimize using endpoint: ${endpoint}`);
      
      try {
        const fetchResponse = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-auth-token': token,
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(params)
        });
        
        // Log response status
        console.log(`Response from ${endpoint}: ${fetchResponse.status} ${fetchResponse.statusText}`);
        
        // If this endpoint worked, use it
        if (fetchResponse.ok) {
          response = fetchResponse;
          successfulEndpoint = endpoint;
          console.log(`Successfully connected to: ${endpoint}`);
          break;
        } else {
          // Try to get error details
          const errorData = await fetchResponse.text();
          console.warn(`Endpoint ${endpoint} returned error:`, fetchResponse.status, errorData);
          
          // Keep track of the last error
          error = new Error(
            `Error ${fetchResponse.status}: ${fetchResponse.statusText}. ${errorData}`
          );
        }
      } catch (fetchError) {
        console.warn(`Failed to connect to ${endpoint}:`, fetchError.message);
        error = fetchError;
      }
    }

    // If we got a successful response from any endpoint
    if (response && response.ok) {
      // Parse and validate the result
      const result = await response.json();
      console.log(`Optimization result from ${successfulEndpoint}:`, result);
      
      // Validate result structure
      if (!result.optimization || !result.logistics || !result.emissions) {
        console.error('Invalid result structure:', result);
        throw new Error('Server returned an invalid response structure');
      }
      
      return result;
    } else {
      console.warn('All API endpoints failed. Using mock optimizer as fallback.');
      
      // Use mock optimizer as a last resort
      try {
        const mockResult = mockOptimizeDiscounts(params);
        console.log('Mock optimization result:', mockResult);
        return mockResult;
      } catch (mockError) {
        console.error('Mock optimizer failed:', mockError);
        
        // If we have a specific API error, throw that
        if (error) {
          throw error;
        } else {
          // Otherwise throw a generic error
          throw new Error('Failed to optimize: All endpoints unreachable and mock optimizer failed');
        }
      }
    }
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

    const token = localStorage.getItem('token');
    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
    const url = `${API_BASE_URL}/api/logistics/co2-savings/${orderId}${queryString}`;
    console.log('Fetching CO2 savings from:', url);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'x-auth-token': token,
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      console.error('API response error:', response.status, response.statusText);
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.msg || `Error ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    console.log('CO2 savings result:', result);
    return result;
  } catch (error) {
    console.error('Error getting CO2 savings:', error);
    throw error;
  }
};
