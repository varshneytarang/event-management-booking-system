/**
 * Wraps an async route handler and forwards any thrown errors to next().
 * Eliminates repetitive try/catch in every controller.
 *
 * @param {Function} fn - async (req, res, next) => Promise<void>
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
