import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { RiArrowRightUpLine, RiUserLine, RiShoppingCartLine, RiDashboardLine } from 'react-icons/ri';
import { getDashboardPathByRole, getStoredUser, isAuthenticated } from '../../utils/auth';

const PublicNavbar = () => {
    const navigate = useNavigate();
    const hasAuth = isAuthenticated();
    const user = getStoredUser();
    const dashboardPath = getDashboardPathByRole(user?.role);

    return (
        <nav className="public-navbar">
            <div className="public-nav-container">
                <Link to="/pos" className="public-nav-logo">
                    <RiArrowRightUpLine size={28} />
                    <span>Medicine</span>
                </Link>

                <div className="public-nav-actions">
                    <Link to="/pos" className="nav-link">
                        <RiShoppingCartLine /> Billing
                    </Link>
                    {hasAuth ? (
                        <button
                            onClick={() => navigate(dashboardPath)}
                            className="public-login-btn"
                        >
                            <RiDashboardLine /> Dashboard
                        </button>
                    ) : (
                        <button
                            onClick={() => navigate('/login')}
                            className="public-login-btn"
                        >
                            <RiUserLine /> Login
                        </button>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default PublicNavbar;
