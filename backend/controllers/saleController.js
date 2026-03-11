const Sale = require('../models/Sale');
const Medicine = require('../models/Medicine');
const StockLog = require('../models/StockLog');
const ErrorResponse = require('../utils/ErrorResponse');
const asyncHandler = require('../middleware/asyncHandler');
const { validateSale } = require('../validators/saleValidator');
const { generateSalePDF } = require('../utils/pdfGenerator');

// @desc    Create new sale
// @route   POST /api/sales
// @access  Public (for POS)
exports.createSale = asyncHandler(async (req, res, next) => {
    const { error } = validateSale(req.body);
    if (error) {
        return next(new ErrorResponse(error.details[0].message, 400));
    }

    const {
        medicines,
        paymentMethod,
        discount,
        discountType,
        discountValue,
        gstRate,
        amountReceived,
        returnAmount,
        storeId,
        customerName,
        customerMobile
    } = req.body;

    let subtotal = 0;
    const saleItems = [];

    // Start transaction if possible, but for simplicity let's do it with basic logic first
    // We need to fetch each medicine to get prices and update stock

    for (const item of medicines) {
        const medicine = await Medicine.findById(item.medicineId);
        if (!medicine) {
            return next(new ErrorResponse(`Medicine not found: ${item.medicineId}`, 404));
        }

        const availableStock = Number(medicine.stock ?? medicine.quantity ?? 0);

        if (availableStock < item.quantity) {
            return next(new ErrorResponse(`Insufficient stock for ${medicine.name}. Available: ${availableStock}`, 400));
        }

        const sellingPrice = item.sellingPrice || medicine.sellingPrice || medicine.unitPrice;
        const purchasePrice = medicine.purchasePrice || 0;
        const itemTotal = sellingPrice * item.quantity;
        const itemProfit = (sellingPrice - purchasePrice) * item.quantity;

        saleItems.push({
            medicine: medicine._id,
            quantity: item.quantity,
            sellingPrice,
            purchasePrice,
            itemTotal,
            itemProfit
        });

        subtotal += itemTotal;

        // Update stock
        const previousStock = availableStock;
        const updatedStock = availableStock - item.quantity;
        medicine.stock = updatedStock;
        medicine.quantity = updatedStock;
        await medicine.save();

        // Log stock change
        await StockLog.create({
            medicine: medicine._id,
            type: 'sale',
            quantity: item.quantity,
            previousStock,
            newStock: updatedStock,
            notes: `Sale transaction`,
            changedBy: req.user ? req.user.id : null
        });
    }

    const normalizedDiscountValue = typeof discountValue !== 'undefined'
        ? Number(discountValue) || 0
        : Number(discount) || 0;

    let totalDiscount = 0;
    if (discountType === 'percent') {
        totalDiscount = (subtotal * normalizedDiscountValue) / 100;
    } else {
        totalDiscount = normalizedDiscountValue;
    }

    const parsedGstRate = Number(gstRate);
    const normalizedGstRate = Number.isFinite(parsedGstRate) && parsedGstRate >= 0 ? parsedGstRate : 5;
    const gst = Number((subtotal * (normalizedGstRate / 100)).toFixed(2));
    const cgst = Number((gst / 2).toFixed(2));
    const sgst = Number((gst / 2).toFixed(2));
    const grandTotal = Math.max(0, Number((subtotal + gst - totalDiscount).toFixed(2)));

    const totalProfit = saleItems.reduce((acc, item) => acc + item.itemProfit, 0) - totalDiscount;

    const sale = await Sale.create({
        medicines: saleItems,
        subtotal,
        gst,
        gstRate: normalizedGstRate,
        cgst,
        sgst,
        discount: totalDiscount,
        discountType: discountType || 'amount',
        discountValue: normalizedDiscountValue,
        grandTotal,
        totalProfit,
        paymentMethod,
        amountReceived: Number(amountReceived) || 0,
        returnAmount: Number(returnAmount) || 0,
        storeId: storeId || 'Main Store',
        customerName: customerName || '',
        customerMobile: customerMobile || '',
        soldBy: req.user ? req.user.id : null
    });

    res.status(201).json({
        success: true,
        data: sale
    });
});

// @desc    Get all sales
// @route   GET /api/sales
// @access  Private
exports.getSales = asyncHandler(async (req, res, next) => {
    const { page = 1, limit = 10, invoiceNumber, startDate, endDate } = req.query;

    const query = {};

    if (invoiceNumber) {
        query.invoiceNumber = { $regex: invoiceNumber, $options: 'i' };
    }

    if (startDate || endDate) {
        query.createdAt = {};
        if (startDate) query.createdAt.$gte = new Date(startDate);
        if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Sale.countDocuments(query);

    const sales = await Sale.find(query)
        .populate('medicines.medicine', 'name')
        .populate('soldBy', 'name')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));

    res.status(200).json({
        success: true,
        count: sales.length,
        pagination: {
            total,
            pages: Math.ceil(total / limit),
            page: parseInt(page),
            limit: parseInt(limit)
        },
        data: sales
    });
});

// @desc    Get sale by ID
// @route   GET /api/sales/:id
// @access  Public
exports.getSale = asyncHandler(async (req, res, next) => {
    const sale = await Sale.findById(req.params.id)
        .populate('medicines.medicine', 'name genericName batchNumber expiryDate')
        .populate('soldBy', 'name email');

    if (!sale) {
        return next(new ErrorResponse(`Sale not found with id of ${req.params.id}`, 404));
    }

    res.status(200).json({
        success: true,
        data: sale
    });
});

// @desc    Get sale by invoice number
// @route   GET /api/sales/invoice/:invoiceNumber
// @access  Public
exports.getSaleByInvoiceNumber = asyncHandler(async (req, res, next) => {
    const sale = await Sale.findOne({ invoiceNumber: req.params.invoiceNumber })
        .populate('medicines.medicine', 'name genericName batchNumber expiryDate')
        .populate('soldBy', 'name email');

    if (!sale) {
        return next(new ErrorResponse(`Sale not found with invoice number ${req.params.invoiceNumber}`, 404));
    }

    res.status(200).json({
        success: true,
        data: sale
    });
});

// @desc    Get sales analytics
// @route   GET /api/sales/analytics
// @access  Private/Admin
exports.getSalesAnalytics = asyncHandler(async (req, res, next) => {
    const totalTransactions = await Sale.countDocuments();
    const aggregateData = await Sale.aggregate([
        {
            $group: {
                _id: null,
                totalRevenue: { $sum: '$grandTotal' },
                totalProfit: { $sum: '$totalProfit' }
            }
        }
    ]);

    const totalRevenue = aggregateData.length > 0 ? aggregateData[0].totalRevenue : 0;
    const totalProfit = aggregateData.length > 0 ? aggregateData[0].totalProfit : 0;
    const totalCost = totalRevenue - totalProfit;

    res.status(200).json({
        success: true,
        data: {
            totalTransactions,
            totalRevenue,
            totalCost,
            totalProfit
        }
    });
});

// @desc    Download invoice (dummy for now, usually triggers PDF)
// @route   GET /api/sales/:id/invoice
// @access  Public
exports.downloadInvoice = asyncHandler(async (req, res, next) => {
    res.status(200).json({
        success: true,
        message: 'Invoice download triggered'
    });
});

// @desc    Get PDF Invoice
// @route   GET /api/sales/:id/pdf
// @access  Public
exports.getPDFInvoice = asyncHandler(async (req, res, next) => {
    const sale = await Sale.findById(req.params.id)
        .populate('medicines.medicine', 'name')
        .populate('soldBy', 'name email');

    if (!sale) {
        return next(new ErrorResponse(`Sale not found with id of ${req.params.id}`, 404));
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=invoice-${sale.invoiceNumber}.pdf`);

    generateSalePDF(sale, res);
});
