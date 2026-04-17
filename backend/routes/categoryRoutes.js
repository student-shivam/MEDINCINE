const express = require('express');
const {
    getCategories,
    createCategory,
    updateCategory,
    deleteCategory,
} = require('../controllers/categoryController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.route('/')
    .get(getCategories)
    .post(authorizeRoles('admin'), createCategory);

router.route('/:id')
    .put(authorizeRoles('admin'), updateCategory)
    .delete(authorizeRoles('admin'), deleteCategory);

module.exports = router;
