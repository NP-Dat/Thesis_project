import { z } from 'zod';

export const listAlertsQuerySchema = z.object({
  isRead: z
    .enum(['true', 'false'])
    .optional()
    .transform((v) => (v === undefined ? undefined : v === 'true')),
  alertType: z.enum(['high_risk', 'critical_risk', 'trend_spike']).optional(),
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
});
