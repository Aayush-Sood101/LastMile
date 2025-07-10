import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Request interceptor for adding auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for handling errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const { response } = error;
    if (response && response.status === 401) {
      // Handle unauthorized errors (token expired, etc.)
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth services
export const authService = {
  login: async (email, password, role) => {
    const response = await api.post('/users/login', { email, password, role });
    return response.data;
  },
  register: async (userData) => {
    const response = await api.post('/users/register', userData);
    return response.data;
  },
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
  getCurrentUser: async () => {
    const response = await api.get('/users/me');
    return response.data;
  }
};

// Products services
export const productService = {
  getAllProducts: async () => {
    const response = await api.get('/products');
    return response.data;
  },
  getProductById: async (id) => {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },
  getProductsByCategory: async (category) => {
    const response = await api.get(`/products/category/${category}`);
    return response.data;
  }
};

// Cart services
export const cartService = {
  getCart: async () => {
    const response = await api.get('/cart');
    return response.data;
  },
  addItem: async (productId, quantity) => {
    const response = await api.post('/cart/add-item', { productId, quantity });
    return response.data;
  },
  updateItem: async (productId, quantity) => {
    const response = await api.put('/cart/update-item', { productId, quantity });
    return response.data;
  },
  removeItem: async (productId) => {
    const response = await api.delete(`/cart/remove-item/${productId}`);
    return response.data;
  },
  clearCart: async () => {
    const response = await api.delete('/cart/clear');
    return response.data;
  },
  getCarbonFootprint: async () => {
    const response = await api.get('/cart/carbon-footprint');
    return response.data;
  }
};

// Community services
export const communityService = {
  getAllCommunities: async () => {
    const response = await api.get('/communities');
    return response.data;
  },
  getCommunityById: async (id) => {
    const response = await api.get(`/communities/${id}`);
    return response.data;
  },
  createCommunity: async (communityData) => {
    const response = await api.post('/communities', communityData);
    return response.data;
  },
  joinCommunity: async (communityId) => {
    const response = await api.post(`/communities/${communityId}/join`);
    return response.data;
  },
  getMembershipRequests: async (communityId) => {
    const response = await api.get(`/communities/${communityId}/membership-requests`);
    return response.data;
  },
  handleMembershipRequest: async (communityId, userId, status) => {
    const response = await api.put(`/communities/${communityId}/membership-requests/${userId}`, { status });
    return response.data;
  }
};

// Community cart services
export const communityCartService = {
  getMyCommunityCart: async () => {
    const response = await api.get('/community-carts/my-community');
    return response.data;
  },
  getCommunityCartById: async (communityId) => {
    const response = await api.get(`/community-carts/community/${communityId}`);
    return response.data;
  },
  addItem: async (productId, quantity) => {
    const response = await api.post('/community-carts/add-item', { productId, quantity });
    return response.data;
  },
  updateItem: async (productId, quantity) => {
    const response = await api.put('/community-carts/update-item', { productId, quantity });
    return response.data;
  },
  removeItem: async (productId) => {
    const response = await api.delete(`/community-carts/remove-item/${productId}`);
    return response.data;
  },
  lockCart: async (communityId) => {
    const response = await api.put(`/community-carts/lock/${communityId}`);
    return response.data;
  }
};

// Delivery cycle services
export const deliveryCycleService = {
  getAllDeliveryCycles: async () => {
    const response = await api.get('/delivery-cycles');
    return response.data;
  },
  getUpcomingDeliveryCycles: async () => {
    const response = await api.get('/delivery-cycles/upcoming');
    return response.data;
  },
  getCommunityDeliveryCycles: async (communityId) => {
    const response = await api.get(`/delivery-cycles/community/${communityId}`);
    return response.data;
  },
  getDeliveryCycleById: async (id) => {
    const response = await api.get(`/delivery-cycles/${id}`);
    return response.data;
  },
  createDeliveryCycle: async (data) => {
    const response = await api.post('/delivery-cycles', data);
    return response.data;
  },
  updateDeliveryCycleStatus: async (id, status) => {
    const response = await api.put(`/delivery-cycles/${id}/status`, { status });
    return response.data;
  },
  getProductRequirements: async (id) => {
    const response = await api.get(`/delivery-cycles/${id}/requirements`);
    return response.data;
  }
};

// Orders services
export const orderService = {
  createOrder: async (orderData) => {
    const response = await api.post('/orders', orderData);
    return response.data;
  },
  getUserOrders: async () => {
    const response = await api.get('/orders');
    return response.data;
  },
  getOrderById: async (id) => {
    const response = await api.get(`/orders/${id}`);
    return response.data;
  },
  getCommunityOrders: async (communityId) => {
    const response = await api.get(`/orders/community/${communityId}`);
    return response.data;
  },
  getUserCarbonStats: async () => {
    const response = await api.get('/orders/carbon-stats/user');
    return response.data;
  }
};

// Admin services
export const adminService = {
  getDashboardData: async () => {
    const response = await api.get('/admin/dashboard');
    return response.data;
  },
  getCommunityRequests: async () => {
    const response = await api.get('/admin/community-requests');
    return response.data;
  },
  approveCommunity: async (communityId, status) => {
    const response = await api.put(`/communities/${communityId}/approve`, { status });
    return response.data;
  },
  getAllOrders: async () => {
    const response = await api.get('/admin/orders');
    return response.data;
  },
  getUserStats: async () => {
    const response = await api.get('/admin/user-stats');
    return response.data;
  },
  getAllCommunities: async () => {
    const response = await api.get('/admin/communities');
    return response.data;
  }
};

export default api;