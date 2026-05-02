import { mysqlPool } from '../../config/db-mysql.js';

const SAFE_COLUMNS = `
  id, email, first_name, last_name, gender, date_of_birth,
  role, is_active, created_at, updated_at
`;

export async function findUserByEmail(email, conn = mysqlPool) {
  const [rows] = await conn.query(
    `SELECT id, email, password_hash, first_name, last_name, gender, date_of_birth,
            role, is_active, created_at, updated_at
       FROM users
      WHERE email = ?
      LIMIT 1`,
    [email]
  );
  return rows[0] ?? null;
}

export async function findUserById(id, conn = mysqlPool) {
  const [rows] = await conn.query(
    `SELECT ${SAFE_COLUMNS} FROM users WHERE id = ? LIMIT 1`,
    [id]
  );
  return rows[0] ?? null;
}

export async function createUser(user, conn = mysqlPool) {
  const [result] = await conn.query(
    `INSERT INTO users
        (email, password_hash, first_name, last_name, gender, date_of_birth, role, is_active)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      user.email,
      user.passwordHash,
      user.firstName,
      user.lastName,
      user.gender,
      user.dateOfBirth ?? null,
      user.role ?? 'employee',
      user.isActive ?? true,
    ]
  );
  return result.insertId;
}

export async function countUsersByRole(role, conn = mysqlPool) {
  const [rows] = await conn.query('SELECT COUNT(*) AS n FROM users WHERE role = ?', [role]);
  return rows[0].n;
}
