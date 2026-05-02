import { ok } from '../utils/api-response.js';
import * as alertService from '../services/alert.service.js';

export async function list(req, res) {
  const data = await alertService.listAlerts({
    isRead: req.query.isRead,
    alertType: req.query.alertType,
    page: req.query.page,
    limit: req.query.limit,
  });
  return ok(res, data);
}

export async function markRead(req, res) {
  const data = await alertService.markAlertRead(req.params.alertId);
  return ok(res, data);
}

export async function markAllRead(_req, res) {
  const data = await alertService.markAllAlertsRead();
  return ok(res, data);
}
