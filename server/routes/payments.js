const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

// Webhook - NO authentication required (signature validation instead)
router.post('/webhook', paymentController.webhook);

// Get credit bundles - NO authentication required
router.get('/bundles', paymentController.getBundles);

// All other routes require authentication
router.use(authenticateToken);

// Initialize payment
router.post('/initialize', paymentController.initialize);

// Verify payment
router.get('/verify/:txRef', paymentController.verifyPayment);

// Get payment history
router.get('/history', paymentController.getHistory);

// Get financial analytics
router.get('/analytics', paymentController.getAnalytics);

// Export payment history
router.get('/export', paymentController.exportHistory);

// Admin routes
router.get('/all', authorizeRoles('admin'), paymentController.getHistory);

module.exports = router;