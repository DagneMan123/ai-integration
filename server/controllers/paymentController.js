const { prisma } = require('../config/database');
const { initializeChapa, verifyChapa } = require('../services/chapaService');
const { AppError } = require('../middleware/errorHandler');
const { logger } = require('../utils/logger');

// Generate unique transaction reference
const generateTxRef = (userId) => {
  return `req-${userId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// 1. Initialize Payment (Frontend calls this)
exports.initializePayment = async (req, res, next) => {
  try {
    const { amount, type, description } = req.body;
    const userId = req.user.id;

    // Validate input
    if (!amount || amount <= 0) {
      return next(new AppError('Invalid amount', 400));
    }
    if (!type) {
      return next(new AppError('Payment type is required', 400));
    }

    logger.info(`[PAYMENT] Initializing: user=${userId}, amount=${amount}, type=${type}`);

    // Clean up old pending payments (older than 1 hour)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    await prisma.payment.updateMany({
      where: {
        userId,
        status: 'PENDING',
        createdAt: { lt: oneHourAgo }
      },
      data: { status: 'FAILED' }
    });

    // Check for existing pending payment (within 10 minutes)
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
    const existingPending = await prisma.payment.findFirst({
      where: {
        userId,
        amount: parseFloat(amount),
        status: 'PENDING',
        createdAt: { gte: tenMinutesAgo }
      }
    });

    if (existingPending && existingPending.chapaReference) {
      logger.warn(`[PAYMENT] Reusing pending payment: ${existingPending.id}`);
      return res.json({
        success: true,
        data: {
          paymentId: existingPending.id,
          checkoutUrl: existingPending.chapaReference,
          txRef: existingPending.transactionId,
          message: 'Using existing pending payment'
        }
      });
    }

    // Check for completed payment in last 30 minutes (prevent accidental duplicates)
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
    const recentCompleted = await prisma.payment.findFirst({
      where: {
        userId,
        amount: parseFloat(amount),
        status: 'COMPLETED',
        paidAt: { gte: thirtyMinutesAgo }
      }
    });

    if (recentCompleted) {
      logger.warn(`[PAYMENT] Duplicate payment attempt detected: ${recentCompleted.id}`);
      return res.status(400).json({
        success: false,
        message: 'Payment already completed. Please wait before trying again.'
      });
    }

    // Generate unique transaction reference
    const txRef = generateTxRef(userId);

    // Create payment record
    const payment = await prisma.payment.create({
      data: {
        userId,
        amount: parseFloat(amount),
        currency: 'ETB',
        paymentMethod: 'chapa',
        description: description || `Payment for ${type}`,
        status: 'PENDING',
        transactionId: txRef,
        metadata: { type, initiatedAt: new Date().toISOString() }
      }
    });

    // Call Chapa API
    const chapaResponse = await initializeChapa({
      amount: amount, // Avoid Math.round if your service handles decimals
      email: req.user.email,
      first_name: req.user.firstName || 'User',
      last_name: req.user.lastName || 'Account',
      tx_ref: txRef,
      callback_url: `${process.env.CLIENT_URL}/payment/callback`,
      return_url: `${process.env.CLIENT_URL}/payment/success?tx_ref=${txRef}`, // tx_ref added to query string
      customization: {
        title: 'SimuAI Payment',
        description: description || `Payment for ${type}`
      }
    });

    // Update payment with Chapa reference (Checkout URL)
    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        chapaReference: chapaResponse.data?.checkout_url,
        metadata: {
          ...payment.metadata,
          chapaId: chapaResponse.data?.id
        }
      }
    });

    res.json({
      success: true,
      data: {
        paymentId: payment.id,
        checkoutUrl: chapaResponse.data?.checkout_url,
        txRef: txRef
      }
    });
  } catch (error) {
    logger.error(`[PAYMENT] Initialization error: ${error.message}`);
    next(error);
  }
};

// 2. Verify Payment (FIXED: Now checks req.query for the transaction reference)
exports.verifyPayment = async (req, res, next) => {
  try {
    // FIXED: Changed from req.params to check both query and params
    const tx_ref = req.query.tx_ref || req.params.tx_ref;
    const userId = req.user.id;

    if (!tx_ref) {
      return next(new AppError('No transaction reference found in request', 400));
    }

    logger.info(`[PAYMENT] Verifying: tx_ref=${tx_ref}, user=${userId}`);

    // Find payment record
    const payment = await prisma.payment.findUnique({
      where: { transactionId: tx_ref }
    });

    if (!payment) {
      return next(new AppError('Payment record not found in database', 404));
    }

    if (payment.userId !== userId) {
      return next(new AppError('Unauthorized payment verification', 403));
    }

    // Verify with Chapa API
    const verification = await verifyChapa(tx_ref);

    if (verification.status === 'success' || verification.data?.status === 'success') {
      // Update payment status to COMPLETED
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: 'COMPLETED',
          paidAt: new Date(),
          metadata: {
            ...payment.metadata,
            verifiedAt: new Date().toISOString(),
            chapaVerification: verification.data
          }
        }
      });

      // Update Company subscription status if applicable
      const company = await prisma.company.findFirst({ where: { createdById: userId } });
      if (company) {
        await prisma.company.update({
          where: { id: company.id },
          data: { isVerified: true } // Adjust this field based on your schema
        });
      }

      res.json({
        success: true,
        message: 'Payment verified successfully',
        data: { status: 'COMPLETED', paymentId: payment.id }
      });
    } else {
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: 'FAILED' }
      });

      res.status(400).json({
        success: false,
        message: 'Payment verification failed at provider',
        data: { status: 'FAILED' }
      });
    }
  } catch (error) {
    logger.error(`[PAYMENT] Verification error: ${error.message}`);
    next(error);
  }
};

// 3. Webhook Handler
exports.chapaWebhook = async (req, res) => {
  try {
    const { tx_ref, status } = req.body;
    const webhookSecret = process.env.CHAPA_WEBHOOK_SECRET;

    if (webhookSecret && req.headers['x-chapa-signature'] !== webhookSecret) {
      return res.status(401).json({ error: 'Invalid signature' });
    }

    if (status === 'success') {
      const payment = await prisma.payment.findUnique({ where: { transactionId: tx_ref } });
      if (payment && payment.status !== 'COMPLETED') {
        await prisma.payment.update({
          where: { id: payment.id },
          data: { status: 'COMPLETED', paidAt: new Date() }
        });
      }
    }
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 4. Get Payment History
exports.getPaymentHistory = async (req, res, next) => {
  try {
    const payments = await prisma.payment.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' }
    });
    res.json({ success: true, data: payments });
  } catch (error) {
    next(error);
  }
};

// 5. Get Subscription Status
exports.getSubscription = async (req, res, next) => {
  try {
    const company = await prisma.company.findFirst({
      where: { createdById: req.user.id }
    });

    res.json({
      success: true,
      data: company?.subscription || { plan: 'free', status: 'active' }
    });
  } catch (error) {
    next(error);
  }
};

// 6. Cancel Subscription
exports.cancelSubscription = async (req, res, next) => {
  try {
    const company = await prisma.company.findFirst({ where: { createdById: req.user.id } });
    if (!company) return next(new AppError('Company not found', 404));

    await prisma.company.update({
      where: { id: company.id },
      data: { subscription: { ...company.subscription, status: 'cancelled' } }
    });

    res.json({ success: true, message: 'Subscription cancelled' });
  } catch (error) {
    next(error);
  }
};

// 7. Get All Payments (Admin)
exports.getAllPayments = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const payments = await prisma.payment.findMany({
      include: { user: { select: { email: true } } },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: parseInt(limit)
    });
    res.json({ success: true, data: payments });
  } catch (error) {
    next(error);
  }
};

// 8. Refund Payment
exports.refundPayment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const payment = await prisma.payment.update({
      where: { id },
      data: { status: 'refunded', refundedAt: new Date() }
    });
    res.json({ success: true, data: payment });
  } catch (error) {
    next(error);
  }
};