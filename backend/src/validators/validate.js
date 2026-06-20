const { ZodError } = require('zod');
const ApiError = require('../utils/ApiError');

/**
 * Returns an Express middleware that validates req.body against a Zod schema.
 * On failure throws ApiError.badRequest with field-level error details.
 */
const validate = (schema, source = 'body') => (req, res, next) => {
  try {
    const parsed = schema.parse(req[source]);
    req[source] = parsed; // replace with coerced/trimmed values
    next();
  } catch (err) {
    if (err instanceof ZodError) {
      const errors = err.errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      }));
      return next(ApiError.badRequest('Validation failed', errors));
    }
    next(err);
  }
};

module.exports = validate;
