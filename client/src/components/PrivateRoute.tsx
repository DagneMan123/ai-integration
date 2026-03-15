import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import Loading from './Loading'; 

interface PrivateRouteProps {
  children: React.ReactNode;
  role?: 'candidate' | 'employer' | 'admin';
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children, role }) => {
  const { user, token, _hasHydrated } = useAuthStore();
  const location = useLocation();

  // Wait for auth store to hydrate from localStorage
  if (!_hasHydrated) {
    return <Loading fullScreen={true} message="Verifying security credentials..." />;
  }

  // Check if user is authenticated
  if (!token || !user) {
    return (
      <Navigate 
        to="/login" 
        state={{ from: location }} 
        replace 
      />
    );
  }

  // Handle Role-based Authorization
  if (role && user.role !== role) {
    const fallbackPath = user.role === 'admin' 
      ? '/admin/dashboard' 
      : user.role === 'employer' 
        ? '/employer/dashboard' 
        : '/candidate/dashboard';

    console.warn(`Unauthorized access attempt: User role '${user.role}' tried to access '${role}' route.`);
    
    return <Navigate to={fallbackPath} replace />;
  }

  // Authorized access - Render the protected content
  return <>{children}</>;
};

export default PrivateRoute;