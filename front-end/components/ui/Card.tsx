import { ReactNode } from "react";

interface CardProps {
  title?: string;
  children: ReactNode;
  className?: string;
}

export default function Card({ title, children, className = "" }: CardProps) {
  return (
    <div
      className={`bg-ivory border border-border-cream rounded-lg p-6 shadow-[rgba(0,0,0,0.05)_0px_4px_24px] ${className}`}
    >
      {title && (
        <h3 className="font-serif font-medium text-xl mb-4 text-near-black">
          {title}
        </h3>
      )}
      {children}
    </div>
  );
}
