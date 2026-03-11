const express = require('express');
const { protect, authorize } = require('../middleware/authMiddleware');
const { createOrder, getOrder } = require('../controllers/orderController');

const router = express.Router();

router.use(protect, authorize('admin', 'pharmacist'));

router.route('/')
    .post(createOrder);

router.route('/:id')
    .get(getOrder);

module.exports = router;
