"use client";

interface BurnRateGaugeProps {
  value: number; // 0.0 to 1.0
}

function getColor(value: number): string {
  if (value <= 0.3) return "#4a8c5c";
  if (value <= 0.6) return "#c9a227";
  if (value <= 0.8) return "#d97757";
  return "#b53333";
}

function getLabel(value: number): string {
  if (value <= 0.3) return "Low Risk";
  if (value <= 0.6) return "Moderate";
  if (value <= 0.8) return "High";
  return "Critical";
}

export default function BurnRateGauge({ value }: BurnRateGaugeProps) {
  const clampedValue = Math.min(1, Math.max(0, value));
  const angle = -90 + clampedValue * 180;
  const color = getColor(clampedValue);
  const label = getLabel(clampedValue);

  const arcPath = (startAngle: number, endAngle: number, r: number) => {
    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;
    const x1 = 150 + r * Math.cos(startRad);
    const y1 = 140 + r * Math.sin(startRad);
    const x2 = 150 + r * Math.cos(endRad);
    const y2 = 140 + r * Math.sin(endRad);
    const largeArc = endAngle - startAngle > 180 ? 1 : 0;
    return `M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2}`;
  };

  return (
    <div className="flex flex-col items-center">
      <svg viewBox="0 0 300 180" className="w-full max-w-xs">
        {/* Background arc */}
        <path
          d={arcPath(-180, 0, 110)}
          fill="none"
          stroke="#e8e6dc"
          strokeWidth="20"
          strokeLinecap="round"
        />
        {/* Value arc */}
        {clampedValue > 0 && (
          <path
            d={arcPath(-180, -180 + clampedValue * 180, 110)}
            fill="none"
            stroke={color}
            strokeWidth="20"
            strokeLinecap="round"
          />
        )}
        {/* Needle */}
        <line
          x1="150"
          y1="140"
          x2={150 + 80 * Math.cos(((angle - 90) * Math.PI) / 180)}
          y2={140 + 80 * Math.sin(((angle - 90) * Math.PI) / 180)}
          stroke="#141413"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <circle cx="150" cy="140" r="6" fill="#141413" />
        {/* Value text */}
        <text
          x="150"
          y="120"
          textAnchor="middle"
          className="font-serif"
          fontSize="36"
          fontWeight="500"
          fill="#141413"
        >
          {clampedValue.toFixed(2)}
        </text>
      </svg>
      <span className="text-lg font-medium mt-1" style={{ color }}>
        {label}
      </span>
    </div>
  );
}
