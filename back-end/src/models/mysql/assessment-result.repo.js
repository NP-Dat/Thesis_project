import { mysqlPool } from '../../config/db-mysql.js';

export async function createAssessmentResult(result, conn = mysqlPool) {
  const [r] = await conn.query(
    `INSERT INTO assessment_results
        (user_id, personal_burnout_score, work_burnout_score,
         mental_fatigue_score, predicted_burn_rate, risk_level)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      result.user_id,
      result.personal_burnout_score,
      result.work_burnout_score,
      result.mental_fatigue_score,
      result.predicted_burn_rate,
      result.risk_level,
    ]
  );
  return r.insertId;
}

export async function findAssessmentById(id, conn = mysqlPool) {
  const [rows] = await conn.query(
    `SELECT id, user_id, personal_burnout_score, work_burnout_score,
            mental_fatigue_score, predicted_burn_rate, risk_level, taken_at
       FROM assessment_results
      WHERE id = ?
      LIMIT 1`,
    [id]
  );
  return rows[0] ?? null;
}

export async function listAssessmentsByUser(userId, conn = mysqlPool) {
  const [rows] = await conn.query(
    `SELECT id, personal_burnout_score, work_burnout_score, mental_fatigue_score,
            predicted_burn_rate, risk_level, taken_at
       FROM assessment_results
      WHERE user_id = ?
      ORDER BY taken_at ASC`,
    [userId]
  );
  return rows;
}

export async function findLatestAssessmentByUser(userId, conn = mysqlPool) {
  const [rows] = await conn.query(
    `SELECT id, personal_burnout_score, work_burnout_score, mental_fatigue_score,
            predicted_burn_rate, risk_level, taken_at
       FROM assessment_results
      WHERE user_id = ?
      ORDER BY taken_at DESC, id DESC
      LIMIT 1`,
    [userId]
  );
  return rows[0] ?? null;
}

/**
 * Returns the assessment whose `taken_at` is strictly before `excludeId`'s,
 * for the same user. Used to detect trend spikes.
 */
export async function findPreviousAssessmentByUser(userId, excludeId, conn = mysqlPool) {
  const [rows] = await conn.query(
    `SELECT id, predicted_burn_rate, risk_level, taken_at
       FROM assessment_results
      WHERE user_id = ? AND id != ?
      ORDER BY taken_at DESC, id DESC
      LIMIT 1`,
    [userId, excludeId]
  );
  return rows[0] ?? null;
}

/* ------------------------------------------------------------------
 * Admin aggregations
 * ----------------------------------------------------------------*/

/**
 * Latest assessment per user across the whole company, joined with hr_profiles
 * + departments. Used for the admin overview / department drill-downs.
 */
export async function listLatestAssessmentsPerUser(conn = mysqlPool) {
  const [rows] = await conn.query(
    `SELECT u.id AS user_id,
            u.first_name, u.last_name,
            hp.department_id,
            d.name AS department_name,
            d.location AS department_location,
            hp.designation,
            hp.shift_type,
            ar.id AS assessment_id,
            ar.predicted_burn_rate,
            ar.risk_level,
            ar.taken_at
       FROM users u
       JOIN hr_profiles hp ON hp.user_id = u.id
       JOIN departments d  ON d.id = hp.department_id
       JOIN assessment_results ar ON ar.id = (
            SELECT ar2.id FROM assessment_results ar2
             WHERE ar2.user_id = u.id
             ORDER BY ar2.taken_at DESC, ar2.id DESC
             LIMIT 1
       )
      WHERE u.role = 'employee' AND u.is_active = 1`
  );
  return rows;
}

export async function countAllAssessments(conn = mysqlPool) {
  const [rows] = await conn.query('SELECT COUNT(*) AS n FROM assessment_results');
  return rows[0].n;
}

export async function countActiveEmployees(conn = mysqlPool) {
  const [rows] = await conn.query(
    "SELECT COUNT(*) AS n FROM users WHERE role='employee' AND is_active=1"
  );
  return rows[0].n;
}

export async function countAssessmentsByUser(userId, conn = mysqlPool) {
  const [rows] = await conn.query(
    'SELECT COUNT(*) AS n FROM assessment_results WHERE user_id = ?',
    [userId]
  );
  return rows[0].n;
}

/**
 * All assessment rows for employees in a given department, joined with
 * hr_profiles to get designation / shift_type. Ordered by taken_at ASC.
 */
export async function listAssessmentsByDepartment(departmentId, conn = mysqlPool) {
  const [rows] = await conn.query(
    `SELECT ar.id, ar.user_id, ar.personal_burnout_score, ar.work_burnout_score,
            ar.mental_fatigue_score, ar.predicted_burn_rate, ar.risk_level, ar.taken_at,
            hp.designation, hp.shift_type
       FROM assessment_results ar
       JOIN hr_profiles hp ON hp.user_id = ar.user_id
      WHERE hp.department_id = ?
      ORDER BY ar.taken_at ASC`,
    [departmentId]
  );
  return rows;
}

export async function countAssessmentsByUsers(userIds, conn = mysqlPool) {
  if (!userIds.length) return new Map();
  const [rows] = await conn.query(
    `SELECT user_id, COUNT(*) AS n FROM assessment_results
      WHERE user_id IN (?)
      GROUP BY user_id`,
    [userIds]
  );
  const map = new Map();
  for (const r of rows) map.set(r.user_id, r.n);
  return map;
}
