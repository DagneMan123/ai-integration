import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import Loading from './Loading';
import Login from '../pages/auth/Login';

interface PrivateRouteProps {
  children: React.ReactNode;
  role?: 'candidate' | 'employer' | 'admin';
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children, role }) => {
  const { user, token, _hasHydrated } = useAuthStore();
  const [isVerifying, setIsVerifying] = useState(false);

  // Call all hooks unconditionally at the top
  useEffect(() => {
    console.log('[PrivateRoute] Mounted - token:', token ? 'exists' : 'missing');
  }, [token]);

  // STEP 2: AUTH GUARD FIX - If token is missing, return Login component directly
  // This stops the browser from reloading the entire page
  if (!token) {
    console.log('[PrivateRoute] No token found - rendering Login component directly (no navigation)');
    return <Login />;
  }

  // Show loading while hydrating
  if (!_hasHydrated) {
    return <Loading fullScreen={true} message="Verifying security credentials..." />;
  }

  // Check if user is authenticated
  if (!user) {
    console.log('[PrivateRoute] No user found - rendering Login component directly');
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