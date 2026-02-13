const winston = require('winston');
const { ActivityLog } = require('../models');

// Configure Winston logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'simuai-api' },
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' })
  ]
});

// Add console transport in development
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  }));
}

// Log activity to database
const logActivity = async (userId, action, resourceType, resourceId, details = {}, ipAddress = null, userAgent = null, severity = 'info') => {
  try {
    await ActivityLog.create({
      user_id: userId,
      action,
      resource_type: resourceType,
      resource_id: resourceId,
      details,
      ip_address: ipAddress,
      user_agent: userAgent,
      severity
    });
  } catch (error) {
    logger.error('Failed to log activity:', error);
  }
};

// Log payment events
const logPayment = (level, message, meta = {}) => {
  logger.log(level, `[PAYMENT] ${message}`, meta);
};

// Log AI events
const logAI = (level, message, meta = {}) => {
  logger.log(level, `[AI] ${message}`, meta);
};

// Log authentication events
const logAuth = (level, message, meta = {}) => {
  logger.log(level, `[AUTH] ${message}`, meta);
};

// Log security events
const logSecurity = (level, message, meta = {}) => {
  logger.log(level, `[SECURITY] ${message}`, meta);
};

// Error logging middleware
const errorLogger = (err, req, res, next) => {
  logger.error('API Error:', {
    error: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    userId: req.user?.id
  });

  // Log to activity log if user is authenticated
  if (req.user) {
    logActivity(
      req.user.id,
      'api_error',
      'error',
      null,
      {
        error: err.message,
        url: req.url,
        method: req.method
      },
      req.ip,
      req.get('User-Agent'),
      'error'
    );
  }

  next(err);
};

// Request logging middleware
const requestLogger = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logData = {
      method: req.method,
      url: req.url,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      userId: req.user?.id
    };

    if (res.statusCode >= 400) {
      logger.warn('HTTP Request', logData);
    } else {
      logger.info('HTTP Request', logData);
    }
  });

  next();
};

module.exports = {
  logger,
  logActivity,
  logPayment,
  logAI,
  logAuth,
  logSecurity,
  errorLogger,
  requestLogger
};