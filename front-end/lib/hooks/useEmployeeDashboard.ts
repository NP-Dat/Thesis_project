import { useQuery } from "@tanstack/react-query";
import { getEmployeeDashboard } from "../api/employee";

export function useEmployeeDashboard() {
  return useQuery({
    queryKey: ["dashboard", "employee"],
    queryFn: getEmployeeDashboard,
  });
}
