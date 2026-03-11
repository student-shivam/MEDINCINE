const express = require('express');
const {
    getSubCategories,
    createSubCategory,
    updateSubCategory,
    deleteSubCategory,
} = require('../controllers/subCategoryController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.route('/')
    .get(getSubCategories)
    .post(authorize('admin'), createSubCategory);

router.route('/:id')
    .put(authorize('admin'), updateSubCategory)
    .delete(authorize('admin'), deleteSubCategory);

module.exports = router;
