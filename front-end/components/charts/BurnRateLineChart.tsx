"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
} from "recharts";
import type { TrendPoint } from "@/lib/types";
import { RISK_HEX } from "@/lib/risk";

interface BurnRateLineChartProps {
  data: TrendPoint[];
}

export function BurnRateLineChart({ data }: BurnRateLineChartProps) {
  const formatted = data.map((d) => ({
    ...d,
    date: new Date(d.date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={formatted} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0eee6" />
        <XAxis dataKey="date" tick={{ fontSize: 12, fill: "#87867f" }} />
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
          formatter={(v) => [`${(Number(v) * 100).toFixed(1)}%`, "Burn Rate"]}
        />
        <ReferenceLine y={0.35} stroke={RISK_HEX.low} strokeDasharray="4 4" />
        <ReferenceLine y={0.55} stroke={RISK_HEX.moderate} strokeDasharray="4 4" />
        <ReferenceLine y={0.8} stroke={RISK_HEX.high} strokeDasharray="4 4" />
        <Line
          type="monotone"
          dataKey="burnRate"
          stroke="#c96442"
          strokeWidth={2.5}
          dot={{ r: 4, fill: "#c96442", stroke: "#faf9f5", strokeWidth: 2 }}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
