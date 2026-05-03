import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { listAlerts, markAlertRead, markAllAlertsRead } from "../api/alerts";
import type { AlertsFilters } from "../types";

export function useAlerts(filters: AlertsFilters = {}) {
  return useQuery({
    queryKey: ["alerts", filters],
    queryFn: () => listAlerts(filters),
  });
}

export function useMarkAlertRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (alertId: number) => markAlertRead(alertId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["alerts"] });
      qc.invalidateQueries({ queryKey: ["dashboard", "admin"] });
    },
  });
}

export function useMarkAllAlertsRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => markAllAlertsRead(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["alerts"] });
      qc.invalidateQueries({ queryKey: ["dashboard", "admin"] });
    },
  });
}
