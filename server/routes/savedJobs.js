const express = require('express');
const router = express.Router();
const savedJobController = require('../controllers/savedJobController');
const { authenticateToken } = require('../middleware/auth');

// All routes require authentication
router.use(authenticateToken);

// Get all saved jobs for the current user
router.get('/', savedJobController.getSavedJobs);

// Save a job
router.post('/', savedJobController.saveJob);

// Check if a job is saved
router.get('/check/:jobId', savedJobController.isJobSaved);

// Remove a saved job
router.delete('/:jobId', savedJobController.removeSavedJob);

module.exports = router;
