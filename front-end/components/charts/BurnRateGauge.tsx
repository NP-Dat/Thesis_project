"use client";

import { RISK_HEX, classifyBurnRate, RISK_LABELS } from "@/lib/risk";

interface BurnRateGaugeProps {
  value: number; // 0–1
  size?: number;
}

export function BurnRateGauge({ value, size = 260 }: BurnRateGaugeProps) {
  const clamped = Math.min(Math.max(value, 0), 1);
  const risk = classifyBurnRate(clamped);
  const color = RISK_HEX[risk];

  const cx = size / 2;
  const cy = size / 2 + 10;
  const r = size / 2 - 24;
  const strokeWidth = 18;

  const startAngle = Math.PI;
  const endAngle = 0;
  const arcLength = Math.PI;

  const bgArcD = describeArc(cx, cy, r, startAngle, endAngle);

  const needleAngle = startAngle - clamped * arcLength;
  const needleLen = r - 10;
  const nx = cx + needleLen * Math.cos(needleAngle);
  const ny = cy - needleLen * Math.sin(needleAngle);

  const segments = [
    { end: 0.35, color: RISK_HEX.low },
    { end: 0.55, color: RISK_HEX.moderate },
    { end: 0.8, color: RISK_HEX.high },
    { end: 1.0, color: RISK_HEX.critical },
  ];

  let prev = 0;
  const arcs = segments.map((seg) => {
    const sA = startAngle - prev * arcLength;
    const eA = startAngle - seg.end * arcLength;
    const d = describeArc(cx, cy, r, sA, eA);
    prev = seg.end;
    return { d, color: seg.color };
  });

  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size / 2 + 40} viewBox={`0 0 ${size} ${size / 2 + 40}`}>
        <path
          d={bgArcD}
          fill="none"
          stroke="#e8e6dc"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
        {arcs.map((arc, i) => (
          <path
            key={i}
            d={arc.d}
            fill="none"
            stroke={arc.color}
            strokeWidth={strokeWidth}
            strokeLinecap="butt"
            opacity={0.25}
          />
        ))}
        <line
          x1={cx}
          y1={cy}
          x2={nx}
          y2={ny}
          stroke={color}
          strokeWidth={3}
          strokeLinecap="round"
        />
        <circle cx={cx} cy={cy} r={6} fill={color} />
        <circle cx={cx} cy={cy} r={3} fill="#faf9f5" />
      </svg>
      <div className="flex flex-col items-center -mt-2">
        <span className="text-3xl font-serif font-medium" style={{ color }}>
          {(clamped * 100).toFixed(0)}%
        </span>
        <span className="text-sm font-medium mt-1" style={{ color }}>
          {RISK_LABELS[risk]} Risk
        </span>
      </div>
    </div>
  );
}

function describeArc(
  cx: number,
  cy: number,
  r: number,
  startAngle: number,
  endAngle: number
): string {
  const x1 = cx + r * Math.cos(startAngle);
  const y1 = cy - r * Math.sin(startAngle);
  const x2 = cx + r * Math.cos(endAngle);
  const y2 = cy - r * Math.sin(endAngle);
  const sweep = startAngle > endAngle ? 1 : 0;
  const largeArc = Math.abs(startAngle - endAngle) > Math.PI ? 1 : 0;
  return `M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} ${sweep} ${x2} ${y2}`;
}
