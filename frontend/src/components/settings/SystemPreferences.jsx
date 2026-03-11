import React, { useEffect, useState } from 'react';
import { RiSaveLine, RiSettings4Line } from 'react-icons/ri';
import toast from 'react-hot-toast';
import api from '../../services/api';

const SystemPreferences = ({ user, onRefresh }) => {
    const [formData, setFormData] = useState({
        theme: 'light',
        language: 'en',
        defaultDashboardPage: 'dashboard',
    });
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        setFormData({
            theme: user?.preferences?.theme || 'light',
            language: user?.preferences?.language || 'en',
            defaultDashboardPage: user?.preferences?.defaultDashboardPage || 'dashboard',
        });
    }, [user?.preferences?.theme, user?.preferences?.language, user?.preferences?.defaultDashboardPage]);

    const onSave = async (event) => {
        event.preventDefault();
        setSaving(true);
        try {
            await api.put('/users/update-preferences', formData);
            toast.success('Saved successfully');
            onRefresh();
        } catch (error) {
            toast.error(error.response?.data?.error || 'Could not update preferences');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="settings-content-stack">
            <div className="settings-panel-card">
                <div className="settings-panel-header">
                    <h3 className="settings-panel-title">Preferences</h3>
                    <p className="settings-panel-subtitle">Set your display and language preferences</p>
                </div>

                <form className="settings-form-stack" onSubmit={onSave}>
                    <div className="settings-form-group">
                        <label>Theme Preference</label>
                        <select
                            value={formData.theme}
                            onChange={(e) => setFormData((prev) => ({ ...prev, theme: e.target.value }))}
                            className="settings-select"
                        >
                            <option value="light">Light</option>
                            <option value="dark">Dark</option>
                        </select>
                    </div>

                    <div className="settings-form-group">
                        <label>Language</label>
                        <select
                            value={formData.language}
                            onChange={(e) => setFormData((prev) => ({ ...prev, language: e.target.value }))}
                            className="settings-select"
                        >
                            <option value="en">English</option>
                            <option value="hi">Hindi</option>
                        </select>
                    </div>

                    <div className="settings-form-group">
                        <label>Default Page</label>
                        <select
                            value={formData.defaultDashboardPage}
                            onChange={(e) => setFormData((prev) => ({ ...prev, defaultDashboardPage: e.target.value }))}
                            className="settings-select"
                        >
                            <option value="dashboard">Dashboard</option>
                            <option value="medicines">Medicines</option>
                            <option value="sales">Sales</option>
                            <option value="analytics">Analytics</option>
                            <option value="profile">Profile</option>
                        </select>
                    </div>

                    <button type="submit" className="settings-btn settings-btn--primary" disabled={saving}>
                        <RiSaveLine />
                        <span>{saving ? 'Saving...' : 'Save'}</span>
                    </button>
                </form>
            </div>

            {user?.role === 'admin' && (
                <div className="settings-panel-card settings-admin-extra">
                    <div className="settings-panel-header">
                        <h3 className="settings-panel-title">Admin Options</h3>
                        <p className="settings-panel-subtitle">Extra options for admin users</p>
                    </div>
                    <div className="settings-admin-links">
                        <div className="settings-admin-item"><RiSettings4Line /> System Settings</div>
                        <div className="settings-admin-item"><RiSettings4Line /> Pharmacy Info</div>
                        <div className="settings-admin-item"><RiSettings4Line /> Manage Staff</div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SystemPreferences;

