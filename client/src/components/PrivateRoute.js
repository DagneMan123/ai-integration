import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

const PrivateRoute = ({ children, role }) => {
  const { user, token } = useAuthStore();

  if (!token || !user) {
    return <Navigate to="/login" />;
  }

  if (role && user.role !== role) {
    return <Navigate to={`/${user.role}/dashboard`} />;
  }

  return children;
};

export default PrivateRoute;
