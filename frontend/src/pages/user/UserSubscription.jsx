import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import UserSidebar from '../../components/user/UserSidebar';
import { subscriptionService } from '../../services/subscriptionService';
import { 
  FaRegCreditCard, 
  FaPlus, 
  FaEdit, 
  FaTimes, 
  FaCalendarAlt, 
  FaEuroSign, 
  FaCheckCircle, 
  FaClock,
  FaTimesCircle,
  FaChartLine,
  FaCrown,
  FaInfoCircle
} from 'react-icons/fa';

const UserSubscription = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserSubscription = async () => {
      try {
        setLoading(true);
        const response = await subscriptionService.getCurrentSubscription();
        if (response && response.id) {
          setSubscription(response);
        } else {
          setSubscription(null);
        }
      } catch (err) {
        if (err.message.includes('No active subscription')) {
          setSubscription(null);
        } else {
          setError(err.message || 'Erreur lors de la récupération de l\'abonnement.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUserSubscription();
  }, []);

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return <FaCheckCircle className="text-green-500" />;
      case 'incomplete':
        return <FaClock className="text-yellow-500" />;
      case 'canceled':
        return <FaTimesCircle className="text-red-500" />;
      default:
        return <FaClock className="text-gray-500" />;
    }
  };

  const getStatusText = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'Actif';
      case 'incomplete':
        return 'Incomplet';
      case 'canceled':
        return 'Annulé';
      default:
        return status || 'Inconnu';
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'incomplete':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'canceled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatAmount = (amount, currency = 'EUR') => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleSubscribe = () => {
    navigate('/account/subscription/new');
  };

  const handleUpdatePlan = () => {
    navigate('/account/subscription/new');
  };

  const handleCancelPlan = () => {
    navigate('/account/subscription/new');
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <UserSidebar isCollapsed={isSidebarCollapsed} setIsCollapsed={setIsSidebarCollapsed} />
      <div className={`flex-1 p-8 transition-all duration-300 ${isSidebarCollapsed ? 'ml-16' : 'ml-64'}`}>
        <div className="mx-auto">
          {/* Header */}
          <div className="bg-white mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2" >
              {/* <FaRegCreditCard className="inline mr-3" /> */}
              Mon Abonnement
            </h1>
            <p className="text-lg text-gray-600">Gérez votre abonnement mensuel et soutenez notre cause</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg mb-8 flex items-center text-lg">
              <FaTimes className="mr-3 text-xl" />
              {error}
            </div>
          )}

          {/* Loading State */}
          {loading ? (
            <div className="bg-white rounded-lg shadow-md p-12">
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: '#00ACA8' }}></div>
                <p className="mt-4 text-xl text-gray-600">Chargement de votre abonnement...</p>
              </div>
            </div>
          ) : (
            <>
              {/* No Subscription State */}
              {!subscription ? (
                <div className="bg-white rounded-lg shadow-md p-12">
                  <div className="text-center py-16">
                    <FaRegCreditCard className="mx-auto text-8xl text-gray-300 mb-6" />
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">Aucun abonnement actif</h2>
                    <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
                      Vous n'avez pas encore d'abonnement actif. Souscrivez dès maintenant pour soutenir 
                      régulièrement la recherche contre le cancer chez les jeunes adultes.
                    </p>
                    
                    {/* Benefits */}
                    <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg p-8 mb-8 max-w-3xl mx-auto">
                      <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center justify-center">
                        <FaCrown className="mr-2" style={{ color: '#00ACA8' }} />
                        Avantages de l'abonnement
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                        <div className="flex items-center">
                          <FaCheckCircle className="text-green-500 mr-3 flex-shrink-0" />
                          <span className="text-gray-700">Soutien régulier et automatique</span>
                        </div>
                        <div className="flex items-center">
                          <FaCheckCircle className="text-green-500 mr-3 flex-shrink-0" />
                          <span className="text-gray-700">Impact continu sur la recherche</span>
                        </div>
                        <div className="flex items-center">
                          <FaCheckCircle className="text-green-500 mr-3 flex-shrink-0" />
                          <span className="text-gray-700">Flexibilité de gestion</span>
                        </div>
                        <div className="flex items-center">
                          <FaCheckCircle className="text-green-500 mr-3 flex-shrink-0" />
                          <span className="text-gray-700">Annulation à tout moment</span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={handleSubscribe}
                      className="px-10 py-4 text-white rounded-lg font-semibold text-xl transition-colors hover:opacity-90 flex items-center mx-auto shadow-lg"
                      style={{ backgroundColor: '#00ACA8' }}
                    >
                      <FaPlus className="mr-3" />
                      Souscrire un abonnement
                    </button>
                  </div>
                </div>
              ) : (
                /* Active Subscription State */
                <>
                  {/* Tabs Navigation */}
                  <div className="bg-white rounded-lg shadow-md mb-8">
                    <nav className="flex space-x-8 px-8 border-b border-gray-200">
                      <button
                        onClick={() => setActiveTab('overview')}
                        className={`py-5 px-2 border-b-2 font-semibold text-base ${
                          activeTab === 'overview'
                            ? 'border-[#00ACA8] text-[#00ACA8]'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        <FaChartLine className="inline mr-2" /> Aperçu
                      </button>
                      <button
                        onClick={() => setActiveTab('manage')}
                        className={`py-5 px-2 border-b-2 font-semibold text-base ${
                          activeTab === 'manage'
                            ? 'border-[#00ACA8] text-[#00ACA8]'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        <FaEdit className="inline mr-2" /> Gérer
                      </button>
                      <button
                        onClick={() => setActiveTab('details')}
                        className={`py-5 px-2 border-b-2 font-semibold text-base ${
                          activeTab === 'details'
                            ? 'border-[#00ACA8] text-[#00ACA8]'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        <FaInfoCircle className="inline mr-2" /> Détails
                      </button>
                    </nav>
                  </div>

                  {/* Tab Content */}
                  {activeTab === 'overview' && (
                    <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
                      <div className="flex items-center px-6 py-4 border-b border-gray-100">
                        <div>
                          <h2 className="text-2xl font-bold text-gray-700 mb-1">Abonnement Actuel</h2>
                          <p className="text-base text-gray-600">Merci de soutenir notre cause !</p>
                        </div>
                      </div>
                      <div className="p-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                          <div className="text-center">
                            <div className="flex items-center justify-center mb-3">
                              {getStatusIcon(subscription.status)}
                              <span className="ml-2 text-lg font-semibold">Statut</span>
                            </div>
                            <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium border ${getStatusBadgeClass(subscription.status)}`}>
                              {getStatusText(subscription.status)}
                            </span>
                          </div>
                          <div className="text-center">
                            <div className="flex items-center justify-center mb-3">
                              <FaEuroSign className="text-green-500 mr-2" />
                              <span className="text-lg font-semibold">Montant</span>
                            </div>
                            <p className="text-2xl font-bold" style={{ color: '#00ACA8' }}>
                              {formatAmount(subscription.amount, subscription.currency)}
                            </p>
                            <p className="text-sm text-gray-600">par mois</p>
                          </div>
                          <div className="text-center">
                            <div className="flex items-center justify-center mb-3">
                              <FaCalendarAlt className="text-blue-500 mr-2" />
                              <span className="text-lg font-semibold">Début</span>
                            </div>
                            <p className="text-lg text-gray-900">
                              {formatDate(subscription.currentPeriodStart)}
                            </p>
                          </div>
                          <div className="text-center">
                            <div className="flex items-center justify-center mb-3">
                              <FaCalendarAlt className="text-orange-500 mr-2" />
                              <span className="text-lg font-semibold">Prochaine facturation</span>
                            </div>
                            <p className="text-lg text-gray-900">
                              {formatDate(subscription.currentPeriodEnd)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  {activeTab === 'manage' && subscription.status === 'active' && (
                    <div className="bg-white rounded-lg shadow-md p-12 mb-8">
                      <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">
                        Gérer votre abonnement
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                        <div className="text-center p-8 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                          <FaEdit className="mx-auto text-4xl mb-4" style={{ color: '#00ACA8' }} />
                          <h4 className="text-xl font-semibold text-gray-900 mb-3">Modifier le plan</h4>
                          <p className="text-gray-600 mb-6">
                            Changez le montant de votre abonnement mensuel selon vos préférences.
                          </p>
                          <button
                            onClick={handleUpdatePlan}
                            className="w-full px-6 py-3 text-white rounded-lg font-semibold transition-colors hover:opacity-90"
                            style={{ backgroundColor: '#00ACA8' }}
                          >
                            Modifier le plan
                          </button>
                        </div>
                        <div className="text-center p-8 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                          <FaTimes className="mx-auto text-4xl text-red-500 mb-4" />
                          <h4 className="text-xl font-semibold text-gray-900 mb-3">Annuler l'abonnement</h4>
                          <p className="text-gray-600 mb-6">
                            Annulez votre abonnement. Vous pourrez toujours le réactiver plus tard.
                          </p>
                          <button
                            onClick={handleCancelPlan}
                            className="w-full px-6 py-3 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition-colors"
                          >
                            Annuler l'abonnement
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                  {activeTab === 'details' && (
                    <div className="bg-white rounded-lg shadow-md px-6 py-4 mb-8">
                      <h3 className="text-2xl font-bold text-gray-900 mb-8">Détails de l'abonnement</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                          <h4 className="text-lg font-semibold text-gray-900 mb-4">Informations générales</h4>
                          <div className="space-y-3">
                            <div className="flex justify-between">
                              <span className="text-gray-600">ID Stripe:</span>
                              <span className="text-gray-900 font-mono text-sm">{subscription.stripeSubscriptionId}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Email:</span>
                              <span className="text-gray-900">{subscription.userEmail}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Intervalle:</span>
                              <span className="text-gray-900">Mensuel</span>
                            </div>
                          </div>
                        </div>
                        <div>
                          <h4 className="text-lg font-semibold text-gray-900 mb-4">Dates importantes</h4>
                          <div className="space-y-3">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Création:</span>
                              <span className="text-gray-900">{formatDate(subscription.createdAt)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Dernière mise à jour:</span>
                              <span className="text-gray-900">{formatDate(subscription.updatedAt)}</span>
                            </div>
                            {subscription.canceledAt && (
                              <div className="flex justify-between">
                                <span className="text-gray-600">Annulé le:</span>
                                <span className="text-gray-900">{formatDate(subscription.canceledAt)}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserSubscription;
