const express = require('express');
const router = express.Router();
const applicationController = require('../controllers/applicationController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

router.use(authenticateToken);

// Candidate routes - MUST come before /:id route
router.post('/', authorizeRoles('candidate'), applicationController.createApplication);
router.get('/candidate/my-applications', authorizeRoles('candidate'), applicationController.getCandidateApplications);
router.get('/my-applications', authorizeRoles('candidate'), applicationController.getCandidateApplications); // Alias
router.delete('/:id', authorizeRoles('candidate'), applicationController.withdrawApplication);

// Get single application
router.get('/:id', applicationController.getApplication);

// Get all applications for employer (for tracking view)
router.get('/', authorizeRoles('employer', 'admin'), applicationController.getEmployerApplications);

// Employer routes
router.get('/job/:jobId', authorizeRoles('employer', 'admin'), applicationController.getJobApplications);
router.patch('/:id/status', authorizeRoles('employer', 'admin'), applicationController.updateApplicationStatus);
router.post('/:id/shortlist', authorizeRoles('employer', 'admin'), applicationController.shortlistCandidate);

module.exports = router;
