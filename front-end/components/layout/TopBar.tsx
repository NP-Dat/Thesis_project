import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface TopBarProps {
  title: string;
  action?: ReactNode;
  className?: string;
}

export function TopBar({ title, action, className }: TopBarProps) {
  return (
    <header
      className={cn(
        "flex items-center justify-between px-8 py-5 border-b border-cream bg-ivory/60",
        className
      )}
    >
      <h2 className="font-serif text-[2rem] font-medium leading-[1.10] text-near-black">
        {title}
      </h2>
      {action && <div>{action}</div>}
    </header>
  );
}
