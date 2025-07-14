/**
 * API configuration for LastMile application
 * Contains API URL and common headers
 */

// Get API URL from environment variables
export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

/**
 * Get authentication headers using the token from localStorage
 * @returns {Object} Headers object with Authorization token if available
 */
export const getAuthHeaders = () => {
  // For server-side rendering, check if window is defined
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    
    if (token) {
      return {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };
    }
  }
  
  return {
    'Content-Type': 'application/json'
  };
};

/**
 * Build a complete API endpoint URL
 * @param {string} path - API endpoint path (e.g., '/api/products')
 * @returns {string} Complete API URL
 */
export const buildApiUrl = (path) => {
  // Remove leading slash if present to avoid double slashes
  const cleanPath = path.startsWith('/') ? path.substring(1) : path;
  return `${API_URL}/${cleanPath}`;
};
