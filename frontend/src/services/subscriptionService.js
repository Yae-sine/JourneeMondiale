import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

class SubscriptionService {
    // Get all subscriptions for admin (with pagination and filtering)
    async getAllSubscriptions(page = 0, size = 10, status = '', search = '') {
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                size: size.toString()
            });
            
            if (status && status !== 'all') {
                params.append('status', status);
            }
            
            if (search && search.trim()) {
                params.append('search', search.trim());
            }

            const response = await axios.get(`${API_BASE_URL}/admin/subscriptions?${params}`, {
                withCredentials: true,
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            return response.data;
        } catch (error) {
            console.error('Error fetching subscriptions:', error);
            throw this.handleError(error);
        }
    }

    // Get current user's subscription
    async getCurrentSubscription() {
        try {
            const response = await axios.get(`${API_BASE_URL}/subscriptions/current`, {
                withCredentials: true,
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            return response.data;
        } catch (error) {
            console.error('Error fetching current subscription:', error);
            throw this.handleError(error);
        }
    }

    // Get subscription statistics for admin dashboard
    async getSubscriptionStatistics() {
        try {
            const response = await axios.get(`${API_BASE_URL}/admin/subscriptions/statistics`, {
                withCredentials: true,
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            return response.data;
        } catch (error) {
            console.error('Error fetching subscription statistics:', error);
            throw this.handleError(error);
        }
    }

    // Get subscription by ID for admin
    async getSubscriptionById(subscriptionId) {
        try {
            const response = await axios.get(`${API_BASE_URL}/admin/subscriptions/${subscriptionId}`, {
                withCredentials: true,
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            return response.data;
        } catch (error) {
            console.error('Error fetching subscription:', error);
            throw this.handleError(error);
        }
    }

    // Get subscriptions by user email for admin
    async getSubscriptionsByUser(userEmail) {
        try {
            const response = await axios.get(`${API_BASE_URL}/admin/subscriptions/user/${encodeURIComponent(userEmail)}`, {
                withCredentials: true,
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            return response.data;
        } catch (error) {
            console.error('Error fetching user subscriptions:', error);
            throw this.handleError(error);
        }
    }

    // Get recent subscriptions for admin dashboard
    async getRecentSubscriptions(limit = 5) {
        try {
            const response = await axios.get(`${API_BASE_URL}/admin/subscriptions/recent?limit=${limit}`, {
                withCredentials: true,
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            return response.data;
        } catch (error) {
            console.error('Error fetching recent subscriptions:', error);
            throw this.handleError(error);
        }
    }

    // Format currency for display
    formatCurrency(amount, currency = 'EUR') {
        try {
            return new Intl.NumberFormat('fr-FR', {
                style: 'currency',
                currency: currency.toUpperCase(),
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }).format(amount);
        } catch (error) {
            return `${amount} ${currency.toUpperCase()}`;
        }
    }

    // Format subscription status for display
    formatStatus(status) {
        const statusMap = {
            'active': 'Actif',
            'canceled': 'Annulé',
            'incomplete': 'Incomplet',
        };
        
        return statusMap[status] || status;
    }

    // Get status badge color
    getStatusColor(status) {
        const colorMap = {
            'active': 'bg-green-100 text-green-800',
            'canceled': 'bg-red-100 text-red-800',
            'incomplete': 'bg-orange-100 text-orange-800',
        };
        
        return colorMap[status] || 'bg-gray-100 text-gray-800';
    }

    // Format date for display
    formatDate(dateString) {
        if (!dateString) return 'N/A';
        
        try {
            return new Date(dateString).toLocaleDateString('fr-FR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (error) {
            return dateString;
        }
    }

    // Format billing interval for display
    formatInterval(interval) {
        const intervalMap = {
            'month': 'Mensuel',
        };
        
        return intervalMap[interval] || interval;
    }

    // Error handling
    handleError(error) {
        if (error.response) {
            // Server responded with error status
            const message = error.response.data?.message || error.response.data?.error;
            
            switch (error.response.status) {
                case 400:
                    return new Error(message || 'Données invalides');
                case 401:
                    return new Error('Accès non autorisé');
                case 403:
                    return new Error('Accès interdit');
                case 404:
                    return new Error('Abonnement non trouvé');
                case 500:
                    return new Error('Erreur interne du serveur');
                default:
                    return new Error(message || 'Une erreur est survenue');
            }
        } else if (error.request) {
            // Request was made but no response received
            return new Error('Erreur réseau. Veuillez vérifier votre connexion.');
        } else {
            // Something else happened
            return new Error(error.message || 'Une erreur inattendue s\'est produite');
        }
    }
}

export const subscriptionService = new SubscriptionService();
