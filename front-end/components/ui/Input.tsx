"use client";

import { InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export default function Input({ label, className = "", id, ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-olive-gray">
          {label}
        </label>
      )}
      <input
        id={id}
        className={`w-full px-3 py-2 rounded-xl border border-border-warm bg-white text-near-black placeholder:text-stone-gray focus:outline-none focus:border-focus-blue focus:ring-2 focus:ring-focus-blue/25 transition-colors ${className}`}
        {...props}
      />
    </div>
  );
}
