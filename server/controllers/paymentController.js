const paymentService = require('../services/paymentService');
const walletService = require('../services/walletService');
const chapaService = require('../services/chapaService');
const { logger } = require('../utils/logger');

class PaymentController {
  /**
   * Initialize payment for credit purchase
   * POST /api/payments/initialize
   */
  async initialize(req, res) {
    try {
      const { bundleId, amount, creditAmount, txRef, metadata } = req.body;
      const userId = req.user?.id;

      // Validate inputs
      if (!bundleId && !amount) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields: bundleId or amount'
        });
      }

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'User not authenticated'
        });
      }

      // Initialize payment
      const paymentData = await paymentService.initializePayment(
        bundleId || null,
        userId,
        amount,
        creditAmount,
        txRef
      );

      // Generate Chapa payment URL
      const chapaUrl = await chapaService.generatePaymentUrl(
        paymentData.txRef,
        paymentData.amount,
        {
          userId,
          email: req.user?.email,
          firstName: req.user?.firstName,
          lastName: req.user?.lastName,
          creditAmount: paymentData.creditAmount,
          bundleName: paymentData.bundleName
        }
      );

      return res.status(200).json({
        success: true,
        data: {
          txRef: paymentData.txRef,
          checkout_url: chapaUrl,
          amount: paymentData.amount,
          creditAmount: paymentData.creditAmount
        }
      });
    } catch (error) {
      logger.error(`Payment initialization error: ${error.message}`);

      if (error.message.includes('Invalid or inactive')) {
        return res.status(400).json({
          success: false,
          message: 'Invalid bundle ID or amount'
        });
      }

      return res.status(500).json({
        success: false,
        message: error.message || 'Failed to initialize payment'
      });
    }
  }

  /**
   * Webhook handler for Chapa payment callbacks
   * POST /api/payments/webhook
   */
  async webhook(req, res) {
    try {
      const { tx_ref, status, amount, reference, customization } = req.body;

      // Validate signature
      const signature = req.headers['x-chapa-signature'];
      if (!chapaService.verifySignature(req.body, signature)) {
        logger.warn(`Invalid webhook signature: txRef=${tx_ref}`);
        return res.status(401).json({
          success: false,
          error: 'Invalid signature'
        });
      }

      // Process payment
      const result = await paymentService.verifyAndProcessPayment(tx_ref, {
        status,
        amount,
        reference
      });

      if (!result.success && !result.alreadyProcessed) {
        return res.status(400).json(result);
      }

      // Log webhook event
      logger.info(`Webhook processed: txRef=${tx_ref}, status=${status}`);

      return res.status(200).json({
        success: true,
        message: 'Webhook processed successfully'
      });
    } catch (error) {
      logger.error(`Webhook processing error: ${error.message}`);

      return res.status(500).json({
        success: false,
        error: error.message || 'Failed to process webhook'
      });
    }
  }

  /**
   * Get payment history
   * GET /api/payments/history
   */
  async getHistory(req, res) {
    try {
      const userId = req.user?.id;
      const {
        page = 1,
        limit = 20,
        status,
        paymentMethod,
        dateFrom,
        dateTo,
        sortBy = 'createdAt',
        sortOrder = 'desc'
      } = req.query;

      const history = await paymentService.getPaymentHistory(userId, {
        page: parseInt(page),
        limit: Math.min(parseInt(limit), 100),
        status,
        paymentMethod,
        dateFrom,
        dateTo,
        sortBy,
        sortOrder
      });

      return res.status(200).json({
        success: true,
        ...history
      });
    } catch (error) {
      logger.error(`Failed to fetch payment history: ${error.message}`);

      return res.status(500).json({
        success: false,
        error: error.message || 'Failed to fetch payment history'
      });
    }
  }

  /**
   * Get financial analytics
   * GET /api/payments/analytics
   */
  async getAnalytics(req, res) {
    try {
      const userId = req.user?.id;

      const analytics = await paymentService.calculateAnalytics(userId);

      return res.status(200).json({
        success: true,
        ...analytics
      });
    } catch (error) {
      logger.error(`Failed to calculate analytics: ${error.message}`);

      return res.status(500).json({
        success: false,
        error: error.message || 'Failed to calculate analytics'
      });
    }
  }

  /**
   * Get credit bundles
   * GET /api/payments/bundles
   */
  async getBundles(req, res) {
    try {
      const bundles = await paymentService.getCreditBundles();

      return res.status(200).json({
        success: true,
        data: bundles
      });
    } catch (error) {
      logger.error(`Failed to fetch bundles: ${error.message}`);

      return res.status(500).json({
        success: false,
        error: error.message || 'Failed to fetch bundles'
      });
    }
  }

  /**
   * Export payment history as CSV
   * GET /api/payments/export
   */
  async exportHistory(req, res) {
    try {
      const userId = req.user?.id;
      const { status, paymentMethod, dateFrom, dateTo, format = 'csv' } = req.query;

      if (format !== 'csv') {
        return res.status(400).json({
          success: false,
          error: 'Only CSV format is supported'
        });
      }

      const csv = await paymentService.exportPaymentHistory(userId, {
        status,
        paymentMethod,
        dateFrom,
        dateTo
      });

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="billing_history_${new Date().toISOString().split('T')[0]}.csv"`
      );

      return res.send(csv);
    } catch (error) {
      logger.error(`Failed to export payment history: ${error.message}`);

      return res.status(500).json({
        success: false,
        error: error.message || 'Failed to export payment history'
      });
    }
  }
}

module.exports = new PaymentController();
