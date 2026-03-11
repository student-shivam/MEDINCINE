import React from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../services/api';
import { RiMoneyDollarCircleLine, RiLineChartLine, RiHandCoinLine, RiHistoryLine } from 'react-icons/ri';

const Analytics = () => {
    const { data: stats, isLoading, error } = useQuery({
        queryKey: ['sales-analytics'],
        queryFn: async () => {
            const response = await api.get('/sales/analytics');
            return response.data.data;
        }
    });

    if (isLoading) return <div className="loading-spinner">Loading reports...</div>;
    if (error) return <div className="error-message">Could not load reports: {error.message}</div>;
    const safeStats = {
        totalRevenue: stats?.totalRevenue || 0,
        totalCost: stats?.totalCost || 0,
        totalProfit: stats?.totalProfit || 0,
        totalTransactions: stats?.totalTransactions || 0,
    };

    return (
        <div className="page-container">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Sales Reports</h1>
                    <p className="page-subtitle">Track sales, cost, and profit</p>
                </div>
            </div>

            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon-wrapper revenue">
                        <RiMoneyDollarCircleLine size={24} />
                    </div>
                    <div className="stat-content">
                        <span className="stat-label">Total Sales</span>
                        <h2 className="stat-value">Rs {safeStats.totalRevenue.toFixed(2)}</h2>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon-wrapper stocks">
                        <RiHandCoinLine size={24} />
                    </div>
                    <div className="stat-content">
                        <span className="stat-label">Total Cost</span>
                        <h2 className="stat-value">Rs {safeStats.totalCost.toFixed(2)}</h2>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon-wrapper expiry">
                        <RiLineChartLine size={24} />
                    </div>
                    <div className="stat-content">
                        <span className="stat-label">Total Profit</span>
                        <h2 className="stat-value" style={{ color: safeStats.totalProfit >= 0 ? 'var(--success)' : 'var(--error)' }}>
                            Rs {safeStats.totalProfit.toFixed(2)}
                        </h2>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon-wrapper">
                        <RiHistoryLine size={24} />
                    </div>
                    <div className="stat-content">
                        <span className="stat-label">Total Bills</span>
                        <h2 className="stat-value">{safeStats.totalTransactions}</h2>
                    </div>
                </div>
            </div>

  
            
        </div>
    );
};

export default Analytics;

