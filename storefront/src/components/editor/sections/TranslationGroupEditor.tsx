"use client";

import { useState, useMemo } from "react";
import type { TranslationOverrideContent } from "@/types/content-blocks";

// Static defaults imported at build time
import enMessages from "@/i18n/messages/en.json";

const ALL_NAMESPACES: Record<string, Record<string, string>> = enMessages as Record<
  string,
  Record<string, string>
>;

interface TranslationGroupEditorProps {
  namespace: string;
  content: TranslationOverrideContent;
  onChange: (content: TranslationOverrideContent) => void;
}

export default function TranslationGroupEditor({
  namespace,
  content,
  onChange,
}: TranslationGroupEditorProps) {
  const [search, setSearch] = useState("");

  const defaults = ALL_NAMESPACES[namespace] || {};
  const keys = useMemo(() => {
    const allKeys = Object.keys(defaults);
    if (!search.trim()) return allKeys;
    const q = search.toLowerCase();
    return allKeys.filter(
      (k) =>
        k.toLowerCase().includes(q) ||
        (defaults[k] || "").toLowerCase().includes(q) ||
        (content.overrides[k] || "").toLowerCase().includes(q)
    );
  }, [defaults, search, content.overrides]);

  const overrideCount = Object.keys(content.overrides).filter(
    (k) => content.overrides[k] !== defaults[k]
  ).length;

  const handleChange = (key: string, value: string) => {
    const newOverrides = { ...content.overrides };
    // If the value matches the default, remove the override
    if (value === defaults[key] || value === "") {
      delete newOverrides[key];
    } else {
      newOverrides[key] = value;
    }
    onChange({ overrides: newOverrides });
  };

  const handleReset = (key: string) => {
    const newOverrides = { ...content.overrides };
    delete newOverrides[key];
    onChange({ overrides: newOverrides });
  };

  if (Object.keys(defaults).length === 0) {
    return (
      <p className="text-sm text-charcoal/40 py-4">
        No translation keys found for namespace &quot;{namespace}&quot;.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-[11px] text-charcoal/40 tracking-wide">
          {keys.length} keys {overrideCount > 0 && `· ${overrideCount} edited`}
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <svg
          className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-charcoal/25"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
          />
        </svg>
        <input
          type="text"
          placeholder="Filter keys..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-8 pr-3 py-2 text-[12px] border border-soft-gray/50 rounded bg-white focus:outline-none focus:border-gold/50 transition-colors"
        />
      </div>

      {/* Keys */}
      <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
        {keys.map((key) => {
          const defaultValue = defaults[key] || "";
          const currentValue = content.overrides[key] ?? "";
          const isEdited = currentValue !== "" && currentValue !== defaultValue;

          return (
            <div
              key={key}
              className={`p-3 rounded border transition-colors ${
                isEdited
                  ? "border-gold/30 bg-gold/[0.03]"
                  : "border-soft-gray/30 bg-white"
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-mono text-charcoal/35 tracking-wide">
                  {namespace}.{key}
                </span>
                {isEdited && (
                  <button
                    onClick={() => handleReset(key)}
                    className="text-[9px] text-charcoal/30 hover:text-red-400 tracking-wider uppercase transition-colors"
                  >
                    Reset
                  </button>
                )}
              </div>
              {defaultValue.length > 80 ? (
                <textarea
                  value={currentValue || ""}
                  onChange={(e) => handleChange(key, e.target.value)}
                  placeholder={defaultValue}
                  rows={2}
                  className="w-full px-2.5 py-1.5 text-[13px] border border-soft-gray/40 rounded bg-white focus:outline-none focus:border-gold/50 transition-colors resize-y placeholder:text-charcoal/20"
                />
              ) : (
                <input
                  type="text"
                  value={currentValue || ""}
                  onChange={(e) => handleChange(key, e.target.value)}
                  placeholder={defaultValue}
                  className="w-full px-2.5 py-1.5 text-[13px] border border-soft-gray/40 rounded bg-white focus:outline-none focus:border-gold/50 transition-colors placeholder:text-charcoal/20"
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
