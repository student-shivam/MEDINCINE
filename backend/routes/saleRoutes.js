const express = require('express');
const {
    createSale,
    getSales,
    getSalesAnalytics,
    downloadInvoice,
    getSaleByInvoiceNumber,
    getPDFInvoice,
    getSale
} = require('../controllers/saleController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.route('/')
    .get(protect, getSales)
    .post(protect, authorize('admin', 'pharmacist'), createSale);

router.get('/analytics', protect, authorize('admin'), getSalesAnalytics);
router.get('/invoice/:invoiceNumber', getSaleByInvoiceNumber); // Public for invoice viewing
router.get('/:id', getSale); // Public for fetching by ID
router.get('/:id/invoice', downloadInvoice); // Public download
router.get('/:id/pdf', getPDFInvoice); // Public PDF generation

module.exports = router;
