const mongoose = require('mongoose');

const MedicineSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Please add a medicine name'],
            trim: true,
            index: true,
        },
        categoryId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Category',
            required: [true, 'Please select a category'],
        },
        subcategoryId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'SubCategory',
            default: null,
        },
        brand: {
            type: String,
            required: [true, 'Please add a brand name'],
            trim: true,
        },
        price: {
            type: Number,
            required: [true, 'Please add price'],
            min: [0, 'Price cannot be negative'],
        },
        stock: {
            type: Number,
            required: [true, 'Please add stock quantity'],
            min: [0, 'Stock cannot be negative'],
            default: 0,
        },
        expiryDate: {
            type: Date,
            required: [true, 'Please add an expiry date'],
        },
        supplier: {
            type: String,
            required: [true, 'Please add a supplier'],
            trim: true,
        },
        image: {
            type: String,
            default: '',
        },
        description: {
            type: String,
            default: '',
            trim: true,
        },

        // Backward-compatible fields used by existing pages/modules
        category: {
            type: String,
            required: [true, 'Please add a category'],
            trim: true,
        },
        genericName: {
            type: String,
            trim: true,
            default: '',
        },
        batchNumber: {
            type: String,
            trim: true,
            default: '',
        },
        sku: {
            type: String,
            unique: true,
            sparse: true,
        },
        barcode: {
            type: String,
            default: '',
        },
        quantity: {
            type: Number,
            default: 0,
            min: [0, 'Quantity cannot be negative'],
        },
        unitPrice: {
            type: Number,
            min: [0, 'Price cannot be negative'],
            default: 0,
        },
        purchasePrice: {
            type: Number,
            default: 0,
            min: [0, 'Price cannot be negative'],
        },
        sellingPrice: {
            type: Number,
            default: 0,
            min: [0, 'Price cannot be negative'],
        },
        manufacturer: {
            type: String,
            trim: true,
            default: '',
        },
        storageLocation: {
            type: String,
            default: '',
        },
        lowStockThreshold: {
            type: Number,
            default: 10,
            min: 0,
        },
        assignedPharmacist: {
            type: mongoose.Schema.ObjectId,
            ref: 'User',
            default: null,
        },
        createdBy: {
            type: mongoose.Schema.ObjectId,
            ref: 'User',
            required: true,
        },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

MedicineSchema.pre('validate', function syncFields(next) {
    if (this.price == null && this.unitPrice != null) this.price = this.unitPrice;
    if (this.unitPrice == null && this.price != null) this.unitPrice = this.price;

    if (this.stock == null && this.quantity != null) this.stock = this.quantity;
    if (this.quantity == null && this.stock != null) this.quantity = this.stock;

    if (!this.brand && this.manufacturer) this.brand = this.manufacturer;
    if (!this.manufacturer && this.brand) this.manufacturer = this.brand;

    if (this.price != null) this.unitPrice = this.price;
    if (this.stock != null) this.quantity = this.stock;

    next();
});

// Auto-generate SKU before saving
MedicineSchema.pre('save', function buildSku(next) {
    if (!this.sku) {
        const prefix = this.category ? this.category.substring(0, 3).toUpperCase() : 'MED';
        const random = Math.random().toString(36).substring(2, 8).toUpperCase();
        this.sku = `${prefix}-${random}`;
    }
    next();
});

MedicineSchema.virtual('isExpired').get(function isExpired() {
    return this.expiryDate < new Date();
});

MedicineSchema.virtual('isLowStock').get(function isLowStock() {
    return this.stock <= this.lowStockThreshold && this.stock > 0;
});

MedicineSchema.virtual('expiringIn30Days').get(function expiringIn30Days() {
    const now = new Date();
    const thirtyDays = new Date();
    thirtyDays.setDate(now.getDate() + 30);
    return this.expiryDate >= now && this.expiryDate <= thirtyDays;
});

MedicineSchema.index({ name: 'text', brand: 'text', genericName: 'text', supplier: 'text', description: 'text' });

module.exports = mongoose.model('Medicine', MedicineSchema);
