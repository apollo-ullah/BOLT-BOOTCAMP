import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../ui/LoadingSpinner';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: ('consultant' | 'pm' | 'partner')[];
  redirectTo?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  allowedRoles,
  redirectTo = '/login'
}) => {
  const { user, userProfile, loading } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking authentication
  if (loading) {
    return <LoadingSpinner size="lg" />;
  }

  // Not authenticated - redirect to login
  if (!user) {
    return (
      <Navigate 
        to={redirectTo} 
        state={{ from: location.pathname }} 
        replace 
      />
    );
  }

  // Check role-based access if roles are specified
  if (allowedRoles && allowedRoles.length > 0) {
    // Wait for user profile to load
    if (!userProfile) {
      return <LoadingSpinner size="lg" />;
    }

    // Not authorized for this route
    if (!allowedRoles.includes(userProfile.role)) {
      console.warn(
        `Access denied: User role '${userProfile.role}' not in allowed roles:`,
        allowedRoles
      );
      return (
        <Navigate 
          to="/" 
          state={{ 
            error: "You don't have permission to access this page",
            from: location.pathname 
          }} 
          replace 
        />
      );
    }
  }

  // Render protected content
  return <>{children}</>;
};

export default ProtectedRoute; 