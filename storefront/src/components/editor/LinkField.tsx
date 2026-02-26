"use client";

import { useState, useCallback } from "react";

interface LinkFieldProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  hint?: string;
}

function normalizeUrl(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return trimmed;
  // Internal paths — leave as-is
  if (trimmed.startsWith("/")) return trimmed;
  // Already has protocol
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  // WhatsApp API shorthand
  if (trimmed.startsWith("wa.me/")) return `https://${trimmed}`;
  // www. prefix without protocol
  if (trimmed.startsWith("www.")) return `https://${trimmed}`;
  // Looks like a domain (contains dot, no spaces)
  if (/^[^\s]+\.[^\s]+/.test(trimmed) && !trimmed.includes(" ")) {
    return `https://${trimmed}`;
  }
  return trimmed;
}

function getUrlMeta(url: string): {
  display: string;
  isExternal: boolean;
} | null {
  const trimmed = url.trim();
  if (!trimmed) return null;
  if (trimmed.startsWith("/")) {
    return { display: trimmed, isExternal: false };
  }
  try {
    const parsed = new URL(
      /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`
    );
    return { display: parsed.href, isExternal: true };
  } catch {
    return null;
  }
}

export default function LinkField({
  label,
  value,
  onChange,
  placeholder,
  hint,
}: LinkFieldProps) {
  const [focused, setFocused] = useState(false);
  const meta = getUrlMeta(value);

  const handleBlur = useCallback(() => {
    setFocused(false);
    const normalized = normalizeUrl(value);
    if (normalized !== value) onChange(normalized);
  }, [value, onChange]);

  return (
    <div>
      <label className="block text-[11px] font-medium text-charcoal/60 tracking-wide uppercase mb-1.5">
        {label}
      </label>
      <div className="relative">
        {/* Chain link icon */}
        <svg
          className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-charcoal/30"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m9.86-2.54a4.5 4.5 0 0 0-1.242-7.244l-4.5-4.5a4.5 4.5 0 0 0-6.364 6.364L4.34 8.374"
          />
        </svg>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={handleBlur}
          placeholder={placeholder ?? "/path or https://..."}
          className="w-full pl-8 pr-8 py-2 text-[13px] border border-soft-gray/50 rounded bg-white focus:outline-none focus:border-gold/50 transition-colors"
        />
        {/* Right indicator */}
        {meta && !focused && (
          <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-charcoal/30">
            {meta.isExternal ? (
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
              </svg>
            ) : (
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
              </svg>
            )}
          </span>
        )}
      </div>
      {/* Resolved URL hint */}
      {meta && !focused && value.trim() && (
        <p className="mt-1 text-[10px] text-charcoal/40 leading-relaxed truncate">
          {meta.isExternal ? "Opens" : "Goes to"}: {meta.display}
        </p>
      )}
      {hint && (
        <p className="mt-1 text-[10px] text-charcoal/40 leading-relaxed">{hint}</p>
      )}
    </div>
  );
}
