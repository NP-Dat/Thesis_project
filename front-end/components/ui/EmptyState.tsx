import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-16 text-center",
        className
      )}
    >
      {icon && <div className="mb-4 text-stone">{icon}</div>}
      <h3 className="font-serif text-lg font-medium text-near-black mb-1">
        {title}
      </h3>
      {description && (
        <p className="text-sm text-olive mb-4 max-w-sm">{description}</p>
      )}
      {action}
    </div>
  );
}
