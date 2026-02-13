const axios = require('axios');
const logger = require('../utils/logger');

const CHAPA_URL = process.env.CHAPA_URL || 'https://api.chapa.co/v1';
const CHAPA_SECRET_KEY = process.env.CHAPA_SECRET_KEY;

// Initialize Chapa payment
const initializeChapa = async (paymentData) => {
  try {
    const response = await axios.post(
      `${CHAPA_URL}/transaction/initialize`,
      paymentData,
      {
        headers: {
          Authorization: `Bearer ${CHAPA_SECRET_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data;
  } catch (error) {
    logger.error(`Chapa initialization error: ${error.message}`);
    throw new Error('Payment initialization failed');
  }
};

// Verify Chapa payment
const verifyChapa = async (tx_ref) => {
  try {
    const response = await axios.get(
      `${CHAPA_URL}/transaction/verify/${tx_ref}`,
      {
        headers: {
          Authorization: `Bearer ${CHAPA_SECRET_KEY}`
        }
      }
    );

    return response.data;
  } catch (error) {
    logger.error(`Chapa verification error: ${error.message}`);
    throw new Error('Payment verification failed');
  }
};

// Get Chapa banks
const getChapaBanks = async () => {
  try {
    const response = await axios.get(`${CHAPA_URL}/banks`, {
      headers: {
        Authorization: `Bearer ${CHAPA_SECRET_KEY}`
      }
    });

    return response.data;
  } catch (error) {
    logger.error(`Chapa banks error: ${error.message}`);
    throw new Error('Failed to fetch banks');
  }
};

module.exports = {
  initializeChapa,
  verifyChapa,
  getChapaBanks
};
