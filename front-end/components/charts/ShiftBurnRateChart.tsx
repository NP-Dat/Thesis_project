"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import type { ShiftBurnRate } from "@/lib/types";
import { RISK_HEX } from "@/lib/risk";

interface Props {
  data: ShiftBurnRate[];
}

const SHIFT_COLORS: Record<string, string> = {
  Day: "#6b8f5f",
  Night: "#c96442",
  Rotating: "#c69a3d",
};

function barColor(shift: string, rate: number) {
  if (SHIFT_COLORS[shift]) return SHIFT_COLORS[shift];
  if (rate >= 0.8) return RISK_HEX.critical;
  if (rate >= 0.55) return RISK_HEX.high;
  return RISK_HEX.moderate;
}

export function ShiftBurnRateChart({ data }: Props) {
  const formatted = data.map((d) => ({
    name: `${d.shift} Shift`,
    avgBurnRate: d.avgBurnRate,
    count: d.count,
    shift: d.shift,
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart
        data={formatted}
        margin={{ top: 8, right: 16, left: 0, bottom: 0 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#f0eee6" />
        <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#87867f" }} />
        <YAxis
          domain={[0, 1]}
          tick={{ fontSize: 12, fill: "#87867f" }}
          tickFormatter={(v: number) => `${(v * 100).toFixed(0)}%`}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "#faf9f5",
            border: "1px solid #f0eee6",
            borderRadius: 8,
            fontSize: 13,
          }}
          formatter={(v: number, _name: string, entry) => [
            `${(v * 100).toFixed(1)}%  (${entry.payload.count} employees)`,
            "Avg Burn Rate",
          ]}
        />
        <Bar dataKey="avgBurnRate" radius={[4, 4, 0, 0]} barSize={56}>
          {formatted.map((entry, i) => (
            <Cell key={i} fill={barColor(entry.shift, entry.avgBurnRate)} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
