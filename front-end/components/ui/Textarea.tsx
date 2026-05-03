"use client";

import { forwardRef, type TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      "w-full rounded-[var(--radius-input)] border border-cream bg-white px-3 py-2 text-near-black placeholder:text-stone min-h-[80px] resize-y",
      "focus:outline-none focus:ring-2 focus:ring-focus focus:border-focus",
      "disabled:opacity-50 disabled:cursor-not-allowed",
      className
    )}
    {...props}
  />
));

Textarea.displayName = "Textarea";
