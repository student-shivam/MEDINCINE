const mongoose = require('mongoose');

const SaleSchema = new mongoose.Schema({
    invoiceNumber: {
        type: String,
        unique: true,
        index: true
    },
    medicines: [
        {
            medicine: {
                type: mongoose.Schema.ObjectId,
                ref: 'Medicine',
                required: true
            },
            quantity: {
                type: Number,
                required: true,
                min: [1, 'Quantity must be at least 1']
            },
            sellingPrice: {
                type: Number,
                required: true
            },
            purchasePrice: {
                type: Number,
                required: true
            },
            itemTotal: {
                type: Number,
                required: true
            },
            itemProfit: {
                type: Number,
                required: true
            }
        }
    ],
    subtotal: {
        type: Number,
        required: true
    },
    gst: {
        type: Number,
        required: true,
        default: 0
    },
    gstRate: {
        type: Number,
        default: 5,
    },
    cgst: {
        type: Number,
        default: 0,
    },
    sgst: {
        type: Number,
        default: 0,
    },
    amountReceived: {
        type: Number,
        default: 0,
    },
    returnAmount: {
        type: Number,
        default: 0,
    },
    discount: {
        type: Number,
        default: 0
    },
    discountType: {
        type: String,
        enum: ['amount', 'percent'],
        default: 'amount'
    },
    discountValue: {
        type: Number,
        default: 0
    },
    grandTotal: {
        type: Number,
        required: true
    },
    totalProfit: {
        type: Number,
        required: true
    },
    paymentMethod: {
        type: String,
        enum: ['Cash', 'Card', 'UPI', 'Net Banking'],
        default: 'Cash'
    },
    storeId: {
        type: String,
        default: 'Main Store'
    },
    customerName: {
        type: String,
        default: '',
        trim: true,
    },
    customerMobile: {
        type: String,
        default: '',
        trim: true,
    },
    soldBy: {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
    },
    saleDate: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Auto-generate Invoice Number
SaleSchema.pre('save', async function (next) {
    if (!this.invoiceNumber) {
        const date = new Date();
        const year = date.getFullYear().toString().slice(-2);
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const count = await mongoose.model('Sale').countDocuments() + 1;
        this.invoiceNumber = `INV-${year}${month}-${count.toString().padStart(5, '0')}`;
    }
    next();
});

module.exports = mongoose.model('Sale', SaleSchema);
