"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  className?: string;
}

export function Modal({ open, onClose, title, children, className }: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center"
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
    >
      <div className="absolute inset-0 bg-near-black/40" />
      <div
        className={cn(
          "relative z-10 w-full max-w-lg bg-ivory rounded-[var(--radius-feature)] border border-cream p-6 shadow-[rgba(0,0,0,0.1)_0px_8px_32px]",
          className
        )}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-serif text-xl font-medium text-near-black">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-[var(--radius-card)] text-stone hover:text-near-black hover:bg-sand transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
