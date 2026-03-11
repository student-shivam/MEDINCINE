const mongoose = require('mongoose');

const StockLogSchema = new mongoose.Schema({
    medicine: {
        type: mongoose.Schema.ObjectId,
        ref: 'Medicine',
        required: true,
    },
    type: {
        type: String,
        enum: ['increase', 'reduce', 'sale', 'adjustment'],
        required: true,
    },
    quantity: {
        type: Number,
        required: true,
    },
    previousStock: {
        type: Number,
        required: true,
    },
    newStock: {
        type: Number,
        required: true,
    },
    notes: {
        type: String,
        default: '',
    },
    changedBy: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: false,
    },
}, {
    timestamps: true,
});

StockLogSchema.index({ medicine: 1, createdAt: -1 });

module.exports = mongoose.model('StockLog', StockLogSchema);
