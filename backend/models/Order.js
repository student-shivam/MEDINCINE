const mongoose = require('mongoose');
const { getNextInvoiceNumber } = require('../utils/invoiceNumber');

const OrderSchema = new mongoose.Schema({
    invoiceNumber: {
        type: String,
        unique: true,
        index: true,
    },
    customerName: {
        type: String,
        default: 'Walk-in Customer',
        trim: true,
    },
    phone: {
        type: String,
        default: '',
        trim: true,
    },
    medicines: [
        {
            medicine: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Medicine',
                required: true,
            },
            name: {
                type: String,
                required: true,
            },
            price: {
                type: Number,
                required: true,
            },
            quantity: {
                type: Number,
                required: true,
                min: 1,
            },
        },
    ],
    subtotal: {
        type: Number,
        required: true,
    },
    tax: {
        type: Number,
        required: true,
        default: 0,
    },
    taxRate: {
        type: Number,
        default: 0,
    },
    total: {
        type: Number,
        required: true,
    },
    paymentMethod: {
        type: String,
        enum: ['Cash', 'UPI', 'Card'],
        default: 'Cash',
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
}, {
    timestamps: true,
});

OrderSchema.pre('save', async function (next) {
    if (!this.invoiceNumber) {
        this.invoiceNumber = await getNextInvoiceNumber({
            prefix: 'ORD',
            session: this.$session(),
        });
    }
    next();
});

module.exports = mongoose.model('Order', OrderSchema);
