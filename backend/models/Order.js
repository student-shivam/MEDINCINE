const mongoose = require('mongoose');

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
        const date = new Date();
        const year = date.getFullYear().toString().slice(-2);
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const count = await mongoose.model('Order').countDocuments() + 1;
        this.invoiceNumber = `ORD-${year}${month}-${count.toString().padStart(5, '0')}`;
    }
    next();
});

module.exports = mongoose.model('Order', OrderSchema);
