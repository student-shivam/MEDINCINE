import React, { useState } from 'react';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import {
    RiCapsuleLine,
    RiSearchLine,
    RiEditLine,
    RiDeleteBin7Line,
    RiInboxLine,
    RiAlertLine
} from 'react-icons/ri';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../services/api';
import { resolveUploadUrl } from '../utils/url';

const STATUSES = [
    { value: '', label: 'All Status' },
    { value: 'expired', label: 'Expired' },
    { value: 'expiring', label: 'Expiring Soon' },
    { value: 'low-stock', label: 'Low Stock' },
    { value: 'out-of-stock', label: 'Out of Stock' },
];

const Medicines = () => {
    const queryClient = useQueryClient();
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('all');
    const [status, setStatus] = useState('');
    const [sortBy, setSortBy] = useState('');
    const [page, setPage] = useState(1);
    const limit = 10;

    const [deleteModal, setDeleteModal] = useState(null);

    const queryParams = new URLSearchParams({
        page,
        limit,
        ...(search && { search }),
        ...(category !== 'all' && { category }),
        ...(status && { status }),
        ...(sortBy && { sort: sortBy }),
    }).toString();

    const { data, isLoading } = useQuery({
        queryKey: ['medicines', page, search, category, status, sortBy],
        queryFn: async () => {
            const res = await api.get(`/medicines?${queryParams}`);
            return res.data;
        },
        placeholderData: (previousData) => previousData,
    });

    const medicines = data?.data || [];
    const totalPages = data?.totalPages || 1;

    const { data: categoriesData = [] } = useQuery({
        queryKey: ['categories'],
        queryFn: async () => {
            const res = await api.get('/categories');
            return res.data.data || [];
        },
    });

    const categoryOptions = [{ _id: 'all', name: 'All Categories' }, ...categoriesData];

    const deleteMutation = useMutation({
        mutationFn: (id) => api.delete(`/medicines/${id}`),
        onSuccess: () => {
            toast.success('Medicine deleted');
            queryClient.invalidateQueries({ queryKey: ['medicines'] });
            setDeleteModal(null);
        },
    });

    const getBadge = (med) => {
        const now = new Date();
        const expiry = new Date(med.expiryDate);
        const thirtyDays = new Date();
        thirtyDays.setDate(now.getDate() + 30);

        if (expiry < now) return { text: 'EXPIRED', cls: 'med-badge--red' };
        if (expiry <= thirtyDays) return { text: 'EXPIRING', cls: 'med-badge--orange' };
        if (med.quantity === 0) return { text: 'OUT OF STOCK', cls: 'med-badge--red' };
        if (med.quantity <= med.lowStockThreshold) return { text: 'LOW STOCK', cls: 'med-badge--yellow' };
        return { text: 'IN STOCK', cls: 'med-badge--green' };
    };

    const getMedicineImage = (med) => {
        const candidate = med?.image || med?.imageUrl || med?.medicineImage || med?.photo;
        return resolveUploadUrl(candidate);
    };

    if (isLoading && !data) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
                <p style={{ color: 'var(--text-muted)', marginTop: '1rem' }}>Loading medicines...</p>
            </div>
        );
    }

    return (
        <div className="med-page fade-in">
            <div className="medicines-header">
                <div className="medicines-header-copy">
                    <h1 className="medicines-title">Medicines</h1>
                    <p className="medicines-subtitle">Manage medicines and stock levels</p>
                </div>
            </div>

            <div className="premium-filter-strip medicines-filter-card">
                <div className="premium-search-box medicines-search-box">
                    <RiSearchLine className="search-box-icon" />
                    <input
                        type="text"
                        placeholder="Search medicine, generic name, or batch"
                        className="premium-search-input"
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                            setPage(1);
                        }}
                    />
                </div>

                <div className="premium-select-group medicines-filter-group">
                    <select
                        value={category}
                        onChange={(e) => {
                            setCategory(e.target.value);
                            setPage(1);
                        }}
                        className="premium-select"
                    >
                        {categoryOptions.map((c) => (
                            <option key={c._id} value={c._id === 'all' ? 'all' : c.name}>
                                {c.name}
                            </option>
                        ))}
                    </select>

                    <select
                        value={status}
                        onChange={(e) => {
                            setStatus(e.target.value);
                            setPage(1);
                        }}
                        className="premium-select"
                    >
                        {STATUSES.map((s) => (
                            <option key={s.value} value={s.value}>
                                {s.label}
                            </option>
                        ))}
                    </select>

                    <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="premium-select">
                        <option value="">Sort: Latest</option>
                        <option value="name">Sort: Name</option>
                        <option value="quantity">Sort: Stock</option>
                        <option value="price">Sort: Price</option>
                        <option value="expiry">Sort: Expiry</option>
                    </select>
                </div>

            </div>

            {medicines.length === 0 ? (
                <div className="premium-empty-state">
                    <div className="empty-state-icon-wrapper">
                        <RiInboxLine size={64} />
                    </div>
                    <div className="empty-state-text-wrapper">
                        <h3 className="empty-state-title">No medicines found</h3>
                        <p className="empty-state-subtitle">Try changing your filters</p>
                    </div>
                </div>
            ) : (
                <div className="premium-table-container medicines-table-card">
                    <table className="premium-table medicines-table">
                        <thead>
                            <tr>
                                <th>Image</th>
                                <th>Medicine Name</th>
                                <th>Category</th>
                                <th>Price</th>
                                <th>Stock</th>
                                <th>Expiry Date</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>

                        <tbody>
                            {medicines.map((med, idx) => {
                                const badge = getBadge(med);
                                const imageUrl = getMedicineImage(med);
                                const lowStock = med.quantity <= med.lowStockThreshold;

                                return (
                                    <tr
                                        key={med._id || idx}
                                        style={{ animationDelay: `${idx * 0.05}s` }}
                                        className={`fade-in ${lowStock ? 'med-row-low-stock' : ''}`}
                                    >
                                        <td>
                                            <div className="medicines-image-cell">
                                                {imageUrl ? (
                                                    <img src={imageUrl} alt={med.name} className="medicines-image" />
                                                ) : (
                                                    <div className="medicines-image-fallback">
                                                        <RiCapsuleLine size={22} />
                                                    </div>
                                                )}
                                            </div>
                                        </td>

                                        <td>
                                            <div className="medicines-name-cell">
                                                <div className="medicines-name">{med.name}</div>
                                                <div className="medicines-meta">
                                                    {med.manufacturer || 'N/A'} • {med.batchNumber || 'N/A'}
                                                </div>
                                            </div>
                                        </td>

                                        <td>
                                            <span className="med-cat-badge">{med.category}</span>
                                        </td>

                                        <td className="medicines-price">₹{med.unitPrice?.toLocaleString() || '0'}</td>

                                        <td>
                                            <div className="medicines-stock-cell">
                                                <div className="medicines-stock-value">
                                                    {med.quantity || 0} <span>units</span>
                                                </div>
                                                <div className="medicines-stock-bar">
                                                    <div
                                                        className="medicines-stock-bar-fill"
                                                        style={{
                                                            width: `${Math.min(100, (med.quantity || 0))}%`,
                                                            background: lowStock ? '#ef4444' : 'var(--accent)',
                                                        }}
                                                    ></div>
                                                </div>
                                            </div>
                                        </td>

                                        <td className="medicines-expiry">
                                            {med.expiryDate ? format(new Date(med.expiryDate), 'MMM dd, yyyy') : 'N/A'}
                                        </td>

                                        <td>
                                            <span className={`med-badge ${badge.cls}`}>{badge.text}</span>
                                        </td>

                                        <td>
                                            <div className="medicines-actions">
                                                <Link to={`/edit-medicine/${med._id}`} className="med-edit-btn">
                                                    <RiEditLine size={18} />
                                                    <span>Edit Medicine</span>
                                                </Link>
                                                <button className="med-act-btn" title="Delete" onClick={() => setDeleteModal(med)}>
                                                    <RiDeleteBin7Line size={18} color="#ef4444" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            {totalPages > 1 && (
                <div className="premium-pagination inline-pagination">
                    <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="premium-btn ghost">
                        Previous
                    </button>
                    <div className="premium-pagination-info">
                        Page {page} / {totalPages}
                    </div>
                    <button disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)} className="premium-btn ghost">
                        Next
                    </button>
                </div>
            )}

            {deleteModal && (
                <div className="med-modal-overlay" onClick={() => setDeleteModal(null)}>
                    <div className="premium-form-card" style={{ width: '400px', textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
                        <RiAlertLine size={64} color="#ef4444" style={{ marginBottom: '1.5rem' }} />
                        <h3 className="med-title-premium" style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Delete Medicine?</h3>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
                            This will permanently remove <strong style={{ color: '#ef4444' }}>{deleteModal.name}</strong>.
                        </p>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button className="premium-btn ghost" style={{ flex: 1 }} onClick={() => setDeleteModal(null)}>
                                Cancel
                            </button>
                            <button className="premium-btn primary" style={{ flex: 1, background: '#ef4444' }} onClick={() => deleteMutation.mutate(deleteModal._id)}>
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Medicines;

