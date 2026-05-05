import { apiFetch } from "./client";
import type {
  AdminDashboard,
  DepartmentDetail,
  DepartmentAnalytics,
  EmployeeListResponse,
  EmployeeAdminDetail,
  EmployeeSortField,
} from "../types";

export function getAdminDashboard() {
  return apiFetch<AdminDashboard>("/dashboard/admin");
}

export function getDepartmentDetail(
  id: number,
  page = 1,
  limit = 20,
  opts?: {
    sort?: string;
    order?: "asc" | "desc";
    riskLevel?: string;
    shiftType?: string;
    designation?: string;
  }
) {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });
  if (opts?.sort) params.set("sort", opts.sort);
  if (opts?.order) params.set("order", opts.order);
  if (opts?.riskLevel) params.set("riskLevel", opts.riskLevel);
  if (opts?.shiftType) params.set("shiftType", opts.shiftType);
  if (opts?.designation) params.set("designation", opts.designation);
  return apiFetch<DepartmentDetail>(
    `/dashboard/admin/department/${id}?${params.toString()}`
  );
}

export function getDepartmentAnalytics(id: number) {
  return apiFetch<DepartmentAnalytics>(
    `/dashboard/admin/department/${id}/analytics`
  );
}

export function getEmployeeList(
  page = 1,
  limit = 20,
  sort: EmployeeSortField = "burnRate",
  order: "asc" | "desc" = "desc"
) {
  return apiFetch<EmployeeListResponse>(
    `/dashboard/admin/employees?page=${page}&limit=${limit}&sort=${sort}&order=${order}`
  );
}

export function getEmployeeDetail(userId: number) {
  return apiFetch<EmployeeAdminDetail>(`/dashboard/admin/employees/${userId}`);
}
