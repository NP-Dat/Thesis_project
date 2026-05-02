/**
 * Build the anonymised employee identifier shown on admin drill-down.
 * Format: "Worker #0042"
 */
export function anonymousId(userId) {
  return `Worker #${String(userId).padStart(4, '0')}`;
}
