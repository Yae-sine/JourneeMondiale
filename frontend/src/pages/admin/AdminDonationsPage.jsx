import React, { useState, useEffect } from 'react';
import { FaHandHoldingHeart, FaFilter, FaSort, FaEye, FaDownload, FaChartLine, FaSearch } from 'react-icons/fa';
import AdminSidebar from '../../components/admin/sidebar';
import { donationService } from '../../services/donationService';

const AdminDonationsPage = () => {
  const [donations, setDonations] = useState([]);
  const [recentDonations, setRecentDonations] = useState([]);
  const [donationStats, setDonationStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'recent', 'stats'
  
  // Pagination and filtering states
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortDir, setSortDir] = useState('desc');
  
  // Filter states
  const [filters, setFilters] = useState({
    status: '',
    donorName: '',
    donorEmail: '',
    minAmount: '',
    maxAmount: ''
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchData();
  }, [activeTab, currentPage, pageSize, sortBy, sortDir]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      if (activeTab === 'all') {
        await fetchAllDonations();
      } else if (activeTab === 'recent') {
        await fetchRecentDonations();
      } else if (activeTab === 'stats') {
        await fetchDonationStats();
      }
    } catch (err) {
      console.error('Error fetching donations:', err);
      setError('Failed to load donations. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchAllDonations = async () => {
    const response = await donationService.getAllDonations(currentPage, pageSize, sortBy, sortDir);
    setDonations(response.content || []);
    setTotalPages(response.totalPages || 0);
    setTotalElements(response.totalElements || 0);
  };

  const fetchRecentDonations = async () => {
    const response = await donationService.getRecentDonations(20);
    setRecentDonations(response || []);
  };

  const fetchDonationStats = async () => {
    const response = await donationService.getDonationStatistics();
    setDonationStats(response || {});
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setCurrentPage(0);
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortDir('desc');
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const applyFilters = async () => {
    try {
      setLoading(true);
      const response = await donationService.searchDonations({
        donorName: filters.donorName || null,
        donorEmail: filters.donorEmail || null,
        status: filters.status || null,
        minAmount: filters.minAmount ? parseFloat(filters.minAmount) : null,
        maxAmount: filters.maxAmount ? parseFloat(filters.maxAmount) : null,
        page: currentPage,
        size: pageSize,
        sortBy,
        sortDir
      });
      setDonations(response.content || []);
      setTotalPages(response.totalPages || 0);
      setTotalElements(response.totalElements || 0);
    } catch (err) {
      setError('Failed to apply filters');
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setFilters({
      status: '',
      donorName: '',
      donorEmail: '',
      minAmount: '',
      maxAmount: ''
    });
    setCurrentPage(0);
    fetchAllDonations();
  };

  const formatCurrency = (amount, currency = 'EUR') => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status) => {
    const statusColors = {
      succeeded: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      failed: 'bg-red-100 text-red-800',
      canceled: 'bg-gray-100 text-gray-800'
    };

    const statusText = {
      succeeded: 'Réussie',
      pending: 'En attente',
      failed: 'Échouée',
      canceled: 'Annulée'
    };

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[status] || 'bg-gray-100 text-gray-800'}`}>
        {statusText[status] || status}
      </span>
    );
  };

  const DonationTable = ({ donations: tableData, showPagination = true }) => (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('id')}
              >
                <div className="flex items-center">
                  ID <FaSort className="ml-1" />
                </div>
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('donorName')}
              >
                <div className="flex items-center">
                  Donateur <FaSort className="ml-1" />
                </div>
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('amount')}
              >
                <div className="flex items-center">
                  Montant <FaSort className="ml-1" />
                </div>
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('status')}
              >
                <div className="flex items-center">
                  Statut <FaSort className="ml-1" />
                </div>
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('createdAt')}
              >
                <div className="flex items-center">
                  Date <FaSort className="ml-1" />
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {tableData.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                  Aucune donation trouvée
                </td>
              </tr>
            ) : (
              tableData.map((donation) => (
                <tr key={donation.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    #{donation.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {donation.donorName || 'Anonyme'}
                      </div>
                      {donation.donorEmail && (
                        <div className="text-sm text-gray-500">{donation.donorEmail}</div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold">
                    {formatCurrency(donation.amount, donation.currency)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(donation.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(donation.createdAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <button 
                      className="hover:bg-gray-100 p-2 rounded-full transition-colors"
                      style={{ color: '#00ACA8' }}
                      title="Voir les détails"
                    >
                      <FaEye />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showPagination && totalPages > 1 && (
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
              disabled={currentPage === 0}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              Précédent
            </button>
            <button
              onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
              disabled={currentPage >= totalPages - 1}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
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
                  onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                  disabled={currentPage === 0}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                >
                  Précédent
                </button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pageNum = currentPage < 3 ? i : currentPage - 2 + i;
                  if (pageNum >= totalPages) return null;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        pageNum === currentPage
                          ? 'z-10 border-[#00ACA8] text-white'
                          : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                      }`}
                      style={pageNum === currentPage ? { backgroundColor: '#00ACA8' } : {}}
                    >
                      {pageNum + 1}
                    </button>
                  );
                })}
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
                  disabled={currentPage >= totalPages - 1}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                >
                  Suivant
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const StatsCard = ({ title, value, subtitle, icon, color = '#00ACA8' }) => (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-300">
      <div className="flex items-center">
        <div 
          className="p-3 rounded-lg"
          style={{ backgroundColor: `${color}20` }}
        >
          <span style={{ color: color }}>
            {icon}
          </span>
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />
      
      <div className="flex-1 p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <FaHandHoldingHeart className="mr-3" style={{ color: '#00ACA8' }} />
                Gestion des Donations
              </h1>
              <p className="text-gray-600 mt-1">Visualisez et gérez toutes les donations</p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="px-4 py-2 bg-white text-gray-700 rounded-lg shadow-md hover:bg-gray-50 flex items-center border"
              >
                <FaFilter className="mr-2" />
                Filtres
              </button>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {/* Tabs */}
        <div className="mb-6">
          <nav className="flex space-x-8 border-b border-gray-200">
            <button
              onClick={() => handleTabChange('all')}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'all'
                  ? 'border-[#00ACA8] text-[#00ACA8]'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Toutes les Donations
            </button>
            <button
              onClick={() => handleTabChange('recent')}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'recent'
                  ? 'border-[#00ACA8] text-[#00ACA8]'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Donations Récentes
            </button>
            <button
              onClick={() => handleTabChange('stats')}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'stats'
                  ? 'border-[#00ACA8] text-[#00ACA8]'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Statistiques
            </button>
          </nav>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="mb-6 bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Filtres de Recherche</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00ACA8] focus:border-[#00ACA8]"
                >
                  <option value="">Tous les statuts</option>
                  <option value="succeeded">Réussie</option>
                  <option value="pending">En attente</option>
                  <option value="failed">Échouée</option>
                  <option value="canceled">Annulée</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom du donateur</label>
                <input
                  type="text"
                  value={filters.donorName}
                  onChange={(e) => handleFilterChange('donorName', e.target.value)}
                  placeholder="Rechercher par nom"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00ACA8] focus:border-[#00ACA8]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email du donateur</label>
                <input
                  type="email"
                  value={filters.donorEmail}
                  onChange={(e) => handleFilterChange('donorEmail', e.target.value)}
                  placeholder="Rechercher par email"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00ACA8] focus:border-[#00ACA8]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Montant minimum</label>
                <input
                  type="number"
                  value={filters.minAmount}
                  onChange={(e) => handleFilterChange('minAmount', e.target.value)}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00ACA8] focus:border-[#00ACA8]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Montant maximum</label>
                <input
                  type="number"
                  value={filters.maxAmount}
                  onChange={(e) => handleFilterChange('maxAmount', e.target.value)}
                  placeholder="999999.00"
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00ACA8] focus:border-[#00ACA8]"
                />
              </div>
            </div>
            <div className="mt-4 flex space-x-4">
              <button
                onClick={applyFilters}
                className="px-4 py-2 text-white rounded-md hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-[#00ACA8] transition-opacity"
                style={{ backgroundColor: '#00ACA8' }}
              >
                <FaSearch className="inline mr-2" />
                Appliquer les Filtres
              </button>
              <button
                onClick={clearFilters}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
              >
                Effacer les Filtres
              </button>
            </div>
          </div>
        )}

        {/* Content based on active tab */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2" style={{ borderColor: '#00ACA8' }}></div>
          </div>
        ) : (
          <>
            {activeTab === 'all' && (
              <DonationTable donations={donations} />
            )}

            {activeTab === 'recent' && (
              <div>
                <div className="mb-4">
                  <h2 className="text-xl font-semibold text-gray-900">Donations Récentes (30 derniers jours)</h2>
                  <p className="text-gray-600">Affichage des {recentDonations.length} donations les plus récentes</p>
                </div>
                <DonationTable donations={recentDonations} showPagination={false} />
              </div>
            )}

            {activeTab === 'stats' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <StatsCard
                    title="Total des Donations"
                    value={donationStats.totalCount || 0}
                    icon={<FaHandHoldingHeart size={24} />}
                  />
                  <StatsCard
                    title="Montant Total"
                    value={formatCurrency(donationStats.totalAmount || 0)}
                    icon={<FaChartLine size={24} />}
                  />
                  <StatsCard
                    title="Donation Moyenne"
                    value={formatCurrency(donationStats.averageAmount || 0)}
                    icon={<FaChartLine size={24} />}
                  />
                  <StatsCard
                    title="Donations Réussies"
                    value={donationStats.succeededCount || 0}
                    subtitle={formatCurrency(donationStats.succeededAmount || 0)}
                    icon={<FaHandHoldingHeart size={24} />}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <StatsCard
                    title="Donations en Attente"
                    value={donationStats.pendingCount || 0}
                    subtitle={formatCurrency(donationStats.pendingAmount || 0)}
                    icon={<FaChartLine size={24} />}
                    color="#f59e0b"
                  />
                  <StatsCard
                    title="Donations Échouées"
                    value={donationStats.failedCount || 0}
                    subtitle={formatCurrency(donationStats.failedAmount || 0)}
                    icon={<FaChartLine size={24} />}
                    color="#ef4444"
                  />
                  <StatsCard
                    title="Donations Annulées"
                    value={donationStats.canceledCount || 0}
                    subtitle={formatCurrency(donationStats.canceledAmount || 0)}
                    icon={<FaChartLine size={24} />}
                    color="#6b7280"
                  />
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AdminDonationsPage;