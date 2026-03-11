import React, { useState } from 'react';
import { RiLockLine, RiSaveLine } from 'react-icons/ri';
import toast from 'react-hot-toast';
import api from '../../services/api';

const SecuritySettings = () => {
    const [formData, setFormData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });
    const [errors, setErrors] = useState({});
    const [saving, setSaving] = useState(false);

    const validate = () => {
        const nextErrors = {};
        if (!formData.currentPassword) nextErrors.currentPassword = 'Current password is required';
        if (!formData.newPassword || formData.newPassword.length < 6) {
            nextErrors.newPassword = 'New password must be at least 6 characters';
        }
        if (formData.newPassword !== formData.confirmPassword) {
            nextErrors.confirmPassword = 'Passwords do not match';
        }
        setErrors(nextErrors);
        return Object.keys(nextErrors).length === 0;
    };

    const onSave = async (event) => {
        event.preventDefault();
        if (!validate()) return;
        setSaving(true);
        try {
            await api.put('/users/change-password', formData);
            toast.success('Password updated');
            setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });
            setErrors({});
        } catch (error) {
            toast.error(error.response?.data?.error || 'Could not change password');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="settings-content-stack">
            <div className="settings-panel-card">
                <div className="settings-panel-header">
                    <h3 className="settings-panel-title">Security</h3>
                    <p className="settings-panel-subtitle">Change your password</p>
                </div>

                <form className="settings-form-stack" onSubmit={onSave}>
                    <div className="settings-form-group">
                        <label>Current Password</label>
                        <input
                            type="password"
                            value={formData.currentPassword}
                            onChange={(e) => setFormData((prev) => ({ ...prev, currentPassword: e.target.value }))}
                        />
                        {errors.currentPassword && <span className="profile-form-error">{errors.currentPassword}</span>}
                    </div>

                    <div className="settings-form-group">
                        <label>New Password</label>
                        <input
                            type="password"
                            value={formData.newPassword}
                            onChange={(e) => setFormData((prev) => ({ ...prev, newPassword: e.target.value }))}
                        />
                        {errors.newPassword && <span className="profile-form-error">{errors.newPassword}</span>}
                    </div>

                    <div className="settings-form-group">
                        <label>Confirm Password</label>
                        <input
                            type="password"
                            value={formData.confirmPassword}
                            onChange={(e) => setFormData((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                        />
                        {errors.confirmPassword && <span className="profile-form-error">{errors.confirmPassword}</span>}
                    </div>

                    <button type="submit" className="settings-btn settings-btn--primary" disabled={saving}>
                        <RiLockLine />
                        <span>{saving ? 'Updating...' : 'Save Password'}</span>
                    </button>
                </form>
            </div>
        </div>
    );
};

export default SecuritySettings;

