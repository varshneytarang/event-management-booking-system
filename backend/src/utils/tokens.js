const jwt = require('jsonwebtoken');
const ApiError = require('./ApiError');

/**
 * Generate a short-lived access token (default 15m).
 */
const generateAccessToken = (payload) =>
  jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
    issuer: 'event-booking-api',
    audience: 'event-booking-client',
  });

/**
 * Generate a long-lived refresh token (default 7d).
 */
const generateRefreshToken = (payload) =>
  jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
    issuer: 'event-booking-api',
    audience: 'event-booking-client',
  });

/**
 * Verify an access token. Throws ApiError 401 on failure.
 */
const verifyAccessToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET, {
      issuer: 'event-booking-api',
      audience: 'event-booking-client',
    });
  } catch (err) {
    if (err.name === 'TokenExpiredError') throw ApiError.unauthorized('Access token expired');
    throw ApiError.unauthorized('Invalid access token');
  }
};

/**
 * Verify a refresh token. Throws ApiError 401 on failure.
 */
const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_REFRESH_SECRET, {
      issuer: 'event-booking-api',
      audience: 'event-booking-client',
    });
  } catch (err) {
    if (err.name === 'TokenExpiredError') throw ApiError.unauthorized('Refresh token expired');
    throw ApiError.unauthorized('Invalid refresh token');
  }
};

/**
 * Build the token pair returned on login/refresh.
 */
const createTokenPair = (userId, role) => {
  const payload = { id: userId, role };
  return {
    accessToken: generateAccessToken(payload),
    refreshToken: generateRefreshToken(payload),
  };
};

/**
 * Cookie options for httpOnly refresh token cookie.
 */
const refreshCookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
  path: '/api/auth', // scoped to auth routes only
});

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  createTokenPair,
  refreshCookieOptions,
};
