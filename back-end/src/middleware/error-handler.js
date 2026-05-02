import { env } from '../config/env.js';
import { logger } from '../config/logger.js';
import { ApiError } from '../utils/api-error.js';

/* eslint-disable no-unused-vars */
export function errorHandler(err, req, res, _next) {
  let apiError;
  if (err instanceof ApiError) {
    apiError = err;
  } else if (err?.code === 'ER_DUP_ENTRY') {
    apiError = ApiError.conflict('Duplicate value violates a unique constraint');
  } else {
    apiError = ApiError.internal(err?.message || 'Unexpected error');
  }

  if (apiError.statusCode >= 500) {
    logger.error({ err, path: req.originalUrl }, apiError.message);
  } else {
    logger.warn({ path: req.originalUrl, code: apiError.code }, apiError.message);
  }

  const body = {
    success: false,
    error: {
      code: apiError.code,
      message: apiError.message,
    },
  };
  if (env.NODE_ENV !== 'production' && apiError.details) {
    body.error.details = apiError.details;
  }
  res.status(apiError.statusCode).json(body);
}
