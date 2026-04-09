const jwt = require('jsonwebtoken');
const prisma = require('../lib/prisma');
const { logActivity } = require('../utils/logger');

const { logger } = require('../utils/logger');

const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access token required'
      });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        if (req.path.includes('/payments/verify') || req.path.includes('/payments/webhook')) {
          try {
            decoded = jwt.verify(token, process.env.JWT_SECRET, { ignoreExpiration: true });
          } catch (innerError) {
            return res.status(401).json({
              success: false,
              message: 'Token expired'
            });
          }
        } else {
          return res.status(401).json({
            success: false,
            message: 'Token expired'
          });
        }
      } else {
        throw error;
      }
    }
    
    try {
      const user = await prisma.user.findUnique({
        where: { id: decoded.id || decoded.userId },
        select: {
          id: true,
          email: true,
          role: true,
          isActive: true,
          isLocked: true
        }
      });

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid token - user not found'
        });
      }

      if (user.isActive === false) {
        return res.status(401).json({
          success: false,
          message: 'Account is deactivated'
        });
      }

      if (user.isLocked) {
        return res.status(423).json({
          success: false,
          message: 'Account is temporarily locked'
        });
      }

      req.user = user;
      next();
    } catch (dbError) {
      if (dbError.message && dbError.message.includes('Can\'t reach database server')) {
        logger.error('Database connection error:', dbError.message);
        return res.status(503).json({
          success: false,
          message: 'Database service temporarily unavailable. Please try again in a moment.',
          error: 'DATABASE_UNAVAILABLE'
        });
      }
      throw dbError;
    }
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired'
      });
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }

    console.error('Auth middleware error:', error);
    return res.status(500).json({
      success: false,
      message: 'Authentication error'
    });
  }
};

const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    // Convert user role to uppercase for comparison
    const userRole = req.user.role?.toUpperCase();
    const normalizedRoles = roles.map(r => r.toUpperCase());

    if (!normalizedRoles.includes(userRole)) {
      // Log unauthorized access
      logActivity(
        req.user.id, 
        'unauthorized_access', 
        'role_check', 
        null, 
        {
          required_roles: normalizedRoles,
          user_role: userRole,
          endpoint: req.originalUrl
        }, 
        req.ip, 
        req.get('User-Agent'), 
        'warn'
      );

      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions'
      });
    }

    next();
  };
};

const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await prisma.user.findUnique({
          where: { id: decoded.id || decoded.userId }
        });

        if (user && user.isActive && !user.isLocked) {
          req.user = user;
        }
      } catch (error) {
        // Silently fail for optional auth - don't block the request
        if (error.message && error.message.includes('Can\'t reach database server')) {
          logger.warn('Database unavailable in optionalAuth');
        }
      }
    }

    next();
  } catch (error) {
    // Always continue for optional auth
    next();
  }
};

module.exports = {
  authenticateToken,
  authorizeRoles,
  optionalAuth
};