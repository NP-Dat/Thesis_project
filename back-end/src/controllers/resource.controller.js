import { ok, created } from '../utils/api-response.js';
import * as resourceService from '../services/resource.service.js';

export async function listForEmployee(req, res) {
  const resources = await resourceService.listResourcesForEmployee({
    userId: req.user.id,
    riskLevel: req.query.riskLevel,
  });
  return ok(res, { resources });
}

export async function listForAdmin(_req, res) {
  const resources = await resourceService.listAllResourcesForAdmin();
  return ok(res, { resources });
}

export async function create(req, res) {
  const data = await resourceService.createResourceForAdmin(req.body);
  return created(res, data);
}

export async function update(req, res) {
  const data = await resourceService.updateResourceForAdmin(
    req.params.resourceId,
    req.body
  );
  return ok(res, data);
}

export async function remove(req, res) {
  const data = await resourceService.deleteResourceForAdmin(req.params.resourceId);
  return ok(res, data);
}
