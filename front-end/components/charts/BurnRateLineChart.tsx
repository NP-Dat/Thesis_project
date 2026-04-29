"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface DataPoint {
  date: string;
  burnRate: number;
}

interface BurnRateLineChartProps {
  data: DataPoint[];
}

export default function BurnRateLineChart({ data }: BurnRateLineChartProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0eee6" />
        <XAxis
          dataKey="date"
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
          formatter={(value) => [Number(value).toFixed(2), "Burn Rate"]}
        />
        <Line
          type="monotone"
          dataKey="burnRate"
          stroke="#c96442"
          strokeWidth={2.5}
          dot={{ fill: "#c96442", r: 4 }}
          activeDot={{ r: 6, fill: "#d97757" }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
