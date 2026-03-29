const walletService = require('../services/walletService');
const { logger } = require('../utils/logger');

class WalletController {
  /**
   * Get wallet balance
   * GET /api/wallet/balance
   */
  async getBalance(req, res) {
    try {
      const userId = req.user?.id;

      const balance = await walletService.getBalance(userId);

      return res.status(200).json({
        success: true,
        ...balance
      });
    } catch (error) {
      logger.error(`Failed to get wallet balance: ${error.message}`);

      return res.status(500).json({
        success: false,
        error: error.message || 'Failed to get wallet balance'
      });
    }
  }

  /**
   * Get wallet transaction history
   * GET /api/wallet/transactions
   */
  async getTransactions(req, res) {
    try {
      const userId = req.user?.id;
      const { limit = 50 } = req.query;

      const transactions = await walletService.getTransactionHistory(
        userId,
        Math.min(parseInt(limit), 100)
      );

      return res.status(200).json({
        success: true,
        data: transactions
      });
    } catch (error) {
      logger.error(`Failed to get wallet transactions: ${error.message}`);

      return res.status(500).json({
        success: false,
        error: error.message || 'Failed to get wallet transactions'
      });
    }
  }

  /**
   * Check if user has sufficient credits for interview
   * GET /api/wallet/check-credits
   */
  async checkCredits(req, res) {
    try {
      const userId = req.user?.id;
      const { requiredCredits = 1 } = req.query;

      const balance = await walletService.getBalance(userId);
      const hasSufficientCredits = balance.balance >= requiredCredits;

      return res.status(200).json({
        success: true,
        hasSufficientCredits,
        balance: balance.balance,
        requiredCredits: parseInt(requiredCredits),
        message: hasSufficientCredits
          ? 'Sufficient credits available'
          : `Insufficient credits. Need ${requiredCredits}, have ${balance.balance}`
      });
    } catch (error) {
      logger.error(`Failed to check credits: ${error.message}`);

      return res.status(500).json({
        success: false,
        error: error.message || 'Failed to check credits'
      });
    }
  }
}

module.exports = new WalletController();
