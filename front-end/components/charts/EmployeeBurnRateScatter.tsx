"use client";

import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Cell,
} from "recharts";
import type { DepartmentAnalyticsEmployee } from "@/lib/types";
import { RISK_HEX } from "@/lib/risk";
import type { RiskLevel } from "@/lib/types";

interface Props {
  data: DepartmentAnalyticsEmployee[];
}

export function EmployeeBurnRateScatter({ data }: Props) {
  const points = data.map((d, i) => ({
    x: i + 1,
    y: d.burnRate,
    id: d.anonymousId,
    risk: d.riskLevel,
    designation: d.designation,
    shift: d.shiftType,
  }));

  return (
    <ResponsiveContainer width="100%" height={320}>
      <ScatterChart margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0eee6" />
        <XAxis
          type="number"
          dataKey="x"
          tick={{ fontSize: 12, fill: "#87867f" }}
          label={{
            value: "Employee #",
            position: "insideBottomRight",
            offset: -4,
            fill: "#87867f",
            fontSize: 12,
          }}
        />
        <YAxis
          type="number"
          dataKey="y"
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
          content={({ active, payload }) => {
            if (!active || !payload?.length) return null;
            const d = payload[0].payload;
            return (
              <div className="bg-ivory border border-cream rounded-lg p-3 text-sm shadow-sm">
                <p className="font-medium text-near-black">{d.id}</p>
                <p className="text-stone">
                  Burn Rate: {(d.y * 100).toFixed(1)}%
                </p>
                <p className="text-stone">
                  Level {d.designation} · {d.shift}
                </p>
              </div>
            );
          }}
        />
        <ReferenceLine y={0.35} stroke={RISK_HEX.low} strokeDasharray="4 4" />
        <ReferenceLine
          y={0.55}
          stroke={RISK_HEX.moderate}
          strokeDasharray="4 4"
        />
        <ReferenceLine y={0.8} stroke={RISK_HEX.high} strokeDasharray="4 4" />
        <Scatter data={points}>
          {points.map((pt, i) => (
            <Cell
              key={i}
              fill={RISK_HEX[pt.risk as RiskLevel]}
              r={5}
            />
          ))}
        </Scatter>
      </ScatterChart>
    </ResponsiveContainer>
  );
}
