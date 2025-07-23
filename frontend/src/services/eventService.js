import axios from 'axios';

// Create axios instance for events API
const apiClient = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL + '/events',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Add token to requests if available
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      return Promise.reject(new Error('Unauthorized'));
    }
    if (error.response?.status === 403) {
      // Forbidden - insufficient permissions
      return Promise.reject(new Error('Insufficient permissions'));
    }
    return Promise.reject(error);
  }
);

export const eventService = {
  // Get all upcoming events
  getUpcomingEvents: async () => {
    try {
      const response = await apiClient.get('/upcoming');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Erreur lors de la récupération des événements');
    }
  },

  // Get all events (for admin)
  getAllEvents: async () => {
    try {
      const response = await apiClient.get('/');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Erreur lors de la récupération des événements');
    }
  },

  // Get event by ID
  getEventById: async (eventId) => {
    try {
      const response = await apiClient.get(`/${eventId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Erreur lors de la récupération de l\'événement');
    }
  },

  // Register for an event
  registerForEvent: async (eventId, registrationData) => {
    try {
      const response = await apiClient.post(`/${eventId}/register`, registrationData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Erreur lors de l\'inscription à l\'événement');
    }
  },

  // Get user's registrations
  getMyRegistrations: async () => {
    try {
      const response = await apiClient.get('/my-registrations');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Erreur lors de la récupération des inscriptions');
    }
  },

  // Cancel registration
  cancelRegistration: async (registrationId) => {
    try {
      const response = await apiClient.delete(`/registrations/${registrationId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Erreur lors de l\'annulation de l\'inscription');
    }
  },

  // Admin functions
  createEvent: async (eventData) => {
    try {
      const response = await apiClient.post('/', eventData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Erreur lors de la création de l\'événement');
    }
  },

  updateEvent: async (eventId, eventData) => {
    try {
      const response = await apiClient.put(`/${eventId}`, eventData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Erreur lors de la mise à jour de l\'événement');
    }
  },

  deleteEvent: async (eventId) => {
    try {
      const response = await apiClient.delete(`/${eventId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Erreur lors de la suppression de l\'événement');
    }
  },

  getEventRegistrations: async (eventId) => {
    try {
      const response = await apiClient.get(`/${eventId}/registrations`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Erreur lors de la récupération des inscriptions');
    }
  }
};
