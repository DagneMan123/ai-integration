const express = require('express');
const router = express.Router();
const interviewController = require('../controllers/interviewController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const { logger } = require('../utils/logger');

// Log all requests to this router for debugging
router.use((req, res, next) => {
  logger.info(`[Interviews Router] ${req.method} ${req.path}`, {
    path: req.path,
    method: req.method,
    hasAuth: !!req.headers.authorization
  });
  next();
});

router.use(authenticateToken);

// CRITICAL: Non-parameterized routes MUST come before /:id routes
// These are checked first to avoid being caught by /:id pattern

// Test endpoint to verify route is working
router.get('/test', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Interviews router is working',
    path: '/api/interviews/test',
    user: req.user?.id
  });
});

// Candidate routes - specific paths first
router.post('/start', authorizeRoles('candidate'), interviewController.startInterview);
router.post('/submit-answer', authorizeRoles('candidate'), interviewController.submitAnswer);
router.post('/save-recording', authorizeRoles('candidate'), interviewController.saveRecording);
router.post('/security-violation', authorizeRoles('candidate'), interviewController.logSecurityViolation);
router.get('/candidate/my-interviews', authorizeRoles('candidate'), interviewController.getCandidateInterviews);
router.get('/candidate/pending-invitations', authorizeRoles('candidate'), interviewController.getPendingInvitations);
router.get('/results', authorizeRoles('candidate'), interviewController.getCandidateResults);

// Employer routes - specific paths
router.get('/job/:jobId/interviews', authorizeRoles('employer', 'admin'), interviewController.getJobInterviews);

// Admin routes - specific paths
router.get('/admin/all', authorizeRoles('admin'), interviewController.getAllInterviews);

// Get all interviews for employer (for calendar view)
router.get('/', authorizeRoles('employer', 'admin'), interviewController.getEmployerInterviews);

// Parameterized routes - MUST come after specific paths
router.post('/:id/submit-answer', authorizeRoles('candidate'), interviewController.submitAnswer);
router.post('/:id/complete', authorizeRoles('candidate'), interviewController.completeInterview);
router.post('/:id/anti-cheat-event', authorizeRoles('candidate'), interviewController.recordAntiCheatEvent);
router.post('/:id/identity-snapshot', authorizeRoles('candidate'), interviewController.recordIdentitySnapshot);
router.get('/:id/report', interviewController.getInterviewReport);
router.get('/:id/integrity-report', interviewController.getIntegrityReport);
router.post('/:id/evaluate', authorizeRoles('employer', 'admin'), interviewController.evaluateInterview);

module.exports = router;
