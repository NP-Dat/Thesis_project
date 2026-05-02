import mysql from 'mysql2/promise';
import { env } from './env.js';
import { logger } from './logger.js';

export const mysqlPool = mysql.createPool({
  host: env.MYSQL_HOST,
  port: env.MYSQL_PORT,
  user: env.MYSQL_USER,
  password: env.MYSQL_PASSWORD,
  database: env.MYSQL_DATABASE,
  connectionLimit: env.MYSQL_CONNECTION_LIMIT,
  waitForConnections: true,
  enableKeepAlive: true,
  keepAliveInitialDelay: 10_000,
  dateStrings: false,
  timezone: 'Z',
  ssl: env.MYSQL_SSL ? { rejectUnauthorized: true } : undefined,
});

export async function pingMysql() {
  const conn = await mysqlPool.getConnection();
  try {
    await conn.ping();
    logger.info({ host: env.MYSQL_HOST, db: env.MYSQL_DATABASE }, 'MySQL connected');
  } finally {
    conn.release();
  }
}

/**
 * Run a callback inside a transaction. Auto-commits / rolls back.
 * @template T
 * @param {(conn: import('mysql2/promise').PoolConnection) => Promise<T>} callback
 * @returns {Promise<T>}
 */
export async function withTransaction(callback) {
  const conn = await mysqlPool.getConnection();
  try {
    await conn.beginTransaction();
    const result = await callback(conn);
    await conn.commit();
    return result;
  } catch (err) {
    await conn.rollback().catch(() => {});
    throw err;
  } finally {
    conn.release();
  }
}

export async function closeMysql() {
  await mysqlPool.end();
}
