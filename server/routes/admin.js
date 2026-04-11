const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

router.use(authenticateToken, authorizeRoles('admin'));

// User management
router.get('/users', adminController.getAllUsers);
router.get('/users/:id', adminController.getUser);
router.patch('/users/:id/status', adminController.updateUserStatus);
router.patch('/users/:id/role', adminController.updateUserRole);
router.delete('/users/:id', adminController.deleteUser);

// Company management
router.get('/companies', adminController.getAllCompanies);
router.get('/companies/pending', adminController.getPendingCompanies);
router.patch('/companies/:id/verify', adminController.verifyCompany);
router.patch('/companies/:id/reject', adminController.rejectCompany);

// Job moderation
router.get('/jobs', adminController.getAllJobs);
router.get('/jobs/pending', adminController.getPendingJobs);
router.patch('/jobs/:id/approve', adminController.approveJob);
router.patch('/jobs/:id/reject', adminController.rejectJob);

// Activity logs
router.get('/logs', adminController.getActivityLogs);
router.get('/logs/suspicious', adminController.getSuspiciousActivity);

// Support tickets
router.get('/support-tickets', adminController.getSupportTickets);
router.patch('/support-tickets/:id/status', adminController.updateTicketStatus);

// System settings
router.get('/settings', adminController.getSettings);
router.put('/settings', adminController.updateSettings);

// Analytics
router.get('/analytics', adminController.getAnalytics);

// Payment Analytics
router.get('/payments/analytics', adminController.getPaymentAnalytics);

// Sessions
router.get('/sessions', adminController.getSessions);

module.exports = router;
