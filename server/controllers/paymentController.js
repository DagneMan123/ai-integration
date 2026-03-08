const prisma = require('../lib/prisma');
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

    // Check for existing pending payment
    const existingPending = await prisma.payment.findFirst({
      where: {
        userId,
        amount: parseFloat(amount),
        status: 'PENDING'
      }
    });

    if (existingPending) {
      logger.warn(`[PAYMENT] Reusing pending payment: ${existingPending.id}`);
      return res.json({
        success: true,
        data: {
          paymentId: existingPending.id,
          checkoutUrl: existingPending.chapaReference,
          message: 'Using existing pending payment'
        }
      });
    }

    // Check for completed payment in last 24 hours
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentCompleted = await prisma.payment.findFirst({
      where: {
        userId,
        amount: parseFloat(amount),
        status: 'COMPLETED',
        paidAt: { gte: twentyFourHoursAgo }
      }
    });

    if (recentCompleted) {
      logger.warn(`[PAYMENT] Recent payment exists: ${recentCompleted.id}`);
      return res.status(400).json({
        success: false,
        message: 'Payment already completed. Please wait 24 hours before making another payment.'
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

    logger.info(`[PAYMENT] Record created: ${payment.id}, tx_ref=${txRef}`);

    // Call Chapa API (server-side, with SECRET_KEY)
    const chapaResponse = await initializeChapa({
      amount: Math.round(amount),
      email: req.user.email,
      first_name: req.user.firstName || 'User',
      last_name: req.user.lastName || 'Account',
      tx_ref: txRef,
      callback_url: `${process.env.CLIENT_URL}/payment/callback`,
      return_url: `${process.env.CLIENT_URL}/payment/success`,
      customization: {
        title: 'SimuAI Payment',
        description: description || `Payment for ${type}`
      }
    });

    logger.info(`[PAYMENT] Chapa initialized: ${chapaResponse.data?.checkout_url}`);

    // Update payment with Chapa reference
    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        chapaReference: chapaResponse.data?.checkout_url,
        metadata: {
          type,
          chapaId: chapaResponse.data?.id,
          initiatedAt: new Date().toISOString()
        }
      }
    });

    // Return checkout URL to frontend
    res.json({
      success: true,
      data: {
        paymentId: payment.id,
        checkoutUrl: chapaResponse.data?.checkout_url,
        amount: payment.amount,
        txRef: txRef
      }
    });
  } catch (error) {
    logger.error(`[PAYMENT] Initialization error: ${error.message}`);
    next(error);
  }
};

// 2. Verify Payment & Execute AI (Frontend calls this after redirect)
exports.verifyPayment = async (req, res, next) => {
  try {
    const { tx_ref } = req.params;
    const userId = req.user.id;

    if (!tx_ref) {
      return next(new AppError('Transaction reference is required', 400));
    }

    logger.info(`[PAYMENT] Verifying: tx_ref=${tx_ref}, user=${userId}`);

    // Find payment record
    const payment = await prisma.payment.findUnique({
      where: { transactionId: tx_ref }
    });

    if (!payment) {
      logger.warn(`[PAYMENT] Payment not found: ${tx_ref}`);
      return next(new AppError('Payment not found', 404));
    }

    // Verify ownership
    if (payment.userId !== userId) {
      logger.warn(`[PAYMENT] Unauthorized access: user=${userId}, payment.userId=${payment.userId}`);
      return next(new AppError('Unauthorized', 403));
    }

    // SERVER-SIDE VERIFICATION: Call Chapa to verify payment
    logger.info(`[PAYMENT] Calling Chapa verify API for: ${tx_ref}`);
    const verification = await verifyChapa(tx_ref);

    logger.info(`[PAYMENT] Chapa response: ${JSON.stringify(verification)}`);

    // Check if payment is successful
    if (verification.status === 'success' || verification.data?.status === 'success') {
      // Update payment status
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

      logger.info(`[PAYMENT] Payment verified: ${payment.id}`);

      // NOW: Call OpenAI API (only after payment is verified)
      logger.info(`[PAYMENT] Calling OpenAI for user: ${userId}`);
      
      // TODO: Implement OpenAI call here
      // const aiResult = await callOpenAI(payment.metadata.type);

      res.json({
        success: true,
        message: 'Payment verified successfully',
        data: {
          paymentId: payment.id,
          status: 'COMPLETED',
          // aiResult: aiResult (after OpenAI implementation)
        }
      });
    } else {
      // Payment failed
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: 'FAILED' }
      });

      logger.warn(`[PAYMENT] Verification failed: ${tx_ref}`);
      return res.status(400).json({
        success: false,
        message: 'Payment verification failed',
        data: { status: 'FAILED' }
      });
    }
  } catch (error) {
    logger.error(`[PAYMENT] Verification error: ${error.message}`);
    next(error);
  }
};

// 3. Webhook Handler (Chapa calls this)
exports.chapaWebhook = async (req, res) => {
  try {
    const { tx_ref, event, status } = req.body;

    logger.info(`[WEBHOOK] Received: tx_ref=${tx_ref}, event=${event}, status=${status}`);

    // Validate webhook signature
    const webhookSecret = process.env.CHAPA_WEBHOOK_SECRET;
    if (webhookSecret && req.headers['x-chapa-signature'] !== webhookSecret) {
      logger.warn(`[WEBHOOK] Invalid signature`);
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
              webhookReceivedAt: new Date().toISOString()
            }
          }
        });

        logger.info(`[WEBHOOK] Payment completed: ${payment.id}`);
      }
    }

    res.json({ success: true, message: 'Webhook processed' });
  } catch (error) {
    logger.error(`[WEBHOOK] Error: ${error.message}`);
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
    logger.error(`[PAYMENT] History error: ${error.message}`);
    next(error);
  }
};

// 5. Get Subscription Status
exports.getSubscription = async (req, res, next) => {
  try {
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
    logger.error(`[PAYMENT] Subscription error: ${error.message}`);
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

    logger.info(`[PAYMENT] Subscription cancelled: ${company.id}`);

    res.json({ success: true, message: 'Subscription cancelled successfully' });
  } catch (error) {
    logger.error(`[PAYMENT] Cancel error: ${error.message}`);
    next(error);
  }
};

// 7. Get All Payments (Admin)
exports.getAllPayments = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;

    const where = {};
    if (status) where.status = status;

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
    logger.error(`[PAYMENT] Admin error: ${error.message}`);
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

    logger.info(`[PAYMENT] Refunded: ${id}, reason: ${reason}`);

    res.json({
      success: true,
      message: 'Payment refunded successfully',
      data: refundedPayment
    });
  } catch (error) {
    logger.error(`[PAYMENT] Refund error: ${error.message}`);
    next(error);
  }
};