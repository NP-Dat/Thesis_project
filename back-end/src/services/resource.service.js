import { ApiError } from '../utils/api-error.js';
import * as helpResourceRepo from '../models/mysql/help-resource.repo.js';
import * as assessmentRepo from '../models/mysql/assessment-result.repo.js';

function toDto(row) {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    url: row.url,
    minRiskLevel: row.min_risk_level,
    isActive: !!row.is_active,
    createdAt: row.created_at,
  };
}

/**
 * Public-facing variant: only returns active resources whose threshold is
 * less than or equal to the requested risk level. If no level is supplied,
 * we look up the user's latest assessment.
 */
export async function listResourcesForEmployee({ userId, riskLevel }) {
  let effectiveLevel = riskLevel;
  if (!effectiveLevel) {
    const latest = await assessmentRepo.findLatestAssessmentByUser(userId);
    effectiveLevel = latest?.risk_level ?? 'low';
  }
  const rows = await helpResourceRepo.listActiveResourcesUpTo(effectiveLevel);
  return rows.map((r) => ({
    id: r.id,
    title: r.title,
    description: r.description,
    url: r.url,
    minRiskLevel: r.min_risk_level,
  }));
}

export async function listAllResourcesForAdmin() {
  const rows = await helpResourceRepo.listAllResources();
  return rows.map(toDto);
}

export async function createResourceForAdmin(input) {
  const id = await helpResourceRepo.createResource({
    title: input.title,
    description: input.description ?? null,
    url: input.url ?? null,
    min_risk_level: input.minRiskLevel,
    is_active: input.isActive ?? true,
  });
  const row = await helpResourceRepo.findResourceById(id);
  return toDto(row);
}

export async function updateResourceForAdmin(id, input) {
  const existing = await helpResourceRepo.findResourceById(id);
  if (!existing) throw ApiError.notFound('Resource not found');

  await helpResourceRepo.updateResource(id, {
    title: input.title ?? existing.title,
    description: input.description ?? existing.description,
    url: input.url ?? existing.url,
    min_risk_level: input.minRiskLevel ?? existing.min_risk_level,
    is_active: input.isActive ?? !!existing.is_active,
  });
  const row = await helpResourceRepo.findResourceById(id);
  return toDto(row);
}

export async function deleteResourceForAdmin(id) {
  const ok = await helpResourceRepo.deleteResource(id);
  if (!ok) throw ApiError.notFound('Resource not found');
  return { message: 'Resource deleted successfully.' };
}
