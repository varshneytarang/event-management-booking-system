const { validationResult } = require('express-validator');

/**
 * Runs after express-validator chains.
 * If there are errors, responds 422 with the first error per field.
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formatted = errors.array({ onlyFirstError: true }).map((e) => ({
      field: e.path,
      message: e.msg,
    }));
    return res.status(422).json({
      success: false,
      message: 'Validation failed',
      errors: formatted,
    });
  }
  next();
};

module.exports = validate;
