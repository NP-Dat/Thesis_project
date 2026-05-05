import { useQuery } from "@tanstack/react-query";
import { getEmployeeList, getEmployeeDetail } from "../api/admin";
import type { EmployeeSortField } from "../types";

export function useEmployeeList(
  page = 1,
  sort: EmployeeSortField = "burnRate",
  order: "asc" | "desc" = "desc"
) {
  return useQuery({
    queryKey: ["employees", page, sort, order],
    queryFn: () => getEmployeeList(page, 20, sort, order),
  });
}

export function useEmployeeDetail(userId: number) {
  return useQuery({
    queryKey: ["employee", userId],
    queryFn: () => getEmployeeDetail(userId),
    enabled: userId > 0,
  });
}
