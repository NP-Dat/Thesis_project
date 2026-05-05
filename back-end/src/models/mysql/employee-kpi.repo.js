import { mysqlPool } from '../../config/db-mysql.js';

export async function listKpisByUser(userId, conn = mysqlPool) {
  const [rows] = await conn.query(
    `SELECT period_date, attendance_rate, productivity_score,
            overtime_hours, tasks_completed, quality_score, days_absent
       FROM employee_kpis
      WHERE user_id = ?
      ORDER BY period_date ASC`,
    [userId]
  );
  return rows;
}

export async function listKpisByDepartment(departmentId, conn = mysqlPool) {
  const [rows] = await conn.query(
    `SELECT ek.user_id, ek.period_date, ek.attendance_rate,
            ek.productivity_score, ek.overtime_hours,
            ek.tasks_completed, ek.quality_score, ek.days_absent
       FROM employee_kpis ek
       JOIN hr_profiles hp ON hp.user_id = ek.user_id
      WHERE hp.department_id = ?
      ORDER BY ek.period_date ASC`,
    [departmentId]
  );
  return rows;
}

export async function listAvgKpiPerDepartment(conn = mysqlPool) {
  const [rows] = await conn.query(
    `SELECT hp.department_id,
            d.name AS department_name,
            ROUND(AVG(ek.attendance_rate), 2)    AS avg_attendance,
            ROUND(AVG(ek.productivity_score), 2) AS avg_productivity,
            ROUND(AVG(ek.quality_score), 2)      AS avg_quality,
            ROUND((AVG(ek.attendance_rate) + AVG(ek.productivity_score) + AVG(ek.quality_score)) / 3, 2) AS avg_composite_kpi
       FROM employee_kpis ek
       JOIN hr_profiles hp ON hp.user_id = ek.user_id
       JOIN departments d  ON d.id = hp.department_id
      GROUP BY hp.department_id, d.name
      ORDER BY d.name ASC`
  );
  return rows;
}
