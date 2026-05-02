import { env } from '../config/env.js';
import * as alertRepo from '../models/mysql/alert.repo.js';
import * as assessmentRepo from '../models/mysql/assessment-result.repo.js';
import { ApiError } from '../utils/api-error.js';
import { anonymousId } from '../utils/anonymous-id.js';
import { parsePagination, buildPaginationMeta } from '../utils/pagination.js';

function alertToDto(row) {
  return {
    id: row.id,
    assessmentResultId: row.assessment_result_id,
    alertType: row.alert_type,
    employeeName: anonymousId(row.user_id),
    department: row.department_name ?? null,
    message: row.message,
    isRead: !!row.is_read,
    createdAt: row.created_at,
  };
}

/**
 * Run the two alert rules described in documents/general-flow.md (Flow 5).
 * Designed to be invoked inside the same MySQL transaction that just inserted
 * the assessment_results row.
 */
export async function maybeCreateAlerts({ userId, assessmentId, conn }) {
  const created = [];

  const current = await assessmentRepo.findAssessmentById(assessmentId, conn);
  if (!current) return created;

  if (current.risk_level === 'high' || current.risk_level === 'critical') {
    const alertType = current.risk_level === 'critical' ? 'critical_risk' : 'high_risk';
    const message =
      current.risk_level === 'critical'
        ? `Burn rate reached ${current.predicted_burn_rate.toFixed(2)} — immediate intervention recommended.`
        : `Burn rate reached ${current.predicted_burn_rate.toFixed(2)} — high burnout risk detected.`;
    const id = await alertRepo.createAlert(
      { assessment_result_id: assessmentId, user_id: userId, alert_type: alertType, message },
      conn
    );
    created.push(id);
  }

  const previous = await assessmentRepo.findPreviousAssessmentByUser(
    userId,
    assessmentId,
    conn
  );
  if (previous) {
    const delta = current.predicted_burn_rate - previous.predicted_burn_rate;
    if (delta >= env.ALERT_TREND_SPIKE_DELTA) {
      const message = `Burn rate jumped from ${previous.predicted_burn_rate.toFixed(2)} to ${current.predicted_burn_rate.toFixed(2)} (+${delta.toFixed(2)}).`;
      const id = await alertRepo.createAlert(
        {
          assessment_result_id: assessmentId,
          user_id: userId,
          alert_type: 'trend_spike',
          message,
        },
        conn
      );
      created.push(id);
    }
  }

  return created;
}

export async function listAlerts({ isRead, alertType, page, limit }) {
  const pag = parsePagination({ page, limit }, { defaultLimit: 20, maxLimit: 100 });
  const { rows, total } = await alertRepo.listAlerts({
    isRead,
    alertType,
    limit: pag.limit,
    offset: pag.offset,
  });
  return {
    alerts: rows.map(alertToDto),
    pagination: buildPaginationMeta({ page: pag.page, limit: pag.limit, totalItems: total }),
  };
}

export async function listRecentAlerts({ limit = 10 } = {}) {
  const rows = await alertRepo.listRecentAlerts({ limit });
  return rows.map(alertToDto);
}

export async function markAlertRead(id) {
  const ok = await alertRepo.markAlertRead(id);
  if (!ok) throw ApiError.notFound('Alert not found');
  return { id, isRead: true };
}

export async function markAllAlertsRead() {
  const updatedCount = await alertRepo.markAllAlertsRead();
  return { updatedCount };
}
