const express = require('express');
const router = express.Router();
const applicationController = require('../controllers/applicationController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

router.use(authenticateToken);

router.post('/', authorizeRoles('candidate'), applicationController.createApplication);
router.get('/candidate/my-applications', authorizeRoles('candidate'), applicationController.getCandidateApplications);
router.get('/my-applications', authorizeRoles('candidate'), applicationController.getCandidateApplications);
router.delete('/:id', authorizeRoles('candidate'), applicationController.withdrawApplication);

router.post('/deduplicate', authorizeRoles('admin'), applicationController.deduplicateApplications);

router.get('/:id', applicationController.getApplication);

router.get('/', authorizeRoles('employer', 'admin'), applicationController.getEmployerApplications);

router.get('/job/:jobId', authorizeRoles('employer', 'admin'), applicationController.getJobApplications);
router.patch('/:id/status', authorizeRoles('employer', 'admin'), applicationController.updateApplicationStatus);
router.post('/:id/shortlist', authorizeRoles('employer', 'admin'), applicationController.shortlistCandidate);

module.exports = router;
