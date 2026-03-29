const axios = require('axios');
const crypto = require('crypto');
const { logger } = require('../utils/logger');

const CHAPA_URL = 'https://api.chapa.co/v1';
const CHAPA_API_KEY = process.env.CHAPA_API_KEY;
const CHAPA_SECRET_KEY = process.env.CHAPA_SECRET_KEY;
const WEBHOOK_URL = process.env.CHAPA_WEBHOOK_URL || 'https://yourdomain.com/api/payments/webhook';
const USE_MOCK_CHAPA = process.env.USE_MOCK_CHAPA === 'true';

// Validate Chapa configuration
if (!CHAPA_SECRET_KEY || !CHAPA_API_KEY) {
  logger.warn('⚠️ CHAPA_SECRET_KEY or CHAPA_API_KEY is not configured in environment variables');
}

if (USE_MOCK_CHAPA) {
  logger.info('🧪 Using MOCK Chapa mode for testing');
}

class ChapaService {
  /**
   * Generate payment URL for Chapa
   */
  async generatePaymentUrl(txRef, amount, metadata) {
    try {
      if (!CHAPA_API_KEY) {
        throw new Error('Chapa API key is not configured');
      }

      logger.info(`Generating Chapa payment URL: txRef=${txRef}, amount=${amount}`);

      const paymentData = {
        amount: parseFloat(amount),
        currency: 'ETB',
        email: metadata.email || 'noreply@simuai.com',
        first_name: metadata.firstName || 'Candidate',
        last_name: metadata.lastName || 'User',
        tx_ref: txRef,
        callback_url: WEBHOOK_URL,
        return_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/payment/success?tx_ref=${txRef}`,
        customization: {
          title: 'SimuAI Credits',
          description: `Purchase ${metadata.creditAmount} credits`
        }
      };

      logger.info(`Chapa request payload: ${JSON.stringify(paymentData)}`);

      // Mock mode for testing
      if (USE_MOCK_CHAPA) {
        logger.info('🧪 Using mock Chapa checkout URL');
        return `https://checkout.chapa.co/checkout/payment/${txRef}`;
      }

      // Real Chapa API call
      logger.info(`Calling Chapa API at ${CHAPA_URL}/transaction/initialize`);
      
      const response = await axios.post(
        `${CHAPA_URL}/transaction/initialize`,
        paymentData,
        {
          headers: {
            Authorization: `Bearer ${CHAPA_API_KEY}`,
            'Content-Type': 'application/json'
          },
          timeout: 30000 // Increased from 15s to 30s
        }
      );

      logger.info(`Chapa response status: ${response.status}`);
      logger.info(`Chapa response data: ${JSON.stringify(response.data)}`);

      if (!response.data?.data?.checkout_url) {
        logger.error(`Invalid Chapa response: ${JSON.stringify(response.data)}`);
        throw new Error('No checkout URL returned from Chapa');
      }

      logger.info(`Chapa payment URL generated: ${response.data.data.checkout_url}`);
      return response.data.data.checkout_url;
    } catch (error) {
      logger.error(`Chapa payment URL generation error: ${error.message}`);
      if (error.response?.data) {
        logger.error(`Chapa error response: ${JSON.stringify(error.response.data)}`);
      }
      if (error.response?.status) {
        logger.error(`Chapa HTTP status: ${error.response.status}`);
      }
      throw error;
    }
  }

  /**
   * Verify webhook signature
   */
  verifySignature(payload, signature) {
    try {
      if (!CHAPA_SECRET_KEY) {
        logger.warn('Chapa secret key not configured for signature verification');
        return false;
      }

      const computed = crypto
        .createHmac('sha256', CHAPA_SECRET_KEY)
        .update(JSON.stringify(payload))
        .digest('hex');

      const isValid = computed === signature;

      if (!isValid) {
        logger.warn(`Invalid webhook signature: expected=${computed}, received=${signature}`);
      }

      return isValid;
    } catch (error) {
      logger.error(`Signature verification error: ${error.message}`);
      return false;
    }
  }

  /**
   * Verify payment status with Chapa
   */
  async verifyPaymentStatus(txRef) {
    try {
      if (!CHAPA_API_KEY) {
        throw new Error('Chapa API key is not configured');
      }

      logger.info(`Verifying payment status: txRef=${txRef}`);

      const response = await axios.get(
        `${CHAPA_URL}/transaction/verify/${txRef}`,
        {
          headers: {
            Authorization: `Bearer ${CHAPA_API_KEY}`
          },
          timeout: 30000 // Increased from 10s to 30s
        }
      );

      const data = response.data.data || {};

      logger.info(`Payment verified: txRef=${txRef}, status=${data.status}`);

      return {
        status: data.status,
        amount: data.amount,
        reference: data.reference,
        customization: data.customization
      };
    } catch (error) {
      logger.error(`Payment verification error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get Chapa banks
   */
  async getBanks() {
    try {
      if (!CHAPA_API_KEY) {
        throw new Error('Chapa API key is not configured');
      }

      logger.info('Fetching Chapa banks');

      const response = await axios.get(`${CHAPA_URL}/banks`, {
        headers: {
          Authorization: `Bearer ${CHAPA_API_KEY}`
        },
        timeout: 30000 // Increased from 10s to 30s
      });

      logger.info(`Chapa banks fetched: ${response.data.data?.length} banks`);
      return response.data.data || [];
    } catch (error) {
      logger.error(`Failed to fetch banks: ${error.message}`);
      throw error;
    }
  }

  /**
   * Initialize Chapa payment (legacy method)
   */
  async initializeChapa(paymentData) {
    try {
      if (!CHAPA_API_KEY) {
        throw new Error('Chapa API key is not configured');
      }

      logger.info(`Initializing Chapa payment: ${paymentData.tx_ref}`);

      const response = await axios.post(
        `${CHAPA_URL}/transaction/initialize`,
        paymentData,
        {
          headers: {
            Authorization: `Bearer ${CHAPA_API_KEY}`,
            'Content-Type': 'application/json'
          },
          timeout: 30000 // Increased from 10s to 30s
        }
      );

      logger.info(`Chapa initialization successful: ${response.data.data?.checkout_url}`);
      return response.data;
    } catch (error) {
      logger.error(`Chapa initialization error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Verify Chapa payment (legacy method)
   */
  async verifyChapa(txRef) {
    try {
      if (!CHAPA_API_KEY) {
        throw new Error('Chapa API key is not configured');
      }

      logger.info(`Verifying Chapa payment: ${txRef}`);

      const response = await axios.get(
        `${CHAPA_URL}/transaction/verify/${txRef}`,
        {
          headers: {
            Authorization: `Bearer ${CHAPA_API_KEY}`
          },
          timeout: 30000 // Increased from 10s to 30s
        }
      );

      logger.info(`Chapa verification successful: ${response.data.status}`);
      return response.data;
    } catch (error) {
      logger.error(`Chapa verification error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get Chapa banks (legacy method)
   */
  async getChapaBanks() {
    try {
      if (!CHAPA_API_KEY) {
        throw new Error('Chapa API key is not configured');
      }

      logger.info('Fetching Chapa banks');

      const response = await axios.get(`${CHAPA_URL}/banks`, {
        headers: {
          Authorization: `Bearer ${CHAPA_API_KEY}`
        },
        timeout: 30000 // Increased from 10s to 30s
      });

      logger.info(`Chapa banks fetched: ${response.data.data?.length} banks`);
      return response.data;
    } catch (error) {
      logger.error(`Chapa banks error: ${error.message}`);
      throw error;
    }
  }
}

module.exports = new ChapaService();
