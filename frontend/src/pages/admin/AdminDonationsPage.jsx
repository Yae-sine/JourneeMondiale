import React, { useState, useEffect } from 'react';
import { FaHandHoldingHeart, FaFilter, FaSort, FaEye, FaChartLine, FaSearch, FaCalendarAlt, FaCalendar } from 'react-icons/fa';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend, AreaChart, Area, Brush, ReferenceLine, Cell } from 'recharts';
import AdminSidebar from '../../components/admin/sidebar';
import { donationService } from '../../services/donationService';

const AdminDonationsPage = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [donations, setDonations] = useState([]);
  const [donationStats, setDonationStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('all'); // 'all'  'stats'
  // Chart data states
  const [donationsOverTime, setDonationsOverTime] = useState([]);
  // const [topDonors, setTopDonors] = useState([]);
  const [monthlyTotals, setMonthlyTotals] = useState([]);
  // Chart customization states
  const [timePeriod, setTimePeriod] = useState('month'); // 'month', 'year' 
  const [chartType, setChartType] = useState('area'); // 'area', 'line', 'bar'
  // Pagination and filtering states
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortDir, setSortDir] = useState('desc');
  const pageSize = 10; 
  // Filter states
  const [filters, setFilters] = useState({
    status: '',
    donorName: '',
    donorEmail: '',
    minAmount: '',
    maxAmount: '',
    startDate: '',
    endDate: ''
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchData();
  }, [activeTab, currentPage, pageSize, sortBy, sortDir, timePeriod]);

  useEffect(() => {
    if (activeTab === 'stats') {
      fetchChartData();
    }
  }, [filters.startDate, filters.endDate, timePeriod]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      if (activeTab === 'all') {
        await fetchAllDonations();
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


  const fetchDonationStats = async () => {
    const response = await donationService.getDonationStatistics(
      filters.startDate || null,
      filters.endDate || null
    );
    setDonationStats(response || {});
    
    // Fetch chart data
    await fetchChartData();
  };

  const fetchChartData = async () => {
    try {
      // Fetch all donations for chart processing
      const allDonationsResponse = await donationService.getAllDonationsSimple();
      const allDonations = allDonationsResponse || [];
      
      // Filter donations by date range if specified
      let filteredDonations = allDonations;
      if (filters.startDate || filters.endDate) {
        filteredDonations = allDonations.filter(donation => {
          const donationDate = new Date(donation.createdAt);
          const startDate = filters.startDate ? new Date(filters.startDate) : null;
          const endDate = filters.endDate ? new Date(filters.endDate) : null;
          
          if (startDate && donationDate < startDate) return false;
          if (endDate && donationDate > endDate) return false;
          return true;
        });
      }
      
      // Process donations over time based on selected period
      const donationsOverTimeData = processDonationsOverTime(filteredDonations, timePeriod);
      setDonationsOverTime(donationsOverTimeData);
            
      // Process monthly totals for bar chart
      const monthlyTotalsData = processMonthlyTotals(filteredDonations);
      setMonthlyTotals(monthlyTotalsData);
    } catch (error) {
      console.error('Error fetching chart data:', error);
    }
  };

  const processDonationsOverTime = (donations, period = 'month') => {
    // Group donations by date based on period
    const donationsByDate = {};
    const now = new Date();
    
    // Calculate date range based on period
    let startDate, dateFormat, groupFormat;
    switch (period) {
      case 'year':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        dateFormat = 'YYYY-MM';
        groupFormat = (date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        break;
      default: // month
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        dateFormat = 'YYYY-MM-DD';
        groupFormat = (date) => date.toISOString().split('T')[0];
    }
    
    donations.forEach(donation => {
      if (donation.status === 'succeeded') {
        const donationDate = new Date(donation.createdAt);
        if (donationDate >= startDate) {
          const dateKey = groupFormat(donationDate);
          
          if (!donationsByDate[dateKey]) {
            donationsByDate[dateKey] = {
              date: dateKey,
              count: 0,
              amount: 0
            };
          }
          
          donationsByDate[dateKey].count += 1;
          donationsByDate[dateKey].amount += parseFloat(donation.amount);
        }
      }
    });
    
    // Convert to array and sort by date
    return Object.values(donationsByDate)
      .sort((a, b) => new Date(a.date) - new Date(b.date));
  };

  const processMonthlyTotals = (donations) => {
    const monthlyData = {};
    const now = new Date();
    
    // Get last 12 months
    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      monthlyData[monthKey] = {
        month: monthKey,
        monthName: date.toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' }),
        total: 0,
        count: 0
      };
    }
    
    donations.forEach(donation => {
      if (donation.status === 'succeeded') {
        const donationDate = new Date(donation.createdAt);
        const monthKey = `${donationDate.getFullYear()}-${String(donationDate.getMonth() + 1).padStart(2, '0')}`;
        
        if (monthlyData[monthKey]) {
          monthlyData[monthKey].total += parseFloat(donation.amount);
          monthlyData[monthKey].count += 1;
        }
      }
    });
    
    return Object.values(monthlyData);
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
      
      if (activeTab === 'stats') {
        // For statistics tab, filter the stats by date range
        await fetchDonationStats();
      } else {
        // For all donations tab, apply search filters
        const response = await donationService.searchDonations({
          donorName: filters.donorName || null,
          donorEmail: filters.donorEmail || null,
          status: filters.status || null,
          minAmount: filters.minAmount ? parseFloat(filters.minAmount) : null,
          maxAmount: filters.maxAmount ? parseFloat(filters.maxAmount) : null,
          startDate: filters.startDate || null,
          endDate: filters.endDate || null,
          page: currentPage,
          size: pageSize,
          sortBy,
          sortDir
        });
        setDonations(response.content || []);
        setTotalPages(response.totalPages || 0);
        setTotalElements(response.totalElements || 0);
      }
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
      maxAmount: '',
      startDate: '',
      endDate: ''
    });
    setCurrentPage(0);
    if (activeTab === 'stats') {
      fetchDonationStats();
    } else {
      fetchAllDonations();
    }
  };

  const formatCurrency = (amount, currency = 'EUR') => {
    // Guard: Only format if amount is a finite number and currency is a valid string
    if (typeof amount !== 'number') {
      amount = Number(amount);
    }
    if (!isFinite(amount)) return '';
    // Only allow valid 3-letter currency codes
    if (typeof currency !== 'string' || currency.length !== 3) currency = 'EUR';
    try {
      return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: currency
      }).format(amount);
    } catch (e) {
      return amount;
    }
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
                  Aucun don trouvé
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
      <AdminSidebar isCollapsed={isSidebarCollapsed} setIsCollapsed={setIsSidebarCollapsed} />
      <div className={`flex-1 p-8 transition-all duration-300 ${isSidebarCollapsed ? 'ml-16' : 'ml-64'}`}>
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <FaHandHoldingHeart className="mr-3" style={{ color: '#00ACA8' }} />
                Gestion des Dons
              </h1>
              <p className="text-gray-600 mt-1">Visualisez et gérez toutes les dons</p>
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
              Tous les Dons
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
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {activeTab === 'stats' ? 'Filtrer les Statistiques' : 'Filtres de Recherche'}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Date filters */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date de début</label>
                <input
                  type="datetime-local"
                  value={filters.startDate}
                  onChange={(e) => handleFilterChange('startDate', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00ACA8] focus:border-[#00ACA8]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date de fin</label>
                <input
                  type="datetime-local"
                  value={filters.endDate}
                  onChange={(e) => handleFilterChange('endDate', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00ACA8] focus:border-[#00ACA8]"
                />
              </div>
              
              {/* Additional filters - only show for 'all' tab */}
              {activeTab === 'all' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
                    <select
                      value={filters.status}
                      onChange={(e) => handleFilterChange('status', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00ACA8] focus:border-[#00ACA8]"
                    >
                      <option value="">Tous les statuts</option>
                      <option value="succeeded">Réussi</option>
                      <option value="pending">En attente</option>
                      <option value="failed">Échoué</option>
                      <option value="canceled">Annulé</option>
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
                </>
              )}
            </div>
            <div className="mt-4 flex space-x-4">
              <button
                onClick={applyFilters}
                className="px-4 py-2 text-white rounded-md hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-[#00ACA8] transition-opacity"
                style={{ backgroundColor: '#00ACA8' }}
              >
                <FaSearch className="inline mr-2" />
                {activeTab === 'stats' ? 'Filtrer les Statistiques' : 'Appliquer les Filtres'}
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
            {activeTab === 'stats' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <StatsCard
                    title="Total des Dons"
                    value={donationStats.totalCount || 0}
                    icon={<FaHandHoldingHeart size={24} />}
                  />
                  <StatsCard
                    title="Montant Total"
                    value={formatCurrency(donationStats.totalAmount || 0)}
                    icon={<FaChartLine size={24} />}
                  />
                  <StatsCard
                    title="Dons Moyens"
                    value={formatCurrency(donationStats.averageAmount || 0)}
                    icon={<FaChartLine size={24} />}
                  />
                  <StatsCard
                    title="Dons Réussis"
                    value={donationStats.succeededCount || 0}
                    subtitle={formatCurrency(donationStats.succeededAmount || 0)}
                    icon={<FaHandHoldingHeart size={24} />}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <StatsCard
                    title="Dons en Attente"
                    value={donationStats.pendingCount || 0}
                    subtitle={formatCurrency(donationStats.pendingAmount || 0)}
                    icon={<FaChartLine size={24} />}
                    color="#f59e0b"
                  />
                  <StatsCard
                    title="Dons Échoués"
                    value={donationStats.failedCount || 0}
                    subtitle={formatCurrency(donationStats.failedAmount || 0)}
                    icon={<FaChartLine size={24} />}
                    color="#ef4444"
                  />
                  <StatsCard
                    title="Dons Annulés"
                    value={donationStats.canceledCount || 0}
                    subtitle={formatCurrency(donationStats.canceledAmount || 0)}
                    icon={<FaChartLine size={24} />}
                    color="#6b7280"
                  />
                </div>

                {/* Charts Section */}
                <div className="space-y-8">
                  {/* Time Period Controls */}
                  <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-semibold text-gray-900">Analyse Temporelle</h3>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setTimePeriod('month')}
                          className={`px-4 py-2 rounded-lg flex items-center space-x-2 transition-all ${
                            timePeriod === 'month'
                              ? 'bg-[#00ACA8] text-white shadow-lg'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          <FaCalendarAlt />
                          <span>Mois</span>
                        </button>
                        <button
                          onClick={() => setTimePeriod('year')}
                          className={`px-4 py-2 rounded-lg flex items-center space-x-2 transition-all ${
                            timePeriod === 'year'
                              ? 'bg-[#00ACA8] text-white shadow-lg'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          <FaCalendar />
                          <span>Année</span>
                        </button>
                      </div>
                    </div>
                    
                    {/* Chart Type Toggle */}
                    <div className="flex space-x-3 mb-4">
                      <button
                        onClick={() => setChartType('area')}
                        className={`px-3 py-1 rounded text-sm transition-all ${
                          chartType === 'area'
                            ? 'bg-[#00ACA8] text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        Zone
                      </button>
                      <button
                        onClick={() => setChartType('line')}
                        className={`px-3 py-1 rounded text-sm transition-all ${
                          chartType === 'line'
                            ? 'bg-[#00ACA8] text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        Ligne
                      </button>
                      <button
                        onClick={() => setChartType('bar')}
                        className={`px-3 py-1 rounded text-sm transition-all ${
                          chartType === 'bar'
                            ? 'bg-[#00ACA8] text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        Barres
                      </button>
                    </div>

                    {/* Advanced Area/Line Chart */}
                    <div className="h-96">
                      <ResponsiveContainer width="100%" height="100%">
                        {chartType === 'area' ? (
                          <AreaChart data={donationsOverTime} margin={{ top: 20, right: 40, left: 20, bottom: 60 }}>
                            <defs>
                              <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#00ACA8" stopOpacity={0.8}/>
                                <stop offset="95%" stopColor="#00ACA8" stopOpacity={0.1}/>
                              </linearGradient>
                              <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8}/>
                                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.1}/>
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" opacity={0.7} />
                            <XAxis 
                              dataKey="date" 
                              tick={{ fontSize: 13, fill: '#374151' }}
                              tickFormatter={(value) => {
                                const date = new Date(value);
                                return timePeriod === 'year' 
                                  ? date.toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' })
                                  : date.toLocaleDateString('fr-FR', { month: 'short', day: 'numeric' });
                              }}
                              axisLine={{ stroke: '#d1d5db' }}
                              tickLine={false}
                              interval="preserveStartEnd"
                            />
                            <YAxis 
                              yAxisId="left" 
                              tick={{ fontSize: 13, fill: '#374151' }} 
                              axisLine={{ stroke: '#d1d5db' }}
                              tickLine={false}
                              width={80}
                              tickFormatter={formatCurrency}
                            />
                            <YAxis 
                              yAxisId="right" 
                              orientation="right" 
                              tick={{ fontSize: 13, fill: '#374151' }} 
                              axisLine={{ stroke: '#d1d5db' }}
                              tickLine={false}
                              width={60}
                            />
                            <Tooltip 
                              contentStyle={{ 
                                background: 'rgba(255, 255, 255, 0.95)', 
                                borderRadius: 12, 
                                border: '1px solid #e5e7eb', 
                                fontSize: 14,
                                boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)'
                              }}
                              labelStyle={{ fontWeight: 600, color: '#00ACA8', marginBottom: 8 }}
                              labelFormatter={(value) => `Date : ${new Date(value).toLocaleDateString('fr-FR', { 
                                weekday: 'short', 
                                year: 'numeric', 
                                month: 'short', 
                                day: 'numeric' 
                              })}`}
                              formatter={(value, name, props) => {
                                if (props.dataKey === 'amount') return [formatCurrency(value), 'Montant Total'];
                                if (props.dataKey === 'count') return [value, 'Nombre de Dons'];
                                return [value, name];
                              }}
                              separator=" : "
                            />
                            <Legend 
                              verticalAlign="top" 
                              height={36} 
                              iconType="circle"
                              wrapperStyle={{ paddingBottom: '20px' }}
                            />
                            <Area 
                              yAxisId="left"
                              type="monotone"
                              dataKey="amount"
                              name="Montant Total (€)"
                              stroke="#00ACA8"
                              fillOpacity={1}
                              fill="url(#colorAmount)"
                              strokeWidth={3}
                              dot={{ r: 6, fill: '#00ACA8', stroke: '#fff', strokeWidth: 3 }}
                              activeDot={{ r: 8, fill: '#00ACA8', stroke: '#fff', strokeWidth: 3 }}
                            />
                            <Area 
                              yAxisId="right"
                              type="monotone"
                              dataKey="count"
                              name="Nombre de Dons"
                              stroke="#f59e0b"
                              fillOpacity={1}
                              fill="url(#colorCount)"
                              strokeWidth={3}
                              dot={{ r: 6, fill: '#f59e0b', stroke: '#fff', strokeWidth: 3 }}
                              activeDot={{ r: 8, fill: '#f59e0b', stroke: '#fff', strokeWidth: 3 }}
                            />
                            <Brush 
                              dataKey="date" 
                              height={60} 
                              stroke="#00ACA8"
                              fill="rgba(0, 172, 168, 0.1)"
                              tickFormatter={(value) => {
                                const date = new Date(value);
                                return date.toLocaleDateString('fr-FR', { month: 'short', day: 'numeric' });
                              }}
                            />
                          </AreaChart>
                        ) : chartType === 'line' ? (
                          <LineChart data={donationsOverTime} margin={{ top: 20, right: 40, left: 20, bottom: 60 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" opacity={0.7} />
                            <XAxis 
                              dataKey="date" 
                              tick={{ fontSize: 13, fill: '#374151' }}
                              tickFormatter={(value) => {
                                const date = new Date(value);
                                return timePeriod === 'year' 
                                  ? date.toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' })
                                  : date.toLocaleDateString('fr-FR', { month: 'short', day: 'numeric' });
                              }}
                              axisLine={{ stroke: '#d1d5db' }}
                              tickLine={false}
                            />
                            <YAxis 
                              yAxisId="left" 
                              tick={{ fontSize: 13, fill: '#374151' }} 
                              axisLine={{ stroke: '#d1d5db' }}
                              tickLine={false}
                              width={80}
                              tickFormatter={formatCurrency}
                            />
                            <YAxis 
                              yAxisId="right" 
                              orientation="right" 
                              tick={{ fontSize: 13, fill: '#374151' }} 
                              axisLine={{ stroke: '#d1d5db' }}
                              tickLine={false}
                              width={60}
                            />
                            <Tooltip 
                              contentStyle={{ 
                                background: 'rgba(255, 255, 255, 0.95)', 
                                borderRadius: 12, 
                                border: '1px solid #e5e7eb', 
                                fontSize: 14,
                                boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)'
                              }}
                              labelStyle={{ fontWeight: 600, color: '#00ACA8' }}
                              formatter={(value, name, props) => {
                                if (props.dataKey === 'amount') return [formatCurrency(value), 'Montant Total'];
                                if (props.dataKey === 'count') return [value, 'Nombre de Dons'];
                                return [value, name];
                              }}
                            />
                            <Legend verticalAlign="top" height={36} iconType="circle" />
                            <Line 
                              yAxisId="left"
                              type="monotone"
                              dataKey="amount"
                              name="Montant Total (€)"
                              stroke="#00ACA8"
                              strokeWidth={4}
                              dot={{ r: 6, fill: '#00ACA8', stroke: '#fff', strokeWidth: 3 }}
                              activeDot={{ r: 8, fill: '#00ACA8', stroke: '#fff', strokeWidth: 3 }}
                            />
                            <Line 
                              yAxisId="right"
                              type="monotone"
                              dataKey="count"
                              name="Nombre de Dons"
                              stroke="#f59e0b"
                              strokeWidth={4}
                              dot={{ r: 6, fill: '#f59e0b', stroke: '#fff', strokeWidth: 3 }}
                              activeDot={{ r: 8, fill: '#f59e0b', stroke: '#fff', strokeWidth: 3 }}
                            />
                            <Brush 
                              dataKey="date" 
                              height={60} 
                              stroke="#00ACA8"
                              fill="rgba(0, 172, 168, 0.1)"
                            />
                          </LineChart>
                        ) : (
                          <BarChart data={donationsOverTime} margin={{ top: 20, right: 40, left: 20, bottom: 60 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" opacity={0.7} />
                            <XAxis 
                              dataKey="date" 
                              tick={{ fontSize: 13, fill: '#374151' }}
                              tickFormatter={(value) => {
                                const date = new Date(value);
                                return timePeriod === 'year' 
                                  ? date.toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' })
                                  : date.toLocaleDateString('fr-FR', { month: 'short', day: 'numeric' });
                              }}
                              axisLine={{ stroke: '#d1d5db' }}
                              tickLine={false}
                            />
                            <YAxis 
                              yAxisId="left" 
                              tick={{ fontSize: 13, fill: '#374151' }} 
                              axisLine={{ stroke: '#d1d5db' }}
                              tickLine={false}
                              width={80}
                              tickFormatter={formatCurrency}
                            />
                            <YAxis 
                              yAxisId="right" 
                              orientation="right" 
                              tick={{ fontSize: 13, fill: '#374151' }} 
                              axisLine={{ stroke: '#d1d5db' }}
                              tickLine={false}
                              width={60}
                            />
                            <Tooltip 
                              contentStyle={{ 
                                background: 'rgba(255, 255, 255, 0.95)', 
                                borderRadius: 12, 
                                border: '1px solid #e5e7eb', 
                                fontSize: 14,
                                boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)'
                              }}
                              labelStyle={{ fontWeight: 600, color: '#00ACA8' }}
                              formatter={(value, name, props) => {
                                if (props.dataKey === 'amount') return [formatCurrency(value), 'Montant Total'];
                                if (props.dataKey === 'count') return [value, 'Nombre de Dons'];
                                return [value, name];
                              }}
                            />
                            <Legend verticalAlign="top" height={36} iconType="rect" />
                            <Bar 
                              yAxisId="left"
                              dataKey="amount"
                              name="Montant Total (€)"
                              fill="#00ACA8"
                              radius={[4, 4, 0, 0]}
                              maxBarSize={60}
                            />
                            <Bar 
                              yAxisId="right"
                              dataKey="count"
                              name="Nombre de Dons"
                              fill="#f59e0b"
                              radius={[4, 4, 0, 0]}
                              maxBarSize={60}
                            />
                            <Brush 
                              dataKey="date" 
                              height={60} 
                              stroke="#00ACA8"
                              fill="rgba(0, 172, 168, 0.1)"
                            />
                          </BarChart>
                        )}
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Monthly Bar Chart */}
                  <div className="bg-white rounded-lg shadow-md p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-6">Montants Totaux par Mois</h3>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={monthlyTotals} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" opacity={0.7} />
                          <XAxis 
                            dataKey="monthName" 
                            tick={{ fontSize: 12, fill: '#374151' }}
                            axisLine={{ stroke: '#d1d5db' }}
                            tickLine={false}
                            angle={-45}
                            textAnchor="end"
                            height={80}
                          />
                          <YAxis 
                            tick={{ fontSize: 13, fill: '#374151' }} 
                            axisLine={{ stroke: '#d1d5db' }}
                            tickLine={false}
                            width={80}
                            tickFormatter={formatCurrency}
                          />
                          <Tooltip 
                            contentStyle={{ 
                              background: 'rgba(255, 255, 255, 0.95)', 
                              borderRadius: 12, 
                              border: '1px solid #e5e7eb', 
                              fontSize: 14,
                              boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)'
                            }}
                            labelStyle={{ fontWeight: 600, color: '#00ACA8' }}
                            formatter={(value, name) => [formatCurrency(value), 'Montant Total']}
                          />
                          <Bar 
                            dataKey="total"
                            fill="#00ACA8"
                            radius={[6, 6, 0, 0]}
                            maxBarSize={50}
                          >
                            {monthlyTotals.map((entry, index) => (
                              <Cell 
                                key={`cell-${index}`} 
                                fill={`hsl(${174}, ${70 + (index * 3)}%, ${45 + (index * 2)}%)`}
                              />
                            ))}
                          </Bar>
                          <ReferenceLine y={0} stroke="#374151" strokeDasharray="2 2" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
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