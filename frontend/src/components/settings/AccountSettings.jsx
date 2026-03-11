import React, { useEffect, useState } from 'react';
import { RiCloseLine, RiSaveLine } from 'react-icons/ri';
import toast from 'react-hot-toast';
import api from '../../services/api';

const AccountSettings = ({ user, onRefresh }) => {
    const [formData, setFormData] = useState({ name: '', phone: '', address: '' });
    const [errors, setErrors] = useState({});
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        setFormData({
            name: user?.name || '',
            phone: user?.phone || '',
            address: user?.address || '',
        });
    }, [user?.name, user?.phone, user?.address]);

    const validate = () => {
        const nextErrors = {};
        if (!formData.name.trim()) nextErrors.name = 'Full name is required';
        if (formData.phone && !/^[0-9+\-\s()]{7,20}$/.test(formData.phone)) {
            nextErrors.phone = 'Enter a valid phone number';
        }
        setErrors(nextErrors);
        return Object.keys(nextErrors).length === 0;
    };

    const onSave = async (event) => {
        event.preventDefault();
        if (!validate()) return;

        setSaving(true);
        try {
            await api.put('/users/update-profile', formData);
            toast.success('Saved successfully');
            onRefresh();
        } catch (error) {
            toast.error(error.response?.data?.error || 'Could not save changes');
        } finally {
            setSaving(false);
        }
    };

    const onCancel = () => {
        setFormData({
            name: user?.name || '',
            phone: user?.phone || '',
            address: user?.address || '',
        });
        setErrors({});
    };

    return (
        <div className="settings-content-stack">
            <div className="settings-panel-card">
                <div className="settings-panel-header">
                    <h3 className="settings-panel-title">Account</h3>
                    <p className="settings-panel-subtitle">Update your profile details</p>
                </div>

                <form className="settings-form-stack" onSubmit={onSave}>
                    <div className="settings-form-group">
                        <label>Full Name</label>
                        <input value={formData.name} onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))} />
                        {errors.name && <span className="profile-form-error">{errors.name}</span>}
                    </div>

                    <div className="settings-form-group">
                        <label>Phone Number</label>
                        <input value={formData.phone} onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))} />
                        {errors.phone && <span className="profile-form-error">{errors.phone}</span>}
                    </div>

                    <div className="settings-form-group">
                        <label>Address</label>
                        <input value={formData.address} onChange={(e) => setFormData((prev) => ({ ...prev, address: e.target.value }))} />
                    </div>

                    <div className="settings-actions-row">
                        <button type="button" className="settings-btn settings-btn--ghost" onClick={onCancel}>
                            <RiCloseLine />
                            <span>Cancel</span>
                        </button>
                        <button type="submit" className="settings-btn settings-btn--primary" disabled={saving}>
                            <RiSaveLine />
                            <span>{saving ? 'Saving...' : 'Save Changes'}</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AccountSettings;

