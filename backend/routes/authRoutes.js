const express = require('express');
const { register, login, getMe, uploadAvatar, updateProfile, changePassword, deleteAccount } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

const router = express.Router();

router.post('/register', register);
router.post('/signup', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.put('/avatar', protect, upload.single('avatar'), uploadAvatar);
router.put('/profile', protect, updateProfile);
router.put('/password', protect, changePassword);
router.delete('/account', protect, deleteAccount);

module.exports = router;
