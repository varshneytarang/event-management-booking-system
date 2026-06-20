const { verifyAccessToken } = require('../utils/tokens');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const User = require('../models/User');

/**
 * Verifies the Bearer access token in Authorization header.
 * Attaches { id, role } to req.user on success.
 */
const authenticate = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw ApiError.unauthorized('No access token provided');
  }

  const token = authHeader.split(' ')[1];
  const decoded = verifyAccessToken(token); // throws ApiError on failure

  // Lightweight existence check — avoids stale tokens for deleted users
  const exists = await User.exists({ _id: decoded.id });
  if (!exists) throw ApiError.unauthorized('User no longer exists');

  req.user = { id: decoded.id, role: decoded.role };
  next();
});

module.exports = authenticate;
