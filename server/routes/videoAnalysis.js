const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const videoAnalysisController = require('../controllers/videoAnalysisController');

// All routes require authentication
router.use(authenticateToken);

// Submit video response
router.post('/responses/:sessionId/:questionId', videoAnalysisController.submitVideoResponse);

// Get analysis status
router.get('/responses/:responseId/status', videoAnalysisController.getAnalysisStatus);

// Get detailed feedback
router.get('/responses/:responseId/feedback', videoAnalysisController.getDetailedFeedback);

// Stream video
router.get('/responses/:responseId/video', videoAnalysisController.streamVideo);

module.exports = router;
