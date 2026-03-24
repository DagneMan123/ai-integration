const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const subscriptionController = require('../controllers/subscriptionController');

// Public route - get subscription plans
router.get('/plans', subscriptionController.getSubscriptionPlans);

// All other routes require authentication
router.use(authenticateToken);

// Get employer subscription
router.get('/', subscriptionController.getEmployerSubscription);

// Create subscription
router.post('/', subscriptionController.createSubscription);

// Cancel subscription
router.post('/cancel', subscriptionController.cancelSubscription);

// Get subscription history
router.get('/history', subscriptionController.getSubscriptionHistory);

// Check subscription status
router.get('/status', subscriptionController.checkSubscriptionStatus);

module.exports = router;
