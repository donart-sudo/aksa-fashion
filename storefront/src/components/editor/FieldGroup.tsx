"use client";

import type { ReactNode } from "react";

interface FieldGroupProps {
  label: string;
  children: ReactNode;
  variant?: "box" | "divider";
}

export default function FieldGroup({
  label,
  children,
  variant = "box",
}: FieldGroupProps) {
  if (variant === "divider") {
    return (
      <div className="border-t border-soft-gray/30 pt-4 mt-4">
        <p className="text-[10px] font-medium text-charcoal/40 uppercase tracking-wide mb-3">
          {label}
        </p>
        <div className="space-y-3">{children}</div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-[#e3e3e3] p-3 space-y-2 bg-[#fafafa]">
      <p className="text-[11px] font-semibold text-[#8a8a8a] uppercase tracking-wide">
        {label}
      </p>
      {children}
    </div>
  );
}
