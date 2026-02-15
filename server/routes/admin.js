const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect, authorize('admin'));

// User management
router.get('/users', adminController.getAllUsers);
router.get('/users/:id', adminController.getUser);
router.patch('/users/:id/status', adminController.updateUserStatus);
router.patch('/users/:id/role', adminController.updateUserRole);
router.delete('/users/:id', adminController.deleteUser);

// Company verification
router.get('/companies/pending', adminController.getPendingCompanies);
router.patch('/companies/:id/verify', adminController.verifyCompany);
router.patch('/companies/:id/reject', adminController.rejectCompany);

// Job moderation
router.get('/jobs/pending', adminController.getPendingJobs);
router.patch('/jobs/:id/approve', adminController.approveJob);
router.patch('/jobs/:id/reject', adminController.rejectJob);

// Activity logs
router.get('/logs', adminController.getActivityLogs);
router.get('/logs/suspicious', adminController.getSuspiciousActivity);

// System settings
router.get('/settings', adminController.getSettings);
router.put('/settings', adminController.updateSettings);

module.exports = router;
