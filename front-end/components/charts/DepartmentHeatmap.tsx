"use client";

import Link from "next/link";
import type { DepartmentSummary } from "@/lib/types";
import { classifyBurnRate, RISK_HEX, formatBurnRate } from "@/lib/risk";
import { cn } from "@/lib/utils";

interface DepartmentHeatmapProps {
  departments: DepartmentSummary[];
}

export function DepartmentHeatmap({ departments }: DepartmentHeatmapProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
      {departments.map((dept) => {
        const risk = classifyBurnRate(dept.avgBurnRate);
        const color = RISK_HEX[risk];
        return (
          <Link
            key={dept.id}
            href={`/admin/departments/${dept.id}`}
            className={cn(
              "group relative rounded-[var(--radius-card)] border border-cream p-4 transition-all",
              "hover:shadow-[0_0_0_1px_var(--color-ring-warm)] hover:border-ring-warm"
            )}
            style={{ backgroundColor: `${color}12` }}
          >
            <div
              className="absolute top-0 left-0 w-1 h-full rounded-l-[var(--radius-card)]"
              style={{ backgroundColor: color }}
            />
            <h4 className="font-medium text-sm text-near-black mb-1 pl-2">
              {dept.name}
            </h4>
            <p className="text-xs text-olive pl-2">{dept.location}</p>
            <div className="flex items-baseline gap-2 mt-3 pl-2">
              <span
                className="text-xl font-serif font-medium"
                style={{ color }}
              >
                {formatBurnRate(dept.avgBurnRate)}
              </span>
              <span className="text-xs text-stone">avg burn rate</span>
            </div>
            <div className="flex items-center gap-3 mt-2 text-xs text-olive pl-2">
              <span>{dept.employeeCount} employees</span>
              <span>{dept.highRiskCount} high risk</span>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
