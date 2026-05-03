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

interface SectionScoreChartProps {
  personalScore: number;
  workScore: number;
}

export function SectionScoreChart({
  personalScore,
  workScore,
}: SectionScoreChartProps) {
  const data = [
    { name: "Personal Burnout", score: personalScore },
    { name: "Work-Related", score: workScore },
  ];

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0eee6" />
        <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#87867f" }} />
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
          formatter={(v) => [`${Number(v).toFixed(1)}`, "Score"]}
        />
        <Bar dataKey="score" fill="#c96442" radius={[4, 4, 0, 0]} barSize={48} />
      </BarChart>
    </ResponsiveContainer>
  );
}
