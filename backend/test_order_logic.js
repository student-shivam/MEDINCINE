const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: './.env' });

const Order = require('./models/Order');
const Sale = require('./models/Sale');
const Medicine = require('./models/Medicine');

async function simulateOrderCreation() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');

        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            // Find a medicine to sell
            const medicine = await Medicine.findOne().session(session);
            if (!medicine) {
                console.log('No medicine found to test with.');
                await session.abortTransaction();
                return;
            }

            console.log(`Selling medicine: ${medicine.name}, Stock: ${medicine.quantity}`);

            const quantity = 1;
            const subtotal = medicine.sellingPrice || medicine.unitPrice || 0;
            const tax = subtotal * 0.05;
            const total = subtotal + tax;

            // 1. Create Order (Simulation of controller logic)
            const order = await Order.create([{
                customerName: 'Test Customer',
                phone: '1234567890',
                medicines: [{
                    medicine: medicine._id,
                    name: medicine.name,
                    price: subtotal,
                    quantity: quantity
                }],
                subtotal,
                tax,
                taxRate: 5,
                total,
                paymentMethod: 'Cash'
            }], { session });

            console.log(`Order created: ${order[0].invoiceNumber}`);

            // 2. Create Sale (The logic I added to orderController.js)
            const saleItems = [{
                medicine: medicine._id,
                quantity: quantity,
                sellingPrice: subtotal,
                purchasePrice: medicine.purchasePrice || 0,
                itemTotal: subtotal * quantity,
                itemProfit: (subtotal - (medicine.purchasePrice || 0)) * quantity
            }];

            const totalProfit = saleItems.reduce((acc, si) => acc + si.itemProfit, 0);

            await Sale.create([{
                invoiceNumber: order[0].invoiceNumber,
                medicines: saleItems,
                subtotal,
                gst: tax,
                gstRate: 5,
                grandTotal: total,
                totalProfit,
                paymentMethod: 'Cash',
                customerName: 'Test Customer',
                customerMobile: '1234567890',
                createdAt: order[0].createdAt
            }], { session });

            console.log(`Sale created matching order ${order[0].invoiceNumber}`);

            await session.commitTransaction();
            console.log('Transaction committed successfully.');
        } catch (err) {
            console.error('Inner error:', err);
            await session.abortTransaction();
        } finally {
            session.endSession();
        }

        await mongoose.disconnect();
    } catch (err) {
        console.error('Outer error:', err);
    }
}

simulateOrderCreation();
