import { mysqlPool } from '../../config/db-mysql.js';

export async function listDepartments(conn = mysqlPool) {
  const [rows] = await conn.query(
    'SELECT id, name, location, created_at FROM departments ORDER BY id ASC'
  );
  return rows;
}

export async function listDepartmentIds(conn = mysqlPool) {
  const [rows] = await conn.query('SELECT id FROM departments');
  return rows.map((r) => r.id);
}

export async function findDepartmentById(id, conn = mysqlPool) {
  const [rows] = await conn.query(
    'SELECT id, name, location FROM departments WHERE id = ? LIMIT 1',
    [id]
  );
  return rows[0] ?? null;
}
