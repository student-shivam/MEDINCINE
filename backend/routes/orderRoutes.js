const express = require('express');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');
const { createOrder, getOrder } = require('../controllers/orderController');

const router = express.Router();

// Public route for invoice viewing
router.get('/:id', getOrder);

router.use(protect, authorizeRoles('admin', 'pharmacist'));

router.route('/')
    .post(createOrder);

module.exports = router;
