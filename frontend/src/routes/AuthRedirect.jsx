import React from 'react';
import { Navigate } from 'react-router-dom';
import { getDashboardPathByRole, getStoredUser, isAuthenticated } from '../utils/auth';

const AuthRedirect = () => {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  const user = getStoredUser();
  const redirectPath = getDashboardPathByRole(user?.role);
  return <Navigate to={redirectPath} replace />;
};

export default AuthRedirect;
