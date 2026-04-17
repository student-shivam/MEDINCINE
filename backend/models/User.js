const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a name'],
    },
    email: {
        type: String,
        required: [true, 'Please add an email'],
        unique: true,
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            'Please add a valid email',
        ],
    },
    role: {
        type: String,
        enum: ['admin', 'pharmacist'],
        required: [true, 'Please add a user role'],
        default: 'pharmacist',
    },
    phone: {
        type: String,
        default: '',
        trim: true,
    },
    address: {
        type: String,
        default: '',
        trim: true,
    },
    password: {
        type: String,
        required: [true, 'Please add a password'],
        minlength: 6,
        select: false,
    },
    profileImage: {
        type: String,
        default: '',
    },
    avatar: {
        type: String,
        default: 'default-avatar.png',
    },
    lastLogin: {
        type: Date,
        default: null,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    notifications: {
        lowStock: {
            type: Boolean,
            default: true,
        },
        expiryAlerts: {
            type: Boolean,
            default: true,
        },
        salesUpdates: {
            type: Boolean,
            default: true,
        },
    },
    preferences: {
        theme: {
            type: String,
            enum: ['light', 'dark'],
            default: 'light',
        },
        language: {
            type: String,
            default: 'en',
        },
        defaultDashboardPage: {
            type: String,
            default: 'dashboard',
        },
    },
}, {
    timestamps: true
});

// Encrypt password using bcrypt before saving
UserSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        return next();
    }

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Match user entered password to hashed password in database
UserSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
