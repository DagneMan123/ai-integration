const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

router.use(authenticateToken);

// Candidate analytics
router.get('/candidate/dashboard', authorizeRoles('candidate'), analyticsController.getCandidateDashboard);
router.get('/candidate/performance', authorizeRoles('candidate'), analyticsController.getCandidatePerformance);

// Employer analytics
router.get('/employer/dashboard', authorizeRoles('employer'), analyticsController.getEmployerDashboard);
router.get('/employer/job/:jobId', authorizeRoles('employer'), analyticsController.getJobAnalytics);

// Admin analytics
router.get('/admin/dashboard', authorizeRoles('admin'), analyticsController.getAdminDashboard);
router.get('/admin/revenue', authorizeRoles('admin'), analyticsController.getRevenueAnalytics);
router.get('/admin/users', authorizeRoles('admin'), analyticsController.getUserAnalytics);

module.exports = router;
