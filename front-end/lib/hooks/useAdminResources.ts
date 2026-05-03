import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  listAdminResources,
  createResource,
  updateResource,
  deleteResource,
} from "../api/resources";

export function useAdminResources() {
  return useQuery({
    queryKey: ["admin", "resources"],
    queryFn: listAdminResources,
  });
}

export function useCreateResource() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createResource,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "resources"] }),
  });
}

export function useUpdateResource() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      ...body
    }: {
      id: number;
      title?: string;
      description?: string;
      url?: string;
      minRiskLevel?: string;
      isActive?: boolean;
    }) => updateResource(id, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "resources"] }),
  });
}

export function useDeleteResource() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteResource(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "resources"] }),
  });
}
