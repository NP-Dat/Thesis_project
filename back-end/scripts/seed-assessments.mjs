/**
 * Generate 200 assessment results for existing users (IDs 1–202).
 *
 *   npm run seed:assessments
 *
 * Each run inserts 200 new rows with:
 *   - random user_id drawn from hr_profiles (range 1–202)
 *   - random taken_at between 2026-01-01 and 2026-05-05
 *   - CBI-style personal/work burnout scores
 *   - mental_fatigue_score derived from the two section averages
 *   - predicted_burn_rate from the AI service (mock or real)
 *   - auto-generated alerts via alert.service.js
 *
 * The script is intentionally non-idempotent — run it multiple times to
 * accumulate more assessment history.
 */
import { logger } from '../src/config/logger.js';
import { withTransaction, closeMysql, mysqlPool } from '../src/config/db-mysql.js';
import { predictBurnRate } from '../src/services/ai.service.js';
import { maybeCreateAlerts } from '../src/services/alert.service.js';

const BATCH_SIZE = 200;
const DATE_START = new Date('2026-01-01T00:00:00Z');
const DATE_END = new Date('2026-05-05T23:59:59Z');
const USER_ID_MIN = 1;
const USER_ID_MAX = 202;

function randomFloat(min, max, decimals = 1) {
  return parseFloat((Math.random() * (max - min) + min).toFixed(decimals));
}

function randomDate(start, end) {
  const ms = start.getTime() + Math.random() * (end.getTime() - start.getTime());
  return new Date(ms);
}

function burnRateToRiskLevel(rate) {
  if (rate >= 0.80) return 'critical';
  if (rate >= 0.55) return 'high';
  if (rate >= 0.35) return 'moderate';
  return 'low';
}

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

async function main() {
  try {
    const [profileRows] = await mysqlPool.query(
      `SELECT user_id, designation, resource_allocation
         FROM hr_profiles
        WHERE user_id BETWEEN ? AND ?`,
      [USER_ID_MIN, USER_ID_MAX],
    );

    if (profileRows.length === 0) {
      throw new Error(
        'No hr_profiles found for user IDs 1–202. Run seed:dataset first.',
      );
    }

    logger.info(
      { eligibleUsers: profileRows.length },
      'Loaded hr_profiles for seeding',
    );

    let inserted = 0;
    let alertsCreated = 0;

    await withTransaction(async (conn) => {
      for (let i = 0; i < BATCH_SIZE; i++) {
        const profile = pick(profileRows);
        const { user_id: userId, designation: rawDesig, resource_allocation } = profile;
        const designation = Math.max(1, Math.min(5, rawDesig ?? 2));
        const resourceAllocation = Math.max(1, Math.min(10, resource_allocation ?? 5));

        const personalBurnout = randomFloat(0, 100, 1);
        const workBurnout = randomFloat(0, 100, 1);
        const mentalFatigueScore = parseFloat(
          (((personalBurnout + workBurnout) / 2) / 10).toFixed(1),
        );

        const predictedBurnRate = await predictBurnRate({
          designation,
          resourceAllocation,
          mentalFatigueScore,
        });

        const riskLevel = burnRateToRiskLevel(predictedBurnRate);
        const takenAt = randomDate(DATE_START, DATE_END);

        const [result] = await conn.query(
          `INSERT INTO assessment_results
              (user_id, personal_burnout_score, work_burnout_score,
               mental_fatigue_score, predicted_burn_rate, risk_level, taken_at)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [userId, personalBurnout, workBurnout,
           mentalFatigueScore, predictedBurnRate, riskLevel, takenAt],
        );
        const assessmentId = result.insertId;

        const alertIds = await maybeCreateAlerts({ userId, assessmentId, conn });
        alertsCreated += alertIds.length;

        inserted++;
      }
    });

    logger.info({ inserted, alertsCreated }, 'Assessment seed complete');
  } finally {
    await closeMysql();
  }
}

main().catch((err) => {
  logger.fatal({ err }, 'Assessment seed failed');
  process.exit(1);
});
