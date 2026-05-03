import { cn } from "@/lib/utils";
import type { RiskLevel } from "@/lib/types";
import { RISK_LABELS } from "@/lib/risk";

const riskStyles: Record<RiskLevel, string> = {
  low: "bg-risk-low/15 text-risk-low",
  moderate: "bg-risk-moderate/15 text-risk-moderate",
  high: "bg-risk-high/15 text-risk-high",
  critical: "bg-risk-critical/15 text-risk-critical",
};

interface BadgeProps {
  level: RiskLevel;
  className?: string;
}

export function Badge({ level, className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium",
        riskStyles[level],
        className
      )}
    >
      {RISK_LABELS[level]}
    </span>
  );
}
