import { useQuery } from "@tanstack/react-query";
import { getDepartmentDetail, getDepartmentAnalytics } from "../api/admin";

export interface DepartmentQueryOpts {
  sort?: string;
  order?: "asc" | "desc";
  riskLevel?: string;
  shiftType?: string;
  designation?: string;
}

export function useDepartment(id: number, page = 1, opts?: DepartmentQueryOpts) {
  return useQuery({
    queryKey: ["department", id, page, opts],
    queryFn: () => getDepartmentDetail(id, page, 20, opts),
    enabled: id > 0,
  });
}

export function useDepartmentAnalytics(id: number) {
  return useQuery({
    queryKey: ["department-analytics", id],
    queryFn: () => getDepartmentAnalytics(id),
    enabled: id > 0,
  });
}
