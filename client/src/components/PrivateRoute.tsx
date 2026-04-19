import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import Loading from './Loading';
import Login from '../pages/auth/Login';
import apiService from '../services/apiService';

interface PrivateRouteProps {
  children: React.ReactNode;
  role?: 'candidate' | 'employer' | 'admin';
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children, role }) => {
  const { user, token, _hasHydrated, isLoading, setIsLoading, logout } = useAuthStore();
  const location = useLocation();
  const [tokenVerified, setTokenVerified] = useState(false);

  // CRITICAL: Verify token on mount if it exists
  // This hook MUST be called unconditionally (not inside if statement)
  useEffect(() => {
    const verifyToken = async () => {
      // If no token, mark as not loading and not verified
      if (!token) {
        console.log('[PrivateRoute] No token found, skipping verification');
        setIsLoading(false);
        setTokenVerified(true);
        return;
      }

      try {
        console.log('[PrivateRoute] Verifying token with backend...');
        // Call backend verify endpoint
        await apiService.get('/auth/verify-token');
        console.log('[PrivateRoute] Token verified successfully');
        setTokenVerified(true);
        setIsLoading(false);
      } catch (error: any) {
        console.error('[PrivateRoute] Token verification failed:', error.message);
        
        // CRITICAL: If 401, clear token immediately
        if (error.response?.status === 401) {
          console.log('[PrivateRoute] 401 Error - Clearing token');
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('auth-storage');
          logout();
          return;
        }
        
        setTokenVerified(true);
        setIsLoading(false);
      }
    };

    // Only verify if hydrated and we have a token
    if (_hasHydrated && token) {
      verifyToken();
    } else if (_hasHydrated) {
      setTokenVerified(true);
      setIsLoading(false);
    }
  }, [_hasHydrated, token, setIsLoading, logout]);

  // ROUTE GUARD FIX: If no token, return Login component instead of navigate()
  // This prevents browser refresh and redirect loops
  // This check happens AFTER all hooks are called
  if (!token) {
    console.log('[PrivateRoute] No token found - rendering Login component directly');
    return <Login />;
  }

  // Show loading while hydrating or verifying token
  if (!_hasHydrated || isLoading || !tokenVerified) {
    return <Loading fullScreen={true} message="Verifying security credentials..." />;
  }

  // Check if user is authenticated
  if (!user) {
    console.log('[PrivateRoute] No user found - rendering Login component');
    return <Login />;
  }

  // Handle Role-based Authorization
  if (role && user.role?.toLowerCase() !== role.toLowerCase()) {
    const userRole = user.role?.toLowerCase() || 'candidate';
    const fallbackPath = userRole === 'admin' 
      ? '/admin/dashboard' 
      : userRole === 'employer' 
        ? '/employer/dashboard' 
        : '/candidate/dashboard';

    console.warn(`Unauthorized access attempt: User role '${user.role}' tried to access '${role}' route.`);
    
    return <Navigate to={fallbackPath} replace />;
  }

  // Authorized access - Render the protected content
  return <>{children}</>;
};

export default PrivateRoute;