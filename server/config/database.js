require('dotenv').config();

const { PrismaClient } = require('@prisma/client');
const { logger } = require('../utils/logger');

const prisma = new PrismaClient({
  log: ['error', 'warn'],
});

const testConnection = async () => {
  try {
    await prisma.$connect();
    logger.info('Database connection established successfully via Prisma.');
  } catch (error) {
    logger.error('Unable to connect to the database:', error.message);
    logger.error('Please start PostgreSQL service and ensure database exists.');
    logger.error('See START_POSTGRESQL.md for instructions.');
  }
};

module.exports = { prisma, testConnection };