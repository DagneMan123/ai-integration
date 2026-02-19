const express = require('express');
const router = express.Router();
const interviewController = require('../controllers/interviewController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

router.use(authenticateToken);

// Candidate routes
router.post('/start', authorizeRoles('candidate'), interviewController.startInterview);
router.post('/:id/submit-answer', authorizeRoles('candidate'), interviewController.submitAnswer);
router.post('/:id/complete', authorizeRoles('candidate'), interviewController.completeInterview);
router.get('/my-interviews', authorizeRoles('candidate'), interviewController.getCandidateInterviews);
router.get('/:id/report', interviewController.getInterviewReport);

// Anti-cheat routes
router.post('/:id/anti-cheat-event', authorizeRoles('candidate'), interviewController.recordAntiCheatEvent);
router.post('/:id/identity-snapshot', authorizeRoles('candidate'), interviewController.recordIdentitySnapshot);
router.get('/:id/integrity-report', interviewController.getIntegrityReport);

// Employer routes
router.get('/job/:jobId/interviews', authorizeRoles('employer', 'admin'), interviewController.getJobInterviews);
router.post('/:id/evaluate', authorizeRoles('employer', 'admin'), interviewController.evaluateInterview);

// Admin routes
router.get('/all', authorizeRoles('admin'), interviewController.getAllInterviews);

module.exports = router;
