import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../services/api';
import { RiDownloadLine, RiSearchLine, RiFileTextLine, RiCalendarLine, RiArrowLeftSLine, RiArrowRightSLine } from 'react-icons/ri';
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
                endDate
            };
            const response = await api.get('/sales', { params });
            return response.data;
        }
    });

    const sales = data?.data || [];
    const pagination = data?.pagination || {};

    const handleDownload = async (id, invoiceNumber) => {
        try {
            const response = await api.get(`/sales/${id}/pdf`, {
                responseType: 'blob'
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
        <div className="page-container" style={{ padding: '2.5rem' }}>
            <div className="page-header" style={{ marginBottom: '2.5rem' }}>
                <div>
                    <h1 className="stats-card-value" style={{ fontSize: '2.5rem', color: 'var(--text-main)', margin: 0, letterSpacing: '-1px' }}>Sales</h1>
                    <p style={{ color: 'var(--text-muted)', fontWeight: 600, fontSize: '1rem' }}>View and manage all medicine sales</p>
                </div>
            </div>

            {/* Filter Strip */}
            <div className="premium-filter-strip" style={{ marginBottom: '2rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <div className="premium-search-box" style={{ flex: 1, minWidth: '300px', marginBottom: 0 }}>
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
                <div className="filter-group" style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                    <div className="premium-search-box" style={{ width: '200px', marginBottom: 0 }}>
                        <RiCalendarLine className="search-box-icon" />
                        <input
                            type="date"
                            className="premium-search-input"
                            style={{ paddingLeft: '2.5rem' }}
                            value={startDate}
                            onChange={(e) => {
                                setStartDate(e.target.value);
                                setPage(1);
                            }}
                        />
                    </div>
                    <span style={{ fontWeight: 800, color: 'var(--text-muted)' }}>to</span>
                    <div className="premium-search-box" style={{ width: '200px', marginBottom: 0 }}>
                        <RiCalendarLine className="search-box-icon" />
                        <input
                            type="date"
                            className="premium-search-input"
                            style={{ paddingLeft: '2.5rem' }}
                            value={endDate}
                            onChange={(e) => {
                                setEndDate(e.target.value);
                                setPage(1);
                            }}
                        />
                    </div>
                </div>
            </div>

            <div className="premium-table-container">
                <table className="premium-table">
                    <thead>
                        <tr>
                            <th>Invoice</th>
                            <th>Medicines</th>
                            <th>Total</th>
                            <th>Sale Details</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sales.length > 0 ? (
                            sales.map((sale) => (
                                <tr key={sale._id}>
                                    <td>
                                        <div style={{ fontWeight: 800, color: 'var(--text-main)', fontSize: '1.05rem' }}>{sale.invoiceNumber}</div>
                                        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                                            {new Date(sale.createdAt).toLocaleDateString()} • {new Date(sale.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                            {sale.medicines.map((item, i) => (
                                                <div key={i} style={{ fontSize: '0.9rem', fontWeight: 650, color: 'var(--text-soft)' }}>
                                                    {item.medicine?.name} <span style={{ color: 'var(--primary)', fontWeight: 800, marginLeft: '4px' }}>x{item.quantity}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </td>
                                    <td style={{ fontWeight: 900, color: 'var(--primary)', fontSize: '1.2rem' }}>
                                        ₹{(sale.grandTotal || 0).toLocaleString()}
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                                            <span style={{ fontWeight: 800, color: 'var(--text-main)' }}>{sale.soldBy?.name || 'Public Kiosk'}</span>
                                            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                                                {sale.paymentMethod || 'Cash'} • {sale.storeId || 'Main Store'}
                                            </span>
                                        </div>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                                            <Link to={`/invoice/${sale._id}`} className="med-act-btn" title="View Bill">
                                                <RiFileTextLine size={20} color="var(--primary)" />
                                            </Link>
                                            <button
                                                onClick={() => handleDownload(sale._id, sale.invoiceNumber)}
                                                className="med-act-btn"
                                                title="Download PDF"
                                            >
                                                <RiDownloadLine size={20} color="var(--accent)" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="5" style={{ textAlign: 'center', padding: '6rem', color: 'var(--text-muted)' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                                        <RiSearchLine size={48} opacity={0.2} />
                                        <p style={{ fontSize: '1.2rem', fontWeight: 700 }}>No matching sales found</p>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
                <div className="premium-pagination">
                    <button
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="pagination-btn"
                    >
                        <RiArrowLeftSLine /> Previous
                    </button>
                    <div className="pagination-info">
                        Page <strong>{page}</strong> of <strong>{pagination.pages}</strong>
                    </div>
                    <button
                        onClick={() => setPage(p => Math.min(pagination.pages, p + 1))}
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

