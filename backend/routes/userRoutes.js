const express = require('express');
const {
    getUsers,
    getUser,
    createUser,
    updateUser,
    deleteUser,
    updateUserStatus,
    getProfileSummary,
    updateMyProfile,
    uploadMyAvatar,
    changeMyPassword,
    uploadProfileImage,
    updateNotificationSettings,
    updateSystemPreferences,
} = require('../controllers/userController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

const router = express.Router({ mergeParams: true });

router.use(protect);

router.get('/profile-summary', getProfileSummary);
router.put('/update-profile', updateMyProfile);
router.put('/upload-avatar', uploadProfileImage.single('profileImage'), uploadMyAvatar);
router.put('/change-password', changeMyPassword);
router.put('/update-notifications', updateNotificationSettings);
router.put('/update-preferences', updateSystemPreferences);

router.use(authorizeRoles('admin'));

router.route('/')
    .get(getUsers)
    .post(createUser);

router.route('/:id')
    .get(getUser)
    .put(updateUser)
    .delete(deleteUser);

router.patch('/:id/status', updateUserStatus);

module.exports = router;
