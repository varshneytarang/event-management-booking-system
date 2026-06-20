const mongoose = require('mongoose');
const { ZodError } = require('zod');
const ApiError = require('../utils/ApiError');
const logger = require('../config/logger');

/**
 * Centralized global error handler.
 * Must have exactly 4 parameters for Express to treat it as error middleware.
 */
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  // Always log the full error in dev; log at warn level for operational errors in prod
  if (process.env.NODE_ENV === 'development') {
    logger.error({ err, path: req.path, method: req.method }, err.message);
  } else if (!err.isOperational) {
    logger.error({ err, path: req.path, method: req.method }, 'Unexpected error');
  } else {
    logger.warn({ statusCode: err.statusCode, path: req.path }, err.message);
  }

  // ── Zod validation (should already be converted by validate middleware, belt-and-suspenders) ──
  if (err instanceof ZodError) {
    return res.status(422).json({
      success: false,
      message: 'Validation failed',
      errors: err.errors.map((e) => ({ field: e.path.join('.'), message: e.message })),
    });
  }

  // ── Mongoose CastError (bad ObjectId) ────────────────────────────────────────
  if (err.name === 'CastError' && err.kind === 'ObjectId') {
    return res.status(400).json({ success: false, message: 'Invalid ID format' });
  }

  // ── Mongoose ValidationError ──────────────────────────────────────────────────
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message,
    }));
    return res.status(400).json({ success: false, message: 'Validation failed', errors });
  }

  // ── Mongoose duplicate key (E11000) ───────────────────────────────────────────
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    return res.status(409).json({
      success: false,
      message: `${field} already exists`,
    });
  }

  // ── JWT errors (fallthrough) ──────────────────────────────────────────────────
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    return res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }

  // ── Operational ApiError ──────────────────────────────────────────────────────
  if (err instanceof ApiError) {
    const body = { success: false, message: err.message };
    if (err.errors && err.errors.length > 0) body.errors = err.errors;
    return res.status(err.statusCode).json(body);
  }

  // ── Unknown / programmer error ────────────────────────────────────────────────
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
  });
};

/** 404 handler — must be registered after all routes */
const notFound = (req, res) => {
  res.status(404).json({
    success: false,
    message: `Cannot ${req.method} ${req.originalUrl}`,
  });
};

module.exports = { errorHandler, notFound };
