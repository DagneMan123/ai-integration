const express = require('express');
const router = express.Router();
const jobController = require('../controllers/jobController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

// Public routes
router.get('/', jobController.getAllJobs);
router.get('/:id', jobController.getJob);

// Protected routes
router.use(authenticateToken);

// Employer routes
router.post('/', authorizeRoles('employer', 'admin'), jobController.createJob);
router.put('/:id', authorizeRoles('employer', 'admin'), jobController.updateJob);
router.delete('/:id', authorizeRoles('employer', 'admin'), jobController.deleteJob);
router.get('/employer/my-jobs', authorizeRoles('employer'), jobController.getEmployerJobs);
router.patch('/:id/status', authorizeRoles('employer', 'admin'), jobController.updateJobStatus);

module.exports = router;
