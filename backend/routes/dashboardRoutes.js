const express = require('express');
const { getDashboardStats } = require('../controllers/dashboardController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

// @desc    Get comprehensive dashboard stats
// @route   GET /api/dashboard/stats
// @access  Private (All Roles - Data masked based on role)
router.get('/stats', getDashboardStats);

module.exports = router;
