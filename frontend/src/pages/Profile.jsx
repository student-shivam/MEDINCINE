import React, { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
    RiCalendarCheckLine,
    RiMapPinLine,
    RiPhoneLine,
    RiShieldUserLine,
    RiSaveLine,
    RiLockPasswordLine,
    RiHistoryLine,
    RiShoppingBagLine,
    RiMedicineBottleLine,
    RiUser3Line,
} from 'react-icons/ri';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import api from '../services/api';
import AvatarUpload from '../components/profile/AvatarUpload';
import '../styles/settings.css';
import { resolveUploadUrl } from '../utils/url';

const Profile = () => {
    const queryClient = useQueryClient();
    const [profileForm, setProfileForm] = useState({ name: '', phone: '', address: '' });
    const [passwordForm, setPasswordForm] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });
    const [formErrors, setFormErrors] = useState({});

    const { data, isLoading } = useQuery({
        queryKey: ['profile-summary'],
        queryFn: async () => {
            const response = await api.get('/users/profile-summary');
            return response.data.data;
        },
    });

    const updateProfileMutation = useMutation({
        mutationFn: async (payload) => {
            const response = await api.put('/users/update-profile', payload);
            return response.data;
        },
        onSuccess: () => {
            toast.success('Saved successfully');
            queryClient.invalidateQueries({ queryKey: ['profile-summary'] });
            queryClient.invalidateQueries({ queryKey: ['user-profile'] });
        },
        onError: (error) => {
            toast.error(error.response?.data?.error || 'Could not update profile');
        },
    });

    const changePasswordMutation = useMutation({
        mutationFn: async (payload) => {
            const response = await api.put('/users/change-password', payload);
            return response.data;
        },
        onSuccess: () => {
            toast.success('Password updated');
            setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
        },
        onError: (error) => {
            toast.error(error.response?.data?.error || 'Could not change password');
        },
    });

    const user = data?.user || {};
    const metrics = data?.metrics || {};
    const activity = data?.recentActivity || {};
    const avatarUrl = useMemo(() => {
        const image = user.profileImage || user.avatar;
        if (!image || image === 'default-avatar.png') return '';
        return resolveUploadUrl(image) || '';
    }, [user.profileImage, user.avatar]);

    React.useEffect(() => {
        setProfileForm({
            name: user?.name || '',
            phone: user?.phone || '',
            address: user?.address || '',
        });
    }, [user?.name, user?.phone, user?.address]);

    const validateProfile = () => {
        const nextErrors = {};
        if (!profileForm.name.trim()) {
            nextErrors.name = 'Name is required';
        }
        setFormErrors(nextErrors);
        return Object.keys(nextErrors).length === 0;
    };

    const validatePassword = () => {
        const nextErrors = {};
        if (!passwordForm.currentPassword) {
            nextErrors.currentPassword = 'Current password is required';
        }
        if (!passwordForm.newPassword || passwordForm.newPassword.length < 6) {
            nextErrors.newPassword = 'New password must be at least 6 characters';
        }
        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            nextErrors.confirmPassword = 'Passwords do not match';
        }
        setFormErrors(nextErrors);
        return Object.keys(nextErrors).length === 0;
    };

    const handleProfileSubmit = (event) => {
        event.preventDefault();
        if (!validateProfile()) return;
        updateProfileMutation.mutate(profileForm);
    };

    const handlePasswordSubmit = (event) => {
        event.preventDefault();
        if (!validatePassword()) return;
        changePasswordMutation.mutate(passwordForm);
    };

    const renderRoleMetrics = () => {
        if (user.role === 'admin') {
            return (
                <div className="dashboard-grid">
                    <div className="stats-card">
                        <p className="stats-card-title">Total Medicines</p>
                        <h2 className="stats-card-value">{metrics.totalMedicines || 0}</h2>
                    </div>
                    <div className="stats-card">
                        <p className="stats-card-title">Total Users</p>
                        <h2 className="stats-card-value">{metrics.totalUsers || 0}</h2>
                    </div>
                    <div className="stats-card">
                        <p className="stats-card-title">Total Sales</p>
                        <h2 className="stats-card-value">Rs {(metrics.totalSales || 0).toLocaleString()}</h2>
                    </div>
                </div>
            );
        }

        return (
            <div className="dashboard-grid">
                <div className="stats-card">
                    <p className="stats-card-title">Medicines Sold</p>
                    <h2 className="stats-card-value">{metrics.medicinesSold || 0}</h2>
                </div>
                <div className="stats-card">
                    <p className="stats-card-title">Bills Generated</p>
                    <h2 className="stats-card-value">{metrics.totalBillsGenerated || 0}</h2>
                </div>
            </div>
        );
    };

    if (isLoading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
                <p style={{ color: 'var(--text-muted)', marginTop: '1rem' }}>Loading profile...</p>
            </div>
        );
    }

    return (
        <div className="profile-page-wrapper fade-in">
            <div className="med-header-premium">
                <div className="med-header-text">
                    <h1 className="med-title-premium">Profile</h1>
                    <p className="med-subtitle-premium">Manage your account details</p>
                </div>
            </div>

            <div className="profile-grid-layout">
                <section className="chart-card profile-header-card">
                    <AvatarUpload
                        imageUrl={avatarUrl}
                        fallbackName={user.name}
                        onUploaded={() => {
                            queryClient.invalidateQueries({ queryKey: ['profile-summary'] });
                            queryClient.invalidateQueries({ queryKey: ['user-profile'] });
                        }}
                    />
                    <div className="profile-header-meta">
                        <h2>{user.name}</h2>
                        <p>{user.email}</p>
                        <span className="med-cat-badge">{(user.role || 'pharmacist').toUpperCase()}</span>
                    </div>
                </section>

                <section className="chart-card">
                    <h3 className="chart-header">Profile Details</h3>
                    <div className="profile-details-grid">
                        <div className="profile-detail-item"><RiUser3Line /> <span><strong>Full Name:</strong> {user.name || '-'}</span></div>
                        <div className="profile-detail-item"><RiShieldUserLine /> <span><strong>Role:</strong> {(user.role || '-').toUpperCase()}</span></div>
                        <div className="profile-detail-item"><RiPhoneLine /> <span><strong>Phone:</strong> {user.phone || '-'}</span></div>
                        <div className="profile-detail-item"><RiMapPinLine /> <span><strong>Address:</strong> {user.address || '-'}</span></div>
                        <div className="profile-detail-item"><RiCalendarCheckLine /> <span><strong>Created On:</strong> {user.createdAt ? format(new Date(user.createdAt), 'MMM dd, yyyy') : '-'}</span></div>
                        <div className="profile-detail-item"><RiHistoryLine /> <span><strong>Last Login:</strong> {activity.lastLogin ? format(new Date(activity.lastLogin), 'MMM dd, yyyy hh:mm a') : '-'}</span></div>
                    </div>
                </section>
            </div>

            <section className="profile-section-block">
                <h3 className="chart-header">Summary</h3>
                {renderRoleMetrics()}
            </section>

            <div className="profile-grid-layout">
                <section className="chart-card">
                    <h3 className="chart-header">Edit Profile</h3>
                    <form className="settings-form-stack" onSubmit={handleProfileSubmit}>
                        <div className="settings-form-group">
                            <label>Full Name</label>
                            <input
                                value={profileForm.name}
                                onChange={(e) => setProfileForm((prev) => ({ ...prev, name: e.target.value }))}
                                placeholder="Enter full name"
                            />
                            {formErrors.name && <span className="profile-form-error">{formErrors.name}</span>}
                        </div>
                        <div className="settings-form-group">
                            <label>Phone Number</label>
                            <input
                                value={profileForm.phone}
                                onChange={(e) => setProfileForm((prev) => ({ ...prev, phone: e.target.value }))}
                                placeholder="Enter phone number"
                            />
                        </div>
                        <div className="settings-form-group">
                            <label>Address</label>
                            <input
                                value={profileForm.address}
                                onChange={(e) => setProfileForm((prev) => ({ ...prev, address: e.target.value }))}
                                placeholder="Enter address"
                            />
                        </div>
                        <button className="settings-btn settings-btn--primary" type="submit" disabled={updateProfileMutation.isPending}>
                            <RiSaveLine />
                            <span>{updateProfileMutation.isPending ? 'Saving...' : 'Save'}</span>
                        </button>
                    </form>
                </section>

                <section className="chart-card">
                    <h3 className="chart-header">Change Password</h3>
                    <form className="settings-form-stack" onSubmit={handlePasswordSubmit}>
                        <div className="settings-form-group">
                            <label>Current Password</label>
                            <input
                                type="password"
                                value={passwordForm.currentPassword}
                                onChange={(e) => setPasswordForm((prev) => ({ ...prev, currentPassword: e.target.value }))}
                                placeholder="Enter current password"
                            />
                            {formErrors.currentPassword && <span className="profile-form-error">{formErrors.currentPassword}</span>}
                        </div>
                        <div className="settings-form-group">
                            <label>New Password</label>
                            <input
                                type="password"
                                value={passwordForm.newPassword}
                                onChange={(e) => setPasswordForm((prev) => ({ ...prev, newPassword: e.target.value }))}
                                placeholder="Enter new password"
                            />
                            {formErrors.newPassword && <span className="profile-form-error">{formErrors.newPassword}</span>}
                        </div>
                        <div className="settings-form-group">
                            <label>Confirm Password</label>
                            <input
                                type="password"
                                value={passwordForm.confirmPassword}
                                onChange={(e) => setPasswordForm((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                                placeholder="Confirm new password"
                            />
                            {formErrors.confirmPassword && <span className="profile-form-error">{formErrors.confirmPassword}</span>}
                        </div>
                        <button className="settings-btn settings-btn--primary" type="submit" disabled={changePasswordMutation.isPending}>
                            <RiLockPasswordLine />
                            <span>{changePasswordMutation.isPending ? 'Saving...' : 'Change Password'}</span>
                        </button>
                    </form>
                </section>
            </div>

            <section className="profile-section-block">
                <h3 className="chart-header">Recent Activity</h3>
                <div className="profile-activity-grid">
                    <div className="chart-card">
                        <h4 className="profile-subtitle"><RiMedicineBottleLine /> Recent Medicine Changes</h4>
                        {(activity.medicineUpdates || []).length ? (
                            <div className="profile-activity-list">
                                {activity.medicineUpdates.map((item) => (
                                    <div className="profile-activity-item" key={item.id}>
                                        <span>{item.name}</span>
                                        <small>{format(new Date(item.updatedAt), 'MMM dd, hh:mm a')}</small>
                                    </div>
                                ))}
                            </div>
                        ) : <p className="profile-empty-state">No recent medicine changes</p>}
                    </div>

                    <div className="chart-card">
                        <h4 className="profile-subtitle"><RiShoppingBagLine /> Recent Bills</h4>
                        {(activity.recentSales || []).length ? (
                            <div className="profile-activity-list">
                                {activity.recentSales.map((item) => (
                                    <div className="profile-activity-item" key={item.id}>
                                        <span>{item.invoiceNumber} - Rs {Number(item.grandTotal || 0).toLocaleString()}</span>
                                        <small>{format(new Date(item.createdAt), 'MMM dd, hh:mm a')}</small>
                                    </div>
                                ))}
                            </div>
                        ) : <p className="profile-empty-state">No recent sales</p>}
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Profile;

