const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const walletController = require('../controllers/walletController');

// All wallet routes require authentication
router.use(authenticateToken);

// Get wallet balance
router.get('/balance', walletController.getWalletBalance);

// Top up wallet
router.post('/topup', walletController.topupWallet);

// Deduct credits
router.post('/deduct', walletController.deductCredits);

// Refund credits
router.post('/refund', walletController.refundCredits);

// Get transaction history
router.get('/history', walletController.getTransactionHistory);

module.exports = router;
