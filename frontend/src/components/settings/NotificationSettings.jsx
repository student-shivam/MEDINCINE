import React, { useEffect, useState } from 'react';
import { RiNotification3Line, RiSaveLine } from 'react-icons/ri';
import toast from 'react-hot-toast';
import api from '../../services/api';

const NotificationSettings = ({ user, onRefresh }) => {
    const [formData, setFormData] = useState({
        lowStock: true,
        expiryAlerts: true,
        salesUpdates: true,
    });
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        setFormData({
            lowStock: user?.notifications?.lowStock ?? true,
            expiryAlerts: user?.notifications?.expiryAlerts ?? true,
            salesUpdates: user?.notifications?.salesUpdates ?? true,
        });
    }, [user?.notifications?.lowStock, user?.notifications?.expiryAlerts, user?.notifications?.salesUpdates]);

    const onSave = async () => {
        setSaving(true);
        try {
            await api.put('/users/update-notifications', formData);
            toast.success('Saved successfully');
            onRefresh();
        } catch (error) {
            toast.error(error.response?.data?.error || 'Could not update notifications');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="settings-content-stack">
            <div className="settings-panel-card">
                <div className="settings-panel-header">
                    <h3 className="settings-panel-title">Notifications</h3>
                    <p className="settings-panel-subtitle">Choose your alerts</p>
                </div>

                <div className="settings-toggle-list">
                    <div className="settings-toggle-row">
                        <div className="settings-toggle-info">
                            <div className="settings-toggle-icon-wrap"><RiNotification3Line size={18} /></div>
                            <div>
                                <p className="settings-toggle-label">Low Stock Alerts</p>
                                <p className="settings-toggle-hint">Get notified when medicine stock reaches threshold</p>
                            </div>
                        </div>
                        <button
                            type="button"
                            className={`settings-toggle ${formData.lowStock ? 'settings-toggle--active' : ''}`}
                            onClick={() => setFormData((prev) => ({ ...prev, lowStock: !prev.lowStock }))}
                        >
                            <span className="settings-toggle-knob"></span>
                        </button>
                    </div>

                    <div className="settings-toggle-row">
                        <div className="settings-toggle-info">
                            <div className="settings-toggle-icon-wrap"><RiNotification3Line size={18} /></div>
                            <div>
                                <p className="settings-toggle-label">Expiry Alerts</p>
                                <p className="settings-toggle-hint">Receive alerts for medicines nearing expiry</p>
                            </div>
                        </div>
                        <button
                            type="button"
                            className={`settings-toggle ${formData.expiryAlerts ? 'settings-toggle--active' : ''}`}
                            onClick={() => setFormData((prev) => ({ ...prev, expiryAlerts: !prev.expiryAlerts }))}
                        >
                            <span className="settings-toggle-knob"></span>
                        </button>
                    </div>

                    <div className="settings-toggle-row">
                        <div className="settings-toggle-info">
                            <div className="settings-toggle-icon-wrap"><RiNotification3Line size={18} /></div>
                            <div>
                                <p className="settings-toggle-label">Sales Notifications</p>
                                <p className="settings-toggle-hint">Get updates for completed sales</p>
                            </div>
                        </div>
                        <button
                            type="button"
                            className={`settings-toggle ${formData.salesUpdates ? 'settings-toggle--active' : ''}`}
                            onClick={() => setFormData((prev) => ({ ...prev, salesUpdates: !prev.salesUpdates }))}
                        >
                            <span className="settings-toggle-knob"></span>
                        </button>
                    </div>
                </div>

                <button type="button" className="settings-btn settings-btn--primary" onClick={onSave} disabled={saving}>
                    <RiSaveLine />
                    <span>{saving ? 'Saving...' : 'Save'}</span>
                </button>
            </div>
        </div>
    );
};

export default NotificationSettings;

