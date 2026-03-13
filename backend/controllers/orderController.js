const mongoose = require('mongoose');
const Sale = require('../models/Sale');
const Medicine = require('../models/Medicine');
const Order = require('../models/Order');
const ErrorResponse = require('../utils/ErrorResponse');
const asyncHandler = require('../middleware/asyncHandler');

const parseNumber = (val, fallback = 0) => {
    const num = Number(val);
    return Number.isFinite(num) ? num : fallback;
};

// @route POST /api/orders
// @access Protected (admin, pharmacist)
exports.createOrder = asyncHandler(async (req, res, next) => {
    const { customerName, phone, medicines = [], paymentMethod = 'Cash', taxRate = 0 } = req.body;

    if (!Array.isArray(medicines) || medicines.length === 0) {
        return next(new ErrorResponse('No medicines provided', 400));
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        let subtotal = 0;
        const items = [];

        for (const item of medicines) {
            const medicineDoc = await Medicine.findById(item.medicineId).session(session);
            if (!medicineDoc) {
                throw new ErrorResponse(`Medicine not found: ${item.medicineId}`, 404);
            }

            const availableStock = Number(medicineDoc.stock ?? medicineDoc.quantity ?? 0);
            const quantity = parseNumber(item.quantity, 0);

            if (quantity < 1) {
                throw new ErrorResponse('Quantity must be at least 1', 400);
            }

            if (availableStock < quantity) {
                throw new ErrorResponse(`Insufficient stock for ${medicineDoc.name}. Available: ${availableStock}`, 400);
            }

            const price = parseNumber(item.price ?? item.unitPrice ?? medicineDoc.price ?? medicineDoc.unitPrice, 0);
            const lineTotal = price * quantity;

            items.push({
                medicine: medicineDoc._id,
                name: item.name || medicineDoc.name,
                price,
                quantity,
            });

            subtotal += lineTotal;

            medicineDoc.stock = availableStock - quantity;
            medicineDoc.quantity = medicineDoc.stock;
            await medicineDoc.save({ session });
        }

        const normalizedTaxRate = parseNumber(taxRate, 0);
        const tax = Number((subtotal * (normalizedTaxRate / 100)).toFixed(2));
        const total = Number((subtotal + tax).toFixed(2));

        const order = await Order.create([{
            customerName: (customerName || 'Walk-in Customer').trim(),
            phone: (phone || '').trim(),
            medicines: items,
            subtotal,
            tax,
            taxRate: normalizedTaxRate,
            total,
            paymentMethod,
            createdBy: req.user?._id || null,
        }], { session });

        // CREATE CORRESPONDING SALE RECORD FOR DASHBOARD
        const Sale = mongoose.model('Sale');
        const saleItems = [];
        for (const item of items) {
            const med = await Medicine.findById(item.medicine).session(session);
            const pPrice = med ? med.purchasePrice || 0 : 0;
            saleItems.push({
                medicine: item.medicine,
                quantity: item.quantity,
                sellingPrice: item.price,
                purchasePrice: pPrice,
                itemTotal: item.price * item.quantity,
                itemProfit: (item.price - pPrice) * item.quantity
            });
        }

        const totalProfit = saleItems.reduce((acc, si) => acc + si.itemProfit, 0);

        console.log(`[POS-SYNC] Creating Sale for Order: ${order[0].invoiceNumber}, Total: ${total}, Profit: ${totalProfit}`);

        await Sale.create([{
            invoiceNumber: order[0].invoiceNumber,
            medicines: saleItems,
            subtotal,
            gst: tax,
            gstRate: normalizedTaxRate,
            grandTotal: total,
            totalProfit,
            paymentMethod,
            customerName: (customerName || 'Walk-in Customer').trim(),
            customerMobile: (phone || '').trim(),
            soldBy: req.user?._id || null,
            createdAt: order[0].createdAt
        }], { session });

        console.log(`[POS-SYNC] Sale record created successfully for ${order[0].invoiceNumber}`);

        await session.commitTransaction();
        session.endSession();

        res.status(201).json({ success: true, data: order[0] });
    } catch (err) {
        await session.abortTransaction();
        session.endSession();
        next(err);
    }
});

// @route GET /api/orders/:id
// @access Protected (admin, pharmacist)
exports.getOrder = asyncHandler(async (req, res, next) => {
    const order = await Order.findById(req.params.id)
        .populate('medicines.medicine', 'name brand')
        .populate('createdBy', 'name email');

    if (!order) {
        return next(new ErrorResponse('Order not found', 404));
    }

    res.status(200).json({ success: true, data: order });
});
