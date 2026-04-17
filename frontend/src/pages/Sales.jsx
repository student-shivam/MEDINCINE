import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../services/api';
import {
    RiDownloadLine,
    RiSearchLine,
    RiFileTextLine,
    RiCalendarLine,
    RiArrowLeftSLine,
    RiArrowRightSLine,
} from 'react-icons/ri';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const Sales = () => {
    const [invoiceSearch, setInvoiceSearch] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [page, setPage] = useState(1);
    const limit = 10;

    const { data, isLoading, isError, error } = useQuery({
        queryKey: ['sales-records', invoiceSearch, startDate, endDate, page],
        queryFn: async () => {
            const params = {
                page,
                limit,
                invoiceNumber: invoiceSearch,
                startDate,
                endDate,
            };
            const response = await api.get('/sales', { params });
            return response.data;
        },
    });

    const sales = data?.data || [];
    const pagination = data?.pagination || {};

    const handleDownload = async (id, invoiceNumber) => {
        try {
            const response = await api.get(`/sales/${id}/pdf`, {
                responseType: 'blob',
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `invoice-${invoiceNumber}.pdf`);
            document.body.appendChild(link);
            link.click();
            toast.success('Downloading invoice...');
        } catch {
            toast.error('Failed to download invoice');
        }
    };

    if (isLoading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
                <p style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>Loading sales...</p>
            </div>
        );
    }

    if (isError) {
        return <div className="error-container">Could not load sales: {error?.message}</div>;
    }

    return (
        <div className="sales-page fade-in">
            <div className="page-header sales-page-header">
                <div className="sales-page-header-copy">
                    <h1 className="sales-page-title">Sales</h1>
                    <p className="sales-page-subtitle">View and manage all medicine sales</p>
                </div>
            </div>

            <div className="premium-filter-strip sales-filter-strip">
                <div className="premium-search-box sales-search-box">
                    <RiSearchLine className="search-box-icon" />
                    <input
                        type="text"
                        placeholder="Search by invoice number"
                        className="premium-search-input"
                        value={invoiceSearch}
                        onChange={(e) => {
                            setInvoiceSearch(e.target.value);
                            setPage(1);
                        }}
                    />
                </div>

                <div className="filter-group sales-filter-group">
                    <div className="premium-search-box sales-date-box">
                        <RiCalendarLine className="search-box-icon" />
                        <input
                            type="date"
                            className="premium-search-input sales-date-input"
                            value={startDate}
                            onChange={(e) => {
                                setStartDate(e.target.value);
                                setPage(1);
                            }}
                        />
                    </div>

                    <span className="sales-filter-separator">to</span>

                    <div className="premium-search-box sales-date-box">
                        <RiCalendarLine className="search-box-icon" />
                        <input
                            type="date"
                            className="premium-search-input sales-date-input"
                            value={endDate}
                            onChange={(e) => {
                                setEndDate(e.target.value);
                                setPage(1);
                            }}
                        />
                    </div>
                </div>
            </div>

            <div className="premium-table-container checkout-card sales-table-shell">
                <div className="sales-table-wrap">
                    <table className="premium-table sales-table">
                        <thead>
                            <tr className="sales-table-head-row">
                                <th>Invoice</th>
                                <th>Items</th>
                                <th>Total Amount</th>
                                <th>Context</th>
                                <th className="sales-actions-head">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sales.length > 0 ? (
                                sales.map((sale) => (
                                    <tr key={sale._id} className="sales-row">
                                        <td data-label="Invoice" className="sales-cell">
                                            <div className="sales-invoice-number">#{sale.invoiceNumber}</div>
                                            <div className="sales-invoice-date">
                                                <RiCalendarLine size={12} color="var(--text-soft)" />
                                                <span className="sales-invoice-date-text">
                                                    {new Date(sale.createdAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </td>

                                        <td data-label="Items" className="sales-cell">
                                            <div className="sales-items-list">
                                                {sale.medicines.map((item, index) => (
                                                    <div key={index} className="sales-item-chip">
                                                        {item.medicine?.name}
                                                        <span className="sales-item-chip-qty">x{item.quantity}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </td>

                                        <td data-label="Total Amount" className="sales-cell">
                                            <div className="sales-total-amount">
                                                Rs. {(sale.grandTotal || 0).toLocaleString()}
                                            </div>
                                        </td>

                                        <td data-label="Context" className="sales-cell">
                                            <div className="sales-context-block">
                                                <span className="sales-context-user">{sale.soldBy?.name || 'Public Kiosk'}</span>
                                                <span className="sales-context-meta">
                                                    {sale.paymentMethod || 'Cash'} | {sale.storeId || 'Main Store'}
                                                </span>
                                            </div>
                                        </td>

                                        <td data-label="Actions" className="sales-cell sales-actions-cell">
                                            <div className="sales-actions">
                                                <Link
                                                    to={`/invoice/${sale._id}`}
                                                    className="icon-btn sales-action-btn sales-action-btn--view"
                                                    title="View Bill"
                                                >
                                                    <RiFileTextLine size={20} />
                                                </Link>
                                                <button
                                                    onClick={() => handleDownload(sale._id, sale.invoiceNumber)}
                                                    className="icon-btn sales-action-btn sales-action-btn--download"
                                                    title="Download PDF"
                                                >
                                                    <RiDownloadLine size={20} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="sales-empty-cell">
                                        <div className="sales-empty-state">
                                            <div className="sales-empty-icon">
                                                <RiSearchLine size={48} opacity={0.3} />
                                            </div>
                                            <div>
                                                <p className="sales-empty-title">No Records Found</p>
                                                <p className="sales-empty-subtitle">Try adjusting your search or date filters</p>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {pagination.pages > 1 && (
                <div className="premium-pagination">
                    <button
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="pagination-btn"
                    >
                        <RiArrowLeftSLine /> Previous
                    </button>
                    <div className="pagination-info">
                        Page <strong>{page}</strong> of <strong>{pagination.pages}</strong>
                    </div>
                    <button
                        onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
                        disabled={page === pagination.pages}
                        className="pagination-btn"
                    >
                        Next <RiArrowRightSLine />
                    </button>
                </div>
            )}
        </div>
    );
};

export default Sales;
