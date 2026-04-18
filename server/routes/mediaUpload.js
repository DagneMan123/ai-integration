const express = require('express');
const router = express.Router();
const { uploadStream } = require('../middleware/upload');
const { authenticate } = require('../middleware/auth');
const {
  uploadInterviewVideo,
  uploadResume,
  uploadProfilePicture,
  getUploadProgress
} = require('../controllers/mediaUploadController');

/**
 * POST /api/media/interview-video/:interviewId
 * Upload interview video
 * Requires: Authentication, interviewId in params, video file in body
 */
router.post(
  '/interview-video/:interviewId',
  authenticate,
  uploadStream,
  uploadInterviewVideo
);

/**
 * POST /api/media/resume
 * Upload resume/document
 * Requires: Authentication, document file in body
 */
router.post(
  '/resume',
  authenticate,
  uploadStream,
  uploadResume
);

/**
 * POST /api/media/profile-picture
 * Upload profile picture
 * Requires: Authentication, image file in body
 */
router.post(
  '/profile-picture',
  authenticate,
  uploadStream,
  uploadProfilePicture
);

/**
 * GET /api/media/upload-progress/:uploadId
 * Get upload progress
 * Requires: Authentication
 */
router.get(
  '/upload-progress/:uploadId',
  authenticate,
  getUploadProgress
);

module.exports = router;
