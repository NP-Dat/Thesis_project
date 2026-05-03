import { apiFetch } from "./client";
import type { HelpResource } from "../types";

export function listAdminResources() {
  return apiFetch<{ resources: HelpResource[] }>("/admin/resources");
}

export function createResource(body: {
  title: string;
  description: string;
  url: string;
  minRiskLevel: string;
}) {
  return apiFetch<HelpResource>("/admin/resources", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function updateResource(
  id: number,
  body: {
    title?: string;
    description?: string;
    url?: string;
    minRiskLevel?: string;
    isActive?: boolean;
  }
) {
  return apiFetch<HelpResource>(`/admin/resources/${id}`, {
    method: "PUT",
    body: JSON.stringify(body),
  });
}

export function deleteResource(id: number) {
  return apiFetch<{ message: string }>(`/admin/resources/${id}`, {
    method: "DELETE",
  });
}
