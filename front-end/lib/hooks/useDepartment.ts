import { useQuery } from "@tanstack/react-query";
import { getDepartmentDetail } from "../api/admin";

export function useDepartment(id: number, page = 1) {
  return useQuery({
    queryKey: ["department", id, page],
    queryFn: () => getDepartmentDetail(id, page),
    enabled: id > 0,
  });
}
