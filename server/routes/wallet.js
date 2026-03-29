const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const walletController = require('../controllers/walletController');

// All wallet routes require authentication
router.use(authenticateToken);

// Get wallet balance
router.get('/balance', walletController.getBalance);

// Get wallet transaction history
router.get('/transactions', walletController.getTransactions);

// Check if user has sufficient credits
router.get('/check-credits', walletController.checkCredits);

module.exports = router;
