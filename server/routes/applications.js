const express = require('express');
const router = express.Router();
const applicationController = require('../controllers/applicationController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

router.use(authenticateToken);

// Candidate routes
router.post('/', authorizeRoles('candidate'), applicationController.createApplication);
router.get('/my-applications', authorizeRoles('candidate'), applicationController.getCandidateApplications);
router.get('/:id', applicationController.getApplication);
router.delete('/:id', authorizeRoles('candidate'), applicationController.withdrawApplication);

// Employer routes
router.get('/job/:jobId', authorizeRoles('employer', 'admin'), applicationController.getJobApplications);
router.patch('/:id/status', authorizeRoles('employer', 'admin'), applicationController.updateApplicationStatus);
router.post('/:id/shortlist', authorizeRoles('employer', 'admin'), applicationController.shortlistCandidate);

module.exports = router;
