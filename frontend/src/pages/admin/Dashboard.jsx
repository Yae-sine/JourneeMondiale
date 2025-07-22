import React, { useState, useEffect } from 'react';
import { FaUsers, FaHandHoldingHeart, FaCalendarAlt, FaChartLine, FaCalendarDay, FaArrowUp, FaArrowDown } from 'react-icons/fa';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, AreaChart, Area } from 'recharts';
import AdminSidebar from '../../components/admin/sidebar';
import { userService } from '../../services/userService';
import { donationService } from '../../services/donationService';
import { eventService } from '../../services/eventService';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalDonations: 0,
    totalEvents: 0,
    donationAmount: 0,
    eventRegistrations: 0
  });
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState({
    donationTrends: [],
    eventStats: [],
    donationByStatus: [],
    monthlyData: []
  });
  const [recentUsers, setRecentUsers] = useState([]);
  const [recentDonations, setRecentDonations] = useState([]);
  const [recentEvents, setRecentEvents] = useState([]);

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Fetch all dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch basic statistics
        const [usersData, donationsData, eventsData, donationStats] = await Promise.all([
          userService.getAllUsers(),
          donationService.getAllDonationsSimple(),
          eventService.getAllEvents(),
          donationService.getDonationStatistics()
        ]);

        // Process users data
        const totalUsers = usersData?.length || 0;
        const sortedUsers = usersData?.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)) || [];
        setRecentUsers(sortedUsers.slice(0, 3));

        // Process donations data
        const totalDonations = donationsData?.length || 0;
        const donationAmount = donationStats?.totalAmount || 0;
        const sortedDonations = donationsData?.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)) || [];
        setRecentDonations(sortedDonations.slice(0, 3));

        // Process events data
        const totalEvents = eventsData?.length || 0;
        const eventRegistrations = eventsData?.reduce((sum, event) => sum + (event.currentParticipants || 0), 0) || 0;
        const sortedEvents = eventsData?.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)) || [];
        setRecentEvents(sortedEvents.slice(0, 3));

        // Update stats
        setStats({
          totalUsers,
          totalDonations,
          totalEvents,
          donationAmount,
          eventRegistrations
        });

        // Generate chart data
        generateChartData(donationsData, eventsData, donationStats);
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const generateChartData = (donations, events, donationStats) => {
    // Donation trends over last 6 months
    const donationTrends = generateMonthlyTrends(donations);
    
    // Event statistics
    const eventStats = events?.map(event => ({
      name: event.name?.length > 15 ? event.name.substring(0, 15) + '...' : event.name,
      participants: event.currentParticipants || 0,
      capacity: event.maxParticipants || 0,
      fillRate: Math.round(((event.currentParticipants || 0) / (event.maxParticipants || 1)) * 100)
    })) || [];

    // Donation by status
    const statusCounts = donations?.reduce((acc, donation) => {
      const status = donation.status || 'unknown';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {}) || {};

    const donationByStatus = Object.entries(statusCounts).map(([status, count]) => ({
      name: status.charAt(0).toUpperCase() + status.slice(1),
      value: count,
      amount: donations?.filter(d => d.status === status).reduce((sum, d) => sum + (d.amount || 0), 0) || 0
    }));

    // Monthly data combining donations and events
    const monthlyData = generateMonthlyData(donations, events);

    setChartData({
      donationTrends,
      eventStats: eventStats.slice(0, 6), // Show top 6 events
      donationByStatus,
      monthlyData
    });
  };

  const generateMonthlyTrends = (donations) => {
    const months = [];
    const now = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthName = date.toLocaleDateString('fr-FR', { month: 'short' });
      
      const monthDonations = donations?.filter(donation => {
        const donationDate = new Date(donation.createdAt);
        return donationDate.getMonth() === date.getMonth() && 
               donationDate.getFullYear() === date.getFullYear();
      }) || [];

      months.push({
        month: monthName,
        donations: monthDonations.length,
        amount: monthDonations.reduce((sum, d) => sum + (d.amount || 0), 0)
      });
    }
    
    return months;
  };

  const generateMonthlyData = (donations, events) => {
    const months = [];
    const now = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthName = date.toLocaleDateString('fr-FR', { month: 'short' });
      
      const monthDonations = donations?.filter(donation => {
        const donationDate = new Date(donation.createdAt);
        return donationDate.getMonth() === date.getMonth() && 
               donationDate.getFullYear() === date.getFullYear();
      }) || [];

      const monthEvents = events?.filter(event => {
        const eventDate = new Date(event.createdAt);
        return eventDate.getMonth() === date.getMonth() && 
               eventDate.getFullYear() === date.getFullYear();
      }) || [];

      months.push({
        month: monthName,
        donations: monthDonations.reduce((sum, d) => sum + (d.amount || 0), 0),
        events: monthEvents.length,
        registrations: monthEvents.reduce((sum, e) => sum + (e.currentParticipants || 0), 0)
      });
    }
    
    return months;
  };

  // Color schemes for charts
  const COLORS = ['#00ACA8', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7'];
  const RADIAN = Math.PI / 180;

  // Custom label function for pie chart
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        fontSize="12"
        fontWeight="bold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  const StatCard = ({ title, value, icon, color, subtitle, trend }) => (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-all duration-300 border-l-4" 
         style={{ borderLeftColor: color }}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">
            {loading ? (
              <span className="animate-pulse bg-gray-200 rounded w-16 h-8 inline-block"></span>
            ) : (
              typeof value === 'number' && title.includes('€') ? 
                `${value.toLocaleString('fr-FR')}€` : 
                value.toLocaleString('fr-FR')
            )}
          </p>
          {subtitle && (
            <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
          )}
          {trend && (
            <div className="flex items-center mt-2">
              {trend > 0 ? (
                <FaArrowUp className="text-green-500 mr-1" size={12} />
              ) : (
                <FaArrowDown className="text-red-500 mr-1" size={12} />
              )}
              <span className={`text-xs font-semibold ${trend > 0 ? 'text-green-500' : 'text-red-500'}`}>
                {Math.abs(trend)}%
              </span>
            </div>
          )}
        </div>
        <div 
          className="p-3 rounded-full"
          style={{ backgroundColor: `${color}20` }}
        >
          <span style={{ color: color }}>
            {icon}
          </span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <AdminSidebar isCollapsed={isSidebarCollapsed} setIsCollapsed={setIsSidebarCollapsed} />
      <div className={`flex-1 p-8 transition-all duration-300 ${isSidebarCollapsed ? 'ml-16' : 'ml-64'}`}>
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Tableau de Bord Admin
          </h1>
          <p className="text-gray-600">
            Bon retour ! Voici ce qui se passe avec Gustave Roussey aujourd'hui.
          </p>
          
          {/* Welcome Message */}
          <div className="bg-white rounded-lg shadow-md p-6 mt-6">
            <div className="flex items-center space-x-3">
              <div 
                className="p-3 rounded-full"
                style={{ backgroundColor: '#00ACA820' }}
              >
                <FaCalendarDay size={20} style={{ color: '#00ACA8' }} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Bienvenue dans le Panneau d'Administration de Gustave Roussey
                </h3>
                <p className="text-gray-600">
                  Surveillez et gérez les activités, utilisateurs et dons de votre plateforme en un seul endroit.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Utilisateurs"
            value={stats.totalUsers}
            icon={<FaUsers size={24} />}
            color="#00ACA8"
            subtitle="Membres inscrits"
            trend={5.2}
          />
          
          <StatCard
            title="Total Dons"
            value={`${stats.donationAmount}€`}
            icon={<FaHandHoldingHeart size={24} />}
            color="#FF6B6B"
            subtitle={`${stats.totalDonations} transactions`}
            trend={12.5}
          />
          
          <StatCard
            title="Événements"
            value={stats.totalEvents}
            icon={<FaCalendarAlt size={24} />}
            color="#4ECDC4"
            subtitle={`${stats.eventRegistrations} inscriptions`}
            trend={8.1}
          />
          
          <StatCard
            title="Activité du Mois"
            value={stats.totalUsers + stats.totalDonations + stats.totalEvents}
            icon={<FaChartLine size={24} />}
            color="#45B7D1"
            subtitle="Total d'activités"
            trend={3.7}
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Donation Trends Chart */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Tendances des Dons</h3>
              <div className="text-sm text-gray-500">6 derniers mois</div>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={chartData.donationTrends}>
                <defs>
                  <linearGradient id="donationGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00ACA8" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#00ACA8" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="month" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#6b7280' }}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#6b7280' }}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                  }}
                  formatter={(value, name) => [`${value}€`, 'Montant']}
                />
                <Area 
                  type="monotone" 
                  dataKey="amount" 
                  stroke="#00ACA8" 
                  strokeWidth={3}
                  fill="url(#donationGradient)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Event Participation Chart */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Participation aux Événements</h3>
              <div className="text-sm text-gray-500">Taux de remplissage</div>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData.eventStats}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: '#6b7280' }}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#6b7280' }}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                  }}
                  formatter={(value, name) => {
                    if (name === 'participants') return [`${value}`, 'Participants'];
                    if (name === 'capacity') return [`${value}`, 'Capacité'];
                    return [value, name];
                  }}
                />
                <Bar dataKey="participants" fill="#4ECDC4" radius={[4, 4, 0, 0]} />
                <Bar dataKey="capacity" fill="#E8F4F8" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Additional Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Donation Status Distribution */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Statut des Dons</h3>
              <div className="text-sm text-gray-500">Répartition</div>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={chartData.donationByStatus}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderCustomizedLabel}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {chartData.donationByStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                  }}
                  formatter={(value, name, props) => [
                    `${value} (${props.payload.amount}€)`, 
                    'Nombre de dons'
                  ]}
                />
                <Legend 
                  verticalAlign="bottom" 
                  height={36}
                  iconType="circle"
                  wrapperStyle={{ fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Monthly Activity Overview */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Activité Mensuelle</h3>
              <div className="text-sm text-gray-500">Vue d'ensemble</div>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData.monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#6b7280' }}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#6b7280' }}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="donations" 
                  stroke="#FF6B6B" 
                  strokeWidth={3}
                  dot={{ fill: '#FF6B6B', strokeWidth: 2, r: 4 }}
                  name="Dons (€)"
                />
                <Line 
                  type="monotone" 
                  dataKey="events" 
                  stroke="#4ECDC4" 
                  strokeWidth={3}
                  dot={{ fill: '#4ECDC4', strokeWidth: 2, r: 4 }}
                  name="Événements"
                />
                <Line 
                  type="monotone" 
                  dataKey="registrations" 
                  stroke="#45B7D1" 
                  strokeWidth={3}
                  dot={{ fill: '#45B7D1', strokeWidth: 2, r: 4 }}
                  name="Inscriptions"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Recent Users */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Utilisateurs Récents</h3>
              <FaUsers className="text-gray-400" />
            </div>
            <div className="space-y-3">
              {loading ? (
                [...Array(3)].map((_, index) => (
                  <div key={index} className="animate-pulse">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-32"></div>
                      </div>
                      <div className="h-3 bg-gray-200 rounded w-16"></div>
                    </div>
                  </div>
                ))
              ) : recentUsers.length > 0 ? (
                recentUsers.map((user, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div>
                      <p className="font-medium text-gray-900">{user.firstName} {user.lastName}</p>
                      <p className="text-sm text-gray-500">{user.email}</p>
                    </div>
                    <span className="text-xs text-gray-400">
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString('fr-FR') : 'N/A'}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">Aucun utilisateur récent</p>
              )}
            </div>
          </div>

          {/* Recent Donations */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Dons Récents</h3>
              <FaHandHoldingHeart className="text-gray-400" />
            </div>
            <div className="space-y-3">
              {loading ? (
                [...Array(3)].map((_, index) => (
                  <div key={index} className="animate-pulse">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-16"></div>
                      </div>
                      <div>
                        <div className="h-4 bg-gray-200 rounded w-12 mb-1"></div>
                        <div className="h-3 bg-gray-200 rounded w-16"></div>
                      </div>
                    </div>
                  </div>
                ))
              ) : recentDonations.length > 0 ? (
                recentDonations.map((donation, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div>
                      <p className="font-medium text-gray-900">
                        {donation.donorName || 'Anonyme'}
                      </p>
                      <p className="text-sm text-gray-500 capitalize">{donation.status || 'En cours'}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold" style={{ color: '#00ACA8' }}>
                        {donation.amount ? `${donation.amount.toLocaleString('fr-FR')}€` : 'N/A'}
                      </p>
                      <span className="text-xs text-gray-400">
                        {donation.createdAt ? new Date(donation.createdAt).toLocaleDateString('fr-FR') : 'N/A'}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">Aucun don récent</p>
              )}
            </div>
          </div>

          {/* Recent Events */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Événements Récents</h3>
              <FaCalendarAlt className="text-gray-400" />
            </div>
            <div className="space-y-3">
              {loading ? (
                [...Array(3)].map((_, index) => (
                  <div key={index} className="animate-pulse">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <div className="h-4 bg-gray-200 rounded w-28 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-20"></div>
                      </div>
                      <div className="h-3 bg-gray-200 rounded w-12"></div>
                    </div>
                  </div>
                ))
              ) : recentEvents.length > 0 ? (
                recentEvents.map((event, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div>
                      <p className="font-medium text-gray-900">
                        {event.name?.length > 20 ? event.name.substring(0, 20) + '...' : event.name}
                      </p>
                      <p className="text-sm text-gray-500">{event.location || 'Lieu non défini'}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-semibold" style={{ color: '#4ECDC4' }}>
                        {event.currentParticipants || 0}/{event.maxParticipants || 0}
                      </span>
                      <p className="text-xs text-gray-400">
                        {event.eventDate ? new Date(event.eventDate).toLocaleDateString('fr-FR') : 'Date non définie'}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">Aucun événement récent</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard; 