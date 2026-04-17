import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { RiDashboardFill, RiMedicineBottleLine, RiAddCircleLine, RiUserLine, RiSettings4Line, RiBarChartFill, RiShoppingCartLine, RiLogoutBoxRLine, RiHistoryLine, RiTeamLine, RiCloseFill } from 'react-icons/ri';
import { GiMedicinePills } from 'react-icons/gi';
import { useQuery } from '@tanstack/react-query';
import api from '../../services/api';
import { clearAuthSession } from '../../utils/auth';

const Sidebar = ({ isOpen, closeSidebar }) => {
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
    const isPharmacist = userRole === 'pharmacist';
    const canViewSales = isAdmin || isPharmacist;

    const handleLogout = () => {
        clearAuthSession();
        navigate('/login', { replace: true });
    };

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && <div className="sidebar-overlay" onClick={closeSidebar}></div>}

            <aside className={`sidebar ${isOpen ? 'sidebar--open' : ''}`}>
                <div className="sidebar-header">
                    <div className="sidebar-logo">
                        <div className="logo-icon-wrapper">
                            <GiMedicinePills size={28} color="white" />
                        </div>
                        <div className="logo-text-wrapper">
                            <span className="logo-main">Medicine</span>
                            <span className="logo-sub">Pharmacy System</span>
                        </div>
                    </div>
                    <button className="sidebar-close-btn" onClick={closeSidebar}>
                        <RiCloseFill size={24} />
                    </button>
                </div>

                <nav className="sidebar-menu">
                    {isAdmin ? (
                        <>
                            <NavLink to="/admin/dashboard" className={({ isActive }) => isActive ? 'menu-item active' : 'menu-item'} onClick={() => window.innerWidth < 1024 && closeSidebar()}>
                                <RiDashboardFill />
                                <span>Dashboard</span>
                            </NavLink>

                            <NavLink to="/admin/medicines" className={({ isActive }) => isActive ? 'menu-item active' : 'menu-item'} onClick={() => window.innerWidth < 1024 && closeSidebar()}>
                                <RiMedicineBottleLine />
                                <span>Medicines</span>
                            </NavLink>

                            <NavLink to="/admin/add-medicine" className={({ isActive }) => isActive ? 'menu-item active' : 'menu-item'} onClick={() => window.innerWidth < 1024 && closeSidebar()}>
                                <RiAddCircleLine />
                                <span>Add Medicine</span>
                            </NavLink>

                            <NavLink to="/pos" className={({ isActive }) => isActive ? 'menu-item active' : 'menu-item'} onClick={() => window.innerWidth < 1024 && closeSidebar()}>
                                <RiShoppingCartLine />
                                <span>POS</span>
                            </NavLink>

                            {canViewSales && (
                                <NavLink to="/admin/sales" className={({ isActive }) => isActive ? 'menu-item active' : 'menu-item'} onClick={() => window.innerWidth < 1024 && closeSidebar()}>
                                    <RiHistoryLine />
                                    <span>Sales Records</span>
                                </NavLink>
                            )}

                            {isAdmin && (
                                <>
                                    <NavLink to="/admin/staff" className={({ isActive }) => isActive ? 'menu-item active' : 'menu-item'} onClick={() => window.innerWidth < 1024 && closeSidebar()}>
                                        <RiTeamLine />
                                        <span>Staff</span>
                                    </NavLink>

                                    <NavLink to="/admin/reports" className={({ isActive }) => isActive ? 'menu-item active' : 'menu-item'} onClick={() => window.innerWidth < 1024 && closeSidebar()}>
                                        <RiBarChartFill />
                                        <span>Reports</span>
                                    </NavLink>
                                </>
                            )}
                        </>
                    ) : (
                        <>
                            <NavLink to="/pos" className={({ isActive }) => isActive ? 'menu-item active' : 'menu-item'} onClick={() => window.innerWidth < 1024 && closeSidebar()}>
                                <RiShoppingCartLine />
                                <span>POS</span>
                            </NavLink>
                            {isPharmacist && (
                                <NavLink to="/admin/sales" className={({ isActive }) => isActive ? 'menu-item active' : 'menu-item'} onClick={() => window.innerWidth < 1024 && closeSidebar()}>
                                    <RiHistoryLine />
                                    <span>Sales Records</span>
                                </NavLink>
                            )}
                        </>
                    )}

                    <NavLink to="/settings" className={({ isActive }) => isActive ? 'menu-item active' : 'menu-item'} onClick={() => window.innerWidth < 1024 && closeSidebar()}>
                        <RiSettings4Line />
                        <span>Settings</span>
                    </NavLink>

                    <button type="button" className="menu-item menu-item-btn" onClick={handleLogout}>
                        <RiLogoutBoxRLine />
                        <span>Logout</span>
                    </button>
                </nav>
            </aside>
        </>
    );
};

export default Sidebar;
