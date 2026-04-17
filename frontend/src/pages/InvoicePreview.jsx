import React, { useMemo, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
    RiArrowLeftLine,
    RiPrinterLine,
} from 'react-icons/ri';
import api from '../services/api';
import PublicNavbar from '../components/layout/PublicNavbar';

const formatCurrency = (value) =>
    new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 2,
    }).format(Number(value || 0));

const formatDate = (value) => {
    if (!value) return '--';
    return new Date(value).toLocaleDateString('en-GB');
};

const formatTime = (value) => {
    if (!value) return '--';
    return new Date(value).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const InvoicePreview = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const invoiceRef = useRef(null);

    const { data: order, isLoading } = useQuery({
        queryKey: ['order-invoice', id],
        queryFn: async () => {
            try {
                const response = await api.get(`/orders/${id}`);
                return response.data.data;
            } catch (err) {
                const response = await api.get(`/sales/${id}`);
                const sale = response.data.data;
                return {
                    ...sale,
                    subtotal: sale.subtotal || 0,
                    tax: sale.gst || sale.tax || 0,
                    taxRate: sale.gstRate || sale.taxRate || 0,
                    total: sale.grandTotal || sale.total || 0,
                    phone: sale.customerMobile || sale.phone || '',
                    customerName: sale.customerName || 'Walk-in Customer',
                    medicines:
                        sale.medicines?.map((item) => ({
                            name: item.name || item.medicine?.name || 'Medicine',
                            quantity: item.quantity || 0,
                            price: item.sellingPrice || item.price || 0,
                            batchNumber: item.medicine?.batchNumber || '',
                            expiryDate: item.medicine?.expiryDate || '',
                        })) || [],
                };
            }
        },
    });

    const invoiceItems = useMemo(() => {
        if (!order?.medicines) return [];
        return order.medicines.map((item, index) => {
            const medicine = item.medicine || {};
            const price = Number(item.price || item.sellingPrice || 0);
            const quantity = Number(item.quantity || 0);
            return {
                serial: index + 1,
                name: item.name || medicine.name || 'Medicine',
                batchNumber: medicine.batchNumber || item.batchNumber || '--',
                expiryDate: formatDate(medicine.expiryDate || item.expiryDate),
                quantity,
                mrp: price,
                amount: price * quantity,
            };
        });
    }, [order]);

    const discountAmount = useMemo(() => {
        const subtotal = Number(order?.subtotal || 0);
        const tax = Number(order?.tax || 0);
        const total = Number(order?.total || 0);
        const discount = subtotal + tax - total;
        return discount > 0 ? discount : 0;
    }, [order]);

    if (isLoading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="error-container">
                <p>Bill not found.</p>
            </div>
        );
    }

    return (
        <div className="public-page-wrapper invoice-screen">
            <PublicNavbar />
            <div className="public-content invoice-screen-content">
                <div className="invoice-controls no-print">
                    <button onClick={() => navigate('/pos')} className="back-pos-btn invoice-control-btn">
                        <RiArrowLeftLine />
                        <span>New Transaction</span>
                    </button>
                    <button onClick={() => window.print()} className="generate-btn-premium invoice-print-btn">
                        <RiPrinterLine size={18} />
                        <span>Print Bill</span>
                    </button>
                </div>

                <div className="invoice-print-page">
                    <div id="invoice-section" className="invoice-print-stage">
                    <div id="invoice" className="medical-invoice-sheet" ref={invoiceRef}>
                        <header className="medical-invoice-header">
                            <h1 className="medical-shop-name">Ravindra Medicine Inventory</h1>
                            <p className="medical-shop-meta">BBD University, Lucknow</p>
                            <p className="medical-shop-meta">Mobile: +91 7707876498 | GSTIN: --</p>
                            <p className="medical-shop-meta">Drug License No: DL-20B-123456 | DL-21B-654321</p>
                        </header>

                        <section className="medical-bill-info-grid">
                            <div className="medical-bill-info-box">
                                <h2 className="medical-box-title">Bill Details</h2>
                                <p><strong>Bill No:</strong> {order.invoiceNumber || '--'}</p>
                                <p><strong>Date:</strong> {formatDate(order.createdAt)}</p>
                                <p><strong>Time:</strong> {formatTime(order.createdAt)}</p>
                            </div>

                            <div className="medical-bill-info-box">
                                <h2 className="medical-box-title">Customer Details</h2>
                                <p><strong>Customer:</strong> {order.customerName || 'Walk-in Customer'}</p>
                                <p><strong>Doctor:</strong> {order.doctorName || '--'}</p>
                                <p><strong>Phone:</strong> {order.phone || '--'}</p>
                            </div>
                        </section>

                        <section className="medical-invoice-table-section">
                            <table className="medical-invoice-table">
                                <thead>
                                    <tr>
                                        <th className="col-sn">S.No</th>
                                        <th className="col-name">Medicine Name</th>
                                        <th className="col-batch">Batch No</th>
                                        <th className="col-expiry">Expiry Date</th>
                                        <th className="col-qty">Quantity</th>
                                        <th className="col-mrp">MRP</th>
                                        <th className="col-amount">Amount</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {invoiceItems.map((item) => (
                                        <tr key={`${item.serial}-${item.name}`}>
                                            <td>{item.serial}</td>
                                            <td className="medical-text-left">{item.name}</td>
                                            <td>{item.batchNumber}</td>
                                            <td>{item.expiryDate}</td>
                                            <td>{item.quantity}</td>
                                            <td>{formatCurrency(item.mrp)}</td>
                                            <td>{formatCurrency(item.amount)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </section>

                        <section className="medical-summary-signature">
                            <div className="medical-notes-box">
                                <h2 className="medical-box-title">Important Notes</h2>
                                <p>Medicines once sold will not be taken back.</p>
                                <p>Keep medicines out of reach of children.</p>
                            </div>

                            <div className="medical-summary-block">
                                <div className="medical-summary-box">
                                    <div className="medical-summary-row">
                                        <span>Subtotal</span>
                                        <span>{formatCurrency(order.subtotal)}</span>
                                    </div>
                                    <div className="medical-summary-row">
                                        <span>Discount</span>
                                        <span>{formatCurrency(discountAmount)}</span>
                                    </div>
                                    <div className="medical-summary-row">
                                        <span>GST</span>
                                        <span>{formatCurrency(order.tax)}</span>
                                    </div>
                                    <div className="medical-summary-row medical-summary-row-total">
                                        <span>Grand Total</span>
                                        <span>{formatCurrency(order.total)}</span>
                                    </div>
                                </div>

                                <div className="medical-signature-section">
                                    <div className="medical-signature-line"></div>
                                    <p>Authorized Signatory (Ravindra)</p>
                                </div>
                            </div>
                        </section>

                        <footer className="medical-invoice-footer">
                            <span>Developed by Ravindra Yadav</span>
                        </footer>
                    </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InvoicePreview;
