import { apiFetch } from "./client";
import type { EmployeeDashboard, HelpResource } from "../types";

export function getEmployeeDashboard() {
  return apiFetch<EmployeeDashboard>("/dashboard/employee");
}

export function getResources(riskLevel: string) {
  return apiFetch<{ resources: HelpResource[] }>(
    `/resources?riskLevel=${riskLevel}`
  );
}
