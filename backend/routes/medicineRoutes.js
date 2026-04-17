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
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

const router = express.Router();

// Public search for POS
router.get('/', getMedicines);

router.use(protect); // Below routes require authentication

// Stats & special endpoints (before /:id)
router.get('/stats', getStats);
router.get('/low-stock', getLowStock);
router.get('/expired', getExpired);
router.get('/expiring-soon', getExpiringSoon);
router.get('/export/csv', authorizeRoles('admin'), exportCSV);

// CRUD
router.post('/', authorizeRoles('admin'), uploadMedicineImage.single('image'), createMedicine);

router.route('/:id')
    .get(getMedicine)
    .put(authorizeRoles('admin'), uploadMedicineImage.single('image'), updateMedicine)
    .delete(authorizeRoles('admin'), deleteMedicine);

// Stock operations (admin + pharmacist)
router.patch('/:id/increase', authorizeRoles('admin', 'pharmacist'), increaseStock);
router.patch('/:id/reduce', authorizeRoles('admin', 'pharmacist'), reduceStock);

module.exports = router;
