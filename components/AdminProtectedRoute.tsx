
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface AdminProtectedRouteProps {
  children: React.ReactElement;
}

const AdminProtectedRoute: React.FC<AdminProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Redirect if the user is authenticated but not an admin
  if (!user?.isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default AdminProtectedRoute;
