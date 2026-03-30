const { PrismaClient } = require('@prisma/client');
const { logger } = require('../utils/logger');

// Global variable to store Prisma client instance
let prisma;
let connectionHealthCheck;
let isReconnecting = false;

// Create Prisma client with proper configuration and retry logic
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

// Retry connection with exponential backoff
async function connectWithRetry(maxRetries = 5) {
  let retries = 0;
  let lastError;

  while (retries < maxRetries) {
    try {
      await prisma.$connect();
      logger.info('✅ Database connection established successfully');
      return true;
    } catch (error) {
      lastError = error;
      retries++;
      const delay = Math.min(1000 * Math.pow(2, retries - 1), 10000);
      
      if (retries < maxRetries) {
        logger.warn(`Database connection failed (attempt ${retries}/${maxRetries}). Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  logger.error(`Failed to connect to database after ${maxRetries} attempts:`, lastError?.message);
  throw lastError;
}

// Health check function to detect silent disconnections
async function checkConnectionHealth() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    logger.error('❌ Database health check failed:', error.message);
    return false;
  }
}

// Automatic reconnection handler
async function handleDisconnection() {
  if (isReconnecting) {
    logger.warn('⚠️ Reconnection already in progress, skipping...');
    return;
  }

  isReconnecting = true;
  logger.error('🔄 Database disconnected! Attempting automatic reconnection...');

  try {
    // Disconnect existing client
    try {
      await prisma.$disconnect();
    } catch (e) {
      logger.warn('Error disconnecting old client:', e.message);
    }

    // Create new client
    prisma = createPrismaClient();
    setupEventListeners();

    // Reconnect with retry
    await connectWithRetry(5);
    logger.info('✅ Database reconnected successfully');
    isReconnecting = false;
  } catch (error) {
    logger.error('❌ Failed to reconnect to database:', error.message);
    isReconnecting = false;
    // Schedule retry in 10 seconds
    setTimeout(handleDisconnection, 10000);
  }
}

// Setup event listeners
function setupEventListeners() {
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
    
    // Trigger reconnection on connection errors
    if (e.message && (
      e.message.includes('Can\'t reach database server') ||
      e.message.includes('connection refused') ||
      e.message.includes('ECONNREFUSED') ||
      e.message.includes('ETIMEDOUT') ||
      e.message.includes('socket hang up')
    )) {
      handleDisconnection();
    }
  });

  prisma.$on('warn', (e) => {
    logger.warn('Prisma Warning', {
      message: e.message,
      target: e.target,
      timestamp: e.timestamp
    });
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

// Setup event listeners
setupEventListeners();

// Start periodic health checks (every 30 seconds)
function startHealthCheck() {
  connectionHealthCheck = setInterval(async () => {
    const isHealthy = await checkConnectionHealth();
    if (!isHealthy && !isReconnecting) {
      logger.error('🚨 Health check detected database disconnection!');
      handleDisconnection();
    }
  }, 30000);
}

// Start health check after initial connection
setTimeout(startHealthCheck, 5000);

// Graceful shutdown
process.on('beforeExit', async () => {
  logger.info('Disconnecting from database...');
  if (connectionHealthCheck) clearInterval(connectionHealthCheck);
  await prisma.$disconnect();
});

process.on('SIGINT', async () => {
  logger.info('Received SIGINT, disconnecting from database...');
  if (connectionHealthCheck) clearInterval(connectionHealthCheck);
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  logger.info('Received SIGTERM, disconnecting from database...');
  if (connectionHealthCheck) clearInterval(connectionHealthCheck);
  await prisma.$disconnect();
  process.exit(0);
});

module.exports = prisma;
module.exports.connectWithRetry = connectWithRetry;
module.exports.checkConnectionHealth = checkConnectionHealth;