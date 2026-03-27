const express = require('express');
const router = express.Router();
const jobController = require('../controllers/jobController');
const { authenticateToken } = require('../middleware/auth');

// Public routes
router.get('/', jobController.getAllJobs);

// Protected routes - must come before /:id routes
router.use(authenticateToken);

// Employer routes - specific routes BEFORE generic /:id routes
router.get('/employer/my-jobs', jobController.getEmployerJobs);
router.post('/', jobController.createJob);
router.patch('/:id/status', jobController.updateJobStatus);
router.put('/:id', jobController.updateJob);
router.delete('/:id', jobController.deleteJob);

// Generic routes - must come LAST
router.get('/:id', jobController.getJob);

module.exports = router;
