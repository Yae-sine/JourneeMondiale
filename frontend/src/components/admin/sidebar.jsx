import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { authService } from '../../services/authService';
import { 
  FaUsers, 
  FaHandHoldingHeart, 
  FaCalendarAlt, 
  FaTachometerAlt,
  FaBars,
  FaTimes,
  FaRegCreditCard
} from 'react-icons/fa';

const AdminSidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();

  const menuItems = [
    {
      id: 'dashboard',
      title: 'Tableau de bord',
      icon: <FaTachometerAlt size={20} />,
      path: '/admin/dashboard'
    },
    {
      id: 'users',
      title: 'Utilisateurs',
      icon: <FaUsers size={20} />,
      path: '/admin/users'
    },
    {
      id: 'donations',
      title: 'Dons',
      icon: <FaHandHoldingHeart size={20} />,
      path: '/admin/donations'
    },
    {
      id: 'subscriptions',
      title: 'Abonnements',
      icon: <FaRegCreditCard size={20} />,
      path: '/admin/subscriptions'
    },
    {
      id: 'events',
      title: 'Événements',
      icon: <FaCalendarAlt size={20} />,
      path: '/admin/events'
    }
  ];

  const isActiveRoute = (path) => {
    // Check for exact match first
    if (location.pathname === path || location.pathname.startsWith(path + '/')) {
      return true;
    }
    return false;
  };

  return (
    <div className={`bg-white shadow-lg transition-all duration-300 ${
      isCollapsed ? 'w-16' : 'w-64'
    } min-h-screen relative`}>
      
      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        {!isCollapsed && (
          <h2 className="text-xl font-bold text-gray-800">
            Admin Panel
          </h2>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          style={{ color: '#00ACA8' }}
        >
          {isCollapsed ? <FaBars size={18} /> : <FaTimes size={18} />}
        </button>
      </div>

      {/* Navigation Menu */}
      <nav className="p-4 space-y-2">
        {menuItems.map((item) => (
          <Link
            key={item.id}
            to={item.path}
            className={`flex items-center ${isCollapsed ? 'justify-center p-2' : 'p-3'} rounded-lg transition-all duration-200 group ${
              isActiveRoute(item.path)
                ? 'text-white shadow-md'
                : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
            }`}
            style={{
              backgroundColor: isActiveRoute(item.path) ? '#00ACA8' : 'transparent'
            }}
          >
            {/* Icon */}
            <span className={`flex-shrink-0 ${isCollapsed ? 'p-2' : ''} ${
              isActiveRoute(item.path) 
                ? 'text-white' 
                : 'text-gray-500 group-hover:text-[#00ACA8]'
            }`}>
              {item.icon}
            </span>
            
            {/* Title */}
            {!isCollapsed && (
              <span className="ml-3 font-medium">
                {item.title}
              </span>
            )}
          </Link>
        ))}
      </nav>

      {/* Logout Button */}
      {!isCollapsed && (
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
          <button
            onClick={() => {
              authService.logout();
            }}
            className="w-full flex items-center justify-center p-3 rounded-lg text-gray-700 hover:text-white hover:shadow-md transition-all duration-200"
            style={{ 
              backgroundColor: 'transparent',
              ':hover': { backgroundColor: '#00ACA8' }
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#00ACA8'}
            onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
          >
            <span className="font-medium">Se Déconnecter</span>
          </button>
        </div>
      )}

      {/* Collapsed tooltip */}
      {isCollapsed && (
        <style jsx>{`
          .group:hover .tooltip {
            opacity: 1;
            visibility: visible;
          }
        `}</style>
      )}
    </div>
  );
};

export default AdminSidebar;
