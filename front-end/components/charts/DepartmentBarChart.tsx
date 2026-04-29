"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface DeptData {
  department: string;
  avgBurnRate: number;
}

interface DepartmentBarChartProps {
  data: DeptData[];
}

export default function DepartmentBarChart({ data }: DepartmentBarChartProps) {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0eee6" />
        <XAxis
          dataKey="department"
          tick={{ fill: "#87867f", fontSize: 13 }}
          stroke="#e8e6dc"
        />
        <YAxis
          domain={[0, 1]}
          tick={{ fill: "#87867f", fontSize: 13 }}
          stroke="#e8e6dc"
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "#faf9f5",
            border: "1px solid #f0eee6",
            borderRadius: 8,
            fontSize: 14,
          }}
          formatter={(value) => [Number(value).toFixed(2), "Avg Burn Rate"]}
        />
        <Bar dataKey="avgBurnRate" fill="#c96442" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
