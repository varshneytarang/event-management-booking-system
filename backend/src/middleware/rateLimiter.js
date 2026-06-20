const rateLimit = require('express-rate-limit');

const windowMs = Number(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000; // 15 min
const max = Number(process.env.RATE_LIMIT_MAX) || 100;

/** General API rate limiter */
const apiLimiter = rateLimit({
  windowMs,
  max,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later',
  },
});

/** Stricter limiter for auth endpoints — 10 attempts per 15 min */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again in 15 minutes',
  },
});

module.exports = { apiLimiter, authLimiter };
