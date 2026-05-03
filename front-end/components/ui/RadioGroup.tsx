"use client";

import { cn } from "@/lib/utils";

interface RadioOption {
  label: string;
  value: number;
}

interface RadioGroupProps {
  options: RadioOption[];
  value: number | null;
  onChange: (value: number) => void;
  name: string;
  className?: string;
}

export function RadioGroup({
  options,
  value,
  onChange,
  name,
  className,
}: RadioGroupProps) {
  return (
    <div className={cn("flex flex-wrap gap-3", className)}>
      {options.map((opt) => {
        const selected = value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(opt.value)}
            className={cn(
              "flex-1 min-w-[120px] rounded-[var(--radius-card)] border px-4 py-3 text-sm font-medium transition-all cursor-pointer text-center",
              selected
                ? "bg-terracotta text-ivory border-terracotta shadow-[0_0_0_1px_var(--color-terracotta)]"
                : "bg-ivory text-olive border-cream hover:border-ring-warm hover:shadow-[0_0_0_1px_var(--color-ring-warm)]"
            )}
          >
            {opt.label}
          </button>
        );
      })}
      <input type="hidden" name={name} value={value ?? ""} />
    </div>
  );
}
