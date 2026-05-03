import { useQuery } from "@tanstack/react-query";
import { getResources } from "../api/employee";

export function useResources(riskLevel: string, enabled = true) {
  return useQuery({
    queryKey: ["resources", riskLevel],
    queryFn: () => getResources(riskLevel),
    enabled,
  });
}
