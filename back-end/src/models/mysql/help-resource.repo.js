import { mysqlPool } from '../../config/db-mysql.js';

const RISK_RANK = "FIELD(min_risk_level, 'low', 'moderate', 'high', 'critical')";

export async function listActiveResourcesUpTo(maxRiskLevel, conn = mysqlPool) {
  const [rows] = await conn.query(
    `SELECT id, title, description, url, min_risk_level, is_active, created_at
       FROM help_resources
      WHERE is_active = 1
        AND ${RISK_RANK} <= FIELD(?, 'low', 'moderate', 'high', 'critical')
      ORDER BY ${RISK_RANK} DESC, id ASC`,
    [maxRiskLevel]
  );
  return rows;
}

export async function listAllResources(conn = mysqlPool) {
  const [rows] = await conn.query(
    `SELECT id, title, description, url, min_risk_level, is_active, created_at
       FROM help_resources
      ORDER BY id ASC`
  );
  return rows;
}

export async function findResourceById(id, conn = mysqlPool) {
  const [rows] = await conn.query(
    `SELECT id, title, description, url, min_risk_level, is_active, created_at
       FROM help_resources
      WHERE id = ?
      LIMIT 1`,
    [id]
  );
  return rows[0] ?? null;
}

export async function createResource(r, conn = mysqlPool) {
  const [result] = await conn.query(
    `INSERT INTO help_resources (title, description, url, min_risk_level, is_active)
     VALUES (?, ?, ?, ?, ?)`,
    [r.title, r.description ?? null, r.url ?? null, r.min_risk_level, r.is_active ?? true]
  );
  return result.insertId;
}

export async function updateResource(id, r, conn = mysqlPool) {
  const [result] = await conn.query(
    `UPDATE help_resources
        SET title = ?, description = ?, url = ?, min_risk_level = ?, is_active = ?
      WHERE id = ?`,
    [
      r.title,
      r.description ?? null,
      r.url ?? null,
      r.min_risk_level,
      r.is_active ?? true,
      id,
    ]
  );
  return result.affectedRows > 0;
}

export async function deleteResource(id, conn = mysqlPool) {
  const [result] = await conn.query('DELETE FROM help_resources WHERE id = ?', [id]);
  return result.affectedRows > 0;
}
