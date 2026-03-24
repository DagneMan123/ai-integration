const express = require('express');
const router = express.Router();
const chapaService = require('../services/chapaService');
const { logger } = require('../utils/logger');

// Webhook endpoint for Chapa payment notifications
router.post('/chapa', async (req, res) => {
  try {
    const { tx_ref, status } = req.body;

    if (!tx_ref || !status) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: tx_ref, status'
      });
    }

    // Process webhook based on payment status
    const result = await chapaService.handleWebhook(tx_ref, status);

    res.json({
      success: true,
      message: 'Webhook processed successfully',
      data: result
    });
  } catch (error) {
    logger.error('Chapa webhook error:', error);
    res.status(500).json({
      success: false,
      message: 'Webhook processing failed',
      error: error.message
    });
  }
});

// Telebirr webhook endpoint
router.post('/telebirr', async (req, res) => {
  try {
    const { transactionId, status } = req.body;

    if (!transactionId || !status) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: transactionId, status'
      });
    }

    // Process Telebirr webhook
    logger.info(`Telebirr webhook received: ${transactionId} - ${status}`);

    res.json({
      success: true,
      message: 'Telebirr webhook processed successfully'
    });
  } catch (error) {
    logger.error('Telebirr webhook error:', error);
    res.status(500).json({
      success: false,
      message: 'Webhook processing failed',
      error: error.message
    });
  }
});

module.exports = router;
