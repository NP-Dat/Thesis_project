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
import type { DepartmentKpi } from "@/lib/types";

interface Props {
  data: DepartmentKpi[];
}

const COLORS = ["#6b8f5f", "#4a7fb5", "#8b6baf", "#c69a3d", "#c96442", "#5a9e8f"];

export function DepartmentKpiBarChart({ data }: Props) {
  const formatted = data.map((d) => ({
    name: d.name,
    avgCompositeKpi: d.avgCompositeKpi,
    avgAttendance: d.avgAttendance,
    avgProductivity: d.avgProductivity,
    avgQuality: d.avgQuality,
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart
        data={formatted}
        margin={{ top: 8, right: 16, left: 0, bottom: 0 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#f0eee6" />
        <XAxis
          dataKey="name"
          tick={{ fontSize: 11, fill: "#87867f" }}
          interval={0}
          angle={-20}
          textAnchor="end"
          height={60}
        />
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
          formatter={(_v: number, _name: string, entry) => {
            const p = entry.payload;
            return [
              `${p.avgCompositeKpi.toFixed(1)} (Att: ${p.avgAttendance.toFixed(1)}, Prod: ${p.avgProductivity.toFixed(1)}, Qual: ${p.avgQuality.toFixed(1)})`,
              "Avg KPI",
            ];
          }}
        />
        <Bar dataKey="avgCompositeKpi" radius={[4, 4, 0, 0]} barSize={48}>
          {formatted.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
