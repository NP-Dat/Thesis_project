import { apiFetch } from "./client";
import type { Alert, AlertsFilters, Pagination } from "../types";

export function listAlerts(filters: AlertsFilters = {}) {
  const params = new URLSearchParams();
  if (filters.isRead !== undefined) params.set("isRead", String(filters.isRead));
  if (filters.alertType) params.set("alertType", filters.alertType);
  if (filters.page) params.set("page", String(filters.page));
  if (filters.limit) params.set("limit", String(filters.limit));

  const qs = params.toString();
  return apiFetch<{ alerts: Alert[]; pagination: Pagination }>(
    `/alerts${qs ? `?${qs}` : ""}`
  );
}

export function markAlertRead(alertId: number) {
  return apiFetch<{ id: number; isRead: boolean }>(
    `/alerts/${alertId}/read`,
    { method: "PATCH" }
  );
}

export function markAllAlertsRead() {
  return apiFetch<{ updatedCount: number }>("/alerts/read-all", {
    method: "PATCH",
  });
}
