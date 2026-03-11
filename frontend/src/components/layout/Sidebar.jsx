import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { RiDashboardFill, RiMedicineBottleLine, RiAddCircleLine, RiUserLine, RiSettings4Line, RiBarChartFill, RiShoppingCartLine, RiLogoutBoxRLine } from 'react-icons/ri';
import { GiMedicinePills } from 'react-icons/gi';
import { useQuery } from '@tanstack/react-query';
import api from '../../services/api';
import { clearAuthSession } from '../../utils/auth';

const Sidebar = () => {
    const navigate = useNavigate();
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
    const user = (apiUser && Object.keys(apiUser).length > 0) ? apiUser : localUser;

    const userRole = (user?.role || '').toLowerCase();
    const isAdmin = userRole === 'admin';

    const handleLogout = () => {
        clearAuthSession();
        navigate('/login', { replace: true });
    };

    return (
        <aside className="sidebar">
            <div className="sidebar-logo">
                <div style={{ background: 'var(--primary)', padding: '8px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow-glow)' }}>
                    <GiMedicinePills size={28} color="white" />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '1.4rem', lineHeight: 1 }}>Medicine</span>
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-soft)', letterSpacing: '1px', textTransform: 'uppercase', marginTop: '4px' }}>Pharmacy System</span>
                </div>
            </div>

            <nav className="sidebar-menu">
                {isAdmin ? (
                    <>
                        <NavLink to="/admin/dashboard" className={({ isActive }) => isActive ? 'menu-item active' : 'menu-item'}>
                            <RiDashboardFill />
                            <span>Dashboard</span>
                        </NavLink>

                        <NavLink to="/admin/medicines" className={({ isActive }) => isActive ? 'menu-item active' : 'menu-item'}>
                            <RiMedicineBottleLine />
                            <span>Medicines</span>
                        </NavLink>

                        <NavLink to="/admin/add-medicine" className={({ isActive }) => isActive ? 'menu-item active' : 'menu-item'}>
                            <RiAddCircleLine />
                            <span>Add Medicine</span>
                        </NavLink>

                        <NavLink to="/pos" className={({ isActive }) => isActive ? 'menu-item active' : 'menu-item'}>
                            <RiShoppingCartLine />
                            <span>POS</span>
                        </NavLink>

                        <NavLink to="/admin/sales" className={({ isActive }) => isActive ? 'menu-item active' : 'menu-item'}>
                            <RiShoppingCartLine />
                            <span>Sales</span>
                        </NavLink>

                        <NavLink to="/admin/staff" className={({ isActive }) => isActive ? 'menu-item active' : 'menu-item'}>
                            <RiUserLine />
                            <span>Staff</span>
                        </NavLink>

                        <NavLink to="/admin/reports" className={({ isActive }) => isActive ? 'menu-item active' : 'menu-item'}>
                            <RiBarChartFill />
                            <span>Reports</span>
                        </NavLink>
                    </>
                ) : (
                    <NavLink to="/pos" className={({ isActive }) => isActive ? 'menu-item active' : 'menu-item'}>
                        <RiShoppingCartLine />
                        <span>POS</span>
                    </NavLink>
                )}

                <NavLink to="/settings" className={({ isActive }) => isActive ? 'menu-item active' : 'menu-item'}>
                    <RiSettings4Line />
                    <span>Settings</span>
                </NavLink>

                <button type="button" className="menu-item menu-item-btn" onClick={handleLogout}>
                    <RiLogoutBoxRLine />
                    <span>Logout</span>
                </button>
            </nav>
        </aside>
    );
};

export default Sidebar;
