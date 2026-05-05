"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import type { KpiPoint } from "@/lib/types";

interface Props {
  data: KpiPoint[];
}

const SERIES = [
  { key: "attendanceRate" as const, label: "Attendance", color: "#6b8f5f" },
  { key: "productivityScore" as const, label: "Productivity", color: "#4a7fb5" },
  { key: "qualityScore" as const, label: "Quality", color: "#8b6baf" },
];

export function KpiLineChart({ data }: Props) {
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
      <LineChart
        data={formatted}
        margin={{ top: 8, right: 16, left: 0, bottom: 0 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#f0eee6" />
        <XAxis dataKey="label" tick={{ fontSize: 12, fill: "#87867f" }} />
        <YAxis
          domain={[0, 100]}
          tick={{ fontSize: 12, fill: "#87867f" }}
          tickFormatter={(v: number) => `${v}`}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "#faf9f5",
            border: "1px solid #f0eee6",
            borderRadius: 8,
            fontSize: 13,
          }}
          formatter={(v: number, name: string) => [`${v.toFixed(1)}`, name]}
        />
        <Legend
          wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
        />
        {SERIES.map((s) => (
          <Line
            key={s.key}
            type="monotone"
            dataKey={s.key}
            name={s.label}
            stroke={s.color}
            strokeWidth={2}
            dot={{ r: 3, fill: s.color, stroke: "#faf9f5", strokeWidth: 2 }}
            activeDot={{ r: 5 }}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}
