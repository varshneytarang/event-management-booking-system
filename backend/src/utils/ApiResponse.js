/**
 * Standardised success response helper.
 * All successful controller responses go through this.
 */
class ApiResponse {
  /**
   * @param {object} res        - Express response object
   * @param {number} statusCode - HTTP status code (default 200)
   * @param {string} message    - Human-readable message
   * @param {*}      data       - Response payload
   * @param {object} meta       - Optional pagination/metadata
   */
  static send(res, statusCode = 200, message = 'Success', data = null, meta = null) {
    const body = { success: true, message };
    if (data !== null) body.data = data;
    if (meta !== null) body.meta = meta;
    return res.status(statusCode).json(body);
  }

  static ok(res, message, data, meta) {
    return ApiResponse.send(res, 200, message, data, meta);
  }

  static created(res, message, data) {
    return ApiResponse.send(res, 201, message, data);
  }

  static noContent(res) {
    return res.status(204).send();
  }
}

module.exports = ApiResponse;
