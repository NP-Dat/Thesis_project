import { mysqlPool } from '../../config/db-mysql.js';

export async function createAlert(alert, conn = mysqlPool) {
  const [r] = await conn.query(
    `INSERT INTO alerts (assessment_result_id, user_id, alert_type, message)
     VALUES (?, ?, ?, ?)`,
    [alert.assessment_result_id, alert.user_id, alert.alert_type, alert.message]
  );
  return r.insertId;
}

export async function listAlerts({ isRead, alertType, limit, offset }, conn = mysqlPool) {
  const where = [];
  const params = [];
  if (typeof isRead === 'boolean') {
    where.push('a.is_read = ?');
    params.push(isRead ? 1 : 0);
  }
  if (alertType) {
    where.push('a.alert_type = ?');
    params.push(alertType);
  }
  const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : '';

  const [rows] = await conn.query(
    `SELECT a.id, a.assessment_result_id, a.user_id, a.alert_type, a.message,
            a.is_read, a.created_at,
            u.first_name, u.last_name,
            d.name AS department_name
       FROM alerts a
       JOIN users u        ON u.id = a.user_id
       LEFT JOIN hr_profiles hp ON hp.user_id = u.id
       LEFT JOIN departments d  ON d.id = hp.department_id
       ${whereClause}
       ORDER BY a.created_at DESC, a.id DESC
       LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );

  const [countRows] = await conn.query(
    `SELECT COUNT(*) AS n FROM alerts a ${whereClause}`,
    params
  );
  return { rows, total: countRows[0].n };
}

export async function listRecentAlerts({ limit }, conn = mysqlPool) {
  const [rows] = await conn.query(
    `SELECT a.id, a.assessment_result_id, a.user_id, a.alert_type, a.message,
            a.is_read, a.created_at,
            u.first_name, u.last_name,
            d.name AS department_name
       FROM alerts a
       JOIN users u        ON u.id = a.user_id
       LEFT JOIN hr_profiles hp ON hp.user_id = u.id
       LEFT JOIN departments d  ON d.id = hp.department_id
       ORDER BY a.created_at DESC, a.id DESC
       LIMIT ?`,
    [limit]
  );
  return rows;
}

export async function markAlertRead(id, conn = mysqlPool) {
  const [r] = await conn.query('UPDATE alerts SET is_read = 1 WHERE id = ?', [id]);
  return r.affectedRows > 0;
}

export async function markAllAlertsRead(conn = mysqlPool) {
  const [r] = await conn.query('UPDATE alerts SET is_read = 1 WHERE is_read = 0');
  return r.affectedRows;
}
