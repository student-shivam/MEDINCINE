import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { getAuthToken, getDashboardPathByRole, getStoredUser } from '../utils/auth';

/**
 * ProtectedRoute component - Production ready
 * 
 * Requirements:
 * - Checks for JWT token in localStorage
 * - Redirects to "/login" if not authenticated
 * - Renders child routes if token exists
 */
const ProtectedRoute = ({ children, roles = [] }) => {
    const token = getAuthToken();
    const user = getStoredUser();
    const userRole = (user?.role || '').toLowerCase();

    if (!token) {
        return <Navigate to="/login" replace />;
    }

    if (roles.length > 0 && !roles.includes(userRole)) {
        const redirectPath = getDashboardPathByRole(userRole);
        return <Navigate to={redirectPath} replace />;
    }

    return children ? children : <Outlet />;
};

export default ProtectedRoute;
