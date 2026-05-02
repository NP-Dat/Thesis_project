import { mysqlPool } from '../../config/db-mysql.js';

export async function createHrProfile(profile, conn = mysqlPool) {
  const [result] = await conn.query(
    `INSERT INTO hr_profiles
        (user_id, department_id, date_of_joining, company_type,
         wfh_available, designation, resource_allocation, shift_type)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      profile.user_id,
      profile.department_id,
      profile.date_of_joining,
      profile.company_type,
      profile.wfh_available,
      profile.designation,
      profile.resource_allocation,
      profile.shift_type,
    ]
  );
  return result.insertId;
}

export async function findHrProfileByUserId(userId, conn = mysqlPool) {
  const [rows] = await conn.query(
    `SELECT hp.id, hp.user_id, hp.department_id, hp.date_of_joining,
            hp.company_type, hp.wfh_available, hp.designation,
            hp.resource_allocation, hp.shift_type,
            d.name AS department_name, d.location AS department_location
       FROM hr_profiles hp
       LEFT JOIN departments d ON d.id = hp.department_id
      WHERE hp.user_id = ?
      LIMIT 1`,
    [userId]
  );
  return rows[0] ?? null;
}
