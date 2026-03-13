import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
    RiAlertLine,
    RiTimeLine,
    RiArrowRightUpLine,
    RiBarChartFill,
    RiLineChartLine,
    RiPulseLine,
    RiHistoryLine,
    RiErrorWarningLine
} from 'react-icons/ri';
import api from '../services/api';
import { FaRupeeSign } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import '../styles/dashboard.css';

const COLORS = ['#4f46e5', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4', '#ec4899'];

const Dashboard = () => {
    const [isLive, setIsLive] = useState(true);

    const { data: stats, isLoading, isFetching, isError, error, refetch, dataUpdatedAt } = useQuery({
        queryKey: ['dashboard-stats'],
        queryFn: async () => {
            const response = await api.get(`/dashboard/stats?_t=${Date.now()}`);
            return response.data.data;
        },
        refetchInterval: isLive ? 5000 : false,
        refetchOnWindowFocus: true,
        retry: 1
    });

    const summaryCards = [
        {
            title: "Today's Gross",
            value: stats?.summary?.todaySales !== null ? `₹${(stats?.summary?.todaySales || 0).toLocaleString('en-IN')}` : null,
            icon: FaRupeeSign,
            color: '#10b981',
            trend: `${stats?.summary?.todayOrders || 0} bills today (Total: ${stats?.summary?.debugCount || 0})`
        },
        {
            title: 'Monthly Volume',
            value: stats?.summary?.currentMonthRevenue !== null ? `₹${(stats?.summary?.currentMonthRevenue || 0).toLocaleString('en-IN')}` : null,
            icon: RiBarChartFill,
            color: '#4f46e5',
            trend: `${stats?.summary?.salesGrowth || 0}% Growth`
        },
        {
            title: 'Total Revenue',
            value: stats?.summary?.totalRevenue !== null ? `₹${(stats?.summary?.totalRevenue || 0).toLocaleString('en-IN')}` : null,
            icon: RiPulseLine,
            color: '#06b6d4',
            trend: 'All-time earnings'
        },
        {
            title: 'Total Orders',
            value: stats?.summary?.totalOrdersCount !== null ? (stats?.summary?.totalOrdersCount || 0).toLocaleString('en-IN') : null,
            icon: RiHistoryLine,
            color: '#ec4899',
            trend: 'Lifetime transactions'
        },
        {
            title: 'Inventory Alerts',
            value: (stats?.summary?.lowStockCount || 0) + (stats?.summary?.expiringCount || 0),
            icon: RiAlertLine,
            color: '#f59e0b',
            trend: `${stats?.summary?.lowStockCount || 0} Low | ${stats?.summary?.expiringCount || 0} Expiry`
        },
    ].filter(card => card.value !== null);

    if (isLoading) {
        return (
            <div className="loading-container">
                <div className="neural-spinner"></div>
                <p>Syncing system core...</p>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="dashboard-shell error-state">
                <div className="error-container">
                    <RiErrorWarningLine className="error-icon" />
                    <h2>Sync Interrupted</h2>
                    <p>{error?.response?.data?.message || error.message || 'The neural link to the dashboard has been disconnected.'}</p>
                    <button className="sync-btn" onClick={() => refetch()}>
                        Try Reconnecting
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="dashboard-shell">
            <header className="dashboard-header-flex">
                <div className="header-intel">
                    <h1 className="intel-title">System <span className="highlight">Command</span></h1>
                    <p className="intel-subtitle">Centralized neural hub for real-time operations</p>
                </div>
                <div className="live-status-hub">
                    <div className="status-pill-container">
                        <div className={`status-pill ${isLive ? 'active' : ''}`} onClick={() => setIsLive(!isLive)}>
                            {isFetching && isLive ? <div className="mini-loader"></div> : <RiPulseLine className="pulse-icon" />}
                            <span>{isLive ? 'LIVE SYNC ACTIVE' : 'MANUAL SYNC'}</span>
                        </div>
                    </div>
                    <div className="sync-meta">
                        <small>Updated: {dataUpdatedAt ? new Date(dataUpdatedAt).toLocaleTimeString() : 'Never'}</small>
                    </div>
                    <button className="sync-btn" onClick={() => refetch()} disabled={isFetching}>
                        {isFetching ? 'Updating...' : 'Update Now'}
                    </button>
                </div>
            </header>

            {/* Primary Metrics Grid */}
            <div className="metrics-grid">
                {summaryCards.map((card, i) => (
                    <motion.div
                        key={i}
                        className="metric-card"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                    >
                        <div className="card-top">
                            <div className="card-icon" style={{ color: card.color, background: `${card.color}15` }}>
                                <card.icon />
                            </div>
                            <div className="live-tag" style={{ color: card.color }}>
                                <RiArrowRightUpLine />
                            </div>
                        </div>
                        <h3 className="card-title">{card.title}</h3>
                        <div className="card-value-wrap">
                            <h2 className="card-value">{card.value}</h2>
                        </div>
                        <p className="card-trend">{card.trend}</p>
                        <div className="hover-glow" style={{ background: card.color }}></div>
                    </motion.div>
                ))}
            </div>

            {/* Extended Dashboard Functions */}
            <div className="dashboard-advanced-grid">
                {/* Unique Live Activity Feed */}
                <div className="activity-panel">
                    <div className="panel-header">
                        <RiHistoryLine />
                        <h3>Today's Neural activity</h3>
                        <span className="live-blink"></span>
                    </div>
                    <div className="feed-container">
                        <AnimatePresence mode="popLayout">
                            {stats?.recentActivity?.length > 0 ? (
                                stats.recentActivity.map((sale, i) => (
                                    <motion.div
                                        key={sale._id}
                                        className="feed-entry"
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        layout
                                    >
                                        <div className="entry-time">{new Date(sale.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                        <div className="entry-content">
                                            <span className="entry-invoice">{sale.invoiceNumber}</span>
                                            <span className="entry-details">
                                                {sale.medicines?.map(m => m.medicine?.name).join(', ')}
                                            </span>
                                        </div>
                                        <div className="entry-amount">₹{sale.grandTotal.toLocaleString()}</div>
                                    </motion.div>
                                ))
                            ) : (
                                <motion.div
                                    className="empty-feed-msg"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                >
                                    No sales recorded today yet.
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Dynamic Alert Command center */}
                <div className="alerts-panel">
                    <div className="panel-header">
                        <RiErrorWarningLine />
                        <h3>Critical Logistics</h3>
                    </div>
                    <div className="alerts-split">
                        <div className="alert-section">
                            <h6>LOW STOCK LOGS</h6>
                            <div className="alert-list">
                                {stats?.alerts?.lowStock?.map(item => (
                                    <div key={item._id} className="alert-item warning">
                                        <span>{item.name}</span>
                                        <small>{item.quantity} {item.unit} left</small>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="alert-section">
                            <h6>EXPIRATION LOGS</h6>
                            <div className="alert-list">
                                {stats?.alerts?.expiring?.map(item => (
                                    <div key={item._id} className="alert-item danger">
                                        <span>{item.name}</span>
                                        <small>Exp: {new Date(item.expiryDate).toLocaleDateString()}</small>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Performance Distribution */}
                <div className="distribution-panel">
                    <div className="panel-header">
                        <RiLineChartLine />
                        <h3>Store Distribution</h3>
                    </div>
                    <div className="dist-list">
                        {stats?.storeWiseRevenue?.map((store, idx) => (
                            <div key={idx} className="dist-item">
                                <div className="dist-info">
                                    <span className="dist-name">{store._id || 'Primary Branch'}</span>
                                    <div className="prog-bar-wrap">
                                        <motion.div
                                            className="prog-bar"
                                            initial={{ width: 0 }}
                                            animate={{ width: `${(store.revenue / (stats.summary.totalRevenue || 1)) * 100}%` }}
                                            style={{ background: COLORS[idx % COLORS.length] }}
                                        ></motion.div>
                                    </div>
                                </div>
                                <span className="dist-val">₹{store.revenue.toLocaleString()}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
