import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  whisper?: boolean;
}

export function Card({ className, whisper, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "bg-ivory border border-cream rounded-[var(--radius-card)] p-6",
        whisper && "shadow-[rgba(0,0,0,0.05)_0px_4px_24px]",
        className
      )}
      {...props}
    />
  );
}

export function CardHeader({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("mb-4", className)} {...props} />;
}

export function CardTitle({
  className,
  ...props
}: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn(
        "font-serif text-[1.3rem] font-medium leading-[1.20] text-near-black",
        className
      )}
      {...props}
    />
  );
}

export function CardContent({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn(className)} {...props} />;
}
