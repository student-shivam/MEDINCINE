const User = require('../models/User');
const ErrorResponse = require('../utils/ErrorResponse');
const asyncHandler = require('../middleware/asyncHandler');
const { validateRegister, validateLogin } = require('../validators/authValidator');
const jwt = require('jsonwebtoken');

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = asyncHandler(async (req, res, next) => {
    // Validate data
    const { error } = validateRegister(req.body);
    if (error) {
        return next(new ErrorResponse(error.details[0].message, 400));
    }

    const { name, email, password } = req.body;
    // for public registration we do not trust the client to assign roles;
    // every new account is a pharmacist by default. an admin user should be
    // created either by the seeded default admin or via the admin panel.
    const role = 'pharmacist';

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
        return next(new ErrorResponse('Email already exists', 400));
    }

    // Create user
    const user = await User.create({
        name,
        email,
        password,
        role,
    });

    sendTokenResponse(user, 201, res);
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = asyncHandler(async (req, res, next) => {
    // Validate data
    const { error } = validateLogin(req.body);
    if (error) {
        return next(new ErrorResponse(error.details[0].message, 400));
    }

    const { email, password } = req.body;

    // Check for user
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
        return next(new ErrorResponse('Invalid credentials', 401));
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
        return next(new ErrorResponse('Invalid credentials', 401));
    }

    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    sendTokenResponse(user, 200, res);
});

// Get token from model, create token and send response
// this helper is used by register and login; it will also return the
// newly-created user object without the password so the front-end can
// persist an authenticated session immediately.
const sendTokenResponse = (user, statusCode, res) => {
    if (!process.env.JWT_SECRET) {
        // Should never happen if startup check passed but guard just in case
        return res.status(500).json({
            success: false,
            error: 'Server configuration error (JWT_SECRET missing)',
        });
    }

    let token;
    try {
        token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_EXPIRE,
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            error: 'Failed to generate authentication token',
        });
    }

    // Remove password from user object
    const userObj = user.toObject();
    delete userObj.password;

    res.status(statusCode).json({
        success: true,
        token,
        data: userObj,
    });
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.user.id);

    res.status(200).json({
        success: true,
        data: user,
    });
});

// @desc    Upload profile picture
// @route   PUT /api/auth/avatar
// @access  Private
exports.uploadAvatar = asyncHandler(async (req, res, next) => {
    if (!req.file) {
        return next(new ErrorResponse('Please upload a file', 400));
    }

    const user = await User.findByIdAndUpdate(
        req.user.id,
        { avatar: req.file.filename, profileImage: req.file.filename },
        { new: true, runValidators: true }
    );

    res.status(200).json({
        success: true,
        data: user,
    });
});

// @desc    Update user profile (name & email)
// @route   PUT /api/auth/profile
// @access  Private
exports.updateProfile = asyncHandler(async (req, res, next) => {
    const { name, email } = req.body;

    if (!name && !email) {
        return next(new ErrorResponse('Please provide name or email to update', 400));
    }

    // If email is being changed, check uniqueness
    if (email) {
        const existing = await User.findOne({ email, _id: { $ne: req.user.id } });
        if (existing) {
            return next(new ErrorResponse('Email already in use by another account', 400));
        }
    }

    const fieldsToUpdate = {};
    if (name) fieldsToUpdate.name = name;
    if (email) fieldsToUpdate.email = email;

    const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
        new: true,
        runValidators: true,
    });

    res.status(200).json({
        success: true,
        data: user,
    });
});

// @desc    Change password
// @route   PUT /api/auth/password
// @access  Private
exports.changePassword = asyncHandler(async (req, res, next) => {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
        return next(new ErrorResponse('Please provide current and new password', 400));
    }

    if (newPassword.length < 6) {
        return next(new ErrorResponse('New password must be at least 6 characters', 400));
    }

    const user = await User.findById(req.user.id).select('+password');

    // Check current password
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
        return next(new ErrorResponse('Current password is incorrect', 401));
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({
        success: true,
        message: 'Password updated successfully',
    });
});

// @desc    Delete user account
// @route   DELETE /api/auth/account
// @access  Private
exports.deleteAccount = asyncHandler(async (req, res, next) => {
    const { password } = req.body;

    if (!password) {
        return next(new ErrorResponse('Please provide your password to confirm', 400));
    }

    const user = await User.findById(req.user.id).select('+password');

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
        return next(new ErrorResponse('Password is incorrect', 401));
    }

    await User.findByIdAndDelete(req.user.id);

    res.status(200).json({
        success: true,
        message: 'Account deleted successfully',
    });
});
