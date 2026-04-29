"use client";

import { ButtonHTMLAttributes } from "react";

type Variant = "brand" | "secondary" | "dark" | "white";

const variantStyles: Record<Variant, string> = {
  brand:
    "bg-terracotta text-ivory shadow-[#c96442_0px_0px_0px_0px,#c96442_0px_0px_0px_1px] hover:opacity-90",
  secondary:
    "bg-warm-sand text-charcoal-warm shadow-[#e8e6dc_0px_0px_0px_0px,#d1cfc5_0px_0px_0px_1px] hover:shadow-[#e8e6dc_0px_0px_0px_0px,#c2c0b6_0px_0px_0px_1px]",
  dark:
    "bg-dark-surface text-ivory shadow-[#30302e_0px_0px_0px_0px,#30302e_0px_0px_0px_1px] hover:opacity-90",
  white:
    "bg-white text-near-black hover:bg-warm-sand rounded-xl",
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

export default function Button({
  variant = "brand",
  className = "",
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-sans text-base font-medium transition-all cursor-pointer ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
