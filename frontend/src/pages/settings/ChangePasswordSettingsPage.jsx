import React from 'react';
import { Link } from 'react-router-dom';
import { RiArrowLeftLine } from 'react-icons/ri';
import SecuritySettings from '../../components/settings/SecuritySettings';
import '../../styles/settings.css';

const ChangePasswordSettingsPage = () => {
    return (
        <div className="settings-route-page">
            <div className="settings-route-head">
                <Link to="/settings" className="settings-route-back"><RiArrowLeftLine /> Back</Link>
                <div>
                    <h1>Change Password</h1>
                    <p>Update your account password securely.</p>
                </div>
            </div>

            <SecuritySettings />
        </div>
    );
};

export default ChangePasswordSettingsPage;
