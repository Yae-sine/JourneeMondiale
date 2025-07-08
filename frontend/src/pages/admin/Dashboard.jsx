import React, { useState, useEffect } from 'react';
import { FaUsers, FaHandHoldingHeart, FaShareAlt, FaChartLine, FaCalendarDay } from 'react-icons/fa';
import AdminSidebar from '../../components/admin/sidebar';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalDonations: 0,
    totalPosts: 0,
    donationAmount: 0
  });
  const [loading, setLoading] = useState(true);

  // Mock data - replace with actual API calls
  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Simulate API call
        setTimeout(() => {
          setStats({
            totalUsers: 1247,
            totalDonations: 89,
            totalPosts: 156,
            donationAmount: 25430
          });
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Error fetching stats:', error);
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const StatCard = ({ title, value, icon, color, subtitle }) => (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-300">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">
            {loading ? (
              <span className="animate-pulse">...</span>
            ) : (
              value
            )}
          </p>
          {subtitle && (
            <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
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
      <AdminSidebar />
      
      {/* Main Content */}
      <div className="flex-1 p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Tableau de Bord Admin
          </h1>
          <p className="text-gray-600">
            Bon retour ! Voici ce qui se passe avec Journey Mondiale aujourd'hui.
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
                  Bienvenue dans le Panneau d'Administration de Journey Mondiale
                </h3>
                <p className="text-gray-600">
                  Surveillez et gérez les activités, utilisateurs et donations de votre plateforme en un seul endroit.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Utilisateurs"
            value={stats.totalUsers.toLocaleString()}
            icon={<FaUsers size={24} />}
            color="#00ACA8"
            subtitle="Membres inscrits"
          />
          
          <StatCard
            title="Total Donations"
            value={stats.totalDonations.toLocaleString()}
            icon={<FaHandHoldingHeart size={24} />}
            color="#00ACA8"
            subtitle={`${stats.donationAmount.toLocaleString()}€ collectés`}
          />
          
          <StatCard
            title="Publications Réseaux Sociaux"
            value={stats.totalPosts.toLocaleString()}
            icon={<FaShareAlt size={24} />}
            color="#00ACA8"
            subtitle="Publications partagées"
          />
          
          <StatCard
            title="Activité du Jour"
            value="24"
            icon={<FaChartLine size={24} />}
            color="#00ACA8"
            subtitle="Nouvelles activités"
          />
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Recent Users */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Utilisateurs Récents
            </h3>
            <div className="space-y-3">
              {[
                { name: 'John Doe', email: 'john@example.com', joined: '2 hours ago' },
                { name: 'Jane Smith', email: 'jane@example.com', joined: '5 hours ago' },
                { name: 'Mike Johnson', email: 'mike@example.com', joined: '1 day ago' }
              ].map((user, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{user.name}</p>
                    <p className="text-sm text-gray-500">{user.email}</p>
                  </div>
                  <span className="text-xs text-gray-400">{user.joined}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Donations */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Donations Récentes
            </h3>
            <div className="space-y-3">
              {[
                { donor: 'Anonymous', amount: '$250', cause: 'Clean Water', time: '1 hour ago' },
                { donor: 'Sarah Wilson', amount: '$100', cause: 'Education', time: '3 hours ago' },
                { donor: 'David Brown', amount: '$500', cause: 'Healthcare', time: '6 hours ago' }
              ].map((donation, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{donation.donor}</p>
                    <p className="text-sm text-gray-500">{donation.cause}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold" style={{ color: '#00ACA8' }}>
                      {donation.amount}
                    </p>
                    <span className="text-xs text-gray-400">{donation.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard; 