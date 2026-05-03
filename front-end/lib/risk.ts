import type { RiskLevel } from "./types";

export const RISK_COLORS: Record<RiskLevel, string> = {
  low: "var(--color-risk-low)",
  moderate: "var(--color-risk-moderate)",
  high: "var(--color-risk-high)",
  critical: "var(--color-risk-critical)",
};

export const RISK_HEX: Record<RiskLevel, string> = {
  low: "#6b8f5f",
  moderate: "#c69a3d",
  high: "#c96442",
  critical: "#b53333",
};

export const RISK_LABELS: Record<RiskLevel, string> = {
  low: "Low",
  moderate: "Moderate",
  high: "High",
  critical: "Critical",
};

export const RISK_BG_CLASSES: Record<RiskLevel, string> = {
  low: "bg-risk-low",
  moderate: "bg-risk-moderate",
  high: "bg-risk-high",
  critical: "bg-risk-critical",
};

export function classifyBurnRate(rate: number): RiskLevel {
  if (rate < 0.35) return "low";
  if (rate < 0.55) return "moderate";
  if (rate < 0.8) return "high";
  return "critical";
}

export function formatBurnRate(rate: number): string {
  return rate.toFixed(2);
}
