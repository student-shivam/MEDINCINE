const fs = require('fs');
const path = require('path');
const multer = require('multer');
const mongoose = require('mongoose');
const Medicine = require('../models/Medicine');
const Category = require('../models/Category');
const SubCategory = require('../models/SubCategory');
const StockLog = require('../models/StockLog');
const Sale = require('../models/Sale');
const ErrorResponse = require('../utils/ErrorResponse');
const asyncHandler = require('../middleware/asyncHandler');
const { validateMedicine } = require('../validators/medicineValidator');

const medicineUploadStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, '..', 'uploads', 'medicines');
        fs.mkdirSync(uploadDir, { recursive: true });
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        const userId = req.user?.id || 'system';
        cb(null, `${userId}-${Date.now()}${ext}`);
    },
});

const medicineUploadFilter = (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
        return cb(new ErrorResponse('Only image files are allowed', 400), false);
    }
    cb(null, true);
};

exports.uploadMedicineImage = multer({
    storage: medicineUploadStorage,
    limits: { fileSize: 2 * 1024 * 1024 },
    fileFilter: medicineUploadFilter,
});

const toObjectId = (value) => (mongoose.Types.ObjectId.isValid(value) ? value : null);

const buildRoleQuery = (user) => {
    if (!user) return {};
    if (user?.role === 'admin') return {};
    if (user?.role === 'pharmacist') return { assignedPharmacist: user._id };
    return {};
};

const normalizeMedicine = (medicineDoc) => {
    const medicine = medicineDoc.toObject ? medicineDoc.toObject() : medicineDoc;
    const categoryName = medicine?.categoryId?.name || medicine?.category || '';
    const subcategoryName = medicine?.subcategoryId?.name || '';

    return {
        ...medicine,
        category: categoryName,
        subcategory: subcategoryName,
        quantity: medicine.stock ?? medicine.quantity ?? 0,
        unitPrice: medicine.price ?? medicine.unitPrice ?? 0,
        manufacturer: medicine.brand || medicine.manufacturer || '',
        image: medicine.image || '',
    };
};

const buildPayload = async (req, existingMedicine = null) => {
    let category = null;
    const rawCategoryId = req.body?.categoryId || existingMedicine?.categoryId;
    const categoryId = toObjectId(rawCategoryId);
    if (categoryId) {
        category = await Category.findById(categoryId);
    } else if (req.body?.category) {
        category = await Category.findOne({ name: req.body.category });
    }

    if (!category) {
        throw new ErrorResponse('Category is required', 400);
    }

    let subcategoryId = null;
    const rawSub = req.body?.subcategoryId;
    if (rawSub) {
        const parsedSub = toObjectId(rawSub);
        if (!parsedSub) {
            throw new ErrorResponse('Invalid subcategory', 400);
        }
        const subcategory = await SubCategory.findOne({ _id: parsedSub, categoryId });
        if (!subcategory) {
            throw new ErrorResponse('Selected subcategory not found in selected category', 400);
        }
        subcategoryId = subcategory._id;
    }

    const incomingPrice = req.body?.price !== undefined ? req.body.price : req.body?.unitPrice;
    const incomingStock = req.body?.stock !== undefined ? req.body.stock : req.body?.quantity;
    const price = incomingPrice !== undefined ? Number(incomingPrice) : Number(existingMedicine?.price);
    const stock = incomingStock !== undefined ? Number(incomingStock) : Number(existingMedicine?.stock);
    const lowStockThreshold = req.body?.lowStockThreshold !== undefined
        ? Number(req.body.lowStockThreshold)
        : Number(existingMedicine?.lowStockThreshold ?? 10);

    const imagePath = req.file ? path.posix.join('medicines', req.file.filename) : undefined;

    const payload = {
        name: (req.body?.name || existingMedicine?.name || '').trim(),
        categoryId: category._id,
        subcategoryId,
        category: category.name,
        brand: (req.body?.brand || req.body?.manufacturer || existingMedicine?.brand || existingMedicine?.manufacturer || '').trim(),
        price,
        stock,
        expiryDate: req.body?.expiryDate || existingMedicine?.expiryDate,
        supplier: (req.body?.supplier || existingMedicine?.supplier || '').trim(),
        description: (req.body?.description || existingMedicine?.description || '').trim(),

        // compatibility fields
        genericName: (req.body?.genericName || existingMedicine?.genericName || '').trim(),
        batchNumber: (req.body?.batchNumber || existingMedicine?.batchNumber || '').trim(),
        barcode: (req.body?.barcode || existingMedicine?.barcode || '').trim(),
        quantity: stock,
        unitPrice: price,
        manufacturer: (req.body?.brand || req.body?.manufacturer || existingMedicine?.brand || existingMedicine?.manufacturer || '').trim(),
        purchasePrice: req.body?.purchasePrice !== undefined ? Number(req.body.purchasePrice) : Number(existingMedicine?.purchasePrice || 0),
        sellingPrice: req.body?.sellingPrice !== undefined ? Number(req.body.sellingPrice) : Number(existingMedicine?.sellingPrice || 0),
        storageLocation: (req.body?.storageLocation || existingMedicine?.storageLocation || '').trim(),
        lowStockThreshold: Number.isFinite(lowStockThreshold) ? lowStockThreshold : 10,
        assignedPharmacist: req.body?.assignedPharmacist || existingMedicine?.assignedPharmacist || null,
    };

    if (imagePath !== undefined) {
        payload.image = imagePath;
    }

    return payload;
};

// @desc    Get all medicines
// @route   GET /api/medicines
// @access  Public/Private
exports.getMedicines = asyncHandler(async (req, res) => {
    const baseQuery = buildRoleQuery(req.user);
    const { search, category, status, sort, page = 1, limit = 50, brand } = req.query;

    if (search) {
        baseQuery.$or = [
            { name: { $regex: search, $options: 'i' } },
            { genericName: { $regex: search, $options: 'i' } },
            { brand: { $regex: search, $options: 'i' } },
            { supplier: { $regex: search, $options: 'i' } },
        ];
    }

    if (brand) {
        baseQuery.brand = { $regex: brand, $options: 'i' };
    }

    if (category && category !== 'all') {
        if (mongoose.Types.ObjectId.isValid(category)) {
            baseQuery.categoryId = category;
        } else {
            baseQuery.category = category;
        }
    }

    const now = new Date();
    const thirtyDays = new Date();
    thirtyDays.setDate(now.getDate() + 30);

    if (status === 'expired') {
        baseQuery.expiryDate = { $lt: now };
    } else if (status === 'expiring') {
        baseQuery.expiryDate = { $gte: now, $lte: thirtyDays };
    } else if (status === 'low-stock') {
        baseQuery.$expr = { $lte: ['$stock', '$lowStockThreshold'] };
        baseQuery.stock = { $gt: 0 };
    } else if (status === 'out-of-stock') {
        baseQuery.stock = 0;
    }

    let sortObj = { createdAt: -1 };
    if (sort === 'name') sortObj = { name: 1 };
    else if (sort === 'quantity') sortObj = { stock: 1 };
    else if (sort === 'price') sortObj = { price: -1 };
    else if (sort === 'expiry') sortObj = { expiryDate: 1 };

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const total = await Medicine.countDocuments(baseQuery);
    const medicines = await Medicine.find(baseQuery)
        .populate('categoryId', 'name')
        .populate('subcategoryId', 'name categoryId')
        .populate('assignedPharmacist', 'name email')
        .populate('createdBy', 'name')
        .sort(sortObj)
        .skip(skip)
        .limit(parseInt(limit, 10));

    res.status(200).json({
        success: true,
        count: medicines.length,
        total,
        totalPages: Math.ceil(total / parseInt(limit, 10)),
        currentPage: parseInt(page, 10),
        data: medicines.map(normalizeMedicine),
    });
});

// @desc    Get single medicine
// @route   GET /api/medicines/:id
// @access  Private
exports.getMedicine = asyncHandler(async (req, res, next) => {
    const medicine = await Medicine.findById(req.params.id)
        .populate('categoryId', 'name')
        .populate('subcategoryId', 'name categoryId')
        .populate('assignedPharmacist', 'name email')
        .populate('createdBy', 'name');

    if (!medicine) {
        return next(new ErrorResponse(`Medicine not found with id of ${req.params.id}`, 404));
    }

    if (
        req.user?.role === 'pharmacist'
        && (!medicine.assignedPharmacist || medicine.assignedPharmacist._id.toString() !== req.user.id)
    ) {
        return next(new ErrorResponse('Not authorized to view this medicine', 403));
    }

    const stockHistory = await StockLog.find({ medicine: req.params.id })
        .populate('changedBy', 'name')
        .sort({ createdAt: -1 })
        .limit(20);

    res.status(200).json({ success: true, data: normalizeMedicine(medicine), stockHistory });
});

// @desc    Create new medicine
// @route   POST /api/medicines
// @access  Private/Admin
exports.createMedicine = asyncHandler(async (req, res, next) => {
    const payload = await buildPayload(req);
    payload.createdBy = req.user?.id;

    const { error } = validateMedicine(payload);
    if (error) {
        return next(new ErrorResponse(error.details.map((d) => d.message).join(', '), 400));
    }

    const medicine = await Medicine.create(payload);

    if (medicine.stock > 0) {
        await StockLog.create({
            medicine: medicine._id,
            type: 'increase',
            quantity: medicine.stock,
            previousStock: 0,
            newStock: medicine.stock,
            notes: 'Initial stock entry',
            changedBy: req.user?.id,
        });
    }

    const hydrated = await Medicine.findById(medicine._id)
        .populate('categoryId', 'name')
        .populate('subcategoryId', 'name categoryId');

    res.status(201).json({ success: true, data: normalizeMedicine(hydrated) });
});

// @desc    Update medicine
// @route   PUT /api/medicines/:id
// @access  Private/Admin
exports.updateMedicine = asyncHandler(async (req, res, next) => {
    const medicine = await Medicine.findById(req.params.id);
    if (!medicine) {
        return next(new ErrorResponse(`Medicine not found with id of ${req.params.id}`, 404));
    }

    const previousStock = medicine.stock;
    const payload = await buildPayload(req, medicine);

    const updated = await Medicine.findByIdAndUpdate(req.params.id, payload, {
        new: true,
        runValidators: true,
    })
        .populate('categoryId', 'name')
        .populate('subcategoryId', 'name categoryId');

    if (payload.stock !== undefined && payload.stock !== previousStock) {
        const diff = Math.abs(payload.stock - previousStock);
        await StockLog.create({
            medicine: updated._id,
            type: payload.stock > previousStock ? 'increase' : 'reduce',
            quantity: diff,
            previousStock,
            newStock: payload.stock,
            notes: 'Stock updated from medicine edit',
            changedBy: req.user?.id,
        });
    }

    res.status(200).json({ success: true, data: normalizeMedicine(updated) });
});

// @desc    Delete medicine
// @route   DELETE /api/medicines/:id
// @access  Private/Admin
exports.deleteMedicine = asyncHandler(async (req, res, next) => {
    const medicine = await Medicine.findById(req.params.id);

    if (!medicine) {
        return next(new ErrorResponse(`Medicine not found with id of ${req.params.id}`, 404));
    }

    await StockLog.deleteMany({ medicine: req.params.id });
    await Medicine.findByIdAndDelete(req.params.id);

    res.status(200).json({ success: true, data: {} });
});

// @desc    Increase stock
// @route   PATCH /api/medicines/:id/increase
// @access  Private (Admin, Pharmacist)
exports.increaseStock = asyncHandler(async (req, res, next) => {
    const { quantity, notes } = req.body;

    if (!quantity || quantity <= 0) {
        return next(new ErrorResponse('Please provide a valid quantity to add', 400));
    }

    const medicine = await Medicine.findById(req.params.id);
    if (!medicine) {
        return next(new ErrorResponse('Medicine not found', 404));
    }

    if (
        req.user?.role === 'pharmacist'
        && (!medicine.assignedPharmacist || medicine.assignedPharmacist.toString() !== req.user.id)
    ) {
        return next(new ErrorResponse('Not authorized to update this medicine stock', 403));
    }

    const previousStock = medicine.stock;
    medicine.stock += parseInt(quantity, 10);
    medicine.quantity = medicine.stock;
    await medicine.save();

    await StockLog.create({
        medicine: medicine._id,
        type: 'increase',
        quantity: parseInt(quantity, 10),
        previousStock,
        newStock: medicine.stock,
        notes: notes || '',
        changedBy: req.user.id,
    });

    res.status(200).json({ success: true, data: normalizeMedicine(medicine) });
});

// @desc    Reduce stock
// @route   PATCH /api/medicines/:id/reduce
// @access  Private (Admin, Pharmacist)
exports.reduceStock = asyncHandler(async (req, res, next) => {
    const { quantity, notes } = req.body;

    if (!quantity || quantity <= 0) {
        return next(new ErrorResponse('Please provide a valid quantity to reduce', 400));
    }

    const medicine = await Medicine.findById(req.params.id);
    if (!medicine) {
        return next(new ErrorResponse('Medicine not found', 404));
    }

    if (
        req.user?.role === 'pharmacist'
        && (!medicine.assignedPharmacist || medicine.assignedPharmacist.toString() !== req.user.id)
    ) {
        return next(new ErrorResponse('Not authorized to update this medicine stock', 403));
    }

    if (medicine.stock < parseInt(quantity, 10)) {
        return next(new ErrorResponse(`Insufficient stock. Current: ${medicine.stock}`, 400));
    }

    const previousStock = medicine.stock;
    medicine.stock -= parseInt(quantity, 10);
    medicine.quantity = medicine.stock;
    await medicine.save();

    await StockLog.create({
        medicine: medicine._id,
        type: 'reduce',
        quantity: parseInt(quantity, 10),
        previousStock,
        newStock: medicine.stock,
        notes: notes || '',
        changedBy: req.user.id,
    });

    res.status(200).json({ success: true, data: normalizeMedicine(medicine) });
});

// @desc    Get low stock medicines
// @route   GET /api/medicines/low-stock
// @access  Private
exports.getLowStock = asyncHandler(async (req, res) => {
    const baseQuery = buildRoleQuery(req.user);
    const medicines = await Medicine.find({
        ...baseQuery,
        $expr: { $lte: ['$stock', '$lowStockThreshold'] },
        stock: { $gt: 0 },
    });
    res.status(200).json({ success: true, count: medicines.length, data: medicines.map(normalizeMedicine) });
});

// @desc    Get expired medicines
// @route   GET /api/medicines/expired
// @access  Private
exports.getExpired = asyncHandler(async (req, res) => {
    const baseQuery = buildRoleQuery(req.user);
    const medicines = await Medicine.find({
        ...baseQuery,
        expiryDate: { $lt: new Date() },
    });
    res.status(200).json({ success: true, count: medicines.length, data: medicines.map(normalizeMedicine) });
});

// @desc    Get expiring soon medicines
// @route   GET /api/medicines/expiring-soon
// @access  Private
exports.getExpiringSoon = asyncHandler(async (req, res) => {
    const baseQuery = buildRoleQuery(req.user);
    const now = new Date();
    const thirtyDays = new Date();
    thirtyDays.setDate(now.getDate() + 30);

    const medicines = await Medicine.find({
        ...baseQuery,
        expiryDate: { $gte: now, $lte: thirtyDays },
    });
    res.status(200).json({ success: true, count: medicines.length, data: medicines.map(normalizeMedicine) });
});

// @desc    Get dashboard statistics
// @route   GET /api/medicines/stats
// @access  Private
exports.getStats = asyncHandler(async (req, res) => {
    const baseQuery = buildRoleQuery(req.user);
    const now = new Date();
    const thirtyDays = new Date();
    thirtyDays.setDate(now.getDate() + 30);

    const [totalMedicines, expired, expiringSoon, outOfStock] = await Promise.all([
        Medicine.countDocuments(baseQuery),
        Medicine.countDocuments({ ...baseQuery, expiryDate: { $lt: now } }),
        Medicine.countDocuments({ ...baseQuery, expiryDate: { $gte: now, $lte: thirtyDays } }),
        Medicine.countDocuments({ ...baseQuery, stock: 0 }),
    ]);

    const allMedicines = await Medicine.find(baseQuery).select('stock price lowStockThreshold category');
    const totalStockValue = allMedicines.reduce((acc, m) => acc + ((m.stock || 0) * (m.price || 0)), 0);
    const lowStock = allMedicines.filter((m) => (m.stock || 0) <= m.lowStockThreshold && (m.stock || 0) > 0).length;

    const categoryData = {};
    allMedicines.forEach((m) => {
        categoryData[m.category] = (categoryData[m.category] || 0) + 1;
    });
    const categoryDistribution = Object.entries(categoryData).map(([name, value]) => ({ name, value }));

    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const stockLogs = await StockLog.find({
        type: { $in: ['reduce', 'sale'] },
        createdAt: { $gte: sixMonthsAgo },
    });

    const monthlyUsage = {};
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    for (let i = 5; i >= 0; i -= 1) {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        const key = `${monthNames[d.getMonth()]} ${d.getFullYear()}`;
        monthlyUsage[key] = 0;
    }
    stockLogs.forEach((log) => {
        const d = new Date(log.createdAt);
        const key = `${monthNames[d.getMonth()]} ${d.getFullYear()}`;
        if (monthlyUsage[key] !== undefined) {
            monthlyUsage[key] += log.quantity;
        }
    });
    const monthlyUsageData = Object.entries(monthlyUsage).map(([month, used]) => ({ month, used }));

    const userRole = req.user?.role || 'staff';
    const salesQuery = userRole === 'admin' ? {} : { soldBy: req.user?.id };
    const sales = await Sale.find(salesQuery);
    const totalSales = sales.reduce((acc, s) => acc + s.totalAmount, 0);

    res.status(200).json({
        success: true,
        data: {
            totalMedicines,
            totalStockValue: Math.round(totalStockValue * 100) / 100,
            lowStock,
            expired,
            expiringSoon,
            outOfStock,
            totalSales,
            categoryDistribution,
            monthlyUsageData,
        },
    });
});

// @desc    Export medicines as CSV
// @route   GET /api/medicines/export/csv
// @access  Private (Admin)
exports.exportCSV = asyncHandler(async (req, res) => {
    const medicines = await Medicine.find(buildRoleQuery(req.user))
        .populate('categoryId', 'name')
        .populate('subcategoryId', 'name')
        .populate('assignedPharmacist', 'name')
        .lean();

    const header = 'Name,Category,Subcategory,Brand,Stock,Price,Expiry Date,Supplier,Description,Pharmacist\n';
    const rows = medicines.map((m) => (
        `"${m.name}","${m.categoryId?.name || m.category || ''}","${m.subcategoryId?.name || ''}","${m.brand || ''}",${m.stock || 0},${m.price || 0},"${new Date(m.expiryDate).toISOString().split('T')[0]}","${m.supplier || ''}","${(m.description || '').replace(/"/g, '""')}","${m.assignedPharmacist?.name || ''}"`
    )).join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=medicines_inventory.csv');
    res.status(200).send(header + rows);
});
