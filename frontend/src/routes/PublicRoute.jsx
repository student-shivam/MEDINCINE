import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { getDashboardPathByRole, getStoredUser, isAuthenticated } from '../utils/auth';

const PublicRoute = ({ children }) => {
  if (isAuthenticated()) {
    const user = getStoredUser();
    const redirectPath = getDashboardPathByRole(user?.role);
    return <Navigate to={redirectPath} replace />;
  }

  return children ? children : <Outlet />;
};

export default PublicRoute;
