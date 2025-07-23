import React, { useState, useEffect } from 'react';
import { FaRegCreditCard, FaSearch, FaEye, FaUsers, FaMoneyBillWave } from 'react-icons/fa';
import AdminSidebar from '../../components/admin/sidebar';
import { subscriptionService } from '../../services/subscriptionService';

const AdminSubscriptionsPage = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [subscriptions, setSubscriptions] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [activeTab, setActiveTab] = useState('all');
  const pageSize = 10;

  // Load subscriptions with pagination and filters
  const loadSubscriptions = async (page = 0, status = '', search = '') => {
    try {
      setLoading(true);
      const response = await subscriptionService.getAllSubscriptions(page, pageSize, status, search);
      
      setSubscriptions(response.content || []);
      setTotalPages(response.totalPages || 0);
      setTotalElements(response.totalElements || 0);
      setCurrentPage(page);
    } catch (err) {
      console.error('Error loading subscriptions:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Load subscription statistics
  const loadStatistics = async () => {
    try {
      const stats = await subscriptionService.getSubscriptionStatistics();
      setStatistics(stats);
    } catch (err) {
      console.error('Error loading statistics:', err);
    }
  };

  useEffect(() => {
    loadSubscriptions(0, filterStatus === 'all' ? '' : filterStatus, searchTerm);
    loadStatistics();
  }, [filterStatus,searchTerm]);

  useEffect(() => {
    loadSubscriptions(0, filterStatus === 'all' ? '' : filterStatus, searchTerm);
  }, [filterStatus, searchTerm]);

  const handlePageChange = (newPage) => {
    loadSubscriptions(newPage, filterStatus === 'all' ? '' : filterStatus, searchTerm);
  };

  const getStatusBadge = (subscription) => {
    const colorClass = subscriptionService.getStatusColor(subscription.status);
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClass}`}>
        {subscriptionService.formatStatus(subscription.status)}
      </span>
    );
  };

  const StatCard = ({ title, value, icon, color = '#00ACA8', subtitle }) => (
    <div className="bg-white rounded-lg shadow-md p-6 border-l-4" style={{ borderLeftColor: color }}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
        </div>
        <div className="p-3 rounded-full" style={{ backgroundColor: `${color}20`, color: color }}>
          {icon}
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar isCollapsed={isSidebarCollapsed} setIsCollapsed={setIsSidebarCollapsed} />
      <div className={`flex-1 p-8 transition-all duration-300 ${isSidebarCollapsed ? 'ml-16' : 'ml-64'}`}>
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Gestion des Abonnements
              </h1>
              <p className="text-gray-600">
                Suivez et gérez tous les abonnements de la plateforme
              </p>
            </div>
          </div>

          {/* Statistics Cards */}
          {statistics && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              <StatCard 
                title="Total Abonnements"
                value={statistics.totalSubscriptions}
                icon={<FaRegCreditCard size={24} />}
                color="#00ACA8"
              />
              <StatCard 
                title="Abonnements Actifs"
                value={statistics.activeSubscriptions}
                icon={<FaUsers size={24} />}
                color="#10B981"
              />
              <StatCard 
                title="Dons Mensuels"
                value={subscriptionService.formatCurrency(statistics.monthlyDonations)}
                icon={<FaMoneyBillWave size={24} />}
                color="#8B5CF6"
              />
            </div>
          )}

          {/* Tabs */}
          <div className="bg-white rounded-lg shadow-md mb-6">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8 px-6">
                {[
                  { id: 'all', label: 'Tous les Abonnements', count: statistics?.totalSubscriptions || 0},
                  { id: 'active', label: 'Actifs', count: statistics?.activeSubscriptions || 0 },
                  { id: 'canceled', label: 'Annulés', count: statistics?.canceledSubscriptions || 0 },
                  { id: 'incomplete', label: 'Incomplets', count: statistics?.incompleteSubscriptions || 0 }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id);
                      setFilterStatus(tab.id);
                      setCurrentPage(0);
                    }}
                    className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                      activeTab === tab.id
                        ? 'border-[#00ACA8] text-[#00ACA8]'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {tab.label} ({tab.count})
                  </button>
                ))}
              </nav>
            </div>

            {/* Search and Filters */}
            <div className="p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaSearch className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Rechercher par email ou nom du plan..."
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-[#00ACA8] focus:border-[#00ACA8]"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Subscriptions Table */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  Liste des Abonnements
                </h3>
                <span className="text-sm text-gray-500">
                  {totalElements} abonnement(s) trouvé(s)
                </span>
              </div>
            </div>

            {loading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 mx-auto mb-4" 
                     style={{ borderColor: '#00ACA8' }}>
                </div>
                <p className="text-gray-500">Chargement des abonnements...</p>
              </div>
            ) : error ? (
              <div className="p-8 text-center">
                <div className="text-red-500 mb-4">⚠️</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Erreur de chargement</h3>
                <p className="text-red-600">{error}</p>
                <button 
                  onClick={() => loadSubscriptions(currentPage, filterStatus === 'all' ? '' : filterStatus, searchTerm)}
                  className="mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                >
                  Réessayer
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Utilisateur
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Plan
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Montant
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Facturation
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Statut
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Période Actuelle
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date de Création
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {subscriptions.map((subscription) => (
                      <tr key={subscription.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {subscription.userEmail}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{subscription.planName}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {subscriptionService.formatCurrency(subscription.amount, subscription.currency)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">
                            {subscriptionService.formatInterval(subscription.interval)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(subscription)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div>
                            <div>Début: {subscriptionService.formatDate(subscription.currentPeriodStart)}</div>
                            <div>Fin: {subscriptionService.formatDate(subscription.currentPeriodEnd)}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {subscriptionService.formatDate(subscription.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => {
                              alert(`Détails de l'abonnement ID: ${subscription.id}`);
                            }}
                            className="p-2 rounded-lg text-gray-600 hover:text-white hover:shadow-md transition-all duration-200"
                            style={{ ':hover': { backgroundColor: '#00ACA8' } }}
                            onMouseEnter={(e) => {
                              e.target.style.backgroundColor = '#00ACA8';
                              e.target.style.color = 'white';
                            }}
                            onMouseLeave={(e) => {
                              e.target.style.backgroundColor = 'transparent';
                              e.target.style.color = '#6B7280';
                            }}
                            title="Voir les détails"
                          >
                            <FaEye size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {subscriptions.length === 0 && !loading && (
                  <div className="p-8 text-center">
                    <FaRegCreditCard size={48} className="mx-auto text-gray-300 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Aucun abonnement trouvé
                    </h3>
                    <p className="text-gray-500">
                      Aucun abonnement ne correspond aux critères de recherche.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 0}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Précédent
                  </button>
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage >= totalPages - 1}
                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Suivant
                  </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Affichage de <span className="font-medium">{currentPage * pageSize + 1}</span> à{' '}
                      <span className="font-medium">
                        {Math.min((currentPage + 1) * pageSize, totalElements)}
                      </span>{' '}
                      sur <span className="font-medium">{totalElements}</span> résultats
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 0}
                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        ‹
                      </button>
                      {[...Array(totalPages)].map((_, index) => (
                        <button
                          key={index}
                          onClick={() => handlePageChange(index)}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                            currentPage === index
                              ? 'z-10 border-[#00ACA8] text-white'
                              : 'border-gray-300 bg-white text-gray-500 hover:bg-gray-50'
                          }`}
                          style={currentPage === index ? { backgroundColor: '#00ACA8' } : {}}
                        >
                          {index + 1}
                        </button>
                      ))}
                      <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage >= totalPages - 1}
                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        ›
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSubscriptionsPage;
