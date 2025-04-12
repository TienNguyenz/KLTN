import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ProtectedRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  // 1. Wait until authentication status is determined
  if (loading) {
    // You might want to show a loading spinner here instead of null
    return <div>Kiểm tra quyền truy cập...</div>;
  }

  // 2. If user is not logged in, redirect to login page
  //    Remember the location they were trying to go to.
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 3. If roles are specified and user's role is not included, redirect to unauthorized page or home
  //    Make sure roles are compared consistently (e.g., lowercase)
  if (roles && roles.length > 0 && !roles.includes(user.role.toLowerCase())) {
    // Option 1: Redirect to a dedicated "Unauthorized" page (if you create one)
    // return <Navigate to="/unauthorized" replace />;
    
    // Option 2: Redirect to home page
    return <Navigate to="/" replace />;
  }

  // 4. If user is logged in and has the correct role (or no specific role is required), render the children
  return children;
};

export default ProtectedRoute; 