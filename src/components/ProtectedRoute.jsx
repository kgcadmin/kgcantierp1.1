import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * ProtectedRoute component to enforce role-based access control (RBAC).
 * Now uses useAuth from AuthContext.
 */
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>Checking access...</div>;
  }

  // 1. Check if user is logged in
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 2. Check if role is allowed
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    console.warn(`Access Denied: User role '${user.role}' is not in allowed list [${allowedRoles.join(', ')}]`);
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;
