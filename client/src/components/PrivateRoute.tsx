import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import Loading from './Loading'; // ቀደም ብለን የሰራነው Loading component

interface PrivateRouteProps {
  children: React.ReactNode;
  role?: 'candidate' | 'employer' | 'admin';
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children, role }) => {
  const { user, token, isInitialized } = useAuthStore();
  const location = useLocation();

  // 1. Show a professional loading screen while checking auth status
  // isInitialized የሚለውን ፕሮፕ በ authStore ውስጥ እንዳለህ እርግጠኛ ሁን
  if (!isInitialized) {
    return <Loading fullScreen={true} message="Verifying security credentials..." />;
  }

  // 2. Redirect to Login if no token or user exists
  // We save the 'from' location so we can redirect back after login
  if (!token || !user) {
    return (
      <Navigate 
        to="/login" 
        state={{ from: location }} 
        replace 
      />
    );
  }

  // 3. Handle Role-based Authorization
  // If the user's role doesn't match the required role, send them to their dashboard
  if (role && user.role !== role) {
    // Determine the safe fallback dashboard
    const fallbackPath = user.role === 'admin' 
      ? '/admin/dashboard' 
      : user.role === 'employer' 
        ? '/employer/dashboard' 
        : '/candidate/dashboard';

    console.warn(`Unauthorized access attempt: User role '${user.role}' tried to access '${role}' route.`);
    
    return <Navigate to={fallbackPath} replace />;
  }

  // 4. Authorized access - Render the protected content
  return <>{children}</>;
};

export default PrivateRoute;