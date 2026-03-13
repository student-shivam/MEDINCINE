import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
    RiArrowLeftLine,
    RiDeleteBinLine,
    RiAddLine,
    RiSubtractLine,
    RiShoppingBag3Line
} from 'react-icons/ri';
import toast from 'react-hot-toast';
import { useCart } from '../context/CartContext';
import api from '../services/api';
import '../styles/pos.css';

const TAX_RATE = 5;

const formatCurrency = (value) => new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
}).format(Number(value || 0));

const Checkout = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const {
        cart,
        updateQty,
        removeFromCart,
        clearCart,
        subtotal: cartSubtotal,
    } = useCart();

    const [customerName, setCustomerName] = useState('');
    const [customerMobile, setCustomerMobile] = useState('');
    const [customerAddress, setCustomerAddress] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('Cash');
    // invoice preview handled on separate page

    const taxAmount = useMemo(
        () => Number((cartSubtotal * (TAX_RATE / 100)).toFixed(2)),
        [cartSubtotal]
    );
    const grandTotal = useMemo(
        () => Number((cartSubtotal + taxAmount).toFixed(2)),
        [cartSubtotal, taxAmount]
    );

    const isCustomerValid = () => {
        if (!customerName.trim()) return false;
        if (!customerMobile.trim()) return false;
        const phonePattern = /^[0-9+\-\s()]{7,20}$/;
        return phonePattern.test(customerMobile.trim());
    };

    const createOrderMutation = useMutation({
        mutationFn: async (payload) => {
            const response = await api.post('/orders', payload);
            return response.data.data;
        },
        onSuccess: (order) => {
            // order saved, clear cart and go to invoice page
            queryClient.invalidateQueries({ queryKey: ['medicines'] });
            queryClient.invalidateQueries({ queryKey: ['orders'] });
            queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
            clearCart();
            navigate(`/invoice/${order._id}`);
        },
        onError: (error) => {
            toast.error(error.response?.data?.error || 'Could not generate invoice');
        },
    });

    const handleGenerateInvoice = () => {
        if (!cart.length) {
            toast.error('Cart is empty');
            return;
        }
        if (!isCustomerValid()) {
            toast.error('Enter valid customer details');
            return;
        }
        const payload = {
            medicines: cart.map((item) => ({
                medicineId: item._id,
                name: item.name,
                price: item.unitPrice,
                quantity: item.qty,
            })),
            paymentMethod,
            taxRate: TAX_RATE,
            customerName: customerName.trim(),
            phone: customerMobile.trim(),
            address: customerAddress.trim(),
        };
        createOrderMutation.mutate(payload);
    };


    if (cart.length === 0) {
        return (
            <div className="page-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '70vh' }}>
                <div style={{ textAlign: 'center', animation: 'fadeIn 0.5s ease' }}>
                    <div style={{ background: '#f8fafc', width: '120px', height: '120px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2rem', boxShadow: 'var(--shadow-md)' }}>
                        <RiShoppingBag3Line size={64} color="var(--text-soft)" />
                    </div>
                    <h2 style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--text-main)', letterSpacing: '-1.5px' }}>Cart is Empty</h2>
                    <p style={{ color: 'var(--text-soft)', marginTop: '0.5rem', fontSize: '1.1rem' }}>Add medicines to create a bill</p>
                    <button onClick={() => navigate('/pos')} className="pos-add-btn" style={{ marginTop: '2.5rem', maxWidth: '200px', margin: '2.5rem auto 0', background: 'var(--primary)', color: 'white' }}>
                        Go to Billing
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="page-container">
            <div className="pos-container fade-in" style={{ paddingBottom: '5rem' }}>
                <div className="checkout-header" style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h1 style={{ fontSize: 'var(--fs-4xl)', fontWeight: 900, color: 'var(--text-main)' }}>Checkout</h1>
                        <p style={{ color: 'var(--text-soft)' }}>Review cart and complete payment</p>
                    </div>
                    <button onClick={() => navigate('/pos')} className="pos-cat-pill">
                        <RiArrowLeftLine /> Back to POS
                    </button>
                </div>

                <div className="checkout-container">
                    <div className="checkout-items">
                        <div className="checkout-table-card" style={{ padding: '2rem' }}>
                            <h3 style={{ marginBottom: '1.5rem', fontWeight: 800, fontSize: '1.25rem' }}>
                                Selected Medicines
                            </h3>
                            <table className="premium-table" style={{ width: '100%' }}>
                                <thead>
                                    <tr>
                                        <th style={{ textAlign: 'left' }}>Description</th>
                                        <th style={{ textAlign: 'center' }}>Qty</th>
                                        <th style={{ textAlign: 'right' }}>Unit Price</th>
                                        <th style={{ textAlign: 'right' }}>Total</th>
                                        <th></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {cart.map(item => (
                                        <tr key={item._id}>
                                            <td style={{ padding: '1rem 0' }}>
                                                <div style={{ fontWeight: 800, color: 'var(--text-main)' }}>{item.name}</div>
                                                <div style={{ fontSize: '0.85rem', color: 'var(--text-soft)' }}>{item.brand || item.categoryName || ''}</div>
                                            </td>
                                            <td style={{ textAlign: 'center' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem' }}>
                                                    <button onClick={() => updateQty(item._id, -1)} className="icon-btn" style={{ width: '28px', height: '28px' }}><RiSubtractLine /></button>
                                                    <span style={{ fontWeight: 800 }}>{item.qty}</span>
                                                    <button onClick={() => updateQty(item._id, 1)} className="icon-btn" style={{ width: '28px', height: '28px' }}><RiAddLine /></button>
                                                </div>
                                            </td>
                                            <td style={{ textAlign: 'right' }}>{formatCurrency(item.unitPrice)}</td>
                                            <td style={{ textAlign: 'right' }}>{formatCurrency(item.unitPrice * item.qty)}</td>
                                            <td style={{ textAlign: 'center' }}>
                                                <button onClick={() => removeFromCart(item._id)} className="icon-btn" style={{ color: '#ef4444' }}>
                                                    <RiDeleteBinLine />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {cart.length === 0 && <p className="pos-empty-text">Cart is empty.</p>}
                        </div>
                    </div>

                    <div className="checkout-sidebar">
                        <div className="checkout-summary-card">
                            <div style={{ marginBottom: '1rem' }}>
                                <h3 style={{ fontSize: '1.25rem', fontWeight: 900, margin: 0 }}>Order Summary</h3>
                            </div>
                            <div className="pos-customer-box slim" style={{ marginBottom: '1rem' }}>
                                <label>
                                    Customer Name
                                    <input
                                        value={customerName}
                                        onChange={(e) => setCustomerName(e.target.value)}
                                        placeholder="Enter customer name"
                                    />
                                </label>
                                <label>
                                    Phone Number
                                    <input
                                        value={customerMobile}
                                        onChange={(e) => setCustomerMobile(e.target.value)}
                                        placeholder="Enter phone number"
                                    />
                                </label>
                                <label>
                                    Address (optional)
                                    <input
                                        value={customerAddress}
                                        onChange={(e) => setCustomerAddress(e.target.value)}
                                        placeholder="Enter address (optional)"
                                    />
                                </label>
                            </div>

                            <div className="pos-payment-box" style={{ marginBottom: '1rem' }}>
                                <p className="pos-payment-title">Payment Method</p>
                                <div className="pos-payment-options">
                                    {['Cash', 'UPI', 'Card'].map((method) => (
                                        <label key={method}>
                                            <input
                                                type="radio"
                                                name="paymentMethod"
                                                value={method}
                                                checked={paymentMethod === method}
                                                onChange={(e) => setPaymentMethod(e.target.value)}
                                            />
                                            <span>{method}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span>Subtotal</span>
                                    <strong>{formatCurrency(cartSubtotal)}</strong>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span>Tax (5%)</span>
                                    <strong>{formatCurrency(taxAmount)}</strong>
                                </div>
                                <div style={{ borderTop: '1px solid #e8edf5', paddingTop: '0.5rem', display: 'flex', justifyContent: 'space-between', fontWeight: 900 }}>
                                    <span>Total</span>
                                    <span>{formatCurrency(grandTotal)}</span>
                                </div>
                            </div>

                            {isCustomerValid() ? (
                                <button
                                    type="button"
                                    className="pos-generate-btn"
                                    style={{ marginTop: '1rem' }}
                                    disabled={!cart.length || createOrderMutation.isPending}
                                    onClick={handleGenerateInvoice}
                                >
                                    {createOrderMutation.isPending ? 'Generating...' : 'Generate Invoice'}
                                </button>
                            ) : (
                                <p className="pos-empty-text" style={{ marginTop: '1rem' }}>
                                    Enter customer name and phone to generate invoice
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
export default Checkout;

