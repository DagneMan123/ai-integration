const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const practiceController = require('../controllers/practiceController');

// All practice routes require authentication
router.use(authenticateToken);

// Get practice sessions
router.get('/sessions', practiceController.getPracticeSessions);

// Create practice session
router.post('/sessions', practiceController.createPracticeSession);

// Get practice session details
router.get('/sessions/:sessionId', practiceController.getPracticeSessionDetails);

// Submit practice answer
router.post('/sessions/:sessionId/answer', practiceController.submitPracticeAnswer);

// End practice session
router.post('/sessions/:sessionId/end', practiceController.endPracticeSession);

// Get practice statistics
router.get('/stats', practiceController.getPracticeStats);

module.exports = router;
