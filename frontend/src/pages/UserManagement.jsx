import React, { useState } from 'react';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import {
    RiSearchLine, RiCloseLine, RiEditLine, RiDeleteBin7Line,
    RiUserAddLine, RiShieldUserLine, RiAlertLine, RiTeamLine
} from 'react-icons/ri';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import api from '../services/api';

const ROLES = ['admin', 'pharmacist'];

const UserManagement = () => {
    const queryClient = useQueryClient();
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const limit = 10;

    const [addModal, setAddModal] = useState(false);
    const [editModal, setEditModal] = useState(null);
    const [deleteModal, setDeleteModal] = useState(null);

    const [addForm, setAddForm] = useState({ name: '', email: '', password: '', role: 'pharmacist' });
    const [editForm, setEditForm] = useState({ name: '', email: '', role: '', password: '' });

    const { data: currentUser } = useQuery({
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

    const { data: usersData, isLoading } = useQuery({
        queryKey: ['users', search, page],
        queryFn: async () => {
            const params = new URLSearchParams();
            if (search) params.append('search', search);
            params.append('page', page);
            params.append('limit', limit);
            const res = await api.get(`/users?${params.toString()}`);
            return res.data;
        },
    });

    const users = usersData?.data;
    const totalUsers = usersData?.total || 0;
    const totalPages = Math.ceil(totalUsers / limit);

    const createMutation = useMutation({
        mutationFn: (data) => api.post('/users', data),
        onSuccess: () => {
            toast.success('Staff member added');
            queryClient.invalidateQueries({ queryKey: ['users'] });
            setAddModal(false);
            setAddForm({ name: '', email: '', password: '', role: 'pharmacist' });
        },
        onError: (error) => {
            toast.error(error.response?.data?.error || 'Failed to add staff');
        }
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }) => api.put(`/users/${id}`, data),
        onSuccess: () => {
            toast.success('Staff member updated');
            queryClient.invalidateQueries({ queryKey: ['users'] });
            setEditModal(null);
        },
        onError: (error) => {
            toast.error(error.response?.data?.error || 'Failed to update staff');
        }
    });

    const toggleStatusMutation = useMutation({
        mutationFn: ({ id, isActive }) => api.patch(`/users/${id}/status`, { isActive: !isActive }),
        onSuccess: () => {
            toast.success('Staff status updated');
            queryClient.invalidateQueries({ queryKey: ['users'] });
        },
        onError: (error) => {
            toast.error(error.response?.data?.error || 'Failed to toggle status');
        }
    });

    const deleteMutation = useMutation({
        mutationFn: (id) => api.delete(`/users/${id}`),
        onSuccess: () => {
            toast.success('Staff member deleted');
            queryClient.invalidateQueries({ queryKey: ['users'] });
            setDeleteModal(null);
        },
        onError: (error) => {
            toast.error(error.response?.data?.error || 'Failed to delete staff');
        }
    });

    const openEdit = (user) => {
        setEditForm({ name: user.name, email: user.email, role: user.role, password: '' });
        setEditModal(user);
    };

    const roleColors = {
        admin: { bg: 'rgba(37,99,235,0.1)', color: '#2563eb' },
        pharmacist: { bg: 'rgba(16,185,129,0.1)', color: '#10b981' },
    };

    if (isLoading) {
        return (
            <div className="loading-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
                <div className="spinner" style={{ width: '40px', height: '40px', border: '4px solid #f3f3f3', borderTop: '4px solid var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                <p style={{ color: 'var(--text-muted)', marginTop: '1rem', fontWeight: 600 }}>Loading staff...</p>
            </div>
        );
    }

    if (currentUser && !['admin', 'pharmacist'].includes((currentUser.role || '').toLowerCase())) {
        return (
            <div style={{ padding: '2rem', textAlign: 'center' }}>
                <RiAlertLine size={48} color="#ef4444" />
                <h2 style={{ marginTop: '1rem' }}>Access denied</h2>
                <p>You do not have permission to open this page.</p>
            </div>
        );
    }

    return (
        <div className="med-page fade-in">
            <div className="med-header-premium">
                <div className="med-header-text">
                    <h1 className="med-title-premium">Staff</h1>
                    <p className="med-subtitle-premium">
                        Managing <span style={{ color: 'var(--primary)', fontWeight: 800 }}>{totalUsers} staff members</span>
                    </p>
                </div>
                <button className="premium-btn primary" onClick={() => setAddModal(true)} style={{ marginLeft: 'auto' }}>
                    <RiUserAddLine size={20} /><span>Add Staff</span>
                </button>
            </div>

            <div className="premium-filter-strip">
                <div className="premium-search-box" style={{ maxWidth: '500px' }}>
                    <RiSearchLine className="search-box-icon" />
                    <input
                        type="text"
                        placeholder="Search staff by name or email"
                        className="premium-search-input"
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                    />
                </div>
            </div>

            <div className="premium-table-container">
                <table className="premium-table">
                    <thead>
                        <tr>
                            <th>Staff</th>
                            <th>Email</th>
                            <th>Role</th>
                            <th>Status</th>
                            <th>Joined</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users?.map((user, idx) => (
                            <tr key={user._id} style={{ animationDelay: `${idx * 0.05}s` }} className="fade-in">
                                <td>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                        <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: roleColors[user.role]?.bg, color: roleColors[user.role]?.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.9rem' }}>
                                            {user.name?.charAt(0).toUpperCase()}
                                        </div>
                                        <span style={{ fontWeight: 800, color: 'var(--text-main)' }}>{user.name}</span>
                                    </div>
                                </td>
                                <td style={{ color: 'var(--text-muted)', fontWeight: 500 }}>{user.email}</td>
                                <td>
                                    <span className="med-cat-badge" style={{
                                        backgroundColor: roleColors[user.role]?.bg,
                                        color: roleColors[user.role]?.color,
                                        border: 'none',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.5px'
                                    }}>
                                        <RiShieldUserLine style={{ marginRight: '6px' }} />{user.role}
                                    </span>
                                </td>
                                <td>
                                    <button
                                        onClick={() => toggleStatusMutation.mutate({ id: user._id, isActive: user.isActive })}
                                        className={`med-badge ${user.isActive ? 'med-badge--green' : 'med-badge--red'}`}
                                        style={{ border: 'none', cursor: 'pointer', outline: 'none' }}
                                    >
                                        {user.isActive ? 'Active' : 'Inactive'}
                                    </button>
                                </td>
                                <td style={{ color: 'var(--text-muted)', fontWeight: 600 }}>
                                    {user.createdAt ? format(new Date(user.createdAt), 'MMM dd, yyyy') : '—'}
                                </td>
                                <td>
                                    <div style={{ display: 'flex', gap: '0.6rem' }}>
                                        <button className="med-act-btn" title="Edit" onClick={() => openEdit(user)}><RiEditLine size={18} color="var(--primary)" /></button>
                                        <button
                                            className="med-act-btn"
                                            title={currentUser?._id === user._id ? "You cannot delete your own account" : "Delete"}
                                            onClick={() => setDeleteModal(user)}
                                            disabled={currentUser?._id === user._id}
                                            style={{ opacity: currentUser?._id === user._id ? 0.3 : 1, cursor: currentUser?._id === user._id ? 'not-allowed' : 'pointer' }}
                                        >
                                            <RiDeleteBin7Line size={18} color="#ef4444" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {totalPages > 1 && (
                <div className="premium-pagination">
                    <button
                        className="pagination-btn"
                        disabled={page === 1}
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                    >
                        Previous
                    </button>
                    <div className="pagination-info">
                        Page <strong>{page}</strong> of <strong>{totalPages}</strong>
                    </div>
                    <button
                        className="pagination-btn"
                        disabled={page === totalPages}
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    >
                        Next
                    </button>
                </div>
            )}

            {addModal && (
                <div className="med-modal-overlay" onClick={() => setAddModal(false)}>
                    <div className="premium-form-card" style={{ width: '500px' }} onClick={e => e.stopPropagation()}>
                        <h3 className="med-title-premium" style={{ marginBottom: '2rem' }}>Onboard New Staff</h3>
                        <form onSubmit={(e) => { e.preventDefault(); createMutation.mutate(addForm); }}>
                            <div className="med-form-group">
                                <label>Full Name *</label>
                                <input type="text" value={addForm.name} onChange={e => setAddForm({ ...addForm, name: e.target.value })} required />
                            </div>
                            <div className="med-form-group">
                                <label>Email Address *</label>
                                <input type="email" value={addForm.email} onChange={e => setAddForm({ ...addForm, email: e.target.value })} required />
                            </div>
                            <div className="med-form-group">
                                <label>Password *</label>
                                <input type="password" value={addForm.password} onChange={e => setAddForm({ ...addForm, password: e.target.value })} required />
                            </div>
                            <div className="med-form-group">
                                <label>Role</label>
                                <select value={addForm.role} onChange={e => setAddForm({ ...addForm, role: e.target.value })}>
                                    {ROLES.map(r => <option key={r} value={r}>{r.toUpperCase()}</option>)}
                                </select>
                            </div>
                            <div className="premium-form-footer">
                                <button type="button" className="premium-btn ghost" onClick={() => setAddModal(false)}>Cancel</button>
                                <button type="submit" className="premium-btn primary" disabled={createMutation.isPending}>
                                    {createMutation.isPending ? 'Saving...' : 'Save'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {editModal && (
                <div className="med-modal-overlay" onClick={() => setEditModal(null)}>
                    <div className="premium-form-card" style={{ width: '500px' }} onClick={e => e.stopPropagation()}>
                        <h3 className="med-title-premium" style={{ marginBottom: '2rem' }}>Edit Staff Record</h3>
                        <form onSubmit={(e) => { e.preventDefault(); updateMutation.mutate({ id: editModal._id, data: editForm }); }}>
                            <div className="med-form-group"><label>Full Name</label><input type="text" value={editForm.name} onChange={e => setEditForm({ ...editForm, name: e.target.value })} /></div>
                            <div className="med-form-group"><label>Email Address</label><input type="email" value={editForm.email} onChange={e => setEditForm({ ...editForm, email: e.target.value })} /></div>
                            <div className="med-form-group">
                                <label>New Password (Optional)</label>
                                <input type="password" placeholder="Leave blank to keep current" value={editForm.password} onChange={e => setEditForm({ ...editForm, password: e.target.value })} />
                            </div>
                            <div className="med-form-group">
                                <label>Role {currentUser?._id === editModal?._id && "(Protected)"}</label>
                                <select
                                    value={editForm.role}
                                    onChange={e => setEditForm({ ...editForm, role: e.target.value })}
                                    disabled={currentUser?._id === editModal?._id}
                                    style={{ cursor: currentUser?._id === editModal?._id ? 'not-allowed' : 'pointer' }}
                                >
                                    {ROLES.map(r => <option key={r} value={r}>{r.toUpperCase()}</option>)}
                                </select>
                            </div>
                            <div className="premium-form-footer">
                                <button type="button" className="premium-btn ghost" onClick={() => setEditModal(null)}>Cancel</button>
                                <button type="submit" className="premium-btn primary" disabled={updateMutation.isPending}>Update</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {deleteModal && (
                <div className="med-modal-overlay" onClick={() => setDeleteModal(null)}>
                    <div className="premium-form-card" style={{ width: '400px', textAlign: 'center' }} onClick={e => e.stopPropagation()}>
                        <RiAlertLine size={64} color="#ef4444" style={{ marginBottom: '1.5rem' }} />
                        <h3 className="med-title-premium" style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Delete Staff?</h3>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>This sequence will permanently remove <strong>{deleteModal.name}</strong> from the staff list.</p>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button className="premium-btn ghost" style={{ flex: 1 }} onClick={() => setDeleteModal(null)}>Cancel</button>
                            <button className="premium-btn primary" style={{ flex: 1, background: '#ef4444' }} onClick={() => deleteMutation.mutate(deleteModal._id)}>Delete Record</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserManagement;

