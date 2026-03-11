import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { RiArrowLeftLine, RiMoonLine, RiSaveLine } from 'react-icons/ri';
import toast from 'react-hot-toast';
import '../../styles/settings.css';

const SystemSettingsPage = () => {
    const [form, setForm] = useState({
        systemName: localStorage.getItem('system_name') || 'Medicine Inventory System',
        defaultGST: localStorage.getItem('system_default_gst') || '18',
        currencyType: localStorage.getItem('system_currency') || 'INR',
    });
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

    const applyTheme = (nextTheme) => {
        const value = nextTheme === 'dark' ? 'dark' : 'light';
        document.body.classList.toggle('dark-mode', value === 'dark');
        document.documentElement.style.colorScheme = value;
        localStorage.setItem('theme', value);
        setTheme(value);
    };

    useEffect(() => {
        applyTheme(theme);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const onSave = (event) => {
        event.preventDefault();
        localStorage.setItem('system_name', form.systemName.trim());
        localStorage.setItem('system_default_gst', form.defaultGST);
        localStorage.setItem('system_currency', form.currencyType);
        toast.success('System settings saved');
    };

    return (
        <div className="settings-route-page">
            <div className="settings-route-head">
                <Link to="/settings" className="settings-route-back"><RiArrowLeftLine /> Back</Link>
                <div>
                    <h1>System Settings</h1>
                    <p>Configure core system preferences.</p>
                </div>
            </div>

            <div className="settings-route-card">
                <form className="settings-route-form settings-route-form--compact" onSubmit={onSave}>
                    <div className="settings-form-group">
                        <label>System Name</label>
                        <input value={form.systemName} onChange={(e) => setForm((p) => ({ ...p, systemName: e.target.value }))} />
                    </div>
                    <div className="settings-form-group">
                        <label>Default GST (%)</label>
                        <input type="number" min="0" max="100" value={form.defaultGST} onChange={(e) => setForm((p) => ({ ...p, defaultGST: e.target.value }))} />
                    </div>
                    <div className="settings-form-group">
                        <label>Currency Type</label>
                        <select value={form.currencyType} onChange={(e) => setForm((p) => ({ ...p, currencyType: e.target.value }))}>
                            <option value="INR">INR</option>
                            <option value="USD">USD</option>
                            <option value="EUR">EUR</option>
                        </select>
                    </div>

                    <div className="settings-toggle-row">
                        <div className="settings-toggle-info">
                            <div className="settings-toggle-icon-wrap">
                                <RiMoonLine size={20} />
                            </div>
                            <div>
                                <div className="settings-toggle-label">Dark Mode</div>
                                <div className="settings-toggle-hint">Switch to the dark dashboard theme</div>
                            </div>
                        </div>
                        <button
                            type="button"
                            className={`settings-toggle ${theme === 'dark' ? 'settings-toggle--active' : ''}`}
                            onClick={() => applyTheme(theme === 'dark' ? 'light' : 'dark')}
                            aria-pressed={theme === 'dark'}
                        >
                            <span className="settings-toggle-knob" />
                        </button>
                    </div>

                    <div className="settings-actions-row">
                        <button type="submit" className="settings-btn settings-btn--primary">
                            <RiSaveLine />
                            <span>Save System Settings</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SystemSettingsPage;
