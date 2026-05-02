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

export async function adminDepartment(req, res) {
  const data = await dashboardService.getDepartmentDrillDown({
    departmentId: req.params.departmentId,
    page: req.query.page,
    limit: req.query.limit,
  });
  return ok(res, data);
}
