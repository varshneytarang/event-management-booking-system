const ApiError = require('../utils/ApiError');

/**
 * Role-based access control guard.
 * Usage: router.delete('/events/:id', authenticate, authorize('admin'), handler)
 *
 * @param {...string} roles - allowed roles
 */
const authorize = (...roles) => (req, res, next) => {
  if (!req.user) throw ApiError.unauthorized();
  if (!roles.includes(req.user.role)) {
    throw ApiError.forbidden(`Role '${req.user.role}' is not permitted to perform this action`);
  }
  next();
};

module.exports = authorize;
