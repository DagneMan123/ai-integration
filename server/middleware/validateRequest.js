/**
 * Request Validation Middleware
 * Validates incoming requests against defined schemas
 */

const { ValidationError } = require('../utils/errorHandler');

/**
 * Validate request body against schema
 * @param {object} schema - Validation schema
 * @returns {function} Middleware function
 */
const validateBody = (schema) => {
  return (req, res, next) => {
    try {
      const { error, value } = schema.validate(req.body, {
        abortEarly: false,
        stripUnknown: true
      });

      if (error) {
        const errors = error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message
        }));
        throw new ValidationError('Validation failed', errors);
      }

      req.body = value;
      next();
    } catch (err) {
      next(err);
    }
  };
};

/**
 * Validate request query parameters
 * @param {object} schema - Validation schema
 * @returns {function} Middleware function
 */
const validateQuery = (schema) => {
  return (req, res, next) => {
    try {
      const { error, value } = schema.validate(req.query, {
        abortEarly: false,
        stripUnknown: true
      });

      if (error) {
        const errors = error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message
        }));
        throw new ValidationError('Query validation failed', errors);
      }

      req.query = value;
      next();
    } catch (err) {
      next(err);
    }
  };
};

/**
 * Validate request parameters
 * @param {object} schema - Validation schema
 * @returns {function} Middleware function
 */
const validateParams = (schema) => {
  return (req, res, next) => {
    try {
      const { error, value } = schema.validate(req.params, {
        abortEarly: false,
        stripUnknown: true
      });

      if (error) {
        const errors = error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message
        }));
        throw new ValidationError('Parameter validation failed', errors);
      }

      req.params = value;
      next();
    } catch (err) {
      next(err);
    }
  };
};

module.exports = {
  validateBody,
  validateQuery,
  validateParams
};
