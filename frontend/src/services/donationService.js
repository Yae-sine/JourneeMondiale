import axios from 'axios';

// Donation service for API calls
const API_BASE_URL = 'http://localhost:8080/api/donations';

// Create axios instance with default configuration
const apiClient = axios.create({
  baseURL: API_BASE_URL,
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
      // window.location.href = '/login';
      return Promise.reject(new Error('Unauthorized'));
    }
    if (error.response?.status === 403) {
      // Forbidden - insufficient permissions
      return Promise.reject(new Error('Insufficient permissions'));
    }
    return Promise.reject(error);
  }
);

export const donationService = {
  // Get all donations with pagination
  getAllDonations: async (page = 0, size = 10, sortBy = 'createdAt', sortDir = 'desc') => {
    try {
      const params = { page, size, sortBy, sortDir };
      const response = await apiClient.get('/', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching donations:', error);
      throw error;
    }
  },

  // Get all donations without pagination
  getAllDonationsSimple: async () => {
    try {
      const response = await apiClient.get('/all');
      return response.data || [];
    } catch (error) {
      console.error('Error fetching all donations:', error);
      throw error;
    }
  },

  // Get donation by ID
  getDonationById: async (id) => {
    try {
      const response = await apiClient.get(`/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching donation:', error);
      throw error;
    }
  },

  // Get donation by payment intent ID
  getDonationByPaymentIntentId: async (paymentIntentId) => {
    try {
      const response = await apiClient.get(`/payment-intent/${paymentIntentId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching donation by payment intent:', error);
      throw error;
    }
  },

  // Get donations by status
  getDonationsByStatus: async (status) => {
    try {
      const response = await apiClient.get(`/status/${status}`);
      return response.data || [];
    } catch (error) {
      console.error('Error fetching donations by status:', error);
      throw error;
    }
  },

  // Get donations by donor email
  getDonationsByDonorEmail: async (email) => {
    try {
      const response = await apiClient.get(`/donor/${email}`);
      return response.data || [];
    } catch (error) {
      console.error('Error fetching donations by donor email:', error);
      throw error;
    }
  },

  // Get recent donations
  getRecentDonations: async (limit = 10) => {
    try {
      const response = await apiClient.get('/recent', { params: { limit } });
      return response.data || [];
    } catch (error) {
      console.error('Error fetching recent donations:', error);
      throw error;
    }
  },

  // Get top donations by amount
  getTopDonations: async (limit = 10) => {
    try {
      const response = await apiClient.get('/top', { params: { limit } });
      return response.data || [];
    } catch (error) {
      console.error('Error fetching top donations:', error);
      throw error;
    }
  },

  // Get donation statistics
  getDonationStatistics: async (startDate = null, endDate = null) => {
    try {
      const params = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      
      const response = await apiClient.get('/statistics', { params });
      return response.data || {};
    } catch (error) {
      console.error('Error fetching donation statistics:', error);
      throw error;
    }
  },

  // Search donations with filters
  searchDonations: async (filters = {}) => {
    try {
      const {
        donorName,
        donorEmail,
        status,
        minAmount,
        maxAmount,
        startDate,
        endDate,
        page = 0,
        size = 10,
        sortBy = 'createdAt',
        sortDir = 'desc'
      } = filters;

      const params = {
        page,
        size,
        sortBy,
        sortDir
      };

      // Add filters only if they have values
      if (donorName && donorName.trim() !== '') params.donorName = donorName;
      if (donorEmail && donorEmail.trim() !== '') params.donorEmail = donorEmail;
      if (status && status !== 'all') params.status = status;
      if (minAmount !== null && minAmount !== undefined) params.minAmount = minAmount;
      if (maxAmount !== null && maxAmount !== undefined) params.maxAmount = maxAmount;
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const response = await apiClient.get('/search', { params });
      return response.data;
    } catch (error) {
      console.error('Error searching donations:', error);
      throw error;
    }
  },

  // Get current user's donations
  getUserDonations: async () => {
    try {
      const response = await apiClient.get('/my-donations');
      return response.data || [];
    } catch (error) {
      console.error('Error fetching user donations:', error);
      throw new Error(error.response?.data?.message || 'Erreur lors de la récupération des donations');
    }
  },

  // Get current user's donation statistics
  getUserDonationStatistics: async () => {
    try {
      const response = await apiClient.get('/my-donations/statistics');
      return response.data || {};
    } catch (error) {
      console.error('Error fetching user donation statistics:', error);
      throw new Error(error.response?.data?.message || 'Erreur lors de la récupération des statistiques');
    }
  },
};
