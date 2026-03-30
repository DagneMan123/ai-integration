const prisma = require('../lib/prisma');
const { logger } = require('../utils/logger');

/**
 * Middleware to check database connection health before processing requests
 * Prevents silent failures by detecting connection issues early
 */
const connectionCheck = async (req, res, next) => {
  try {
    // Quick health check - if this fails, database is disconnected
    const isHealthy = await prisma.$queryRaw`SELECT 1`;
    
    if (!isHealthy) {
      logger.error('Database health check returned false');
      return res.status(503).json({
        success: false,
        message: 'Database service temporarily unavailable',
        error: 'DATABASE_HEALTH_CHECK_FAILED'
      });
    }
    
    next();
  } catch (error) {
    logger.error('Database connection check failed:', error.message);
    
    // Determine error type
    let statusCode = 503;
    let errorCode = 'DATABASE_ERROR';
    
    if (error.message && (
      error.message.includes('Can\'t reach database server') ||
      error.message.includes('connection refused') ||
      error.message.includes('ECONNREFUSED')
    )) {
      errorCode = 'DATABASE_UNREACHABLE';
    } else if (error.message && error.message.includes('ETIMEDOUT')) {
      errorCode = 'DATABASE_TIMEOUT';
    }
    
    return res.status(statusCode).json({
      success: false,
      message: 'Database service temporarily unavailable. Please try again in a moment.',
      error: errorCode
    });
  }
};

/**
 * Lightweight health check for non-critical endpoints
 * Doesn't block request if database is slow, just logs warning
 */
const lightConnectionCheck = async (req, res, next) => {
  try {
    // Non-blocking health check with timeout
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Health check timeout')), 2000)
    );
    
    await Promise.race([
      prisma.$queryRaw`SELECT 1`,
      timeoutPromise
    ]);
    
    next();
  } catch (error) {
    // Log but don't block
    logger.warn('Light connection check warning:', error.message);
    next();
  }
};

module.exports = {
  connectionCheck,
  lightConnectionCheck
};
