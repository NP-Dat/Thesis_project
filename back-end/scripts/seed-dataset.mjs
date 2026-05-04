/**
 * Import ~200 rows from the burnout-analysis Excel file into MySQL.
 *
 *   npm run seed:dataset
 *
 * Prerequisites:
 *   - MySQL schema + reference data loaded (db/schema.sql)
 *   - departments table populated (done by schema.sql)
 *   - .env configured with valid MySQL + MongoDB credentials
 */
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import crypto from 'node:crypto';
import bcrypt from 'bcryptjs';
import XLSX from 'xlsx';

import { env } from '../src/config/env.js';
import { logger } from '../src/config/logger.js';
import { mysqlPool, withTransaction, closeMysql } from '../src/config/db-mysql.js';
import * as departmentRepo from '../src/models/mysql/department.repo.js';
import { maybeCreateAlerts } from '../src/services/alert.service.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const XLSX_PATH = path.join(ROOT, 'archive', 'employee_burnout_analysis-AI.xlsx');
const ROW_LIMIT = 200;

// ── name pools for generating fake users ────────────────────────────
const FIRST_NAMES_MALE = [
  'James', 'Robert', 'Michael', 'David', 'William', 'Richard', 'Joseph',
  'Thomas', 'Daniel', 'Matthew', 'Anthony', 'Mark', 'Steven', 'Paul',
  'Andrew', 'Kevin', 'Brian', 'George', 'Edward', 'Jason', 'Ryan',
  'Jacob', 'Gary', 'Timothy', 'Jose', 'Larry', 'Jeffrey', 'Frank',
  'Scott', 'Eric', 'Stephen', 'Raymond', 'Gregory', 'Samuel', 'Patrick',
];
const FIRST_NAMES_FEMALE = [
  'Mary', 'Patricia', 'Jennifer', 'Linda', 'Barbara', 'Elizabeth',
  'Susan', 'Jessica', 'Sarah', 'Karen', 'Lisa', 'Nancy', 'Betty',
  'Margaret', 'Sandra', 'Ashley', 'Dorothy', 'Kimberly', 'Emily',
  'Donna', 'Michelle', 'Carol', 'Amanda', 'Melissa', 'Deborah',
  'Stephanie', 'Rebecca', 'Sharon', 'Laura', 'Cynthia', 'Anna',
  'Kathleen', 'Amy', 'Angela', 'Shirley',
];
const LAST_NAMES = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller',
  'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez',
  'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin',
  'Lee', 'Perez', 'Thompson', 'White', 'Harris', 'Sanchez', 'Clark',
  'Ramirez', 'Lewis', 'Robinson', 'Walker', 'Young', 'Allen', 'King',
  'Wright', 'Scott', 'Torres', 'Nguyen', 'Hill', 'Flores', 'Green',
  'Adams', 'Nelson', 'Baker', 'Hall', 'Rivera', 'Campbell', 'Mitchell',
];
const SHIFT_TYPES = ['Day', 'Night', 'Rotating'];

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomFloat(min, max, decimals = 1) {
  return parseFloat((Math.random() * (max - min) + min).toFixed(decimals));
}

function randomDateOfBirth() {
  const year = randomInt(1970, 2000);
  const month = randomInt(1, 12);
  const day = randomInt(1, 28);
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function burnRateToRiskLevel(rate) {
  if (rate >= 0.75) return 'critical';
  if (rate >= 0.50) return 'high';
  if (rate >= 0.25) return 'moderate';
  return 'low';
}

function parseExcel() {
  const workbook = XLSX.readFile(XLSX_PATH);
  const sheetName = workbook.SheetNames[0];
  const rows = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
  return rows;
}

function parseDateOfJoining(raw) {
  if (!raw) return '2008-01-01';

  if (typeof raw === 'number') {
    const d = XLSX.SSF.parse_date_code(raw);
    return `${d.y}-${String(d.m).padStart(2, '0')}-${String(d.d).padStart(2, '0')}`;
  }

  const parts = String(raw).split('/');
  if (parts.length === 3) {
    const [m, d, y] = parts;
    return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
  }
  return '2008-01-01';
}

async function main() {
  try {
    const allRows = parseExcel();
    const usableRows = allRows.filter((r) => r['Burn Rate'] != null);
    const rows = usableRows.slice(0, ROW_LIMIT);
    logger.info(
      { totalInFile: allRows.length, usable: usableRows.length, importing: rows.length },
      'Parsed Excel file',
    );

    const departmentIds = await departmentRepo.listDepartmentIds();
    if (departmentIds.length === 0) {
      throw new Error('No departments found – run db/schema.sql first');
    }
    logger.info({ departments: departmentIds.length }, 'Loaded department IDs');

    const sharedPasswordHash = await bcrypt.hash('Password123!', env.BCRYPT_SALT_ROUNDS);

    let inserted = 0;
    let alertsCreated = 0;

    await withTransaction(async (conn) => {
      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];

        const gender = row['Gender'] === 'Female' ? 'Female' : 'Male';
        const firstName = pick(gender === 'Male' ? FIRST_NAMES_MALE : FIRST_NAMES_FEMALE);
        const lastName = pick(LAST_NAMES);
        const uniqueSuffix = crypto.randomBytes(4).toString('hex');
        const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}.${uniqueSuffix}@demo.local`;

        const burnRate = row['Burn Rate'];
        let mentalFatigue = row['Mental Fatigue Score'];
        if (mentalFatigue == null) {
          mentalFatigue = randomFloat(
            Math.max(0, burnRate * 10 - 2),
            Math.min(10, burnRate * 10 + 2),
          );
        }

        // 1. Insert user
        const [userResult] = await conn.query(
          `INSERT INTO users
              (email, password_hash, first_name, last_name, gender, date_of_birth, role, is_active)
           VALUES (?, ?, ?, ?, ?, ?, 'employee', 1)`,
          [email, sharedPasswordHash, firstName, lastName, gender, randomDateOfBirth()]
        );
        const userId = userResult.insertId;

        // 2. Insert hr_profile
        const dateOfJoining = parseDateOfJoining(row['Date of Joining']);
        const companyType = row['Company Type'] === 'Product' ? 'Product' : 'Service';
        const wfhAvailable = row['WFH Setup Available'] === 'Yes' ? 1 : 0;
        const designation = row['Designation'] ?? 2;
        const resourceAllocation = row['Resource Allocation'] ?? null;
        const departmentId = pick(departmentIds);
        const shiftType = pick(SHIFT_TYPES);

        await conn.query(
          `INSERT INTO hr_profiles
              (user_id, department_id, date_of_joining, company_type,
               wfh_available, designation, resource_allocation, shift_type)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [userId, departmentId, dateOfJoining, companyType,
           wfhAvailable, designation, resourceAllocation, shiftType]
        );

        // 3. Insert assessment_result
        const predictedBurnRate = parseFloat(burnRate);
        const riskLevel = burnRateToRiskLevel(predictedBurnRate);
        const personalBurnout = randomFloat(0, 100, 1);
        const workBurnout = randomFloat(0, 100, 1);

        const [assessmentResult] = await conn.query(
          `INSERT INTO assessment_results
              (user_id, personal_burnout_score, work_burnout_score,
               mental_fatigue_score, predicted_burn_rate, risk_level)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [userId, personalBurnout, workBurnout,
           parseFloat(mentalFatigue), predictedBurnRate, riskLevel]
        );
        const assessmentId = assessmentResult.insertId;

        const alertIds = await maybeCreateAlerts({ userId, assessmentId, conn });
        alertsCreated += alertIds.length;

        inserted++;
      }
    });

    logger.info({ inserted, alertsCreated }, 'Dataset import complete');
  } finally {
    await closeMysql();
  }
}

main().catch((err) => {
  logger.fatal({ err }, 'Dataset seed failed');
  process.exit(1);
});
