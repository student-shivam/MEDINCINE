const User = require('../models/User');
const ErrorResponse = require('../utils/ErrorResponse');
const asyncHandler = require('../middleware/asyncHandler');
const Medicine = require('../models/Medicine');
const Sale = require('../models/Sale');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const profileUploadStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, '..', 'uploads', 'profile');
        fs.mkdirSync(uploadDir, { recursive: true });
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        cb(null, `${req.user.id}-${Date.now()}${ext}`);
    },
});

const profileUploadFilter = (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
        return cb(new ErrorResponse('Only image files are allowed', 400), false);
    }
    cb(null, true);
};

exports.uploadProfileImage = multer({
    storage: profileUploadStorage,
    limits: { fileSize: 2 * 1024 * 1024 },
    fileFilter: profileUploadFilter,
});

// @desc    Get current user profile summary with role stats and recent activity
// @route   GET /api/users/profile-summary
// @access  Private
exports.getProfileSummary = asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.user.id);
    if (!user) {
        return next(new ErrorResponse('User not found', 404));
    }

    const isAdmin = user.role === 'admin';
    const salesQuery = isAdmin ? {} : { soldBy: req.user.id };
    const medicineQuery = isAdmin
        ? {}
        : { $or: [{ assignedPharmacist: req.user.id }, { createdBy: req.user.id }] };

    const [totalMedicines, totalUsers, totalBillsGenerated, salesAgg, medicines, sales] = await Promise.all([
        isAdmin ? Medicine.countDocuments() : null,
        isAdmin ? User.countDocuments() : null,
        Sale.countDocuments(salesQuery),
        Sale.aggregate([
            { $match: salesQuery },
            { $unwind: '$medicines' },
            {
                $group: {
                    _id: null,
                    medicinesSold: { $sum: '$medicines.quantity' },
                    totalSales: { $sum: '$grandTotal' },
                },
            },
        ]),
        Medicine.find(medicineQuery)
            .sort({ updatedAt: -1 })
            .limit(5)
            .select('name quantity updatedAt'),
        Sale.find(salesQuery)
            .sort({ createdAt: -1 })
            .limit(5)
            .select('invoiceNumber grandTotal createdAt medicines')
            .lean(),
    ]);

    const metrics = {
        totalMedicines: isAdmin ? totalMedicines : undefined,
        totalUsers: isAdmin ? totalUsers : undefined,
        totalSales: isAdmin ? (salesAgg[0]?.totalSales || 0) : undefined,
        medicinesSold: !isAdmin ? (salesAgg[0]?.medicinesSold || 0) : undefined,
        totalBillsGenerated: !isAdmin ? totalBillsGenerated : undefined,
    };

    const recentActivity = {
        lastLogin: user.lastLogin || null,
        medicineUpdates: medicines.map((m) => ({
            id: m._id,
            name: m.name,
            quantity: m.quantity,
            updatedAt: m.updatedAt,
        })),
        recentSales: sales.map((s) => ({
            id: s._id,
            invoiceNumber: s.invoiceNumber,
            grandTotal: s.grandTotal,
            itemCount: (s.medicines || []).length,
            createdAt: s.createdAt,
        })),
    };

    res.status(200).json({
        success: true,
        data: {
            user,
            metrics,
            recentActivity,
        },
    });
});

// @desc    Update own profile
// @route   PUT /api/users/update-profile
// @access  Private
exports.updateMyProfile = asyncHandler(async (req, res, next) => {
    const { name, phone, address } = req.body;
    const updates = {};

    if (typeof name === 'string') {
        if (!name.trim()) {
            return next(new ErrorResponse('Name cannot be empty', 400));
        }
        updates.name = name.trim();
    }

    if (typeof phone === 'string') {
        updates.phone = phone.trim();
    }

    if (typeof address === 'string') {
        updates.address = address.trim();
    }

    if (!Object.keys(updates).length) {
        return next(new ErrorResponse('Please provide profile fields to update', 400));
    }

    const user = await User.findByIdAndUpdate(req.user.id, updates, {
        new: true,
        runValidators: true,
    });

    res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
        data: user,
    });
});

// @desc    Upload/replace own profile image
// @route   PUT /api/users/upload-avatar
// @access  Private
exports.uploadMyAvatar = asyncHandler(async (req, res, next) => {
    if (req.body?.remove === 'true' || req.body?.remove === true) {
        const user = await User.findByIdAndUpdate(
            req.user.id,
            { profileImage: '', avatar: 'default-avatar.png' },
            { new: true, runValidators: true }
        );

        return res.status(200).json({
            success: true,
            message: 'Profile image removed successfully',
            data: user,
        });
    }

    if (!req.file) {
        return next(new ErrorResponse('Please upload an image', 400));
    }

    const filename = path.posix.join('profile', req.file.filename);
    const user = await User.findByIdAndUpdate(
        req.user.id,
        { profileImage: filename, avatar: filename },
        { new: true, runValidators: true }
    );

    res.status(200).json({
        success: true,
        message: 'Profile image updated successfully',
        data: user,
    });
});

// @desc    Change own password
// @route   PUT /api/users/change-password
// @access  Private
exports.changeMyPassword = asyncHandler(async (req, res, next) => {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!currentPassword || !newPassword || !confirmPassword) {
        return next(new ErrorResponse('All password fields are required', 400));
    }

    if (newPassword.length < 6) {
        return next(new ErrorResponse('New password must be at least 6 characters', 400));
    }

    if (newPassword !== confirmPassword) {
        return next(new ErrorResponse('New password and confirm password do not match', 400));
    }

    const user = await User.findById(req.user.id).select('+password');
    const isMatch = await user.matchPassword(currentPassword);

    if (!isMatch) {
        return next(new ErrorResponse('Current password is incorrect', 401));
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({
        success: true,
        message: 'Password changed successfully',
    });
});

// @desc    Update notification settings
// @route   PUT /api/users/update-notifications
// @access  Private
exports.updateNotificationSettings = asyncHandler(async (req, res, next) => {
    const { lowStock, expiryAlerts, salesUpdates } = req.body;

    const updates = {};
    if (typeof lowStock === 'boolean') updates['notifications.lowStock'] = lowStock;
    if (typeof expiryAlerts === 'boolean') updates['notifications.expiryAlerts'] = expiryAlerts;
    if (typeof salesUpdates === 'boolean') updates['notifications.salesUpdates'] = salesUpdates;

    if (!Object.keys(updates).length) {
        return next(new ErrorResponse('Please provide valid notification settings', 400));
    }

    const user = await User.findByIdAndUpdate(req.user.id, updates, {
        new: true,
        runValidators: true,
    });

    res.status(200).json({
        success: true,
        message: 'Notification settings updated successfully',
        data: user,
    });
});

// @desc    Update system preferences
// @route   PUT /api/users/update-preferences
// @access  Private
exports.updateSystemPreferences = asyncHandler(async (req, res, next) => {
    const { theme, language, defaultDashboardPage } = req.body;
    const allowedPages = ['dashboard', 'medicines', 'sales', 'analytics', 'profile'];
    const updates = {};

    if (theme) {
        if (!['light', 'dark'].includes(theme)) {
            return next(new ErrorResponse('Theme must be light or dark', 400));
        }
        updates['preferences.theme'] = theme;
    }

    if (language && typeof language === 'string') {
        updates['preferences.language'] = language.trim().toLowerCase();
    }

    if (defaultDashboardPage) {
        if (!allowedPages.includes(defaultDashboardPage)) {
            return next(new ErrorResponse('Invalid default dashboard page', 400));
        }
        updates['preferences.defaultDashboardPage'] = defaultDashboardPage;
    }

    if (!Object.keys(updates).length) {
        return next(new ErrorResponse('Please provide valid preference fields', 400));
    }

    const user = await User.findByIdAndUpdate(req.user.id, updates, {
        new: true,
        runValidators: true,
    });

    res.status(200).json({
        success: true,
        message: 'System preferences updated successfully',
        data: user,
    });
});

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
exports.getUsers = asyncHandler(async (req, res, next) => {
    let query;

    // Search functionality
    let queryObj = {};
    if (req.query.search) {
        const search = req.query.search;
        queryObj.$or = [
            { name: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } }
        ];
    }

    query = User.find(queryObj);

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await User.countDocuments(queryObj);

    query = query.skip(startIndex).limit(limit);

    const users = await query;

    // Pagination result
    const pagination = {};

    if (endIndex < total) {
        pagination.next = {
            page: page + 1,
            limit
        };
    }

    if (startIndex > 0) {
        pagination.prev = {
            page: page - 1,
            limit
        };
    }

    res.status(200).json({
        success: true,
        count: users.length,
        total,
        pagination,
        data: users
    });
});

// @desc    Get single user
// @route   GET /api/users/:id
// @access  Private/Admin
exports.getUser = asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.params.id);

    if (!user) {
        return next(new ErrorResponse(`User not found with id of ${req.params.id}`, 404));
    }

    res.status(200).json({
        success: true,
        data: user
    });
});

// @desc    Create user
// @route   POST /api/users
// @access  Private/Admin
exports.createUser = asyncHandler(async (req, res, next) => {
    const user = await User.create(req.body);

    res.status(201).json({
        success: true,
        data: user
    });
});

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private/Admin
exports.updateUser = asyncHandler(async (req, res, next) => {
    let user = await User.findById(req.params.id);

    if (!user) {
        return next(new ErrorResponse(`User not found with id of ${req.params.id}`, 404));
    }

    // If password is being updated, we need to hash it
    // But for this controller, we typically use the auth controller for password changes
    // However, for admin user management, we might want to allow it
    if (req.body.password) {
        user.password = req.body.password;
        delete req.body.password;
    }

    // Prevent admin from changing their own role
    if (req.body.role && req.user?.id === req.params.id) {
        return next(new ErrorResponse('You cannot change your own role', 400));
    }

    // Update other fields
    Object.keys(req.body).forEach(key => {
        user[key] = req.body[key];
    });

    await user.save();

    res.status(200).json({
        success: true,
        data: user
    });
});

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
exports.deleteUser = asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.params.id);

    if (!user) {
        return next(new ErrorResponse(`User not found with id of ${req.params.id}`, 404));
    }

    // Prevent admin from deleting themselves
    if (req.user.id === req.params.id) {
        return next(new ErrorResponse('You cannot delete your own account from the management panel', 400));
    }

    await user.deleteOne();

    res.status(200).json({
        success: true,
        data: {}
    });
});

// @desc    Update user status (Active/Inactive)
// @route   PATCH /api/users/:id/status
// @access  Private/Admin
exports.updateUserStatus = asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.params.id);

    if (!user) {
        return next(new ErrorResponse(`User not found with id of ${req.params.id}`, 404));
    }

    user.isActive = req.body.isActive !== undefined ? req.body.isActive : !user.isActive;
    await user.save();

    res.status(200).json({
        success: true,
        data: user
    });
});
