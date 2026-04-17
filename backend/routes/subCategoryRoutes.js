const express = require('express');
const {
    getSubCategories,
    createSubCategory,
    updateSubCategory,
    deleteSubCategory,
} = require('../controllers/subCategoryController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.route('/')
    .get(getSubCategories)
    .post(authorizeRoles('admin'), createSubCategory);

router.route('/:id')
    .put(authorizeRoles('admin'), updateSubCategory)
    .delete(authorizeRoles('admin'), deleteSubCategory);

module.exports = router;
