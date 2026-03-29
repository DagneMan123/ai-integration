const prisma = require('../lib/prisma');
const { v4: uuidv4 } = require('uuid');
const { logger } = require('../utils/logger');

class PaymentService {
  /**
   * Initialize a payment for credit purchase
   * Generates unique tx_ref and creates PENDING payment record
   */
  async initializePayment(bundleId, userId, amount, creditAmount, txRef) {
    try {
      let bundle = null;
      let finalAmount = amount;
      let finalCreditAmount = creditAmount;
      let bundleName = 'Custom Credits';

      // If bundleId provided, fetch bundle details
      if (bundleId) {
        bundle = await prisma.creditBundle.findUnique({
          where: { id: bundleId }
        });

        if (!bundle || !bundle.isActive) {
          throw new Error('Invalid or inactive credit bundle');
        }

        finalAmount = bundle.priceETB;
        finalCreditAmount = bundle.creditAmount;
        bundleName = bundle.name;
      }

      // Validate amount is positive
      if (finalAmount <= 0) {
        throw new Error('Invalid payment amount');
      }

      // Generate unique tx_ref if not provided
      const transactionRef = txRef || `tx_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`;

      // Create Payment record with PENDING status
      const payment = await prisma.payment.create({
        data: {
          userId,
          amount: finalAmount,
          currency: 'ETB',
          paymentMethod: 'chapa',
          status: 'PENDING',
          metadata: {
            bundleId: bundleId || null,
            creditAmount: finalCreditAmount,
            bundleName
          },
          transactionId: transactionRef
        }
      });

      logger.info(`Payment initialized: txRef=${transactionRef}, userId=${userId}, bundleId=${bundleId}, amount=${finalAmount}, credits=${finalCreditAmount}`);

      return {
        success: true,
        txRef: transactionRef,
        paymentId: payment.id,
        amount: finalAmount,
        creditAmount: finalCreditAmount,
        bundleName
      };
    } catch (error) {
      logger.error(`Payment initialization failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Verify payment with Chapa and update wallet
   */
  async verifyAndProcessPayment(txRef, chapaData) {
    try {
      // Fetch Payment record by txRef
      const payment = await prisma.payment.findUnique({
        where: { transactionId: txRef }
      });

      if (!payment) {
        throw new Error('Payment record not found');
      }

      // Check if already processed (idempotency)
      if (payment.status === 'COMPLETED') {
        logger.info(`Payment already processed: txRef=${txRef}`);
        return {
          success: true,
          message: 'Payment already processed',
          alreadyProcessed: true
        };
      }

      // Verify amount matches
      if (parseFloat(payment.amount) !== parseFloat(chapaData.amount)) {
        throw new Error('Payment amount mismatch');
      }

      // Check payment status from Chapa
      if (chapaData.status !== 'completed') {
        // Update payment to FAILED
        await prisma.payment.update({
          where: { id: payment.id },
          data: { status: 'FAILED' }
        });

        logger.warn(`Payment failed: txRef=${txRef}, status=${chapaData.status}`);
        return {
          success: false,
          message: 'Payment failed',
          status: chapaData.status
        };
      }

      // Execute atomic transaction to update wallet
      const creditAmount = payment.metadata?.creditAmount || 0;
      const result = await prisma.$transaction(async (tx) => {
        // 1. Update Payment record to COMPLETED
        const updatedPayment = await tx.payment.update({
          where: { id: payment.id },
          data: {
            status: 'COMPLETED',
            chapaReference: chapaData.reference,
            paidAt: new Date()
          }
        });

        // 2. Get or create wallet
        let wallet = await tx.wallet.findUnique({
          where: { userId: payment.userId }
        });

        if (!wallet) {
          wallet = await tx.wallet.create({
            data: {
              userId: payment.userId,
              balance: 0,
              currency: 'ETB'
            }
          });
        }

        // 3. Increment wallet balance (with optimistic locking)
        const updatedWallet = await tx.wallet.update({
          where: { userId: payment.userId },
          data: {
            balance: {
              increment: creditAmount
            }
          }
        });

        // 4. Log transaction
        await tx.walletTransaction.create({
          data: {
            userId: payment.userId,
            amount: creditAmount,
            type: 'TOPUP',
            reason: `Payment for ${payment.metadata?.bundleName || 'credits'}`
          }
        });

        return { payment: updatedPayment, wallet: updatedWallet };
      });

      logger.info(`Payment completed: txRef=${txRef}, userId=${payment.userId}, creditAmount=${creditAmount}, newBalance=${result.wallet.balance}`);

      return {
        success: true,
        message: 'Payment processed successfully',
        creditAmount,
        newBalance: result.wallet.balance
      };
    } catch (error) {
      logger.error(`Payment verification failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get payment history for a user
   */
  async getPaymentHistory(userId, filters = {}) {
    try {
      const {
        page = 1,
        limit = 20,
        status,
        paymentMethod,
        dateFrom,
        dateTo,
        sortBy = 'createdAt',
        sortOrder = 'desc'
      } = filters;

      const skip = (page - 1) * limit;

      // Build where clause
      const where = { userId };

      if (status) {
        where.status = status.toUpperCase();
      }

      if (paymentMethod) {
        where.paymentMethod = paymentMethod;
      }

      if (dateFrom || dateTo) {
        where.createdAt = {};
        if (dateFrom) {
          where.createdAt.gte = new Date(dateFrom);
        }
        if (dateTo) {
          where.createdAt.lte = new Date(dateTo);
        }
      }

      // Fetch payments
      const payments = await prisma.payment.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          [sortBy]: sortOrder.toLowerCase()
        }
      });

      // Get total count
      const total = await prisma.payment.count({ where });

      return {
        data: payments,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      logger.error(`Failed to fetch payment history: ${error.message}`);
      throw error;
    }
  }

  /**
   * Calculate financial analytics
   */
  async calculateAnalytics(userId) {
    try {
      const payments = await prisma.payment.findMany({
        where: {
          userId,
          status: 'COMPLETED'
        }
      });

      const totalSpent = payments.reduce((sum, p) => sum + parseFloat(p.amount), 0);
      const successfulTransactions = payments.length;
      const averageValue = successfulTransactions > 0 ? totalSpent / successfulTransactions : 0;

      // Get wallet balance
      const wallet = await prisma.wallet.findUnique({
        where: { userId }
      });

      const creditsRemaining = wallet?.balance || 0;

      return {
        totalSpent: parseFloat(totalSpent.toFixed(2)),
        successfulTransactions,
        averageValue: parseFloat(averageValue.toFixed(2)),
        creditsRemaining: parseFloat(creditsRemaining)
      };
    } catch (error) {
      logger.error(`Failed to calculate analytics: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get credit bundles
   */
  async getCreditBundles() {
    try {
      const bundles = await prisma.creditBundle.findMany({
        where: { isActive: true },
        orderBy: { creditAmount: 'asc' }
      });

      return bundles;
    } catch (error) {
      logger.error(`Failed to fetch credit bundles: ${error.message}`);
      throw error;
    }
  }

  /**
   * Export payment history as CSV
   */
  async exportPaymentHistory(userId, filters = {}) {
    try {
      const { status, paymentMethod, dateFrom, dateTo } = filters;

      const where = { userId };

      if (status) {
        where.status = status.toUpperCase();
      }

      if (paymentMethod) {
        where.paymentMethod = paymentMethod;
      }

      if (dateFrom || dateTo) {
        where.createdAt = {};
        if (dateFrom) {
          where.createdAt.gte = new Date(dateFrom);
        }
        if (dateTo) {
          where.createdAt.lte = new Date(dateTo);
        }
      }

      const payments = await prisma.payment.findMany({
        where,
        orderBy: { createdAt: 'desc' }
      });

      // Generate CSV
      const headers = ['Date', 'Transaction Reference', 'Amount (ETB)', 'Status', 'Payment Method', 'Chapa Reference'];
      const rows = payments.map(p => [
        new Date(p.createdAt).toLocaleString('en-ET'),
        p.transactionId || '',
        p.amount,
        p.status,
        p.paymentMethod,
        p.chapaReference || ''
      ]);

      const csv = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
      ].join('\n');

      return csv;
    } catch (error) {
      logger.error(`Failed to export payment history: ${error.message}`);
      throw error;
    }
  }
}

module.exports = new PaymentService();
