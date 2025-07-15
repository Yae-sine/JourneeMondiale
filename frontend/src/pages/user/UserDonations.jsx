import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import UserSidebar from '../../components/user/UserSidebar';
import { donationService } from '../../services/donationService';
import { FaHandHoldingHeart, FaPlus, FaCalendarAlt, FaEuroSign, FaCheckCircle, FaClock, FaTimesCircle, FaChartLine } from 'react-icons/fa';

const UserDonations = () => {
  const [donations, setDonations] = useState([]);
  const [statistics, setStatistics] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserDonations = async () => {
      try {
        setLoading(true);
        const [donationsData, statsData] = await Promise.all([
          donationService.getUserDonations(),
          donationService.getUserDonationStatistics()
        ]);
        setDonations(donationsData);
        setStatistics(statsData);
      } catch (err) {
        setError(err.message || 'Erreur lors de la récupération des donations.');
      } finally {
        setLoading(false);
      }
    };

    fetchUserDonations();
  }, []);

  const getStatusIcon = (status) => {
    switch (status.toLowerCase()) {
      case 'succeeded':
        return <FaCheckCircle className="text-green-500" />;
      case 'pending':
        return <FaClock className="text-yellow-500" />;
      case 'failed':
        return <FaTimesCircle className="text-red-500" />;
      default:
        return <FaClock className="text-gray-500" />;
    }
  };

  const getStatusText = (status) => {
    switch (status.toLowerCase()) {
      case 'succeeded':
        return 'Réussie';
      case 'pending':
        return 'En attente';
      case 'failed':
        return 'Échouée';
      default:
        return status;
    }
  };

  const formatAmount = (amount, currency = 'EUR') => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <UserSidebar />
      <div className="flex-1 p-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="bg-white rounded-lg shadow-md p-8 mb-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold mb-2" style={{ color: '#00ACA8' }}>
                  <FaHandHoldingHeart className="inline mr-3" />
                  Mes Donations
                </h1>
                <p className="text-gray-600">Suivez l'historique de vos contributions</p>
              </div>
              <button
                onClick={() => navigate('/donation')}
                className="px-6 py-3 text-white rounded-lg font-medium transition-colors hover:opacity-90 flex items-center"
                style={{ backgroundColor: '#00ACA8' }}
              >
                <FaPlus className="mr-2" />
                Faire une nouvelle donation
              </button>
            </div>
          </div>

          {/* Statistics Cards */}
          {!loading && !error && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total des donations</p>
                    <p className="text-2xl font-bold text-gray-900">{statistics.totalCount || 0}</p>
                  </div>
                  <FaChartLine className="text-3xl" style={{ color: '#00ACA8' }} />
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Montant total</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatAmount(statistics.totalAmount || 0)}
                    </p>
                  </div>
                  <FaEuroSign className="text-3xl text-green-500" />
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Donations réussies</p>
                    <p className="text-2xl font-bold text-green-600">{statistics.succeededCount || 0}</p>
                  </div>
                  <FaCheckCircle className="text-3xl text-green-500" />
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">En attente</p>
                    <p className="text-2xl font-bold text-yellow-600">{statistics.pendingCount || 0}</p>
                  </div>
                  <FaClock className="text-3xl text-yellow-500" />
                </div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          {/* Donations List */}
          <div className="bg-white rounded-lg shadow-md">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Historique des donations</h2>
            </div>

            <div className="p-6">
              {loading ? (
                <div className="text-center py-8">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: '#00ACA8' }}></div>
                  <p className="mt-2 text-gray-600">Chargement des donations...</p>
                </div>
              ) : donations.length === 0 ? (
                <div className="text-center py-12">
                  <FaHandHoldingHeart className="mx-auto text-6xl text-gray-300 mb-4" />
                  <h3 className="text-xl font-medium text-gray-900 mb-2">Aucune donation trouvée</h3>
                  <p className="text-gray-600 mb-6">
                    Vous n'avez pas encore fait de donation. Commencez dès maintenant !
                  </p>
                  <button
                    onClick={() => navigate('/donation')}
                    className="px-6 py-3 text-white rounded-lg font-medium transition-colors hover:opacity-90"
                    style={{ backgroundColor: '#00ACA8' }}
                  >
                    Faire ma première donation
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {donations.map((donation) => (
                    <div
                      key={donation.id}
                      className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center mb-2">
                            {getStatusIcon(donation.status)}
                            <span className="ml-2 font-medium text-gray-900">
                              {getStatusText(donation.status)}
                            </span>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <p className="text-sm text-gray-600">Montant</p>
                              <p className="text-lg font-semibold" style={{ color: '#00ACA8' }}>
                                {formatAmount(donation.amount, donation.currency)}
                              </p>
                            </div>
                            
                            <div>
                              <p className="text-sm text-gray-600">Date</p>
                              <p className="text-sm text-gray-900 flex items-center">
                                <FaCalendarAlt className="mr-1" />
                                {formatDate(donation.createdAt)}
                              </p>
                            </div>
                            
                            <div>
                              <p className="text-sm text-gray-600">ID de transaction</p>
                              <p className="text-sm text-gray-900 font-mono">
                                {donation.paymentIntentId}
                              </p>
                            </div>
                          </div>
                          
                          {donation.description && (
                            <div className="mt-3">
                              <p className="text-sm text-gray-600">Description</p>
                              <p className="text-sm text-gray-900">{donation.description}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDonations;
