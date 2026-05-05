"use client";

import {
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import type { KpiBurnRatePoint } from "@/lib/types";

interface Props {
  data: KpiBurnRatePoint[];
}

export function KpiBurnRateComparisonChart({ data }: Props) {
  const formatted = data.map((d) => {
    const [year, month] = d.month.split("-");
    const label = new Date(Number(year), Number(month) - 1).toLocaleDateString(
      "en-US",
      { month: "short", year: "2-digit" }
    );
    return {
      label,
      compositeKpi: d.compositeKpi,
      burnRate: d.avgBurnRate != null ? d.avgBurnRate * 100 : null,
    };
  });

  return (
    <ResponsiveContainer width="100%" height={300}>
      <ComposedChart
        data={formatted}
        margin={{ top: 8, right: 16, left: 0, bottom: 0 }}
      >
        <defs>
          <linearGradient id="kpiGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#4a7fb5" stopOpacity={0.15} />
            <stop offset="95%" stopColor="#4a7fb5" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0eee6" />
        <XAxis dataKey="label" tick={{ fontSize: 12, fill: "#87867f" }} />
        <YAxis
          yAxisId="left"
          domain={[0, 100]}
          tick={{ fontSize: 12, fill: "#87867f" }}
          tickFormatter={(v: number) => `${v}`}
          label={{
            value: "Burn Rate %",
            angle: -90,
            position: "insideLeft",
            style: { fontSize: 11, fill: "#c96442" },
          }}
        />
        <YAxis
          yAxisId="right"
          orientation="right"
          domain={[0, 100]}
          tick={{ fontSize: 12, fill: "#87867f" }}
          tickFormatter={(v: number) => `${v}`}
          label={{
            value: "Composite KPI",
            angle: 90,
            position: "insideRight",
            style: { fontSize: 11, fill: "#4a7fb5" },
          }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "#faf9f5",
            border: "1px solid #f0eee6",
            borderRadius: 8,
            fontSize: 13,
          }}
          formatter={(v: number | null, name: string) => {
            if (v == null) return ["—", name];
            return [`${v.toFixed(1)}`, name];
          }}
        />
        <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
        <Line
          yAxisId="left"
          type="monotone"
          dataKey="burnRate"
          name="Burn Rate %"
          stroke="#c96442"
          strokeWidth={2.5}
          dot={{ r: 4, fill: "#c96442", stroke: "#faf9f5", strokeWidth: 2 }}
          activeDot={{ r: 6 }}
          connectNulls
        />
        <Area
          yAxisId="right"
          type="monotone"
          dataKey="compositeKpi"
          name="Composite KPI"
          stroke="#4a7fb5"
          strokeWidth={2}
          fill="url(#kpiGradient)"
          dot={{ r: 3, fill: "#4a7fb5", stroke: "#faf9f5", strokeWidth: 2 }}
          activeDot={{ r: 5 }}
          connectNulls
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
