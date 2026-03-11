import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { RiArrowLeftLine, RiSaveLine } from 'react-icons/ri';
import toast from 'react-hot-toast';
import '../../styles/settings.css';

const PharmacySettingsPage = () => {
    const [form, setForm] = useState({
        pharmacyName: localStorage.getItem('pharmacy_name') || 'Medicine Inventory System',
        pharmacyAddress: localStorage.getItem('pharmacy_address') || 'Main Pharmacy, City Center',
        pharmacyMobile: localStorage.getItem('pharmacy_mobile') || '9999999999',
        pharmacyEmail: localStorage.getItem('pharmacy_email') || 'pharmacy@example.com',
    });

    const onSave = (event) => {
        event.preventDefault();
        localStorage.setItem('pharmacy_name', form.pharmacyName.trim());
        localStorage.setItem('pharmacy_address', form.pharmacyAddress.trim());
        localStorage.setItem('pharmacy_mobile', form.pharmacyMobile.trim());
        localStorage.setItem('pharmacy_email', form.pharmacyEmail.trim());
        toast.success('Pharmacy details saved');
    };

    return (
        <div className="settings-route-page">
            <div className="settings-route-head">
                <Link to="/settings" className="settings-route-back"><RiArrowLeftLine /> Back</Link>
                <div>
                    <h1>Pharmacy Settings</h1>
                    <p>Manage pharmacy details shown on invoices.</p>
                </div>
            </div>

            <div className="settings-route-card">
                <form className="settings-route-form settings-route-form--compact" onSubmit={onSave}>
                    <div className="settings-form-group">
                        <label>Pharmacy Name</label>
                        <input value={form.pharmacyName} onChange={(e) => setForm((p) => ({ ...p, pharmacyName: e.target.value }))} />
                    </div>
                    <div className="settings-form-group">
                        <label>Pharmacy Address</label>
                        <input value={form.pharmacyAddress} onChange={(e) => setForm((p) => ({ ...p, pharmacyAddress: e.target.value }))} />
                    </div>
                    <div className="settings-form-group">
                        <label>Pharmacy Mobile Number</label>
                        <input value={form.pharmacyMobile} onChange={(e) => setForm((p) => ({ ...p, pharmacyMobile: e.target.value }))} />
                    </div>
                    <div className="settings-form-group">
                        <label>Pharmacy Email</label>
                        <input value={form.pharmacyEmail} onChange={(e) => setForm((p) => ({ ...p, pharmacyEmail: e.target.value }))} />
                    </div>

                    <div className="settings-actions-row">
                        <button type="submit" className="settings-btn settings-btn--primary">
                            <RiSaveLine />
                            <span>Save Pharmacy Details</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PharmacySettingsPage;
