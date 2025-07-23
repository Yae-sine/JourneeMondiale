import axios from 'axios';


// Create axios instance with default configuration
const apiClient = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL + '/users',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // This ensures HTTP-only cookies are sent
});

// Add response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Unauthorized - redirect to login
      window.location.href = '/login';
      return Promise.reject(new Error('Unauthorized'));
    }
    if (error.response?.status === 403) {
      // Forbidden - insufficient permissions
      return Promise.reject(new Error('Insufficient permissions'));
    }
    return Promise.reject(error);
  }
);

export const userService = {
  // Get all users with optional search and role filter
  getAllUsers: async (searchTerm = '', role = 'all') => {
    try {
      const params = {};
      
      if (searchTerm && searchTerm.trim() !== '') {
        params.search = searchTerm;
      }
      
      if (role && role !== 'all') {
        params.role = role;
      }
      
      const response = await apiClient.get('/', { params });
      return response.data || [];
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  },

  // Get user by ID
  getUserById: async (id) => {
    try {
      const response = await apiClient.get(`/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching user:', error);
      throw error;
    }
  },

  // Create new user
  createUser: async (userData) => {
    try {
      const response = await apiClient.post('/', userData);
      return response.data;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  },

  // Update user
  updateUser: async (id, userData) => {
    try {
      const response = await apiClient.put(`/${id}`, userData);
      return response.data;
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  },

  // Delete user
  deleteUser: async (id) => {
    try {
      const response = await apiClient.delete(`/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  },

  // Get current user profile
  getCurrentUserProfile: async () => {
    try {
      const response = await apiClient.get('/me');
      return response.data;
    } catch (error) {
      console.error('Error fetching current user profile:', error);
      throw error;
    }
  },

  // Update current user profile
  updateCurrentUserProfile: async (userData) => {
    try {
      const response = await apiClient.put('/me', userData);
      return response.data;
    } catch (error) {
      console.error('Error updating current user profile:', error);
      throw error;
    }
  },

  // Change password for current user
  changePassword: async (oldPassword, newPassword) => {
    try {
      const response = await apiClient.put('/me/password', {
        oldPassword,
        newPassword
      });
      return response.data;
    } catch (error) {
      console.error('Error changing password:', error);
      throw error;
    }
  }
};
