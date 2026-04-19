const express = require('express');
const router = express.Router();
const { uploadStream } = require('../middleware/upload');
const { authenticateToken } = require('../middleware/auth');
const mediaUploadController = require('../controllers/mediaUploadController');

/**
 * POST /api/media/interview-video/:interviewId
 * Upload interview video
 * Requires: Authentication, interviewId in params, video file in body
 */
router.post(
  '/interview-video/:interviewId',
  authenticateToken,
  uploadStream,
  mediaUploadController.uploadInterviewVideo
);

/**
 * POST /api/media/resume
 * Upload resume/document
 * Requires: Authentication, document file in body
 */
router.post(
  '/resume',
  authenticateToken,
  uploadStream,
  mediaUploadController.uploadResume
);

/**
 * POST /api/media/profile-picture
 * Upload profile picture
 * Requires: Authentication, image file in body
 */
router.post(
  '/profile-picture',
  authenticateToken,
  uploadStream,
  mediaUploadController.uploadProfilePicture
);

/**
 * GET /api/media/upload-progress/:uploadId
 * Get upload progress
 * Requires: Authentication
 */
router.get(
  '/upload-progress/:uploadId',
  authenticateToken,
  mediaUploadController.getUploadProgress
);

module.exports = router;
