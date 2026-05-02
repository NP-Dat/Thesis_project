import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email().max(255),
  password: z.string().min(8).max(128),
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  gender: z.enum(['Male', 'Female', 'Other']),
  dateOfBirth: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Expected YYYY-MM-DD')
    .optional()
    .or(z.literal('').transform(() => undefined)),
});

export const loginSchema = z.object({
  email: z.string().email().max(255),
  password: z.string().min(1).max(128),
});
