const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const {
  saveInterviewVideoUrl,
  saveResumeUrl,
  saveProfilePictureUrl
} = require('../controllers/mediaLinkController');

/**
 * POST /api/media-link/interview-video/:interviewId
 * Save interview video URL to database
 * Frontend uploads directly to Cloudinary, sends URL here
 * 
 * Body: { videoUrl, publicId, duration }
 */
router.post(
  '/interview-video/:interviewId',
  authenticateToken,
  saveInterviewVideoUrl
);

/**
 * POST /api/media-link/resume
 * Save resume URL to database
 * Frontend uploads directly to Cloudinary, sends URL here
 * 
 * Body: { resumeUrl, publicId }
 */
router.post(
  '/resume',
  authenticateToken,
  saveResumeUrl
);

/**
 * POST /api/media-link/profile-picture
 * Save profile picture URL to database
 * Frontend uploads directly to Cloudinary, sends URL here
 * 
 * Body: { profilePictureUrl, publicId }
 */
router.post(
  '/profile-picture',
  authenticateToken,
  saveProfilePictureUrl
);

module.exports = router;
