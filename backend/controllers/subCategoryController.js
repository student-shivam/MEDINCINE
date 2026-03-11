const SubCategory = require('../models/SubCategory');
const Category = require('../models/Category');
const Medicine = require('../models/Medicine');
const ErrorResponse = require('../utils/ErrorResponse');
const asyncHandler = require('../middleware/asyncHandler');

// @desc    Get all subcategories
// @route   GET /api/subcategories
// @access  Private
exports.getSubCategories = asyncHandler(async (req, res) => {
    const query = {};
    if (req.query.categoryId) {
        query.categoryId = req.query.categoryId;
    }

    const subcategories = await SubCategory.find(query)
        .populate('categoryId', 'name')
        .sort({ name: 1 });

    res.status(200).json({
        success: true,
        count: subcategories.length,
        data: subcategories,
    });
});

// @desc    Create subcategory
// @route   POST /api/subcategories
// @access  Private/Admin
exports.createSubCategory = asyncHandler(async (req, res, next) => {
    const name = (req.body?.name || '').trim();
    const categoryId = req.body?.categoryId;

    if (!name || !categoryId) {
        return next(new ErrorResponse('Subcategory name and category are required', 400));
    }

    const category = await Category.findById(categoryId);
    if (!category) {
        return next(new ErrorResponse('Category not found', 404));
    }

    const duplicate = await SubCategory.findOne({
        categoryId,
        name: { $regex: new RegExp(`^${name}$`, 'i') },
    });
    if (duplicate) {
        return next(new ErrorResponse('Subcategory already exists in this category', 400));
    }

    const subcategory = await SubCategory.create({ name, categoryId });

    res.status(201).json({
        success: true,
        data: subcategory,
    });
});

// @desc    Update subcategory
// @route   PUT /api/subcategories/:id
// @access  Private/Admin
exports.updateSubCategory = asyncHandler(async (req, res, next) => {
    const name = (req.body?.name || '').trim();
    const categoryId = req.body?.categoryId;

    if (!name || !categoryId) {
        return next(new ErrorResponse('Subcategory name and category are required', 400));
    }

    const subcategory = await SubCategory.findById(req.params.id);
    if (!subcategory) {
        return next(new ErrorResponse('Subcategory not found', 404));
    }

    const category = await Category.findById(categoryId);
    if (!category) {
        return next(new ErrorResponse('Category not found', 404));
    }

    const duplicate = await SubCategory.findOne({
        _id: { $ne: req.params.id },
        categoryId,
        name: { $regex: new RegExp(`^${name}$`, 'i') },
    });
    if (duplicate) {
        return next(new ErrorResponse('Subcategory already exists in this category', 400));
    }

    subcategory.name = name;
    subcategory.categoryId = categoryId;
    await subcategory.save();

    res.status(200).json({
        success: true,
        data: subcategory,
    });
});

// @desc    Delete subcategory
// @route   DELETE /api/subcategories/:id
// @access  Private/Admin
exports.deleteSubCategory = asyncHandler(async (req, res, next) => {
    const subcategory = await SubCategory.findById(req.params.id);
    if (!subcategory) {
        return next(new ErrorResponse('Subcategory not found', 404));
    }

    const medicineCount = await Medicine.countDocuments({ subcategoryId: subcategory._id });
    if (medicineCount > 0) {
        return next(new ErrorResponse('Subcategory is in use and cannot be deleted', 400));
    }

    await subcategory.deleteOne();

    res.status(200).json({
        success: true,
        data: {},
    });
});
