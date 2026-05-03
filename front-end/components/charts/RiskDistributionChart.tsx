"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import type { RiskDistribution } from "@/lib/types";
import { RISK_HEX, RISK_LABELS } from "@/lib/risk";
import type { RiskLevel } from "@/lib/types";

interface RiskDistributionChartProps {
  data: RiskDistribution;
}

export function RiskDistributionChart({ data }: RiskDistributionChartProps) {
  const entries = (Object.keys(data) as RiskLevel[]).map((key) => ({
    name: RISK_LABELS[key],
    value: data[key],
    color: RISK_HEX[key],
  }));

  return (
    <ResponsiveContainer width="100%" height={280}>
      <PieChart>
        <Pie
          data={entries}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={95}
          paddingAngle={2}
          stroke="none"
        >
          {entries.map((entry, i) => (
            <Cell key={i} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            backgroundColor: "#faf9f5",
            border: "1px solid #f0eee6",
            borderRadius: 8,
            fontSize: 13,
          }}
        />
        <Legend
          verticalAlign="bottom"
          iconType="circle"
          iconSize={10}
          formatter={(value: string) => (
            <span style={{ color: "#5e5d59", fontSize: 13 }}>{value}</span>
          )}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
