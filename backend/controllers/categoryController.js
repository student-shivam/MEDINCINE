const Category = require('../models/Category');
const SubCategory = require('../models/SubCategory');
const Medicine = require('../models/Medicine');
const ErrorResponse = require('../utils/ErrorResponse');
const asyncHandler = require('../middleware/asyncHandler');

// @desc    Get all categories
// @route   GET /api/categories
// @access  Private
exports.getCategories = asyncHandler(async (req, res) => {
    const categories = await Category.find().sort({ name: 1 });

    res.status(200).json({
        success: true,
        count: categories.length,
        data: categories,
    });
});

// @desc    Create category
// @route   POST /api/categories
// @access  Private/Admin
exports.createCategory = asyncHandler(async (req, res, next) => {
    const name = (req.body?.name || '').trim();
    if (!name) {
        return next(new ErrorResponse('Category name is required', 400));
    }

    const exists = await Category.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });
    if (exists) {
        return next(new ErrorResponse('Category already exists', 400));
    }

    const category = await Category.create({ name });

    res.status(201).json({
        success: true,
        data: category,
    });
});

// @desc    Update category
// @route   PUT /api/categories/:id
// @access  Private/Admin
exports.updateCategory = asyncHandler(async (req, res, next) => {
    const name = (req.body?.name || '').trim();
    if (!name) {
        return next(new ErrorResponse('Category name is required', 400));
    }

    const category = await Category.findById(req.params.id);
    if (!category) {
        return next(new ErrorResponse('Category not found', 404));
    }

    const duplicate = await Category.findOne({
        _id: { $ne: req.params.id },
        name: { $regex: new RegExp(`^${name}$`, 'i') },
    });

    if (duplicate) {
        return next(new ErrorResponse('Category already exists', 400));
    }

    category.name = name;
    await category.save();

    await Medicine.updateMany({ categoryId: category._id }, { category: category.name });

    res.status(200).json({
        success: true,
        data: category,
    });
});

// @desc    Delete category
// @route   DELETE /api/categories/:id
// @access  Private/Admin
exports.deleteCategory = asyncHandler(async (req, res, next) => {
    const category = await Category.findById(req.params.id);
    if (!category) {
        return next(new ErrorResponse('Category not found', 404));
    }

    const [subCategoryCount, medicineCount] = await Promise.all([
        SubCategory.countDocuments({ categoryId: category._id }),
        Medicine.countDocuments({ categoryId: category._id }),
    ]);

    if (subCategoryCount > 0 || medicineCount > 0) {
        return next(new ErrorResponse('Category is in use and cannot be deleted', 400));
    }

    await category.deleteOne();

    res.status(200).json({
        success: true,
        data: {},
    });
});
