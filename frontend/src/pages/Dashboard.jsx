import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
    RiAlertLine,
    RiTimeLine,
    RiArrowRightUpLine,
    RiBarChartFill,
    RiLineChartLine
} from 'react-icons/ri';
import api from '../services/api';
import { FaRupeeSign } from 'react-icons/fa';

const COLORS = ['#2563eb', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4', '#ec4899'];

const Dashboard = () => {
    const { data: stats, isLoading } = useQuery({
        queryKey: ['dashboard-stats'],
        queryFn: async () => {
            const response = await api.get('/dashboard/stats');
            return response.data.data;
        }
    });

    const summaryCards = [
        { title: 'Today\'s Sales', value: stats?.summary?.todaySales !== null ? `₹${(stats?.summary?.todaySales || 0).toLocaleString('en-IN')}` : null, icon: FaRupeeSign, color: '#10b981', bg: 'rgba(16,185,129,0.1)', trend: `${stats?.summary?.todayOrders || 0} bills today` },
        { title: 'Monthly Revenue', value: stats?.summary?.currentMonthRevenue !== null ? `₹${(stats?.summary?.currentMonthRevenue || 0).toLocaleString('en-IN')}` : null, icon: RiBarChartFill, color: '#2563eb', bg: 'rgba(37,99,235,0.1)', trend: `${stats?.summary?.salesGrowth || 0}% from last month` },
        { title: 'Total Profit', value: stats?.summary?.totalProfit !== null ? `₹${(stats?.summary?.totalProfit || 0).toLocaleString('en-IN')}` : null, icon: RiLineChartLine, color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)', trend: 'Overall profit' },
        { title: 'Low Stock', value: stats?.summary?.lowStockCount, icon: RiAlertLine, color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', trend: 'Needs attention' },
        { title: 'Expiring Soon', value: stats?.summary?.expiringCount, icon: RiTimeLine, color: '#ef4444', bg: 'rgba(239,68,68,0.1)', trend: 'Within 30 days' },
    ].filter(card => card.value !== null);

    if (isLoading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
                <p style={{ color: 'var(--text-muted)', marginTop: '1rem' }}>Loading dashboard...</p>
            </div>
        );
    }

    return (
        <div className="dashboard-wrapper">
            <div style={{ marginBottom: '3rem', animation: 'fadeInDown 0.6s ease-out' }}>
                <h1 style={{ fontSize: 'var(--fs-4xl)', fontWeight: 900, color: 'var(--text-main)', letterSpacing: '-1.5px', marginBottom: '0.5rem' }}>
                    Dashboard <span style={{ color: 'var(--primary)' }}>Overview</span>
                </h1>
                <p style={{ color: 'var(--text-soft)', fontSize: 'var(--fs-lg)', fontWeight: 500 }}>
                    Track sales and medicine stock in real time
                </p>
            </div>

            <div className="dashboard-grid">
                {summaryCards.map((card, i) => (
                    <div key={i} className="stats-card" style={{ animation: `fadeInUp 0.5s ease-out ${i * 0.1}s backwards` }}>
                        <div className="stats-card-header">
                            <div className="stats-icon-box" style={{ backgroundColor: card.bg }}>
                                <card.icon size={24} color={card.color} />
                            </div>
                            <div className="stats-live-badge" style={{ color: card.color }}>
                                <RiArrowRightUpLine size={12} /><span>Live</span>
                            </div>
                        </div>
                        <p className="stats-card-title">{card.title}</p>
                        <h2 className="stats-card-value">{card.value}</h2>
                        <p className="stats-card-trend">{card.trend}</p>
                        <div className="stats-card-glow" style={{ backgroundColor: card.color }}></div>
                    </div>
                ))}
            </div>

            <div className="charts-grid">
                <div className="chart-card">
                    <h3 className="chart-header">Top Selling Medicines</h3>
                    <div className="top-selling-list">
                        {stats?.topSelling?.length > 0 ? (
                            stats.topSelling.map((med, idx) => (
                                <div key={idx} className="top-selling-item">
                                    <div className="med-info">
                                        <span className="med-name">{med.name}</span>
                                        <span className="med-sold">{med.totalSold} units sold</span>
                                    </div>
                                    <span className="med-revenue">₹{med.revenue.toLocaleString()}</span>
                                </div>
                            ))
                        ) : (
                            <div className="empty-chart-state"><p>No sales yet.</p></div>
                        )}
                    </div>
                </div>

                <div className="chart-card">
                    <h3 className="chart-header">Sales by Store</h3>
                    <div className="store-revenue-list">
                        {stats?.storeWiseRevenue?.length > 0 ? (
                            stats.storeWiseRevenue.map((store, idx) => (
                                <div key={idx} className="store-item">
                                    <div className="store-info">
                                        <span className="store-name">{store._id || 'Unassigned'}</span>
                                        <div className="revenue-bar-wrapper">
                                            <div
                                                className="revenue-bar"
                                                style={{
                                                    width: `${(store.revenue / stats.summary.totalRevenue) * 100}%`,
                                                    backgroundColor: COLORS[idx % COLORS.length]
                                                }}
                                            ></div>
                                        </div>
                                    </div>
                                    <span className="store-val">₹{store.revenue.toLocaleString()}</span>
                                </div>
                            ))
                        ) : (
                            <div className="empty-chart-state"><p>No store sales data yet.</p></div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;


