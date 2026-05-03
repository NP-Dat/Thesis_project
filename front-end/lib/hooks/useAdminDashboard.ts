import { useQuery } from "@tanstack/react-query";
import { getAdminDashboard } from "../api/admin";

export function useAdminDashboard() {
  return useQuery({
    queryKey: ["dashboard", "admin"],
    queryFn: getAdminDashboard,
  });
}
