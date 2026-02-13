const express = require('express');
const router = express.Router();
const jobController = require('../controllers/jobController');
const { protect, authorize } = require('../middleware/auth');

// Public routes
router.get('/', jobController.getAllJobs);
router.get('/:id', jobController.getJob);

// Protected routes
router.use(protect);

// Employer routes
router.post('/', authorize('employer', 'admin'), jobController.createJob);
router.put('/:id', authorize('employer', 'admin'), jobController.updateJob);
router.delete('/:id', authorize('employer', 'admin'), jobController.deleteJob);
router.get('/employer/my-jobs', authorize('employer'), jobController.getEmployerJobs);
router.patch('/:id/status', authorize('employer', 'admin'), jobController.updateJobStatus);

module.exports = router;
