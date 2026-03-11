const express = require('express');
const {
    getMedicines,
    getMedicine,
    createMedicine,
    updateMedicine,
    deleteMedicine,
    increaseStock,
    reduceStock,
    getLowStock,
    getExpired,
    getExpiringSoon,
    getStats,
    exportCSV,
    uploadMedicineImage,
} = require('../controllers/medicineController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// Public search for POS
router.get('/', getMedicines);

router.use(protect); // Below routes require authentication

// Stats & special endpoints (before /:id)
router.get('/stats', getStats);
router.get('/low-stock', getLowStock);
router.get('/expired', getExpired);
router.get('/expiring-soon', getExpiringSoon);
router.get('/export/csv', authorize('admin'), exportCSV);

// CRUD
router.post('/', authorize('admin'), uploadMedicineImage.single('image'), createMedicine);

router.route('/:id')
    .get(getMedicine)
    .put(authorize('admin'), uploadMedicineImage.single('image'), updateMedicine)
    .delete(authorize('admin'), deleteMedicine);

// Stock operations (admin + pharmacist)
router.patch('/:id/increase', authorize('admin', 'pharmacist'), increaseStock);
router.patch('/:id/reduce', authorize('admin', 'pharmacist'), reduceStock);

module.exports = router;
