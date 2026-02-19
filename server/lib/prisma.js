const { PrismaClient } = require('@prisma/client');
const { logger } = require('../utils/logger');

// Global variable to store Prisma client instance
let prisma;

// Create Prisma client with proper configuration
function createPrismaClient() {
  const isDevelopment = process.env.NODE_ENV !== 'production';
  
  return new PrismaClient({
    log: isDevelopment 
      ? [
          // In development, only log warnings and errors
          { emit: 'event', level: 'warn' },
          { emit: 'event', level: 'error' },
        ]
      : [
          // In production, log everything
          { emit: 'event', level: 'query' },
          { emit: 'event', level: 'error' },
          { emit: 'event', level: 'info' },
          { emit: 'event', level: 'warn' },
        ],
    errorFormat: 'pretty',
  });
}

// Initialize Prisma client
if (process.env.NODE_ENV === 'production') {
  prisma = createPrismaClient();
} else {
  // In development, use global variable to prevent multiple instances
  if (!global.__prisma) {
    global.__prisma = createPrismaClient();
  }
  prisma = global.__prisma;
}

// Event listeners for logging (only in production or for errors/warnings)
if (process.env.NODE_ENV === 'production') {
  prisma.$on('query', (e) => {
    logger.debug('Prisma Query', {
      query: e.query,
      params: e.params,
      duration: `${e.duration}ms`,
      timestamp: e.timestamp
    });
  });

  prisma.$on('info', (e) => {
    logger.info('Prisma Info', {
      message: e.message,
      target: e.target,
      timestamp: e.timestamp
    });
  });
}

// Always log errors and warnings
prisma.$on('error', (e) => {
  logger.error('Prisma Error', {
    message: e.message,
    target: e.target,
    timestamp: e.timestamp
  });
});

prisma.$on('warn', (e) => {
  logger.warn('Prisma Warning', {
    message: e.message,
    target: e.target,
    timestamp: e.timestamp
  });
});

// Graceful shutdown
process.on('beforeExit', async () => {
  logger.info('Disconnecting from database...');
  await prisma.$disconnect();
});

process.on('SIGINT', async () => {
  logger.info('Received SIGINT, disconnecting from database...');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  logger.info('Received SIGTERM, disconnecting from database...');
  await prisma.$disconnect();
  process.exit(0);
});

module.exports = prisma;