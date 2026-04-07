/**
 * Async Handler Middleware
 * Wraps async route handlers to catch errors automatically
 */

/**
 * Wraps async route handlers to catch errors
 * @param {function} fn - Async route handler
 * @returns {function} Express middleware
 */
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

module.exports = asyncHandler;
