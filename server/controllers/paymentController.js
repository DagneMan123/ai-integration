const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { initializeChapa, verifyChapa } = require('../services/chapaService');
const { AppError } = require('../middleware/errorHandler');
const { logger } = require('../utils/logger');

// 1. Initialize
exports.initializePayment = async (req, res, next) => {
  try {
    const { amount, type, description, metadata } = req.body;
    const payment = await prisma.payment.create({
      data: {
        userId: req.user.id,
        amount,
        type,
        description,
        status: 'pending',
        metadata: metadata || {},
        transactionRef: `TX-${Date.now()}`
      }
    });

    const chapaResponse = await initializeChapa({
      amount,
      email: req.user.email,
      first_name: req.user.firstName,
      last_name: req.user.lastName,
      tx_ref: payment.transactionRef,
      callback_url: `${process.env.CLIENT_URL}/payment/callback`,
      return_url: `${process.env.CLIENT_URL}/payment/success`
    });

    await prisma.payment.update({
      where: { id: payment.id },
      data: { chapaReference: chapaResponse.data.checkout_url }
    });

    res.json({ success: true, data: { paymentId: payment.id, checkoutUrl: chapaResponse.data.checkout_url } });
  } catch (error) { next(error); }
};

// 2. Verify
exports.verifyPayment = async (req, res, next) => {
  try {
    const { tx_ref } = req.params;
    const payment = await prisma.payment.findUnique({ where: { transactionRef: tx_ref } });
    if (!payment) return next(new AppError('Payment not found', 404));

    const verification = await verifyChapa(tx_ref);
    if (verification.status === 'success') {
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: 'completed', paidAt: new Date() }
      });
      res.json({ success: true, message: 'Verified' });
    } else {
      res.json({ success: false, message: 'Failed' });
    }
  } catch (error) { next(error); }
};

// 3. Webhook
exports.chapaWebhook = async (req, res) => {
  try {
    const { tx_ref, event } = req.body;
    if (event === 'charge.completed') {
      await prisma.payment.update({ where: { transactionRef: tx_ref }, data: { status: 'completed', paidAt: new Date() } });
    }
    res.json({ success: true });
  } catch (error) { res.status(500).json({ error: error.message }); }
};

// 4. Get History
exports.getPaymentHistory = async (req, res, next) => {
  try {
    const payments = await prisma.payment.findMany({ where: { userId: req.user.id }, orderBy: { createdAt: 'desc' } });
    res.json({ success: true, data: payments });
  } catch (error) { next(error); }
};

// 5. Subscription Status
exports.getSubscription = async (req, res, next) => {
  try {
    const company = await prisma.company.findUnique({ where: { userId: req.user.id } });
    res.json({ success: true, data: company?.subscription || null });
  } catch (error) { next(error); }
};

// 6. Cancel Subscription
exports.cancelSubscription = async (req, res, next) => {
  try {
    const company = await prisma.company.findUnique({ where: { userId: req.user.id } });
    if (!company) return next(new AppError('Company not found', 404));
    const updatedSub = { ...company.subscription, status: 'cancelled' };
    await prisma.company.update({ where: { userId: req.user.id }, data: { subscription: updatedSub } });
    res.json({ success: true, message: 'Cancelled' });
  } catch (error) { next(error); }
};

// 7. Get All (Admin)
exports.getAllPayments = async (req, res, next) => {
  try {
    const payments = await prisma.payment.findMany({ include: { user: true }, orderBy: { createdAt: 'desc' } });
    res.json({ success: true, data: payments });
  } catch (error) { next(error); }
};

// 8. Refund Payment (ይህ ነው መስመር 30 ላይ ስህተት የሚሰጠው - ስሙ በትክክል ተጽፏል)
exports.refundPayment = async (req, res, next) => {
  try {
    const payment = await prisma.payment.update({
      where: { id: req.params.id },
      data: { status: 'refunded', refundedAt: new Date() }
    });
    res.json({ success: true, message: 'Refunded successfully', data: payment });
  } catch (error) { next(error); }
};