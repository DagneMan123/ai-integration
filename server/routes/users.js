const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticateToken } = require('../middleware/auth');
const { upload } = require('../middleware/upload');

router.use(authenticateToken);

router.get('/profile', userController.getProfile);
router.put('/profile', userController.updateProfile);
router.put('/password', userController.updatePassword);
router.post('/avatar', upload.single('avatar'), userController.uploadAvatar);
router.delete('/account', userController.deleteAccount);

module.exports = router;
