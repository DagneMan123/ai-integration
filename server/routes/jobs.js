const express = require('express');
const router = express.Router();
const jobController = require('../controllers/jobController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

// Public routes
router.get('/', jobController.getAllJobs);
router.get('/:id', jobController.getJob);

// Protected routes
router.use(authenticateToken);

// Employer routes - role check done in controller for better error messages
router.post('/', jobController.createJob);
router.put('/:id', jobController.updateJob);
router.delete('/:id', jobController.deleteJob);
router.get('/employer/my-jobs', jobController.getEmployerJobs);
router.patch('/:id/status', jobController.updateJobStatus);

module.exports = router;
