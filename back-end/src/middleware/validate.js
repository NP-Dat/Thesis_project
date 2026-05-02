import { ZodError } from 'zod';
import { ApiError } from '../utils/api-error.js';

/**
 * Validate `req[source]` with the supplied zod schema. The parsed (and
 * coerced) value replaces the original so downstream code reads sanitised
 * data.
 *
 * @param {import('zod').ZodTypeAny} schema
 * @param {'body'|'query'|'params'} source
 */
export function validate(schema, source = 'body') {
  return (req, _res, next) => {
    try {
      const parsed = schema.parse(req[source]);
      req[source] = parsed;
      return next();
    } catch (err) {
      if (err instanceof ZodError) {
        const details = err.flatten();
        return next(ApiError.badRequest('Invalid request payload', details));
      }
      return next(err);
    }
  };
}
