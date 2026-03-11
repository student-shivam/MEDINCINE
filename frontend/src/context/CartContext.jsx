/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState } from 'react';
import toast from 'react-hot-toast';

const CartContext = createContext();

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};

export const CartProvider = ({ children }) => {
    const [cart, setCart] = useState([]);
    const [discount, setDiscount] = useState(0);
    const [discountType, setDiscountType] = useState('amount'); // 'amount' or 'percent'
    const [paymentMethod, setPaymentMethod] = useState('Cash');

    const addToCart = (medicine) => {
        const existing = cart.find(item => item._id === medicine._id);
        if (existing) {
            if (existing.qty + 1 > medicine.quantity) {
                toast.error(`Maximum stock reached for ${medicine.name}`);
                return;
            }
            setCart(cart.map(item =>
                item._id === medicine._id ? { ...item, qty: item.qty + 1 } : item
            ));
            toast.success(`Updated ${medicine.name} quantity`);
        } else {
            if (medicine.quantity < 1) {
                toast.error(`${medicine.name} is out of stock`);
                return;
            }
            setCart([...cart, { ...medicine, qty: 1 }]);
            toast.success(`Added ${medicine.name} to cart`);
        }
    };

    const updateQty = (id, delta) => {
        setCart((prev) => prev.reduce((acc, item) => {
            if (item._id === id) {
                const newQty = item.qty + delta;
                if (newQty < 1) {
                    toast.success(`Removed ${item.name} from cart`);
                    return acc;
                }
                if (newQty > item.quantity) {
                    toast.error('Insufficient stock available');
                    acc.push(item);
                    return acc;
                }
                acc.push({ ...item, qty: newQty });
                return acc;
            }
            acc.push(item);
            return acc;
        }, []));
    };

    const removeFromCart = (id) => {
        const item = cart.find(i => i._id === id);
        setCart(cart.filter(i => i._id !== id));
        if (item) toast.success(`Removed ${item.name} from cart`);
    };

    const clearCart = () => {
        setCart([]);
        setDiscount(0);
        setDiscountType('amount');
        setPaymentMethod('Cash');
    };

    // Financial Calculations
    const subtotal = cart.reduce((acc, item) => acc + ((item.unitPrice || 0) * item.qty), 0);

    // Configurable GST (5%)
    const gstRate = 0.05;
    const gst = parseFloat((subtotal * gstRate).toFixed(2));

    const val = parseFloat(discount) || 0;
    const discountAmount = discountType === 'percent' ? (subtotal * (val / 100)) : val;

    const grandTotal = Math.max(0, subtotal + gst - discountAmount);

    const value = {
        cart,
        addToCart,
        updateQty,
        removeFromCart,
        clearCart,
        discount,
        setDiscount,
        discountType,
        setDiscountType,
        paymentMethod,
        setPaymentMethod,
        subtotal,
        gst,
        grandTotal,
        discountAmount,
        itemCount: cart.reduce((acc, item) => acc + item.qty, 0)
    };

    return (
        <CartContext.Provider value={value}>
            {children}
        </CartContext.Provider>
    );
};
