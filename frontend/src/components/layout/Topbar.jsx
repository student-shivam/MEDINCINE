import React, { useMemo, useState } from 'react';
import { RiNotification3Line, RiShoppingCart2Line } from 'react-icons/ri';
import { useNavigate, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../../services/api';
import { useCart } from '../../context/CartContext';

const PAGE_TITLES = {
    '/admin/dashboard': 'Dashboard',
    '/admin/medicines': 'Medicines',
    '/admin/add-medicine': 'Add Medicine',
    '/pos': 'POS',
    '/admin/sales': 'Sales Records',
    '/admin/staff': 'Staff',
    '/admin/reports': 'Reports',
    '/settings': 'Settings',
};

const Topbar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [search, setSearch] = useState('');

    // Fetch user info for the topbar
    const { data: apiUser } = useQuery({
        queryKey: ['user-profile'],
        queryFn: async () => {
            try {
                const response = await api.get('/auth/me');
                return response.data.data;
            } catch {
                return null;
            }
        }
    });

    // Fallback to localStorage user if API user is not yet available
    const localUser = JSON.parse(localStorage.getItem('user') || '{}');
    const user = apiUser || localUser;

    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    const profileImage = user?.profileImage || user?.avatar;
    const avatarUrl = profileImage && profileImage !== 'default-avatar.png'
        ? `${baseUrl.replace('/api', '')}/uploads/${profileImage}`
        : null;

    const pageTitle = useMemo(() => {
        // Try exact match first, then fallback to a best-guess title
        const exact = PAGE_TITLES[location.pathname];
        if (exact) return exact;

        if (location.pathname.startsWith('/admin/')) {
            const segment = location.pathname.replace('/admin/', '').split('/')[0];
            return segment ? segment.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) : 'Dashboard';
        }
        if (location.pathname === '/pos') return 'POS';
        if (location.pathname === '/login') return 'Login';
        if (location.pathname === '/signup') return 'Sign Up';
        return 'Medicine System';
    }, [location.pathname]);

    const { itemCount } = useCart();

    const showSearch = location.pathname !== '/pos';

    return (
        <header className="topbar">
            <div className="topbar-left">
                <div className="topbar-title">
                    <span className="topbar-title-main">{pageTitle}</span>
                </div>

                {showSearch && (
                    <div className="topbar-search-wrapper">
                        <input
                            className="premium-search-input"
                            placeholder="Search medicines, users, etc."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                )}
            </div>

            <div className="topbar-right">
                <button className="icon-btn" type="button">
                    <RiNotification3Line size={20} />
                </button>

                <button className="icon-btn cart-btn" type="button" onClick={() => navigate('/cart')}>
                    <RiShoppingCart2Line size={20} />
                    {itemCount > 0 && <span className="cart-badge">{itemCount}</span>}
                </button>

                <button type="button" className="user-profile-trigger" onClick={() => navigate('/profile')}>
                    {avatarUrl ? (
                        <img src={avatarUrl} alt="Avatar" className="user-avatar-small" />
                    ) : (
                        <div className="user-avatar-fallback">
                            {user?.name?.charAt(0).toUpperCase() || 'A'}
                        </div>
                    )}
                </button>
            </div>
        </header>
    );
};

export default Topbar;
