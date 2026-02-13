const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

// Initialize payment
router.post('/initialize', paymentController.initializePayment);

// Verify payment
router.get('/verify/:tx_ref', paymentController.verifyPayment);

// Webhook
router.post('/webhook', paymentController.chapaWebhook);

// Get payment history
router.get('/history', paymentController.getPaymentHistory);

// Get subscription status
router.get('/subscription', paymentController.getSubscription);

// Cancel subscription
router.post('/subscription/cancel', paymentController.cancelSubscription);

// Admin routes
router.get('/all', authorize('admin'), paymentController.getAllPayments);
router.post('/:id/refund', authorize('admin'), paymentController.refundPayment);

module.exports = router;
