import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { RiArrowLeftLine, RiSaveLine } from 'react-icons/ri';
import toast from 'react-hot-toast';
import '../../styles/settings.css';

const InvoiceSettingsPage = () => {
    const [form, setForm] = useState({
        invoicePrefix: localStorage.getItem('invoice_prefix') || 'INV',
        invoiceFooterMessage: localStorage.getItem('invoice_footer_message') || 'Thank you for visiting Medicine Inventory System',
        defaultTax: localStorage.getItem('invoice_default_tax') || '18',
    });

    const onSave = (event) => {
        event.preventDefault();
        localStorage.setItem('invoice_prefix', form.invoicePrefix.trim());
        localStorage.setItem('invoice_footer_message', form.invoiceFooterMessage.trim());
        localStorage.setItem('invoice_default_tax', form.defaultTax);
        toast.success('Invoice settings saved');
    };

    return (
        <div className="settings-route-page">
            <div className="settings-route-head">
                <Link to="/settings" className="settings-route-back"><RiArrowLeftLine /> Back</Link>
                <div>
                    <h1>Invoice Settings</h1>
                    <p>Control invoice formatting and defaults.</p>
                </div>
            </div>

            <div className="settings-route-card">
                <form className="settings-route-form settings-route-form--compact" onSubmit={onSave}>
                    <div className="settings-form-group">
                        <label>Invoice Prefix</label>
                        <input value={form.invoicePrefix} onChange={(e) => setForm((p) => ({ ...p, invoicePrefix: e.target.value }))} />
                    </div>
                    <div className="settings-form-group">
                        <label>Invoice Footer Message</label>
                        <input value={form.invoiceFooterMessage} onChange={(e) => setForm((p) => ({ ...p, invoiceFooterMessage: e.target.value }))} />
                    </div>
                    <div className="settings-form-group">
                        <label>Default Tax (%)</label>
                        <input type="number" min="0" max="100" value={form.defaultTax} onChange={(e) => setForm((p) => ({ ...p, defaultTax: e.target.value }))} />
                    </div>

                    <div className="settings-actions-row">
                        <button type="submit" className="settings-btn settings-btn--primary">
                            <RiSaveLine />
                            <span>Save Invoice Settings</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default InvoiceSettingsPage;
