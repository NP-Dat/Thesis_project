/**
 * Seed script.
 *
 *   npm run seed                       # seed everything
 *   npm run seed -- --only=quiz        # CBI quiz (MongoDB) only
 *   npm run seed -- --only=admin       # Admin user only
 *   npm run seed -- --only=resources   # Re-insert default help resources
 *
 * MySQL schema and reference rows (departments, default help_resources)
 * live in back-end/db/schema.sql and are loaded manually before running this.
 */
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import bcrypt from 'bcryptjs';

import { env } from '../src/config/env.js';
import { logger } from '../src/config/logger.js';
import { mysqlPool, closeMysql } from '../src/config/db-mysql.js';
import { connectMongo, disconnectMongo } from '../src/config/db-mongo.js';
import { CbiQuiz } from '../src/models/mongo/cbi-quiz.model.js';
import * as userRepo from '../src/models/mysql/user.repo.js';
import * as helpResourceRepo from '../src/models/mysql/help-resource.repo.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const CBI_TEST_PATH = path.join(ROOT, 'mock-data', 'cbi-test.json');

function parseFlags() {
  const onlyArg = process.argv.find((a) => a.startsWith('--only='));
  const only = onlyArg ? onlyArg.split('=')[1] : null;
  return { only };
}

async function seedQuiz() {
  const raw = JSON.parse(await readFile(CBI_TEST_PATH, 'utf8'));

  const existing = await CbiQuiz.findOne({ name: raw.name, version: 1 });
  if (existing) {
    logger.info('CBI quiz already present – skipping');
    return;
  }
  await CbiQuiz.create({
    name: raw.name,
    version: 1,
    responseOptions: raw.responseOptions,
    sections: raw.sections,
    questions: raw.questions,
    isActive: true,
  });
  logger.info('Seeded CBI quiz (version 1)');
}

async function seedAdmin() {
  if (!env.ADMIN_EMAIL || !env.ADMIN_PASSWORD) {
    logger.warn('ADMIN_EMAIL / ADMIN_PASSWORD not set – skipping admin seed');
    return;
  }
  const existing = await userRepo.findUserByEmail(env.ADMIN_EMAIL);
  if (existing) {
    logger.info({ email: env.ADMIN_EMAIL }, 'Admin user already exists – skipping');
    return;
  }
  const passwordHash = await bcrypt.hash(env.ADMIN_PASSWORD, env.BCRYPT_SALT_ROUNDS);
  await userRepo.createUser({
    email: env.ADMIN_EMAIL,
    passwordHash,
    firstName: env.ADMIN_FIRST_NAME ?? 'System',
    lastName: env.ADMIN_LAST_NAME ?? 'Administrator',
    gender: 'Other',
    role: 'admin',
    isActive: true,
  });
  logger.info({ email: env.ADMIN_EMAIL }, 'Seeded admin user');
}

async function seedResources() {
  // Defensive: if someone wiped help_resources after running schema.sql,
  // re-insert the canonical defaults.
  const defaults = [
    {
      title: 'National Mental Health Hotline',
      description: 'Free 24/7 support line for workers experiencing burnout or stress.',
      url: 'https://example.com/hotline',
      min_risk_level: 'high',
    },
    {
      title: 'Stress Management Techniques',
      description: 'Evidence-based exercises for managing workplace fatigue.',
      url: 'https://example.com/stress-guide',
      min_risk_level: 'moderate',
    },
    {
      title: 'Sleep Hygiene Basics',
      description: 'A short guide to improving sleep quality on shift work.',
      url: 'https://example.com/sleep',
      min_risk_level: 'low',
    },
    {
      title: 'Workplace Wellness Program',
      description: 'Company-sponsored counselling sessions and ergonomic checks.',
      url: 'https://example.com/wellness',
      min_risk_level: 'high',
    },
    {
      title: 'Crisis Support: Talk Now',
      description: 'Immediate professional help for workers in critical distress.',
      url: 'https://example.com/crisis',
      min_risk_level: 'critical',
    },
  ];
  const existing = await helpResourceRepo.listAllResources();
  if (existing.length > 0) {
    logger.info({ count: existing.length }, 'help_resources already populated – skipping');
    return;
  }
  for (const r of defaults) {
    await helpResourceRepo.createResource({ ...r, is_active: true });
  }
  logger.info({ count: defaults.length }, 'Seeded help resources');
}

async function main() {
  const { only } = parseFlags();

  // Mongo is needed for "quiz" (and also to keep the connection happy if
  // we run "all").
  await connectMongo();

  try {
    if (!only || only === 'quiz') {
      await seedQuiz();
    }
    if (!only || only === 'admin') {
      await seedAdmin();
    }
    if (!only || only === 'resources') {
      await seedResources();
    }
  } finally {
    await disconnectMongo();
    await closeMysql();
    void mysqlPool; // keep import live
  }
}

main().catch((err) => {
  logger.fatal({ err }, 'Seed failed');
  process.exit(1);
});
