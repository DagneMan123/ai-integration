const express = require('express');
const router = express.Router();
const applicationController = require('../controllers/applicationController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

// Candidate routes
router.post('/', authorize('candidate'), applicationController.createApplication);
router.get('/my-applications', authorize('candidate'), applicationController.getCandidateApplications);
router.get('/:id', applicationController.getApplication);
router.delete('/:id', authorize('candidate'), applicationController.withdrawApplication);

// Employer routes
router.get('/job/:jobId', authorize('employer', 'admin'), applicationController.getJobApplications);
router.patch('/:id/status', authorize('employer', 'admin'), applicationController.updateApplicationStatus);
router.post('/:id/shortlist', authorize('employer', 'admin'), applicationController.shortlistCandidate);

module.exports = router;
