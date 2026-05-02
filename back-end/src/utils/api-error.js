/**
 * Application error with HTTP status code and an internal error code string.
 * Use throughout services and controllers; the central error handler turns
 * these into the standard error envelope.
 */
export class ApiError extends Error {
  /**
   * @param {number} statusCode
   * @param {string} code        machine-readable code, e.g. 'VALIDATION_ERROR'
   * @param {string} message     human-readable description
   * @param {object} [details]   optional extra details exposed in development
   */
  constructor(statusCode, code, message, details) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.isOperational = true;
    Error.captureStackTrace?.(this, ApiError);
  }

  static badRequest(message, details) {
    return new ApiError(400, 'VALIDATION_ERROR', message, details);
  }

  static unauthorized(message = 'Authentication required') {
    return new ApiError(401, 'UNAUTHORIZED', message);
  }

  static forbidden(message = 'Insufficient permissions') {
    return new ApiError(403, 'FORBIDDEN', message);
  }

  static notFound(message = 'Resource not found') {
    return new ApiError(404, 'NOT_FOUND', message);
  }

  static conflict(message) {
    return new ApiError(409, 'CONFLICT', message);
  }

  static internal(message = 'Internal server error') {
    return new ApiError(500, 'INTERNAL_ERROR', message);
  }
}
