import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    RiArrowRightLine,
    RiBuilding2Line,
    RiFileSettingsLine,
    RiLockPasswordLine,
    RiSearchLine,
    RiSettings4Line,
    RiUser3Line,
} from 'react-icons/ri';
import '../styles/settings.css';

const SETTINGS_ITEMS = [
    {
        title: 'Profile Settings',
        description: 'Manage your admin profile information.',
        icon: RiUser3Line,
        path: '/settings/profile',
    },
    {
        title: 'Change Password',
        description: 'Update your password and keep account secure.',
        icon: RiLockPasswordLine,
        path: '/settings/change-password',
    },
    {
        title: 'System Settings',
        description: 'Configure system name, GST, and currency.',
        icon: RiSettings4Line,
        path: '/settings/system',
    },
    {
        title: 'Pharmacy Settings',
        description: 'Manage pharmacy identity and contact details.',
        icon: RiBuilding2Line,
        path: '/settings/pharmacy',
    },
    {
        title: 'Invoice Settings',
        description: 'Set invoice prefix, footer, and default tax.',
        icon: RiFileSettingsLine,
        path: '/settings/invoice',
    },
];

const Settings = () => {
    const navigate = useNavigate();
    const [query, setQuery] = useState('');

    const filteredItems = useMemo(() => {
        const value = query.trim().toLowerCase();
        if (!value) return SETTINGS_ITEMS;
        return SETTINGS_ITEMS.filter((item) => (
            item.title.toLowerCase().includes(value) || item.description.toLowerCase().includes(value)
        ));
    }, [query]);

    return (
        <div className="settings-modern-page">
            <div className="settings-modern-header">
                <h1>Settings</h1>
                <p>Manage your pharmacy system configuration.</p>
            </div>

            <div className="settings-modern-search">
                <RiSearchLine />
                <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search settings by name"
                />
            </div>

            <div className="settings-modern-grid settings-modern-grid--fixed">
                {filteredItems.map((item) => {
                    const Icon = item.icon;
                    return (
                        <button
                            type="button"
                            key={item.path}
                            className="settings-modern-card settings-modern-card--clickable"
                            onClick={() => navigate(item.path)}
                        >
                            <div className="settings-modern-icon"><Icon size={22} /></div>
                            <h3>{item.title}</h3>
                            <p>{item.description}</p>
                            <div className="settings-modern-card-arrow">
                                <RiArrowRightLine />
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default Settings;
