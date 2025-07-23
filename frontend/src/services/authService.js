import axios from 'axios';

// Create axios instance with default configuration
const apiClient = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL + '/auth',
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
      // Don't auto-redirect on auth endpoints as user might be trying to login
      return Promise.reject(error);
    }
    if (error.response?.status === 403) {
      // Forbidden - insufficient permissions
      return Promise.reject(new Error('Insufficient permissions'));
    }
    return Promise.reject(error);
  }
);

export const authService = {
  // Login user
  login: async (credentials) => {
    try {
      const response = await apiClient.post('/signin', {
        username: credentials.username,
        password: credentials.password
      });
      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else if (error.response?.status === 401) {
        throw new Error('Nom d\'utilisateur ou mot de passe incorrect');
      } else if (error.response?.status >= 500) {
        throw new Error('Erreur serveur. Veuillez réessayer plus tard.');
      } else {
        throw new Error('Erreur de connexion. Veuillez vérifier vos informations.');
      }
    }
  },

  // Register new user
  register: async (userData) => {
    try {
      const response = await apiClient.post('/signup', {
        username: userData.username,
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        password: userData.password,
        role: userData.role || 'USER'
      });
      return response.data;
    } catch (error) {
      console.error('Registration error:', error);
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else if (error.response?.status === 400) {
        throw new Error('Données d\'inscription invalides. Veuillez vérifier vos informations.');
      } else if (error.response?.status >= 500) {
        throw new Error('Erreur serveur. Veuillez réessayer plus tard.');
      } else {
        throw new Error('Erreur lors de l\'inscription. Veuillez réessayer.');
      }
    }
  },

  // Logout user
  logout: async () => {
    try {
      const response = await apiClient.post('/signout');
      if (response.status===200){
        window.location.href='/login'
      }
    } catch (error) {
      console.error('Logout error:', error);
      // Even if logout fails on server, we should clear local state
      throw error;
    }
  },

  // Get current user info
  getCurrentUser: async () => {
    try {
      const response = await apiClient.get('/me');
      return response.data;
    } catch (error) {
      console.error('Get current user error:', error);
      if (error.response?.status === 401) {
        throw new Error('Non authentifié');
      } else if (error.response?.status >= 500) {
        throw new Error('Erreur serveur. Veuillez réessayer plus tard.');
      } else {
        throw new Error('Erreur lors de la récupération des informations utilisateur.');
      }
    }
  },

  // Check if user is authenticated (by trying to get current user)
  isAuthenticated: async () => {
    try {
      await authService.getCurrentUser();
      return true;
    } catch (error) {
      return false;
    }
  },

  // Validate form data
  validateLoginData: (formData) => {
    const errors = {};

    if (!formData.username || formData.username.trim() === '') {
      errors.username = 'Le nom d\'utilisateur est requis';
    }

    if (!formData.password || formData.password.trim() === '') {
      errors.password = 'Le mot de passe est requis';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  },

  validateRegisterData: (formData) => {
    const errors = {};

    if (!formData.username || formData.username.trim() === '') {
      errors.username = 'Le nom d\'utilisateur est requis';
    } else if (formData.username.length < 3) {
      errors.username = 'Le nom d\'utilisateur doit contenir au moins 3 caractères';
    }

    if (!formData.firstName || formData.firstName.trim() === '') {
      errors.firstName = 'Le prénom est requis';
    }

    if (!formData.lastName || formData.lastName.trim() === '') {
      errors.lastName = 'Le nom de famille est requis';
    }

    if (!formData.email || formData.email.trim() === '') {
      errors.email = 'L\'email est requis';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Format d\'email invalide';
    }

    if (!formData.password || formData.password.trim() === '') {
      errors.password = 'Le mot de passe est requis';
    } else if (formData.password.length < 6) {
      errors.password = 'Le mot de passe doit contenir au moins 6 caractères';
    }

    if (!formData.confirmPassword || formData.confirmPassword.trim() === '') {
      errors.confirmPassword = 'La confirmation du mot de passe est requise';
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Les mots de passe ne correspondent pas';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }
};
