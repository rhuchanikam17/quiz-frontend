import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx'; // Added .jsx extension

// This component takes the required 'role' as a prop
const ProtectedRoute = ({ role }) => {
  const { user, isAuthenticated } = useAuth();

  // 1. Check if user is authenticated
  if (!isAuthenticated) {
    // Not logged in, redirect to login page
    return <Navigate to="/login" replace />;
  }

  // 2. Check if the route requires a specific role
  //    and if the user has that role
  if (role && user.role !== role) {
    // User has wrong role, redirect to their default dashboard
    let dashboardPath = '/dashboard'; // Student dashboard
    if (user.role === 'admin') dashboardPath = '/admin-dashboard';
    if (user.role === 'teacher') dashboardPath = '/teacher-dashboard';
    
    return <Navigate to={dashboardPath} replace />;
  }

  // 3. If all checks pass, render the child component (the page)
  return <Outlet />;
};

export default ProtectedRoute;


