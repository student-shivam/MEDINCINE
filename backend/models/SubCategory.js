const mongoose = require('mongoose');

const SubCategorySchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Subcategory name is required'],
            trim: true,
        },
        categoryId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Category',
            required: [true, 'Category is required'],
        },
    },
    {
        timestamps: true,
    }
);

SubCategorySchema.index({ categoryId: 1, name: 1 }, { unique: true });

module.exports = mongoose.model('SubCategory', SubCategorySchema);
