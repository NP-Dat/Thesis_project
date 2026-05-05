import { ok } from '../utils/api-response.js';
import * as dashboardService from '../services/dashboard.service.js';

export async function employee(req, res) {
  const data = await dashboardService.getEmployeeDashboard(req.user.id);
  return ok(res, data);
}

export async function admin(_req, res) {
  const data = await dashboardService.getAdminDashboard();
  return ok(res, data);
}

export async function adminDepartmentAnalytics(req, res) {
  const data = await dashboardService.getDepartmentAnalytics(req.params.departmentId);
  return ok(res, data);
}

export async function adminDepartment(req, res) {
  const data = await dashboardService.getDepartmentDrillDown({
    departmentId: req.params.departmentId,
    page: req.query.page,
    limit: req.query.limit,
    sort: req.query.sort,
    order: req.query.order,
    riskLevel: req.query.riskLevel,
    shiftType: req.query.shiftType,
    designation: req.query.designation,
  });
  return ok(res, data);
}

export async function adminEmployees(req, res) {
  const data = await dashboardService.getAllEmployees({
    sort: req.query.sort,
    order: req.query.order,
    page: req.query.page,
    limit: req.query.limit,
  });
  return ok(res, data);
}

export async function adminEmployeeDetail(req, res) {
  const data = await dashboardService.getEmployeeDetailForAdmin(req.params.userId);
  return ok(res, data);
}
