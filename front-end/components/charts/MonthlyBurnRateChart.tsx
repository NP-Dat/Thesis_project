"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import type { MonthlyBurnRate } from "@/lib/types";
import { RISK_HEX } from "@/lib/risk";

interface Props {
  data: MonthlyBurnRate[];
}

export function MonthlyBurnRateChart({ data }: Props) {
  const formatted = data.map((d) => {
    const [year, month] = d.month.split("-");
    const label = new Date(Number(year), Number(month) - 1).toLocaleDateString(
      "en-US",
      { month: "short", year: "2-digit" }
    );
    return { ...d, label };
  });

  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart
        data={formatted}
        margin={{ top: 8, right: 16, left: 0, bottom: 0 }}
      >
        <defs>
          <linearGradient id="burnGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#c96442" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#c96442" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0eee6" />
        <XAxis dataKey="label" tick={{ fontSize: 12, fill: "#87867f" }} />
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
            `${(v * 100).toFixed(1)}% (${entry.payload.assessmentCount} assessments)`,
            "Avg Burn Rate",
          ]}
        />
        <ReferenceLine y={0.35} stroke={RISK_HEX.low} strokeDasharray="4 4" />
        <ReferenceLine
          y={0.55}
          stroke={RISK_HEX.moderate}
          strokeDasharray="4 4"
        />
        <ReferenceLine y={0.8} stroke={RISK_HEX.high} strokeDasharray="4 4" />
        <Area
          type="monotone"
          dataKey="avgBurnRate"
          stroke="#c96442"
          strokeWidth={2.5}
          fill="url(#burnGradient)"
          dot={{ r: 4, fill: "#c96442", stroke: "#faf9f5", strokeWidth: 2 }}
          activeDot={{ r: 6 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
