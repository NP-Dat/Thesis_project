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
      // Express 5 makes req.query and req.params read-only getters,
      // so we merge parsed values onto the existing object for those.
      if (source === 'body') {
        req.body = parsed;
      } else {
        const target = req[source];
        for (const key of Object.keys(target)) {
          if (!(key in parsed)) delete target[key];
        }
        Object.assign(target, parsed);
      }
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
