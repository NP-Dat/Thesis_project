import { ApiError } from '../utils/api-error.js';
import { anonymousId } from '../utils/anonymous-id.js';
import { parsePagination, buildPaginationMeta } from '../utils/pagination.js';
import * as hrProfileRepo from '../models/mysql/hr-profile.repo.js';
import * as departmentRepo from '../models/mysql/department.repo.js';
import * as assessmentRepo from '../models/mysql/assessment-result.repo.js';
import * as kpiRepo from '../models/mysql/employee-kpi.repo.js';
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
  const [latestPerUser, totalAssessments, totalEmployees, departments, recentAlerts, deptKpiRows] =
    await Promise.all([
      assessmentRepo.listLatestAssessmentsPerUser(),
      assessmentRepo.countAllAssessments(),
      assessmentRepo.countActiveEmployees(),
      departmentRepo.listDepartments(),
      listRecentAlerts({ limit: 10 }),
      kpiRepo.listAvgKpiPerDepartment(),
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

  const departmentKpis = deptKpiRows.map((r) => ({
    departmentId: r.department_id,
    name: r.department_name,
    avgCompositeKpi: r.avg_composite_kpi,
    avgAttendance: r.avg_attendance,
    avgProductivity: r.avg_productivity,
    avgQuality: r.avg_quality,
  }));

  return {
    companyOverview: {
      totalEmployees,
      totalAssessments,
      avgBurnRate: avg(allBurnRates),
      riskDistribution: companyDistribution,
    },
    departments: departmentsOut,
    departmentKpis,
    recentAlerts,
  };
}

const SORT_FIELDS = {
  burnRate: (a, b) => b.predicted_burn_rate - a.predicted_burn_rate,
  burnRateAsc: (a, b) => a.predicted_burn_rate - b.predicted_burn_rate,
  lastAssessment: (a, b) => new Date(b.taken_at) - new Date(a.taken_at),
  assessmentCount: (a, b) => (b._count ?? 0) - (a._count ?? 0),
  department: (a, b) => a.department_name.localeCompare(b.department_name),
  riskLevel: (a, b) => {
    const order = { critical: 0, high: 1, moderate: 2, low: 3 };
    return (order[a.risk_level] ?? 4) - (order[b.risk_level] ?? 4);
  },
};

export async function getAllEmployees({ sort = 'burnRate', order = 'desc', page, limit }) {
  const latestPerUser = await assessmentRepo.listLatestAssessmentsPerUser();
  const userIds = latestPerUser.map((r) => r.user_id);
  const countsMap = await assessmentRepo.countAssessmentsByUsers(userIds);

  for (const r of latestPerUser) r._count = countsMap.get(r.user_id) ?? 0;

  let sortFn = SORT_FIELDS[sort] ?? SORT_FIELDS.burnRate;
  if (order === 'asc' && sort === 'burnRate') sortFn = SORT_FIELDS.burnRateAsc;
  else if (order === 'asc' && SORT_FIELDS[sort]) {
    const baseFn = SORT_FIELDS[sort];
    sortFn = (a, b) => baseFn(b, a);
  }
  latestPerUser.sort(sortFn);

  const pag = parsePagination({ page, limit }, { defaultLimit: 20, maxLimit: 100 });
  const window = latestPerUser.slice(pag.offset, pag.offset + pag.limit);

  return {
    employees: window.map((r) => ({
      userId: r.user_id,
      anonymousId: anonymousId(r.user_id),
      department: r.department_name,
      designation: r.designation,
      shiftType: r.shift_type,
      latestBurnRate: r.predicted_burn_rate,
      riskLevel: r.risk_level,
      lastAssessmentDate: r.taken_at,
      assessmentCount: r._count,
    })),
    pagination: buildPaginationMeta({
      page: pag.page,
      limit: pag.limit,
      totalItems: latestPerUser.length,
    }),
  };
}

export async function getEmployeeDetailForAdmin(userId) {
  const profile = await hrProfileRepo.findHrProfileByUserId(userId);
  if (!profile) throw ApiError.notFound('Employee not found');

  const [assessments, kpiRows] = await Promise.all([
    assessmentRepo.listAssessmentsByUser(userId),
    kpiRepo.listKpisByUser(userId),
  ]);
  const latest = assessments.length ? assessments[assessments.length - 1] : null;

  const kpiData = kpiRows.map((r) => {
    const d = new Date(r.period_date);
    return {
      month: `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`,
      attendanceRate: r.attendance_rate,
      productivityScore: r.productivity_score,
      qualityScore: r.quality_score,
      overtimeHours: r.overtime_hours,
      tasksCompleted: r.tasks_completed,
      daysAbsent: r.days_absent,
      compositeKpi: Math.round(((r.attendance_rate + r.productivity_score + r.quality_score) / 3) * 100) / 100,
    };
  });

  // Build monthly burn rate map from assessments
  const monthBurnMap = new Map();
  for (const a of assessments) {
    const d = new Date(a.taken_at);
    const key = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
    if (!monthBurnMap.has(key)) monthBurnMap.set(key, []);
    monthBurnMap.get(key).push(a.predicted_burn_rate);
  }

  // Merge KPI months with burn rate months
  const allMonths = new Set([...kpiData.map((k) => k.month), ...monthBurnMap.keys()]);
  const kpiMap = new Map(kpiData.map((k) => [k.month, k.compositeKpi]));
  const kpiBurnRateComparison = [...allMonths]
    .sort()
    .map((month) => ({
      month,
      compositeKpi: kpiMap.get(month) ?? null,
      avgBurnRate: monthBurnMap.has(month) ? avg(monthBurnMap.get(month)) : null,
    }));

  return {
    anonymousId: anonymousId(userId),
    department: profile.department_name,
    designation: profile.designation,
    shiftType: profile.shift_type,
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
    kpiData,
    kpiBurnRateComparison,
  };
}

export async function getDepartmentAnalytics(departmentId) {
  const department = await departmentRepo.findDepartmentById(departmentId);
  if (!department) throw ApiError.notFound('Department not found');

  const [allRows, deptKpiRows] = await Promise.all([
    assessmentRepo.listAssessmentsByDepartment(departmentId),
    kpiRepo.listKpisByDepartment(departmentId),
  ]);

  if (allRows.length === 0 && deptKpiRows.length === 0) {
    return {
      department,
      summary: { avgBurnRate: 0, medianBurnRate: 0, totalEmployees: 0, highRiskCount: 0, highRiskPercent: 0, highestDesignation: null },
      employeeBurnRates: [],
      byDesignation: [],
      byShift: [],
      riskDistribution: EMPTY_DISTRIBUTION(),
      burnRateOverTime: [],
      avgKpiOverTime: [],
      kpiBurnRateOverTime: [],
    };
  }

  // --- Latest assessment per user (for summary cards + employee scatter) ---
  const latestByUser = new Map();
  for (const r of allRows) {
    const prev = latestByUser.get(r.user_id);
    if (!prev || new Date(r.taken_at) > new Date(prev.taken_at)) {
      latestByUser.set(r.user_id, r);
    }
  }
  const latestRows = [...latestByUser.values()];

  const burnRates = latestRows.map((r) => r.predicted_burn_rate).sort((a, b) => a - b);
  const avgBurnRate = avg(burnRates);
  const medianBurnRate = burnRates.length % 2 === 0
    ? (burnRates[burnRates.length / 2 - 1] + burnRates[burnRates.length / 2]) / 2
    : burnRates[Math.floor(burnRates.length / 2)];

  const riskDist = EMPTY_DISTRIBUTION();
  let highRiskCount = 0;
  for (const r of latestRows) {
    riskDist[r.risk_level] += 1;
    if (r.risk_level === 'high' || r.risk_level === 'critical') highRiskCount += 1;
  }

  // --- By designation ---
  const desigMap = new Map();
  for (const r of latestRows) {
    if (!desigMap.has(r.designation)) desigMap.set(r.designation, []);
    desigMap.get(r.designation).push(r.predicted_burn_rate);
  }
  const byDesignation = [...desigMap.entries()]
    .map(([designation, rates]) => ({ designation, avgBurnRate: avg(rates), count: rates.length }))
    .sort((a, b) => a.designation - b.designation);

  const highestDesig = byDesignation.reduce(
    (best, d) => (!best || d.avgBurnRate > best.avgBurnRate ? d : best), null
  );

  // --- By shift ---
  const shiftMap = new Map();
  for (const r of latestRows) {
    if (!shiftMap.has(r.shift_type)) shiftMap.set(r.shift_type, []);
    shiftMap.get(r.shift_type).push(r.predicted_burn_rate);
  }
  const byShift = [...shiftMap.entries()]
    .map(([shift, rates]) => ({ shift, avgBurnRate: avg(rates), count: rates.length }))
    .sort((a, b) => a.shift.localeCompare(b.shift));

  // --- Employee-level scatter data (latest per user) ---
  const employeeBurnRates = latestRows.map((r) => ({
    anonymousId: anonymousId(r.user_id),
    burnRate: r.predicted_burn_rate,
    riskLevel: r.risk_level,
    designation: r.designation,
    shiftType: r.shift_type,
  }));

  // --- Monthly burn rate trend for the department ---
  const monthMap = new Map();
  for (const r of allRows) {
    const d = new Date(r.taken_at);
    const key = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
    if (!monthMap.has(key)) monthMap.set(key, []);
    monthMap.get(key).push(r.predicted_burn_rate);
  }
  const burnRateOverTime = [...monthMap.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, rates]) => ({ month, avgBurnRate: avg(rates), assessmentCount: rates.length }));

  // --- Avg KPI over time (department-wide monthly averages) ---
  const kpiMonthMap = new Map();
  for (const r of deptKpiRows) {
    const d = new Date(r.period_date);
    const key = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
    if (!kpiMonthMap.has(key)) kpiMonthMap.set(key, []);
    kpiMonthMap.get(key).push(r);
  }
  const avgKpiOverTime = [...kpiMonthMap.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, rows]) => ({
      month,
      attendanceRate: avg(rows.map((r) => r.attendance_rate)),
      productivityScore: avg(rows.map((r) => r.productivity_score)),
      qualityScore: avg(rows.map((r) => r.quality_score)),
      overtimeHours: avg(rows.map((r) => r.overtime_hours)),
      tasksCompleted: Math.round(avg(rows.map((r) => r.tasks_completed))),
      daysAbsent: Math.round(avg(rows.map((r) => r.days_absent))),
      compositeKpi: avg(rows.map((r) => (r.attendance_rate + r.productivity_score + r.quality_score) / 3)),
    }));

  // --- KPI vs Burn Rate over time ---
  const burnMonthMap = new Map(burnRateOverTime.map((b) => [b.month, b.avgBurnRate]));
  const kpiCompMap = new Map(avgKpiOverTime.map((k) => [k.month, k.compositeKpi]));
  const allMonths = new Set([...burnMonthMap.keys(), ...kpiCompMap.keys()]);
  const kpiBurnRateOverTime = [...allMonths]
    .sort()
    .map((month) => ({
      month,
      compositeKpi: kpiCompMap.get(month) ?? null,
      avgBurnRate: burnMonthMap.get(month) ?? null,
    }));

  return {
    department,
    summary: {
      avgBurnRate: Math.round(avgBurnRate * 100) / 100,
      medianBurnRate: Math.round(medianBurnRate * 100) / 100,
      totalEmployees: latestRows.length,
      highRiskCount,
      highRiskPercent: latestRows.length > 0 ? Math.round((highRiskCount / latestRows.length) * 100) : 0,
      highestDesignation: highestDesig ? { designation: highestDesig.designation, avgBurnRate: highestDesig.avgBurnRate } : null,
    },
    employeeBurnRates,
    byDesignation,
    byShift,
    riskDistribution: riskDist,
    burnRateOverTime,
    avgKpiOverTime,
    kpiBurnRateOverTime,
  };
}

const DEPT_SORT_FIELDS = {
  burnRate: (a, b) => b.predicted_burn_rate - a.predicted_burn_rate,
  burnRateAsc: (a, b) => a.predicted_burn_rate - b.predicted_burn_rate,
  designation: (a, b) => a.designation - b.designation,
  shift: (a, b) => a.shift_type.localeCompare(b.shift_type),
  lastAssessment: (a, b) => new Date(b.taken_at) - new Date(a.taken_at),
  assessmentCount: (a, b) => (b._count ?? 0) - (a._count ?? 0),
  riskLevel: (a, b) => {
    const order = { critical: 0, high: 1, moderate: 2, low: 3 };
    return (order[a.risk_level] ?? 4) - (order[b.risk_level] ?? 4);
  },
};

export async function getDepartmentDrillDown({
  departmentId, page, limit,
  sort = 'burnRate', order = 'desc',
  riskLevel: filterRisk, shiftType: filterShift, designation: filterDesig,
}) {
  const department = await departmentRepo.findDepartmentById(departmentId);
  if (!department) throw ApiError.notFound('Department not found');

  const latestPerUser = await assessmentRepo.listLatestAssessmentsPerUser();
  let filtered = latestPerUser.filter((r) => r.department_id === departmentId);

  // Filters
  if (filterRisk) filtered = filtered.filter((r) => r.risk_level === filterRisk);
  if (filterShift) filtered = filtered.filter((r) => r.shift_type === filterShift);
  if (filterDesig != null) filtered = filtered.filter((r) => r.designation === Number(filterDesig));

  // Counts (needed before pagination for sort-by-count)
  const userIds = filtered.map((r) => r.user_id);
  const countsMap = await assessmentRepo.countAssessmentsByUsers(userIds);
  for (const r of filtered) r._count = countsMap.get(r.user_id) ?? 0;

  // Sort
  let sortFn = DEPT_SORT_FIELDS[sort] ?? DEPT_SORT_FIELDS.burnRate;
  if (order === 'asc' && sort === 'burnRate') sortFn = DEPT_SORT_FIELDS.burnRateAsc;
  else if (order === 'asc' && DEPT_SORT_FIELDS[sort]) {
    const baseFn = DEPT_SORT_FIELDS[sort];
    sortFn = (a, b) => baseFn(b, a);
  }
  filtered.sort(sortFn);

  const pag = parsePagination({ page, limit }, { defaultLimit: 20, maxLimit: 100 });
  const window = filtered.slice(pag.offset, pag.offset + pag.limit);

  return {
    department,
    employees: window.map((r) => ({
      userId: r.user_id,
      anonymousId: anonymousId(r.user_id),
      designation: r.designation,
      shiftType: r.shift_type,
      latestBurnRate: r.predicted_burn_rate,
      riskLevel: r.risk_level,
      lastAssessmentDate: r.taken_at,
      assessmentCount: r._count,
    })),
    pagination: buildPaginationMeta({
      page: pag.page,
      limit: pag.limit,
      totalItems: filtered.length,
    }),
  };
}
