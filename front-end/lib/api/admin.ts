import { apiFetch } from "./client";
import type { AdminDashboard, DepartmentDetail } from "../types";

export function getAdminDashboard() {
  return apiFetch<AdminDashboard>("/dashboard/admin");
}

export function getDepartmentDetail(id: number, page = 1, limit = 20) {
  return apiFetch<DepartmentDetail>(
    `/dashboard/admin/department/${id}?page=${page}&limit=${limit}`
  );
}
