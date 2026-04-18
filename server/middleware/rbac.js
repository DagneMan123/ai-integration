const { logger } = require('../utils/logger');
const { AppError } = require('./errorHandler');

/**
 * Role-Based Access Control (RBAC) Middleware
 * Ensures users can only access resources appropriate for their role
 */

// Define role permissions
const rolePermissions = {
  CANDIDATE: {
    dashboards: ['candidate'],
    resources: ['applications', 'interviews', 'profile', 'jobs', 'saved-jobs'],
    actions: ['read', 'create', 'update_own']
  },
  EMPLOYER: {
    dashboards: ['employer'],
    resources: ['jobs', 'applications', 'candidates', 'interviews', 'company'],
    actions: ['read', 'create', 'update', 'delete']
  },
  ADMIN: {
    dashboards: ['admin', 'candidate', 'employer'],
    resources: ['users', 'companies', 'jobs', 'applications', 'interviews', 'system'],
    actions: ['read', 'create', 'update', 'delete', 'manage']
  }
};

/**
 * Check if user has permission for resource
 */
const hasPermission = (userRole, resource, action) => {
  const permissions = rolePermissions[userRole];
  if (!permissions) return false;
  
  return permissions.resources.includes(resource) && 
         permissions.actions.includes(action);
};

/**
 * Check if user can access dashboard
 */
const canAccessDashboard = (userRole, dashboard) => {
  const permissions = rolePermissions[userRole];
  if (!permissions) return false;
  
  return permissions.dashboards.includes(dashboard);
};

/**
 * Middleware to check resource access
 */
const checkResourceAccess = (resource, action = 'read') => {
  return (req, res, next) => {
    try {
      const userRole = req.user?.role;
      
      if (!userRole) {
        logger.warn('Resource access attempt without user role', {
          path: req.path,
          method: req.method
        });
        return next(new AppError('User role not found', 401));
      }

      if (!hasPermission(userRole, resource, action)) {
        logger.warn('Unauthorized resource access attempt', {
          userId: req.user.id,
          userRole,
          resource,
          action,
          path: req.path
        });
        return next(new AppError(`Access denied to ${resource}`, 403));
      }

      next();
    } catch (error) {
      logger.error('RBAC check error:', error);
      next(error);
    }
  };
};

/**
 * Middleware to check dashboard access
 */
const checkDashboardAccess = (dashboard) => {
  return (req, res, next) => {
    try {
      const userRole = req.user?.role;
      
      if (!userRole) {
        logger.warn('Dashboard access attempt without user role', {
          dashboard,
          path: req.path
        });
        return next(new AppError('User role not found', 401));
      }

      if (!canAccessDashboard(userRole, dashboard)) {
        logger.warn('Unauthorized dashboard access attempt', {
          userId: req.user.id,
          userRole,
          dashboard,
          path: req.path
        });
        return next(new AppError(`Access denied to ${dashboard} dashboard`, 403));
      }

      next();
    } catch (error) {
      logger.error('Dashboard access check error:', error);
      next(error);
    }
  };
};

/**
 * Middleware to check if user owns resource
 */
const checkResourceOwnership = (resourceField = 'userId') => {
  return (req, res, next) => {
    try {
      const userId = req.user?.id;
      const resourceOwnerId = req.body?.[resourceField] || req.params?.[resourceField];

      if (!userId) {
        return next(new AppError('User ID not found', 401));
      }

      // Admin can access any resource
      if (req.user.role === 'ADMIN') {
        return next();
      }

      // Check ownership
      if (parseInt(userId) !== parseInt(resourceOwnerId)) {
        logger.warn('Unauthorized resource ownership access', {
          userId,
          resourceOwnerId,
          path: req.path
        });
        return next(new AppError('You do not own this resource', 403));
      }

      next();
    } catch (error) {
      logger.error('Resource ownership check error:', error);
      next(error);
    }
  };
};

/**
 * Get user permissions
 */
const getUserPermissions = (userRole) => {
  return rolePermissions[userRole] || null;
};

/**
 * Check multiple permissions
 */
const hasAnyPermission = (userRole, permissions) => {
  return permissions.some(({ resource, action }) => 
    hasPermission(userRole, resource, action)
  );
};

module.exports = {
  checkResourceAccess,
  checkDashboardAccess,
  checkResourceOwnership,
  hasPermission,
  canAccessDashboard,
  getUserPermissions,
  hasAnyPermission,
  rolePermissions
};
