import { z } from 'zod';

export const RISK_LEVEL = z.enum(['low', 'moderate', 'high', 'critical']);

export const paginationQuery = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
});

export const positiveIntParam = (name) =>
  z.object({
    [name]: z.coerce.number().int().positive(),
  });
