import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AppContext';
import { Permissions } from '../types';

interface ProtectedRouteProps {
  children?: React.ReactElement;
  requiredPermission?: keyof Permissions;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredPermission }) => {
  const { loggedInUser } = useAuth();

  if (!loggedInUser) {
    // Redirect to login page if not authenticated
    return <Navigate to="/login" replace />;
  }
  
  if (requiredPermission && !loggedInUser.permissions[requiredPermission]) {
      // Optional: Redirect to an unauthorized page or dashboard if permission is missing
      // For simplicity, we'll redirect to the dashboard.
      return <Navigate to="/" replace />;
  }

  return children ? children : <Outlet />;
};
