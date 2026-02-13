const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect } = require('../middleware/auth');
const { upload } = require('../middleware/upload');

router.use(protect);

router.get('/profile', userController.getProfile);
router.put('/profile', userController.updateProfile);
router.put('/password', userController.updatePassword);
router.post('/avatar', upload.single('avatar'), userController.uploadAvatar);
router.delete('/account', userController.deleteAccount);

module.exports = router;
