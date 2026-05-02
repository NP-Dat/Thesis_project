import { z } from 'zod';
import { RISK_LEVEL } from './common.schema.js';

export const createResourceSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  url: z.string().url().max(500).optional(),
  minRiskLevel: RISK_LEVEL,
  isActive: z.boolean().optional(),
});

export const updateResourceSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(2000).optional(),
  url: z.string().url().max(500).optional(),
  minRiskLevel: RISK_LEVEL.optional(),
  isActive: z.boolean().optional(),
});

export const resourceListQuerySchema = z.object({
  riskLevel: RISK_LEVEL.optional(),
});
