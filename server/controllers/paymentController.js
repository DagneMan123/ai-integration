const prisma = require('../lib/prisma');
const { initializeChapa, verifyChapa } = require('../services/chapaService');
const { AppError } = require('../middleware/errorHandler');
const { logger } = require('../utils/logger');

// 1. Initialize Payment
exports.initializePayment = async (req, res, next) => {
  try {
    const { amount, type, description, metadata } = req.body;

    // Validate input
    if (!amount || amount <= 0) {
      return next(new AppError('Invalid amount', 400));
    }

    if (!type) {
      return next(new AppError('Payment type is required', 400));
    }

    logger.info(`Initializing payment: amount=${amount}, type=${type}, user=${req.user.id}`);

    // Create payment record
    const payment = await prisma.payment.create({
      data: {
        userId: req.user.id,
        amount: parseFloat(amount),
        currency: 'ETB',
        paymentMethod: 'chapa',
        description: description || `Payment for ${type}`,
        status: 'PENDING',
        metadata: metadata || { type },
        transactionId: `TX-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      }
    });

    logger.info(`Payment record created: ${payment.id}`);

    // Initialize with Chapa
    const chapaResponse = await initializeChapa({
      amount: Math.round(amount),
      email: req.user.email,
      first_name: req.user.firstName || 'User',
      last_name: req.user.lastName || 'Account',
      tx_ref: payment.transactionId,
      callback_url: `${process.env.CLIENT_URL}/payment/callback`,
      return_url: `${process.env.CLIENT_URL}/payment/success`,
      customization: {
        title: 'SimuAI Payment',
        description: description || `Payment for ${type}`
      }
    });

    logger.info(`Chapa response received: ${JSON.stringify(chapaResponse)}`);

    // Update payment with Chapa reference
    await prisma.payment.update({
      where: { id: payment.id },
      data: { 
        chapaReference: chapaResponse.data?.checkout_url || chapaResponse.data?.id,
        metadata: {
          ...payment.metadata,
          chapaData: chapaResponse.data
        }
      }
    });

    res.json({ 
      success: true, 
      data: { 
        paymentId: payment.id, 
        transactionRef: payment.transactionId,
        checkoutUrl: chapaResponse.data?.checkout_url,
        amount: payment.amount
      } 
    });
  } catch (error) {
    logger.error(`Payment initialization error: ${error.message}`);
    next(error);
  }
};

// 2. Verify Payment
exports.verifyPayment = async (req, res, next) => {
  try {
    const { tx_ref } = req.params;

    if (!tx_ref) {
      return next(new AppError('Transaction reference is required', 400));
    }

    logger.info(`Verifying payment: ${tx_ref}`);

    // Find payment
    const payment = await prisma.payment.findUnique({ 
      where: { transactionId: tx_ref } 
    });

    if (!payment) {
      logger.warn(`Payment not found: ${tx_ref}`);
      return next(new AppError('Payment not found', 404));
    }

    // Verify with Chapa
    const verification = await verifyChapa(tx_ref);

    logger.info(`Chapa verification response: ${JSON.stringify(verification)}`);

    // Update payment status based on verification
    if (verification.status === 'success' || verification.data?.status === 'success') {
      await prisma.payment.update({
        where: { id: payment.id },
        data: { 
          status: 'COMPLETED', 
          paidAt: new Date(),
          metadata: {
            ...payment.metadata,
            verificationData: verification.data
          }
        }
      });

      logger.info(`Payment verified and completed: ${payment.id}`);

      res.json({ 
        success: true, 
        message: 'Payment verified successfully',
        data: { paymentId: payment.id, status: 'COMPLETED' }
      });
    } else {
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: 'FAILED' }
      });

      logger.warn(`Payment verification failed: ${tx_ref}`);

      res.json({ 
        success: false, 
        message: 'Payment verification failed',
        data: { paymentId: payment.id, status: 'FAILED' }
      });
    }
  } catch (error) {
    logger.error(`Payment verification error: ${error.message}`);
    next(error);
  }
};

// 3. Webhook Handler
exports.chapaWebhook = async (req, res) => {
  try {
    const { tx_ref, event, status } = req.body;

    logger.info(`Chapa webhook received: tx_ref=${tx_ref}, event=${event}, status=${status}`);

    // Validate webhook secret
    const webhookSecret = process.env.CHAPA_WEBHOOK_SECRET;
    if (webhookSecret && req.headers['x-chapa-signature'] !== webhookSecret) {
      logger.warn(`Invalid webhook signature received`);
      return res.status(401).json({ error: 'Invalid webhook signature' });
    }

    if (event === 'charge.completed' || status === 'success') {
      const payment = await prisma.payment.findUnique({
        where: { transactionId: tx_ref }
      });

      if (payment) {
        await prisma.payment.update({
          where: { id: payment.id },
          data: { 
            status: 'COMPLETED', 
            paidAt: new Date(),
            metadata: {
              ...payment.metadata,
              webhookData: req.body
            }
          }
        });

        logger.info(`Payment completed via webhook: ${payment.id}`);
      } else {
        logger.warn(`Payment not found for webhook: ${tx_ref}`);
      }
    }

    res.json({ success: true, message: 'Webhook processed' });
  } catch (error) {
    logger.error(`Webhook error: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
};

// 4. Get Payment History
exports.getPaymentHistory = async (req, res, next) => {
  try {
    const payments = await prisma.payment.findMany({ 
      where: { userId: req.user.id }, 
      orderBy: { createdAt: 'desc' },
      take: 50
    });

    res.json({ success: true, data: payments });
  } catch (error) {
    logger.error(`Get payment history error: ${error.message}`);
    next(error);
  }
};

// 5. Get Subscription Status
exports.getSubscription = async (req, res, next) => {
  try {
    // Get user's company (employer only)
    const company = await prisma.company.findFirst({ 
      where: { createdById: req.user.id } 
    });

    if (!company) {
      return res.json({ 
        success: true, 
        data: { 
          plan: 'free', 
          status: 'active',
          startDate: new Date(),
          endDate: null
        } 
      });
    }

    res.json({ 
      success: true, 
      data: company.subscription || { 
        plan: 'free', 
        status: 'active',
        startDate: new Date(),
        endDate: null
      } 
    });
  } catch (error) {
    logger.error(`Get subscription error: ${error.message}`);
    next(error);
  }
};

// 6. Cancel Subscription
exports.cancelSubscription = async (req, res, next) => {
  try {
    const company = await prisma.company.findFirst({ 
      where: { createdById: req.user.id } 
    });

    if (!company) {
      return next(new AppError('Company not found', 404));
    }

    const updatedSub = { 
      plan: company.subscription?.plan || 'free',
      status: 'cancelled',
      cancelledAt: new Date()
    };

    await prisma.company.update({ 
      where: { id: company.id }, 
      data: { subscription: updatedSub } 
    });

    logger.info(`Subscription cancelled: ${company.id}`);

    res.json({ success: true, message: 'Subscription cancelled successfully' });
  } catch (error) {
    logger.error(`Cancel subscription error: ${error.message}`);
    next(error);
  }
};

// 7. Get All Payments (Admin)
exports.getAllPayments = async (req, res, next) => {
  try {
    const { status, type, page = 1, limit = 20 } = req.query;

    const where = {};
    if (status) where.status = status;
    if (type) where.type = type;

    const payments = await prisma.payment.findMany({ 
      where,
      include: { user: { select: { id: true, email: true, firstName: true, lastName: true } } },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: parseInt(limit)
    });

    const total = await prisma.payment.count({ where });

    res.json({ 
      success: true, 
      data: payments,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    logger.error(`Get all payments error: ${error.message}`);
    next(error);
  }
};

// 8. Refund Payment
exports.refundPayment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    if (!id) {
      return next(new AppError('Payment ID is required', 400));
    }

    const payment = await prisma.payment.findUnique({
      where: { id }
    });

    if (!payment) {
      return next(new AppError('Payment not found', 404));
    }

    if (payment.status === 'refunded') {
      return next(new AppError('Payment already refunded', 400));
    }

    const refundedPayment = await prisma.payment.update({
      where: { id },
      data: { 
        status: 'refunded', 
        refundedAt: new Date(),
        metadata: {
          ...payment.metadata,
          refundReason: reason || 'Admin refund'
        }
      }
    });

    logger.info(`Payment refunded: ${id}, reason: ${reason}`);

    res.json({ 
      success: true, 
      message: 'Payment refunded successfully', 
      data: refundedPayment 
    });
  } catch (error) {
    logger.error(`Refund payment error: ${error.message}`);
    next(error);
  }
};