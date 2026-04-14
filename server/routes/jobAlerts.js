const express = require('express');
const router = express.Router();
const jobAlertController = require('../controllers/jobAlertController');
const { authenticateToken } = require('../middleware/auth');

router.use(authenticateToken);

// Get all job alerts
router.get('/', jobAlertController.getJobAlerts);

// Create a job alert
router.post('/', jobAlertController.createJobAlert);

// Get matching jobs for an alert
router.get('/:id/matching-jobs', jobAlertController.getMatchingJobs);

// Update a job alert
router.put('/:id', jobAlertController.updateJobAlert);

// Delete a job alert
router.delete('/:id', jobAlertController.deleteJobAlert);

module.exports = router;
