import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
    RiArrowLeftLine,
    RiDeleteBinLine,
    RiAddLine,
    RiSubtractLine,
    RiShoppingBag3Line,
    RiWallet3Line,
    RiBankCardLine,
    RiSmartphoneLine,
    RiPriceTag3Line,
    RiHandCoinLine,
    RiShieldCheckLine,
    RiMedicineBottleFill,
    RiUser3Line,
    RiMapPinLine
} from 'react-icons/ri';
import toast from 'react-hot-toast';
import { useCart } from '../context/CartContext';
import api from '../services/api';
import '../styles/checkout.css';

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
            <div className="premium-empty-state">
                <div className="empty-state-icon-wrapper">
                    <RiShoppingBag3Line size={64} />
                </div>
                <div className="empty-state-text-wrapper">
                    <h3 className="empty-state-title">Your cart is empty</h3>
                    <p className="empty-state-subtitle">Add some medicines to the cart to proceed with checkout</p>
                </div>
                <button onClick={() => navigate('/pos')} className="generate-btn-premium" style={{ maxWidth: '240px', marginTop: '2rem' }}>
                    <RiArrowLeftLine /> Go to POS
                </button>
            </div>
        );
    }

    return (
        <div className="checkout-page fade-in">
            <header className="checkout-header">
                <div className="checkout-header-main">
                    <button onClick={() => navigate('/pos')} className="back-pos-btn checkout-back-btn">
                        <RiArrowLeftLine size={18} />
                        <span>Back to POS</span>
                    </button>
                    <div className="checkout-title-wrap">
                        <h1 className="checkout-page-title">Checkout</h1>
                        <p className="checkout-page-subtitle">Order ID: #{Math.floor(Math.random() * 900000) + 100000}</p>
                    </div>
                </div>
                <div className="checkout-status">
                    <span className="checkout-status-step">1</span>
                    Review & Pay
                </div>
            </header>

            <div className="checkout-grid">
                <div className="checkout-main-col">
                    <section className="checkout-card" style={{ marginBottom: '1.5rem' }}>
                        <h3 className="checkout-card-title">Customer & Payment</h3>
                        <form className="checkout-form checkout-form-grid">
                            <div className="form-group-premium">
                                <label className="checkout-field-label">
                                    <RiUser3Line size={14} color="var(--primary-light)" />
                                    Customer Name
                                </label>
                                <input
                                    className="form-input-premium"
                                    value={customerName}
                                    onChange={(e) => setCustomerName(e.target.value)}
                                    placeholder="e.g. John Doe"
                                    required
                                />
                            </div>
                            <div className="form-group-premium">
                                <label className="checkout-field-label">
                                    <RiSmartphoneLine size={14} color="var(--primary-light)" />
                                    Phone Number
                                </label>
                                <input
                                    className="form-input-premium"
                                    value={customerMobile}
                                    onChange={(e) => setCustomerMobile(e.target.value)}
                                    placeholder="e.g. +91 9876543210"
                                    required
                                />
                            </div>
                            <div className="form-group-premium" style={{ gridColumn: '1 / -1' }}>
                                <label className="checkout-field-label">
                                    <RiMapPinLine size={14} color="var(--primary-light)" />
                                    Address (Optional)
                                </label>
                                <input
                                    className="form-input-premium"
                                    value={customerAddress}
                                    onChange={(e) => setCustomerAddress(e.target.value)}
                                    placeholder="Enter full address"
                                />
                            </div>

                            <div className="form-group-premium" style={{ gridColumn: '1 / -1' }}>
                                <label>Payment Method</label>
                                <div className="payment-methods">
                                    {[
                                        { id: 'Cash', icon: <RiWallet3Line />, label: 'Cash' },
                                        { id: 'UPI', icon: <RiSmartphoneLine />, label: 'UPI' },
                                        { id: 'Card', icon: <RiBankCardLine />, label: 'Card' }
                                    ].map((m) => (
                                        <label key={m.id} className="payment-option">
                                            <input
                                                type="radio"
                                                name="paymentMethod"
                                                value={m.id}
                                                checked={paymentMethod === m.id}
                                                onChange={(e) => setPaymentMethod(e.target.value)}
                                            />
                                            <div className="payment-card">
                                                {m.icon}
                                                <span>{m.label}</span>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </form>
                    </section>

                    <section className="checkout-card" style={{ padding: '1rem' }}>
                        <div className="checkout-items-header">
                            <h3 className="checkout-card-title" style={{ marginBottom: 0 }}>Selected Medicines</h3>
                            <span className="checkout-items-count">{cart.length} Items</span>
                        </div>
                        
                        <div className="checkout-items-list">
                            {cart.map((item) => (
                                <div key={item._id} className="checkout-item-card">
                                    <div className="item-icon-box">
                                        <RiMedicineBottleFill size={28} />
                                    </div>
                                    
                                    <div className="checkout-item-copy">
                                        <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 900, color: 'var(--text-heading)' }}>{item.name}</h4>
                                        <p style={{ margin: '0.2rem 0 0', fontSize: '0.85rem', color: 'var(--text-soft)', fontWeight: 600 }}>{item.brand || 'General Pharm'}</p>
                                    </div>

                                    <div className="item-qty-section">
                                        <div className="qty-control-premium" style={{ margin: 0 }}>
                                            <button onClick={() => updateQty(item._id, -1)} className="qty-btn" style={{ width: '32px', height: '32px' }}>
                                                <RiSubtractLine />
                                            </button>
                                            <span className="qty-value" style={{ fontSize: '1.1rem', minWidth: '30px' }}>{item.qty}</span>
                                            <button onClick={() => updateQty(item._id, 1)} className="qty-btn" style={{ width: '32px', height: '32px' }}>
                                                <RiAddLine />
                                            </button>
                                        </div>
                                        
                                        <div className="checkout-item-total">
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-soft)', fontWeight: 700 }}>Total</div>
                                            <div style={{ fontSize: '1.15rem', fontWeight: 900, color: 'var(--text-heading)' }}>{formatCurrency(item.unitPrice * item.qty)}</div>
                                        </div>

                                        <button onClick={() => removeFromCart(item._id)} className="icon-btn" style={{ color: 'rgba(239, 68, 68, 0.6)', padding: '8px', borderRadius: '12px' }}>
                                            <RiDeleteBinLine size={20} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>
            </div>

            <footer className="checkout-footer-bar">
                <div className="footer-summary">
                    <div className="footer-total-box">
                        <span className="footer-total-label">Subtotal</span>
                        <div className="checkout-footer-meta">
                            <RiPriceTag3Line size={16} color="var(--text-soft)" />
                            <span>{formatCurrency(cartSubtotal)}</span>
                        </div>
                    </div>
                    <div className="footer-total-box">
                        <span className="footer-total-label">Tax (5%)</span>
                        <div className="checkout-footer-meta">
                            <RiHandCoinLine size={16} color="var(--text-soft)" />
                            <span>{formatCurrency(taxAmount)}</span>
                        </div>
                    </div>
                    <div className="footer-total-box grand-total">
                        <span className="footer-total-label">Grand Total</span>
                        <span className="grand-total-amount">{formatCurrency(grandTotal)}</span>
                    </div>
                </div>
                <button
                    type="button"
                    className="generate-btn-premium"
                    disabled={!cart.length || createOrderMutation.isPending || !isCustomerValid()}
                    onClick={handleGenerateInvoice}
                >
                    {createOrderMutation.isPending ? (
                        <>Processing...</>
                    ) : (
                        <>
                            <RiShieldCheckLine size={24} />
                            <span>Complete Payment</span>
                        </>
                    )}
                </button>
            </footer>
        </div>
    );
};
export default Checkout;

