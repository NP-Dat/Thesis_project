"use client";

import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "dark" | "ghost" | "danger";

const base =
  "inline-flex items-center justify-center gap-2 font-medium transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus";

const variants: Record<Variant, string> = {
  primary:
    "bg-terracotta text-ivory rounded-[var(--radius-input)] px-4 py-2.5 shadow-[0_0_0_1px_var(--color-terracotta)] hover:brightness-110",
  secondary:
    "bg-sand text-charcoal-warm rounded-[var(--radius-card)] px-3 py-2 shadow-[0_0_0_1px_var(--color-ring-warm)] hover:shadow-[0_0_0_1px_var(--color-ring-deep)]",
  dark: "bg-dark-surface text-ivory rounded-[var(--radius-card)] px-3 py-2 shadow-[0_0_0_1px_var(--color-dark-surface)] hover:bg-dark-warm",
  ghost:
    "bg-transparent text-olive rounded-[var(--radius-card)] px-3 py-2 hover:bg-sand",
  danger:
    "bg-crimson text-white rounded-[var(--radius-input)] px-4 py-2.5 hover:brightness-110",
};

const sizes = {
  sm: "text-sm h-8 px-3",
  md: "text-sm h-10",
  lg: "text-base h-12 px-6",
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: "sm" | "md" | "lg";
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => (
    <button
      ref={ref}
      className={cn(base, variants[variant], sizes[size], className)}
      {...props}
    />
  )
);

Button.displayName = "Button";
