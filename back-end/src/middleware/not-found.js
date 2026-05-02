import { ApiError } from '../utils/api-error.js';

export function notFoundHandler(req, _res, next) {
  next(ApiError.notFound(`Route not found: ${req.method} ${req.originalUrl}`));
}
