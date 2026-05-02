/**
 * Risk-level thresholds (from documents/database_schema.txt and general-flow.md).
 *   low      → burn_rate < 0.35
 *   moderate → 0.35 ≤ burn_rate < 0.55
 *   high     → 0.55 ≤ burn_rate < 0.80
 *   critical → burn_rate ≥ 0.80
 */
export const RISK_LEVELS = ['low', 'moderate', 'high', 'critical'];

export function burnRateToRiskLevel(burnRate) {
  if (burnRate >= 0.8) return 'critical';
  if (burnRate >= 0.55) return 'high';
  if (burnRate >= 0.35) return 'moderate';
  return 'low';
}

const ORDER = { low: 0, moderate: 1, high: 2, critical: 3 };

/**
 * True if `actual` is at least as severe as `threshold`.
 */
export function meetsMinRiskLevel(actual, threshold) {
  return ORDER[actual] >= ORDER[threshold];
}

export function riskLevelRank(level) {
  return ORDER[level] ?? -1;
}
