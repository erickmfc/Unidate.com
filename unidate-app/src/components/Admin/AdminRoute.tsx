import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAdminAuth } from '../../contexts/AdminAuthContext';
import LoadingSpinner from '../UI/LoadingSpinner';

interface AdminRouteProps {
  children: React.ReactNode;
}

const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  const { isAuthenticated, loading, adminSession } = useAdminAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated || !adminSession?.user) {
    return <Navigate to="/admin/login" replace />;
  }

  return <>{children}</>;
};

export default AdminRoute;

