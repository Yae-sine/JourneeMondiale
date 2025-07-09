import React from 'react';
import { Navigate } from 'react-router-dom';
import useAdminGuard from '../../hooks/useAdminGuard';

const AdminRoute = ({ children }) => {
  const { isAdmin, loading } = useAdminGuard();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          {/* Spinner */}
          <div className="relative">
            <div className="w-16 h-16 border-4 border-gray-200 border-t-4 rounded-full animate-spin mx-auto mb-4"
                 style={{ borderTopColor: '#00ACA8' }}>
            </div>
            {/* Pulsing inner circle */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-8 h-8 rounded-full animate-pulse"
                   style={{ backgroundColor: '#00ACA8' }}>
              </div>
            </div>
          </div>
          
          {/* Loading text */}
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Chargement...
          </h2>
          <p className="text-gray-600">
            Vérification des permissions d'administrateur
          </p>
          
          {/* Progress dots */}
          <div className="flex justify-center space-x-1 mt-4">
            <div className="w-2 h-2 rounded-full animate-bounce"
                 style={{ backgroundColor: '#00ACA8', animationDelay: '0ms' }}>
            </div>
            <div className="w-2 h-2 rounded-full animate-bounce"
                 style={{ backgroundColor: '#00ACA8', animationDelay: '150ms' }}>
            </div>
            <div className="w-2 h-2 rounded-full animate-bounce"
                 style={{ backgroundColor: '#00ACA8', animationDelay: '300ms' }}>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!isAdmin) return <Navigate to="/unauthorized" />;
  return children;
};

export default AdminRoute;