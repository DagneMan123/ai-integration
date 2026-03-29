const prisma = require('../lib/prisma');
const { logger } = require('../utils/logger');

class WalletService {
  /**
   * Get wallet balance for a user
   */
  async getBalance(userId) {
    try {
      let wallet = await prisma.wallet.findUnique({
        where: { userId }
      });

      // Initialize wallet if not found
      if (!wallet) {
        wallet = await prisma.wallet.create({
          data: {
            userId,
            balance: 0,
            currency: 'ETB'
          }
        });

        logger.info(`Wallet initialized for user ${userId}`);
      }

      return {
        balance: parseFloat(wallet.balance),
        currency: wallet.currency
      };
    } catch (error) {
      logger.error(`Failed to get wallet balance: ${error.message}`);
      throw error;
    }
  }

  /**
   * Increment wallet balance (for top-ups)
   */
  async incrementBalance(userId, creditAmount) {
    try {
      if (creditAmount <= 0) {
        throw new Error('Credit amount must be positive');
      }

      // Get or create wallet
      let wallet = await prisma.wallet.findUnique({
        where: { userId }
      });

      if (!wallet) {
        wallet = await prisma.wallet.create({
          data: {
            userId,
            balance: 0,
            currency: 'ETB'
          }
        });
      }

      // Update balance
      const updatedWallet = await prisma.wallet.update({
        where: { userId },
        data: {
          balance: {
            increment: creditAmount
          }
        }
      });

      // Log transaction
      await prisma.walletTransaction.create({
        data: {
          userId,
          amount: creditAmount,
          type: 'TOPUP',
          reason: 'Credit purchase'
        }
      });

      logger.info(`Wallet incremented: userId=${userId}, amount=${creditAmount}, newBalance=${updatedWallet.balance}`);

      return parseFloat(updatedWallet.balance);
    } catch (error) {
      logger.error(`Failed to increment wallet balance: ${error.message}`);
      throw error;
    }
  }

  /**
   * Decrement wallet balance (for interview start)
   */
  async decrementBalance(userId, creditAmount) {
    try {
      if (creditAmount <= 0) {
        throw new Error('Credit amount must be positive');
      }

      // Get wallet
      const wallet = await prisma.wallet.findUnique({
        where: { userId }
      });

      if (!wallet) {
        throw new Error('Wallet not found');
      }

      // Check sufficient balance
      if (parseFloat(wallet.balance) < creditAmount) {
        const error = new Error('Insufficient credits');
        error.statusCode = 402; // Payment Required
        throw error;
      }

      // Update balance
      const updatedWallet = await prisma.wallet.update({
        where: { userId },
        data: {
          balance: {
            decrement: creditAmount
          }
        }
      });

      // Log transaction
      await prisma.walletTransaction.create({
        data: {
          userId,
          amount: creditAmount,
          type: 'DEDUCT',
          reason: 'Interview session started'
        }
      });

      logger.info(`Wallet decremented: userId=${userId}, amount=${creditAmount}, newBalance=${updatedWallet.balance}`);

      return parseFloat(updatedWallet.balance);
    } catch (error) {
      logger.error(`Failed to decrement wallet balance: ${error.message}`);
      throw error;
    }
  }

  /**
   * Refund credits (for cancelled interviews)
   */
  async refundCredits(userId, creditAmount, reason = 'Interview cancelled') {
    try {
      if (creditAmount <= 0) {
        throw new Error('Credit amount must be positive');
      }

      // Get wallet
      let wallet = await prisma.wallet.findUnique({
        where: { userId }
      });

      if (!wallet) {
        wallet = await prisma.wallet.create({
          data: {
            userId,
            balance: 0,
            currency: 'ETB'
          }
        });
      }

      // Update balance
      const updatedWallet = await prisma.wallet.update({
        where: { userId },
        data: {
          balance: {
            increment: creditAmount
          }
        }
      });

      // Log transaction
      await prisma.walletTransaction.create({
        data: {
          userId,
          amount: creditAmount,
          type: 'REFUND',
          reason
        }
      });

      logger.info(`Credits refunded: userId=${userId}, amount=${creditAmount}, newBalance=${updatedWallet.balance}`);

      return parseFloat(updatedWallet.balance);
    } catch (error) {
      logger.error(`Failed to refund credits: ${error.message}`);
      throw error;
    }
  }

  /**
   * Initialize wallet for new user
   */
  async initializeWallet(userId) {
    try {
      const wallet = await prisma.wallet.create({
        data: {
          userId,
          balance: 0,
          currency: 'ETB'
        }
      });

      logger.info(`Wallet created for user ${userId}`);

      return {
        balance: parseFloat(wallet.balance),
        currency: wallet.currency
      };
    } catch (error) {
      // Wallet might already exist
      if (error.code === 'P2002') {
        return this.getBalance(userId);
      }
      logger.error(`Failed to initialize wallet: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get wallet transaction history
   */
  async getTransactionHistory(userId, limit = 50) {
    try {
      const transactions = await prisma.walletTransaction.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: limit
      });

      return transactions;
    } catch (error) {
      logger.error(`Failed to fetch transaction history: ${error.message}`);
      throw error;
    }
  }
}

module.exports = new WalletService();
