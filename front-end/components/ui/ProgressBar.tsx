import { cn } from "@/lib/utils";

interface ProgressBarProps {
  value: number; // 0-1
  className?: string;
}

export function ProgressBar({ value, className }: ProgressBarProps) {
  const pct = Math.min(Math.max(value, 0), 1) * 100;
  return (
    <div
      className={cn(
        "h-2 w-full rounded-full bg-sand overflow-hidden",
        className
      )}
    >
      <div
        className="h-full rounded-full bg-terracotta transition-all duration-300"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
