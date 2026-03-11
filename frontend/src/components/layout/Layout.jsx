import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import '../../styles/layout.css';

const Layout = ({ children }) => {
    return (
        <div className="admin-layout">
            <Sidebar />
            <div className="main-content">
                <Topbar />
                <main className="page-container">
                    {children || <Outlet />}
                </main>
            </div>
        </div>
    );
};

export default Layout;
