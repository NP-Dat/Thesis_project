import { env } from '../config/env.js';
import { logger } from '../config/logger.js';
import { ApiError } from '../utils/api-error.js';

/**
 * AI service abstraction.
 *
 * The Python ML microservice is not yet available, so this module provides a
 * deterministic-ish mock that returns plausible burn-rate values in the same
 * range as the training dataset (mock-data/employee-burnt-out.json).
 *
 * Switch to the real service by setting:
 *   AI_USE_MOCK=false
 *   AI_SERVICE_URL=http://<host>:8000
 * The HTTP contract follows documents/backend-api.md §7.
 */

const clamp01 = (n) => Math.max(0, Math.min(1, n));

/**
 * Mock prediction. Treats null resourceAllocation as the mid-point (5).
 */
function mockPredict({ designation, resourceAllocation, mentalFatigueScore }) {
  const ra = resourceAllocation ?? 5;

  // Empirical-ish weighting: mental_fatigue_score dominates, designation +
  // resource_allocation provide secondary signal. Small jitter so repeat
  // submissions look different but stay close to a defensible value.
  const base =
    0.07 * mentalFatigueScore +
    0.03 * designation +
    0.02 * ra -
    0.05;

  const jitter = (Math.random() - 0.5) * 0.05;
  const burnRate = clamp01(base + jitter);
  return Math.round(burnRate * 100) / 100;
}

async function realPredict(payload) {
  if (!env.AI_SERVICE_URL) {
    throw ApiError.internal('AI_SERVICE_URL is not configured');
  }
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), env.AI_SERVICE_TIMEOUT_MS);
  try {
    const res = await fetch(`${env.AI_SERVICE_URL}/api/predict`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw ApiError.internal(`AI service responded ${res.status}: ${text.slice(0, 200)}`);
    }
    const json = await res.json();
    const burnRate = json?.data?.predictedBurnRate;
    if (typeof burnRate !== 'number') {
      throw ApiError.internal('AI service returned malformed payload');
    }
    return burnRate;
  } finally {
    clearTimeout(timer);
  }
}

/**
 * @param {{ designation:number, resourceAllocation:number|null, mentalFatigueScore:number }} input
 * @returns {Promise<number>} predicted burn rate in [0, 1]
 */
export async function predictBurnRate(input) {
  if (env.AI_USE_MOCK) {
    const burnRate = mockPredict(input);
    logger.debug({ input, burnRate, mode: 'mock' }, 'AI prediction');
    return burnRate;
  }
  const burnRate = await realPredict(input);
  logger.debug({ input, burnRate, mode: 'http' }, 'AI prediction');
  return burnRate;
}
