import { ApiError } from '../utils/api-error.js';
import { anonymousId } from '../utils/anonymous-id.js';
import { parsePagination, buildPaginationMeta } from '../utils/pagination.js';
import * as hrProfileRepo from '../models/mysql/hr-profile.repo.js';
import * as departmentRepo from '../models/mysql/department.repo.js';
import * as assessmentRepo from '../models/mysql/assessment-result.repo.js';
import { listRecentAlerts } from './alert.service.js';

const EMPTY_DISTRIBUTION = () => ({ low: 0, moderate: 0, high: 0, critical: 0 });

function avg(nums) {
  if (nums.length === 0) return 0;
  const sum = nums.reduce((a, b) => a + b, 0);
  return Math.round((sum / nums.length) * 100) / 100;
}

export async function getEmployeeDashboard(userId) {
  const profile = await hrProfileRepo.findHrProfileByUserId(userId);
  if (!profile) throw ApiError.notFound('HR profile missing');

  const assessments = await assessmentRepo.listAssessmentsByUser(userId);
  const latest = assessments.length ? assessments[assessments.length - 1] : null;

  return {
    profile: {
      firstName: profile.first_name ?? undefined,
      lastName: profile.last_name ?? undefined,
      department: profile.department_name,
      designation: profile.designation,
      resourceAllocation: profile.resource_allocation,
      shiftType: profile.shift_type,
      dateOfJoining: profile.date_of_joining,
    },
    latestAssessment: latest
      ? {
          assessmentId: latest.id,
          predictedBurnRate: latest.predicted_burn_rate,
          riskLevel: latest.risk_level,
          personalBurnoutScore: latest.personal_burnout_score,
          workBurnoutScore: latest.work_burnout_score,
          mentalFatigueScore: latest.mental_fatigue_score,
          takenAt: latest.taken_at,
        }
      : null,
    trendData: assessments.map((a) => ({
      date: a.taken_at,
      burnRate: a.predicted_burn_rate,
      riskLevel: a.risk_level,
    })),
    totalAssessments: assessments.length,
  };
}

export async function getAdminDashboard() {
  const [latestPerUser, totalAssessments, totalEmployees, departments, recentAlerts] =
    await Promise.all([
      assessmentRepo.listLatestAssessmentsPerUser(),
      assessmentRepo.countAllAssessments(),
      assessmentRepo.countActiveEmployees(),
      departmentRepo.listDepartments(),
      listRecentAlerts({ limit: 10 }),
    ]);

  // Company-wide aggregation
  const allBurnRates = latestPerUser.map((r) => r.predicted_burn_rate);
  const companyDistribution = EMPTY_DISTRIBUTION();
  for (const r of latestPerUser) companyDistribution[r.risk_level] += 1;

  // Per-department buckets
  const deptMap = new Map();
  for (const d of departments) {
    deptMap.set(d.id, {
      id: d.id,
      name: d.name,
      location: d.location,
      employeeCount: 0,
      _burnRates: [],
      highRiskCount: 0,
      riskDistribution: EMPTY_DISTRIBUTION(),
    });
  }
  for (const r of latestPerUser) {
    const bucket = deptMap.get(r.department_id);
    if (!bucket) continue;
    bucket.employeeCount += 1;
    bucket._burnRates.push(r.predicted_burn_rate);
    bucket.riskDistribution[r.risk_level] += 1;
    if (r.risk_level === 'high' || r.risk_level === 'critical') {
      bucket.highRiskCount += 1;
    }
  }

  const departmentsOut = [...deptMap.values()].map((d) => ({
    id: d.id,
    name: d.name,
    location: d.location,
    employeeCount: d.employeeCount,
    avgBurnRate: avg(d._burnRates),
    highRiskCount: d.highRiskCount,
    riskDistribution: d.riskDistribution,
  }));

  return {
    companyOverview: {
      totalEmployees,
      totalAssessments,
      avgBurnRate: avg(allBurnRates),
      riskDistribution: companyDistribution,
    },
    departments: departmentsOut,
    recentAlerts,
  };
}

export async function getDepartmentDrillDown({ departmentId, page, limit }) {
  const department = await departmentRepo.findDepartmentById(departmentId);
  if (!department) throw ApiError.notFound('Department not found');

  const latestPerUser = await assessmentRepo.listLatestAssessmentsPerUser();
  const filtered = latestPerUser.filter((r) => r.department_id === departmentId);
  const pag = parsePagination({ page, limit }, { defaultLimit: 20, maxLimit: 100 });

  const window = filtered.slice(pag.offset, pag.offset + pag.limit);
  const counts = await Promise.all(
    window.map((r) => assessmentRepo.countAssessmentsByUser(r.user_id))
  );

  return {
    department,
    employees: window.map((r, idx) => ({
      anonymousId: anonymousId(r.user_id),
      designation: r.designation,
      shiftType: r.shift_type,
      latestBurnRate: r.predicted_burn_rate,
      riskLevel: r.risk_level,
      lastAssessmentDate: r.taken_at,
      assessmentCount: counts[idx],
    })),
    pagination: buildPaginationMeta({
      page: pag.page,
      limit: pag.limit,
      totalItems: filtered.length,
    }),
  };
}
