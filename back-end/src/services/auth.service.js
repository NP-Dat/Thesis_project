import bcrypt from 'bcryptjs';
import { env } from '../config/env.js';
import { withTransaction } from '../config/db-mysql.js';
import { ApiError } from '../utils/api-error.js';
import { signToken } from '../middleware/auth.js';
import * as userRepo from '../models/mysql/user.repo.js';
import * as departmentRepo from '../models/mysql/department.repo.js';
import * as hrProfileRepo from '../models/mysql/hr-profile.repo.js';
import { simulateHrProfile } from '../utils/hr-simulator.js';

function publicUser(row) {
  return {
    id: row.id,
    email: row.email,
    firstName: row.first_name,
    lastName: row.last_name,
    gender: row.gender,
    dateOfBirth: row.date_of_birth,
    role: row.role,
    isActive: !!row.is_active,
    createdAt: row.created_at,
  };
}

export async function registerEmployee(input) {
  const existing = await userRepo.findUserByEmail(input.email);
  if (existing) {
    throw ApiError.conflict('Email is already registered');
  }

  const departmentIds = await departmentRepo.listDepartmentIds();
  if (departmentIds.length === 0) {
    throw ApiError.internal('No departments seeded — run `npm run seed` first');
  }
  const passwordHash = await bcrypt.hash(input.password, env.BCRYPT_SALT_ROUNDS);

  const userId = await withTransaction(async (conn) => {
    const insertedId = await userRepo.createUser(
      {
        email: input.email,
        passwordHash,
        firstName: input.firstName,
        lastName: input.lastName,
        gender: input.gender,
        dateOfBirth: input.dateOfBirth ?? null,
        role: 'employee',
        isActive: true,
      },
      conn
    );

    const hr = simulateHrProfile({ departmentIds });
    await hrProfileRepo.createHrProfile({ ...hr, user_id: insertedId }, conn);

    return insertedId;
  });

  const user = await userRepo.findUserById(userId);
  const token = signToken({ userId: user.id, role: user.role });
  return { token, user: publicUser(user) };
}

export async function login(input) {
  const row = await userRepo.findUserByEmail(input.email);
  if (!row || !row.is_active) {
    throw ApiError.unauthorized('Invalid email or password');
  }
  const ok = await bcrypt.compare(input.password, row.password_hash);
  if (!ok) {
    throw ApiError.unauthorized('Invalid email or password');
  }
  const token = signToken({ userId: row.id, role: row.role });
  return { token, user: publicUser(row) };
}

export async function getCurrentUser(userId) {
  const row = await userRepo.findUserById(userId);
  if (!row) throw ApiError.notFound('User not found');
  return publicUser(row);
}
