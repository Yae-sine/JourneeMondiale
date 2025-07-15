import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../context/UserContext';
import { FaSpinner } from 'react-icons/fa';

const withAuth = (WrappedComponent) => {
  return function AuthProtectedComponent(props) {
    const { isAuthenticated, loading } = useUser();
    const navigate = useNavigate();

    useEffect(() => {
      if (!loading && !isAuthenticated) {
        navigate('/login');
      }
    }, [isAuthenticated, loading, navigate]);

    if (loading) {
      return (
        <div className="min-h-screen bg-white flex items-center justify-center">
          <div className="text-center">
            <FaSpinner className="animate-spin mx-auto mb-4 text-3xl" style={{ color: '#00ACA8' }} />
            <p className="text-gray-600">Vérification de l'authentification...</p>
          </div>
        </div>
      );
    }

    if (!isAuthenticated) {
      return null; // Will redirect to login
    }

    return <WrappedComponent {...props} />;
  };
};

export default withAuth;
