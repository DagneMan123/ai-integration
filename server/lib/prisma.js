const { PrismaClient } = require('@prisma/client');
const { logger } = require('../utils/logger');

let prisma;
let connectionHealthCheck;
let isReconnecting = false;

function createPrismaClient() {
  const isDevelopment = process.env.NODE_ENV !== 'production';
  
  return new PrismaClient({
    log: isDevelopment 
      ? [
          { emit: 'event', level: 'warn' },
          { emit: 'event', level: 'error' },
        ]
      : [
          { emit: 'event', level: 'query' },
          { emit: 'event', level: 'error' },
          { emit: 'event', level: 'info' },
          { emit: 'event', level: 'warn' },
        ],
    errorFormat: 'pretty',
  });
}

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
        if (retries === maxRetries - 1) {
          logger.warn(`Database connection failed (attempt ${retries}/${maxRetries}). Retrying in ${delay}ms...`);
        }
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  logger.error(`Failed to connect to database after ${maxRetries} attempts:`, lastError?.message);
  throw lastError;
}

async function checkConnectionHealth() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    logger.error('❌ Database health check failed:', error.message);
    return false;
  }
}

async function handleDisconnection() {
  if (isReconnecting) {
    logger.warn('⚠️ Reconnection already in progress, skipping...');
    return;
  }

  isReconnecting = true;
  logger.error('🔄 Database disconnected! Attempting automatic reconnection...');

  try {
    try {
      await prisma.$disconnect();
    } catch (e) {
      logger.warn('Error disconnecting old client:', e.message);
    }

    prisma = createPrismaClient();
    setupEventListeners();

    await connectWithRetry(5);
    logger.info('✅ Database reconnected successfully');
    isReconnecting = false;
  } catch (error) {
    logger.error('❌ Failed to reconnect to database:', error.message);
    isReconnecting = false;
    setTimeout(handleDisconnection, 10000);
  }
}

function setupEventListeners() {
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

  prisma.$on('error', (e) => {
    logger.error('Prisma Error', {
      message: e.message,
      target: e.target,
      timestamp: e.timestamp
    });
    
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

if (process.env.NODE_ENV === 'production') {
  prisma = createPrismaClient();
} else {
  if (!global.__prisma) {
    global.__prisma = createPrismaClient();
  }
  prisma = global.__prisma;
}

setupEventListeners();

function startHealthCheck() {
  connectionHealthCheck = setInterval(async () => {
    const isHealthy = await checkConnectionHealth();
    if (!isHealthy && !isReconnecting) {
      logger.error('🚨 Health check detected database disconnection!');
      handleDisconnection();
    }
  }, 30000);
}

setTimeout(startHealthCheck, 5000);

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

prisma.connectWithRetry = connectWithRetry;
prisma.checkConnectionHealth = checkConnectionHealth;

module.exports = prisma;