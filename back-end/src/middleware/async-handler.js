/**
 * Wrap an async route handler so thrown errors propagate to express's
 * error middleware. Express 5 already auto-forwards rejected promises,
 * but using this wrapper keeps the intent obvious in route definitions.
 */
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
