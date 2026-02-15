const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

// Candidate analytics
router.get('/candidate/dashboard', authorize('candidate'), analyticsController.getCandidateDashboard);
router.get('/candidate/performance', authorize('candidate'), analyticsController.getCandidatePerformance);

// Employer analytics
router.get('/employer/dashboard', authorize('employer'), analyticsController.getEmployerDashboard);
router.get('/employer/job/:jobId', authorize('employer'), analyticsController.getJobAnalytics);

// Admin analytics
router.get('/admin/dashboard', authorize('admin'), analyticsController.getAdminDashboard);
router.get('/admin/revenue', authorize('admin'), analyticsController.getRevenueAnalytics);
router.get('/admin/users', authorize('admin'), analyticsController.getUserAnalytics);

module.exports = router;
