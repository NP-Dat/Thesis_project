import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().int().positive().default(3000),
  CORS_ORIGIN: z.string().default('*'),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),

  // MySQL
  MYSQL_HOST: z.string().min(1),
  MYSQL_PORT: z.coerce.number().int().positive().default(3306),
  MYSQL_USER: z.string().min(1),
  MYSQL_PASSWORD: z.string().default(''),
  MYSQL_DATABASE: z.string().min(1),
  MYSQL_CONNECTION_LIMIT: z.coerce.number().int().positive().default(10),
  MYSQL_SSL: z
    .enum(['true', 'false'])
    .default('false')
    .transform((v) => v === 'true'),

  // MongoDB
  MONGODB_URI: z.string().min(1),
  MONGODB_DB_NAME: z.string().default('burnout_detection'),

  // Auth
  JWT_SECRET: z.string().min(16, 'JWT_SECRET must be at least 16 characters'),
  JWT_EXPIRES_IN: z.string().default('7d'),
  BCRYPT_SALT_ROUNDS: z.coerce.number().int().positive().default(10),

  // AI service
  AI_USE_MOCK: z
    .enum(['true', 'false'])
    .default('true')
    .transform((v) => v === 'true'),
  AI_SERVICE_URL: z.string().url().optional(),
  AI_SERVICE_TIMEOUT_MS: z.coerce.number().int().positive().default(5000),

  // Alerts
  ALERT_TREND_SPIKE_DELTA: z.coerce.number().min(0).max(1).default(0.15),

  // Seed
  ADMIN_EMAIL: z.string().email().optional(),
  ADMIN_PASSWORD: z.string().min(8).optional(),
  ADMIN_FIRST_NAME: z.string().optional(),
  ADMIN_LAST_NAME: z.string().optional(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  // eslint-disable-next-line no-console
  console.error('Invalid environment variables:', parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;
