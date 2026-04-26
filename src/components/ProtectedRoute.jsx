import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';

/**
 * ProtectedRoute component to enforce role-based access control (RBAC).
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - The component to render if authorized.
 * @param {Array<string>} [props.allowedRoles] - Roles permitted to access this route. If empty, all logged-in users are allowed.
 */
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { currentUser } = useContext(AppContext);

  // 1. Check if user is logged in
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  // 2. Check if role is allowed
  if (allowedRoles.length > 0 && !allowedRoles.includes(currentUser.role)) {
    console.warn(`Access Denied: User role '${currentUser.role}' is not in allowed list [${allowedRoles.join(', ')}]`);
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;
