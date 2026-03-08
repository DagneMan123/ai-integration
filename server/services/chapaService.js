const axios = require('axios');
const { logger } = require('../utils/logger');

const CHAPA_URL = 'https://api.chapa.co/v1';
const CHAPA_SECRET_KEY = process.env.CHAPA_SECRET_KEY;

// Validate Chapa configuration
if (!CHAPA_SECRET_KEY) {
  logger.warn('⚠️ CHAPA_SECRET_KEY is not configured in environment variables');
}

// Initialize Chapa payment
const initializeChapa = async (paymentData) => {
  try {
    if (!CHAPA_SECRET_KEY) {
      throw new Error('Chapa secret key is not configured');
    }

    logger.info(`Initializing Chapa payment with data: ${JSON.stringify({
      amount: paymentData.amount,
      email: paymentData.email,
      tx_ref: paymentData.tx_ref
    })}`);

    const response = await axios.post(
      `${CHAPA_URL}/transaction/initialize`,
      paymentData,
      {
        headers: {
          Authorization: `Bearer ${CHAPA_SECRET_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      }
    );

    logger.info(`Chapa initialization successful: ${response.data.data?.checkout_url}`);
    return response.data;
  } catch (error) {
    logger.error(`Chapa initialization error: ${error.message}`);
    if (error.response?.data) {
      logger.error(`Chapa API error response: ${JSON.stringify(error.response.data)}`);
    }
    throw new Error(`Payment initialization failed: ${error.message}`);
  }
};

// Verify Chapa payment
const verifyChapa = async (tx_ref) => {
  try {
    if (!CHAPA_SECRET_KEY) {
      throw new Error('Chapa secret key is not configured');
    }

    logger.info(`Verifying Chapa payment: ${tx_ref}`);

    const response = await axios.get(
      `${CHAPA_URL}/transaction/verify/${tx_ref}`,
      {
        headers: {
          Authorization: `Bearer ${CHAPA_SECRET_KEY}`
        },
        timeout: 10000
      }
    );

    logger.info(`Chapa verification successful: ${response.data.status}`);
    return response.data;
  } catch (error) {
    logger.error(`Chapa verification error: ${error.message}`);
    if (error.response?.data) {
      logger.error(`Chapa API error response: ${JSON.stringify(error.response.data)}`);
    }
    throw new Error(`Payment verification failed: ${error.message}`);
  }
};

// Get Chapa banks
const getChapaBanks = async () => {
  try {
    if (!CHAPA_SECRET_KEY) {
      throw new Error('Chapa secret key is not configured');
    }

    logger.info('Fetching Chapa banks');

    const response = await axios.get(`${CHAPA_URL}/banks`, {
      headers: {
        Authorization: `Bearer ${CHAPA_SECRET_KEY}`
      },
      timeout: 10000
    });

    logger.info(`Chapa banks fetched successfully: ${response.data.data?.length} banks`);
    return response.data;
  } catch (error) {
    logger.error(`Chapa banks error: ${error.message}`);
    if (error.response?.data) {
      logger.error(`Chapa API error response: ${JSON.stringify(error.response.data)}`);
    }
    throw new Error(`Failed to fetch banks: ${error.message}`);
  }
};

module.exports = {
  initializeChapa,
  verifyChapa,
  getChapaBanks
};
