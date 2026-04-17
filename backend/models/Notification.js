const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema(
    {
        type: {
            type: String,
            required: true,
            enum: ['low_stock', 'out_of_stock', 'near_expiry', 'expired'],
        },
        message: {
            type: String,
            required: true,
        },
        medicineId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Medicine',
            required: true,
        },
        isRead: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('Notification', NotificationSchema);
