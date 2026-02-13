const express = require('express');
const router = express.Router();
const interviewController = require('../controllers/interviewController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

// Candidate routes
router.post('/start', authorize('candidate'), interviewController.startInterview);
router.post('/:id/submit-answer', authorize('candidate'), interviewController.submitAnswer);
router.post('/:id/complete', authorize('candidate'), interviewController.completeInterview);
router.get('/my-interviews', authorize('candidate'), interviewController.getCandidateInterviews);
router.get('/:id/report', interviewController.getInterviewReport);

// Employer routes
router.get('/job/:jobId/interviews', authorize('employer', 'admin'), interviewController.getJobInterviews);
router.post('/:id/evaluate', authorize('employer', 'admin'), interviewController.evaluateInterview);

// Admin routes
router.get('/all', authorize('admin'), interviewController.getAllInterviews);

module.exports = router;
