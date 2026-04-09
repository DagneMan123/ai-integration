const express = require('express');
const router = express.Router();
const interviewController = require('../controllers/interviewController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

router.use(authenticateToken);

// Candidate routes - MUST come before /:id route
router.post('/start', authorizeRoles('candidate'), interviewController.startInterview);
router.get('/candidate/my-interviews', authorizeRoles('candidate'), interviewController.getCandidateInterviews);
router.get('/results', authorizeRoles('candidate'), interviewController.getCandidateResults);
router.post('/:id/submit-answer', authorizeRoles('candidate'), interviewController.submitAnswer);
router.post('/:id/complete', authorizeRoles('candidate'), interviewController.completeInterview);
router.post('/:id/anti-cheat-event', authorizeRoles('candidate'), interviewController.recordAntiCheatEvent);
router.post('/:id/identity-snapshot', authorizeRoles('candidate'), interviewController.recordIdentitySnapshot);

// Get single interview report
router.get('/:id/report', interviewController.getInterviewReport);
router.get('/:id/integrity-report', interviewController.getIntegrityReport);

// Get all interviews for employer (for calendar view)
router.get('/', authorizeRoles('employer', 'admin'), interviewController.getEmployerInterviews);

// Employer routes
router.get('/job/:jobId/interviews', authorizeRoles('employer', 'admin'), interviewController.getJobInterviews);
router.post('/:id/evaluate', authorizeRoles('employer', 'admin'), interviewController.evaluateInterview);

// Admin routes
router.get('/admin/all', authorizeRoles('admin'), interviewController.getAllInterviews);

module.exports = router;
