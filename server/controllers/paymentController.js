const Payment = require('../models/Payment');
const User = require('../models/User');
const Company = require('../models/Company');
const { initializeChapa, verifyChapa } = require('../services/chapaService');
const { AppError } = require('../middleware/errorHandler');
const logger = require('../utils/logger');

// Initialize payment
exports.initializePayment = async (req, res, next) => {
  try {
    const { amount, type, description, metadata } = req.body;

    // Create payment record
    const payment = await Payment.create({
      userId: req.user.id,
      amount,
      type,
      description,
      status: 'pending',
      metadata
    });

    // Initialize Chapa payment
    const chapaResponse = await initializeChapa({
      amount,
      email: req.user.email,
      first_name: req.user.firstName,
      last_name: req.user.lastName,
      tx_ref: payment.transactionRef,
      callback_url: `${process.env.CLIENT_URL}/payment/callback`,
      return_url: `${process.env.CLIENT_URL}/payment/success`,
      customization: {
        title: 'SimuAI Payment',
        description: description
      }
    });

    // Update payment with Chapa data
    payment.chapaReference = chapaResponse.data.checkout_url;
    await payment.save();

    logger.info(`Payment initialized: ${payment.transactionRef}`);

    res.json({
      success: true,
      data: {
        paymentId: payment._id,
        checkoutUrl: chapaResponse.data.checkout_url,
        transactionRef: payment.transactionRef
      }
    });
  } catch (error) {
    next(error);
  }
};

// Verify payment
exports.verifyPayment = async (req, res, next) => {
  try {
    const { tx_ref } = req.params;

    const payment = await Payment.findOne({ transactionRef: tx_ref });

    if (!payment) {
      return next(new AppError('Payment not found', 404));
    }

    // Verify with Chapa
    const verification = await verifyChapa(tx_ref);

    if (verification.status === 'success') {
      payment.status = 'completed';
      payment.paidAt = new Date();
      payment.chapaData = verification.data;
      await payment.save();

      // Process payment based on type
      await processPayment(payment);

      logger.info(`Payment verified: ${tx_ref}`);

      res.json({
        success: true,
        message: 'Payment verified successfully',
        data: payment
      });
    } else {
      payment.status = 'failed';
      await payment.save();

      res.json({
        success: false,
        message: 'Payment verification failed'
      });
    }
  } catch (error) {
    next(error);
  }
};

// Chapa webhook
exports.chapaWebhook = async (req, res, next) => {
  try {
    const { tx_ref, status, event } = req.body;

    logger.info(`Chapa webhook received: ${event} - ${tx_ref}`);

    const payment = await Payment.findOne({ transactionRef: tx_ref });

    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    switch (event) {
      case 'charge.completed':
        payment.status = 'completed';
        payment.paidAt = new Date();
        await payment.save();
        await processPayment(payment);
        break;

      case 'charge.failed':
        payment.status = 'failed';
        await payment.save();
        break;

      case 'charge.refunded':
        payment.status = 'refunded';
        payment.refundedAt = new Date();
        await payment.save();
        await reversePayment(payment);
        break;

      default:
        logger.warn(`Unknown webhook event: ${event}`);
    }

    res.json({ success: true });
  } catch (error) {
    logger.error(`Webhook error: ${error.message}`);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
};

// Get payment history
exports.getPaymentHistory = async (req, res, next) => {
  try {
    const payments = await Payment.find({ userId: req.user.id })
      .sort('-createdAt')
      .lean();

    res.json({
      success: true,
      data: payments
    });
  } catch (error) {
    next(error);
  }
};

// Get subscription
exports.getSubscription = async (req, res, next) => {
  try {
    let subscription = null;

    if (req.user.role === 'employer') {
      const company = await Company.findOne({ userId: req.user.id });
      if (company) {
        subscription = company.subscription;
      }
    }

    res.json({
      success: true,
      data: subscription
    });
  } catch (error) {
    next(error);
  }
};

// Cancel subscription
exports.cancelSubscription = async (req, res, next) => {
  try {
    if (req.user.role !== 'employer') {
      return next(new AppError('Only employers can cancel subscriptions', 403));
    }

    const company = await Company.findOne({ userId: req.user.id });
    if (!company) {
      return next(new AppError('Company not found', 404));
    }

    company.subscription.status = 'cancelled';
    company.subscription.cancelledAt = new Date();
    await company.save();

    res.json({
      success: true,
      message: 'Subscription cancelled successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Get all payments (admin)
exports.getAllPayments = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status } = req.query;

    const query = {};
    if (status) query.status = status;

    const payments = await Payment.find(query)
      .populate('userId', 'firstName lastName email')
      .sort('-createdAt')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    const count = await Payment.countDocuments(query);

    // Calculate revenue
    const revenue = await Payment.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    res.json({
      success: true,
      data: payments,
      pagination: {
        total: count,
        page: parseInt(page),
        pages: Math.ceil(count / limit)
      },
      revenue: revenue[0]?.total || 0
    });
  } catch (error) {
    next(error);
  }
};

// Refund payment (admin)
exports.refundPayment = async (req, res, next) => {
  try {
    const payment = await Payment.findById(req.params.id);

    if (!payment) {
      return next(new AppError('Payment not found', 404));
    }

    if (payment.status !== 'completed') {
      return next(new AppError('Only completed payments can be refunded', 400));
    }

    // Process refund with Chapa (implement actual refund API)
    payment.status = 'refunded';
    payment.refundedAt = new Date();
    payment.refundedBy = req.user.id;
    await payment.save();

    await reversePayment(payment);

    logger.info(`Payment refunded: ${payment.transactionRef}`);

    res.json({
      success: true,
      message: 'Payment refunded successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Helper: Process payment
async function processPayment(payment) {
  const user = await User.findById(payment.userId);

  switch (payment.type) {
    case 'subscription':
      if (user.role === 'employer') {
        const company = await Company.findOne({ userId: user._id });
        if (company) {
          company.subscription = {
            plan: payment.metadata.plan,
            status: 'active',
            startDate: new Date(),
            endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
            autoRenew: true
          };
          await company.save();
        }
      }
      break;

    case 'credits':
      if (user.role === 'employer') {
        const company = await Company.findOne({ userId: user._id });
        if (company) {
          company.aiCredits += payment.metadata.credits || 0;
          await company.save();
        }
      }
      break;

    case 'interview':
      // Grant interview access
      break;

    case 'premium_report':
      // Grant premium report access
      break;

    default:
      logger.warn(`Unknown payment type: ${payment.type}`);
  }
}

// Helper: Reverse payment
async function reversePayment(payment) {
  const user = await User.findById(payment.userId);

  switch (payment.type) {
    case 'subscription':
      if (user.role === 'employer') {
        const company = await Company.findOne({ userId: user._id });
        if (company) {
          company.subscription.status = 'cancelled';
          await company.save();
        }
      }
      break;

    case 'credits':
      if (user.role === 'employer') {
        const company = await Company.findOne({ userId: user._id });
        if (company) {
          company.aiCredits -= payment.metadata.credits || 0;
          if (company.aiCredits < 0) company.aiCredits = 0;
          await company.save();
        }
      }
      break;

    default:
      logger.warn(`Unknown payment type for reversal: ${payment.type}`);
  }
}
