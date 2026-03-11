import React, { useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
    RiArrowLeftLine,
    RiPrinterLine
} from 'react-icons/ri';
import api from '../services/api';
import PublicNavbar from '../components/layout/PublicNavbar';

const formatCurrency = (value) => new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
}).format(Number(value || 0));

const InvoicePreview = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const invoiceRef = useRef();

    const { data: order, isLoading } = useQuery({
        queryKey: ['order-invoice', id],
        queryFn: async () => {
            const response = await api.get(`/orders/${id}`);
            return response.data.data;
        }
    });

    const handlePrint = () => {
        window.print();
    };

    // automatically print when order data arrives
    React.useEffect(() => {
        if (order) {
            setTimeout(() => window.print(), 300);
        }
    }, [order]);


    if (isLoading) return <div className="loading-container"><div className="spinner"></div></div>;

    if (!order) return <div className="error-container"><p>Bill not found.</p></div>;

    return (
        <div className="public-page-wrapper">
            <PublicNavbar />
            <div className="public-content">
                <div className="invoice-preview-wrapper fade-in">
                    <div className="invoice-actions no-print">
                        <button onClick={() => navigate('/pos')} className="premium-btn ghost">
                            <RiArrowLeftLine /> New Bill
                        </button>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button onClick={handlePrint} className="premium-btn ghost">
                                <RiPrinterLine /> Print
                            </button>
                        </div>
                    </div>

                    <div id="invoice" className="invoice-document" ref={invoiceRef} style={{ color: '#111' }}>
                        <div style={{ textAlign: 'center', marginBottom: '0.5rem', color: '#1e3a8a' }}>
                            <img
                                src="/logo.png"
                                alt="Pharmacy Logo"
                                style={{
                                    width: '40px',
                                    height: '40px',
                                    marginBottom: '0.2rem',
                                    filter: 'invert(22%) sepia(80%) saturate(500%) hue-rotate(189deg)'
                                }}
                            />
                            <div style={{ fontWeight: 800, fontSize: '14px' }}>IndiCorp Pharmacy</div>
                            <div style={{ fontSize: '12px', color: '#222' }}>123 Health Avenue, City Center</div>
                            <div style={{ fontSize: '12px', marginBottom: '0.3rem', color: '#222' }}>Phone: +91 90000 00000</div>
                            <hr />
                        </div>
                        <div style={{ fontSize: '12px', lineHeight: 1.4 }}>
                            <div>Invoice #: {order.invoiceNumber}</div>
                            <div>Date: {new Date(order.createdAt).toLocaleDateString()}</div>
                            <div style={{ marginBottom: '0.3rem' }}>Time: {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                            <div>Customer: {order.customerName || 'Walk-in Customer'}</div>
                            <div>Phone: {order.phone || '-'}</div>
                            <hr />
                        </div>

                        <div style={{ fontSize: '12px', lineHeight: 1.4, marginTop: '0.5rem', color: '#000' }}>
                            <table style={{ width: '100%', fontFamily: 'monospace', fontSize: '12px', color: '#000' }}>
                                <thead>
                                    <tr>
                                        <th style={{ textAlign: 'left', color: '#000' }}>Item</th>
                                        <th style={{ textAlign: 'center', color: '#000' }}>Qty</th>
                                        <th style={{ textAlign: 'right', color: '#000' }}>Price</th>
                                        <th style={{ textAlign: 'right', color: '#000' }}>Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {order.medicines.map((item, idx) => (
                                        <tr key={idx}>
                                            <td>{item.name}</td>
                                            <td style={{ textAlign: 'center' }}>{item.quantity}</td>
                                            <td style={{ textAlign: 'right' }}>{formatCurrency(item.price)}</td>
                                            <td style={{ textAlign: 'right' }}>{formatCurrency(item.price * item.quantity)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            <hr />
                            <div style={{ textAlign: 'right' }}>
                                <div>Subtotal: {formatCurrency(order.subtotal)}</div>
                                <div>Tax: {formatCurrency(order.tax)}</div>
                                <div style={{ fontWeight: 800 }}>Total: {formatCurrency(order.total)}</div>
                            </div>
                        </div>
                        <div style={{ textAlign: 'center', marginTop: '0.8rem', fontSize: '12px', lineHeight: 1.4 }}>
                            ---
                            <div>Thank you for visiting</div>
                            <div>Get well soon!</div>
                            ---
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InvoicePreview;


