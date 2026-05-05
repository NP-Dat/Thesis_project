/**
 * Seed monthly KPI data for all employees (user IDs 1–202).
 *
 *   npm run seed:kpis
 *
 * ┌──────────────────────────────────────────────────────────────────┐
 * │  CHANGE THESE TWO VALUES to control which month gets seeded.    │
 * │  The script inserts one KPI row per employee for that month.    │
 * │  Run once per month you want to populate.                       │
 * └──────────────────────────────────────────────────────────────────┘
 */

// ═══════════════════════════════════════════════════════════════
//  >>>  CONFIGURE MONTH AND YEAR HERE  <<<
const YEAR = 2025;
const MONTH = 11; // 1 = January, 2 = February, … 12 = December
// ═══════════════════════════════════════════════════════════════

import { logger } from "../src/config/logger.js";
import {
  mysqlPool,
  withTransaction,
  closeMysql,
} from "../src/config/db-mysql.js";

const USER_ID_MIN = 1;
const USER_ID_MAX = 202;

function randomFloat(min, max, decimals = 1) {
  return parseFloat((Math.random() * (max - min) + min).toFixed(decimals));
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Generate a plausible KPI row. Values are loosely correlated so that
 * "good" employees tend to score well across multiple metrics, and
 * "struggling" employees show lower attendance + productivity, higher
 * absence, etc.  A random archetype is chosen first, then noise is added.
 */
function generateKpi() {
  const archetype = Math.random();

  let attendance, productivity, overtime, tasks, quality, absent;

  if (archetype < 0.15) {
    // ~15 % struggling employees
    attendance = randomFloat(60, 82);
    productivity = randomFloat(30, 60);
    overtime = randomFloat(15, 40);
    tasks = randomInt(20, 50);
    quality = randomFloat(40, 65);
    absent = randomInt(3, 8);
  } else if (archetype < 0.55) {
    // ~40 % average employees
    attendance = randomFloat(82, 93);
    productivity = randomFloat(55, 78);
    overtime = randomFloat(5, 20);
    tasks = randomInt(45, 80);
    quality = randomFloat(60, 82);
    absent = randomInt(1, 3);
  } else {
    // ~45 % high performers
    attendance = randomFloat(93, 100);
    productivity = randomFloat(75, 98);
    overtime = randomFloat(0, 12);
    tasks = randomInt(70, 120);
    quality = randomFloat(80, 99);
    absent = randomInt(0, 1);
  }

  return { attendance, productivity, overtime, tasks, quality, absent };
}

async function main() {
  const periodDate = `${YEAR}-${String(MONTH).padStart(2, "0")}-01`;

  logger.info({ year: YEAR, month: MONTH, periodDate }, "Seeding KPIs");

  try {
    const [profileRows] = await mysqlPool.query(
      `SELECT user_id FROM hr_profiles WHERE user_id BETWEEN ? AND ?`,
      [USER_ID_MIN, USER_ID_MAX],
    );

    if (profileRows.length === 0) {
      throw new Error(
        "No hr_profiles found for user IDs 1–202. Run seed:dataset first.",
      );
    }

    logger.info({ eligibleUsers: profileRows.length }, "Loaded user IDs");

    let inserted = 0;
    let skipped = 0;

    await withTransaction(async (conn) => {
      for (const { user_id: userId } of profileRows) {
        const kpi = generateKpi();

        try {
          await conn.query(
            `INSERT INTO employee_kpis
                (user_id, period_date, attendance_rate, productivity_score,
                 overtime_hours, tasks_completed, quality_score, days_absent)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              userId,
              periodDate,
              kpi.attendance,
              kpi.productivity,
              kpi.overtime,
              kpi.tasks,
              kpi.quality,
              kpi.absent,
            ],
          );
          inserted++;
        } catch (err) {
          if (err.code === "ER_DUP_ENTRY") {
            skipped++;
          } else {
            throw err;
          }
        }
      }
    });

    logger.info({ inserted, skipped, periodDate }, "KPI seed complete");
  } finally {
    await closeMysql();
  }
}

main().catch((err) => {
  logger.fatal({ err }, "KPI seed failed");
  process.exit(1);
});
