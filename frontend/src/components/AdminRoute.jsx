import React from 'react';
import { Navigate } from 'react-router-dom';
import useAdminGuard from '../hooks/useAdminGuard';

const AdminRoute = ({ children }) => {
  const { isAdmin, loading } = useAdminGuard();

  if (loading) return <div>Loading...</div>;
  if (!isAdmin) return <Navigate to="/unauthorized" />;
  return children;
};

export default AdminRoute; 