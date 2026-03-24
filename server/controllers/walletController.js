const { prisma } = require('../config/database');
const { logger } = require('../utils/logger');

// Get wallet balance
exports.getWalletBalance = async (req, res) => {
  try {
    const userId = req.user.id;

    let wallet = await prisma.wallet.findUnique({
      where: { userId }
    });

    if (!wallet) {
      wallet = await prisma.wallet.create({
        data: {
          userId,
          balance: 0
        }
      });
    }

    res.json({
      success: true,
      data: {
        balance: wallet.balance,
        currency: 'ETB'
      }
    });
  } catch (error) {
    logger.error('Error fetching wallet balance:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch wallet balance',
      error: error.message
    });
  }
};

// Top up wallet
exports.topupWallet = async (req, res) => {
  try {
    const userId = req.user.id;
    const { amount } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid amount is required'
      });
    }

    let wallet = await prisma.wallet.findUnique({
      where: { userId }
    });

    if (!wallet) {
      wallet = await prisma.wallet.create({
        data: {
          userId,
          balance: amount
        }
      });
    } else {
      wallet = await prisma.wallet.update({
        where: { userId },
        data: {
          balance: {
            increment: amount
          }
        }
      });
    }

    res.json({
      success: true,
      message: 'Wallet topped up successfully',
      data: {
        balance: wallet.balance
      }
    });
  } catch (error) {
    logger.error('Error topping up wallet:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to top up wallet',
      error: error.message
    });
  }
};

// Deduct credits
exports.deductCredits = async (req, res) => {
  try {
    const userId = req.user.id;
    const { amount, reason } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid amount is required'
      });
    }

    let wallet = await prisma.wallet.findUnique({
      where: { userId }
    });

    if (!wallet) {
      return res.status(404).json({
        success: false,
        message: 'Wallet not found'
      });
    }

    if (wallet.balance < amount) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient balance'
      });
    }

    wallet = await prisma.wallet.update({
      where: { userId },
      data: {
        balance: {
          decrement: amount
        }
      }
    });

    res.json({
      success: true,
      message: 'Credits deducted successfully',
      data: {
        balance: wallet.balance
      }
    });
  } catch (error) {
    logger.error('Error deducting credits:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to deduct credits',
      error: error.message
    });
  }
};

// Refund credits
exports.refundCredits = async (req, res) => {
  try {
    const userId = req.user.id;
    const { amount, reason } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid amount is required'
      });
    }

    let wallet = await prisma.wallet.findUnique({
      where: { userId }
    });

    if (!wallet) {
      wallet = await prisma.wallet.create({
        data: {
          userId,
          balance: amount
        }
      });
    } else {
      wallet = await prisma.wallet.update({
        where: { userId },
        data: {
          balance: {
            increment: amount
          }
        }
      });
    }

    res.json({
      success: true,
      message: 'Refund processed successfully',
      data: {
        balance: wallet.balance
      }
    });
  } catch (error) {
    logger.error('Error processing refund:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process refund',
      error: error.message
    });
  }
};

// Get transaction history
exports.getTransactionHistory = async (req, res) => {
  try {
    const userId = req.user.id;

    const transactions = await prisma.walletTransaction.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50
    });

    res.json({
      success: true,
      data: transactions
    });
  } catch (error) {
    logger.error('Error fetching transaction history:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch transaction history',
      error: error.message
    });
  }
};
