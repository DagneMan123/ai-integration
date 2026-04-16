const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticateToken } = require('../middleware/auth');
const { upload } = require('../middleware/upload');
const { AppError } = require('../middleware/errorHandler');

router.use(authenticateToken);

router.get('/profile', userController.getProfile);
router.put('/profile', userController.updateProfile);
router.put('/password', userController.updatePassword);
router.post('/avatar', upload.single('avatar'), userController.uploadAvatar);
router.delete('/account', userController.deleteAccount);

// Document routes
router.get('/documents', userController.getDocuments);

// Document upload with error handling
router.post('/documents', (req, res, next) => {
  upload.single('document')(req, res, (err) => {
    if (err) {
      // Handle multer errors
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          success: false,
          message: 'File size exceeds 100MB limit'
        });
      }
      if (err.code === 'LIMIT_FILE_COUNT') {
        return res.status(400).json({
          success: false,
          message: 'Only one file can be uploaded at a time'
        });
      }
      if (err.code === 'LIMIT_UNEXPECTED_FILE') {
        return res.status(400).json({
          success: false,
          message: 'Unexpected field name. Expected "document"'
        });
      }
      // Pass other errors to error handler
      return next(err);
    }
    // Continue to controller
    userController.uploadDocument(req, res, next);
  });
});

router.delete('/documents/:documentId', userController.deleteDocument);
router.patch('/documents/:documentId/privacy', userController.toggleDocumentPrivacy);

module.exports = router;
