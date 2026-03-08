const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

// Webhook - NO authentication required
router.post('/webhook', paymentController.chapaWebhook);

// All other routes require authentication
router.use(authenticateToken);

// Initialize payment
router.post('/initialize', paymentController.initializePayment);

// Verify payment
router.get('/verify/:tx_ref', paymentController.verifyPayment);

// Get payment history
router.get('/history', paymentController.getPaymentHistory);

// Get subscription status
router.get('/subscription', paymentController.getSubscription);

// Cancel subscription
router.post('/subscription/cancel', paymentController.cancelSubscription);

// Admin routes
router.get('/all', authorizeRoles('admin'), paymentController.getAllPayments);

router.post('/:id/refund', authorizeRoles('admin'), paymentController.refundPayment);

module.exports = router;