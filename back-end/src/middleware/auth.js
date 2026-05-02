import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { ApiError } from '../utils/api-error.js';

/**
 * Verify the bearer token and attach `req.user = { id, role }`.
 */
export function authenticate(req, _res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return next(ApiError.unauthorized('Missing or malformed Authorization header'));
  }
  const token = header.slice('Bearer '.length).trim();
  try {
    const payload = jwt.verify(token, env.JWT_SECRET);
    req.user = { id: payload.sub, role: payload.role };
    return next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return next(ApiError.unauthorized('Token expired'));
    }
    return next(ApiError.unauthorized('Invalid token'));
  }
}

/**
 * Restrict access to one of the given roles (e.g. requireRole('admin')).
 */
export function requireRole(...allowedRoles) {
  return (req, _res, next) => {
    if (!req.user) return next(ApiError.unauthorized());
    if (!allowedRoles.includes(req.user.role)) {
      return next(ApiError.forbidden(`Requires one of: ${allowedRoles.join(', ')}`));
    }
    return next();
  };
}

export function signToken({ userId, role }) {
  return jwt.sign({ role }, env.JWT_SECRET, {
    subject: String(userId),
    expiresIn: env.JWT_EXPIRES_IN,
  });
}
