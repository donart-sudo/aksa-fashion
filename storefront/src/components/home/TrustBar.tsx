"use client";

import { useRef, useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import {
  GlobeAltIcon,
  SparklesIcon,
  ChatBubbleLeftRightIcon,
} from "@heroicons/react/24/outline";

/* Custom ruler/tape icon for "Made to Your Measurements" */
function MeasureIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
    </svg>
  );
}

import type { TrustBarContent } from "@/types/content-blocks";

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  sparkles: SparklesIcon,
  measure: MeasureIcon,
  globe: GlobeAltIcon,
  chat: ChatBubbleLeftRightIcon,
};

const defaultTrustItems = [
  { key: "trustHandcrafted" as const, text: undefined as string | undefined, Icon: SparklesIcon },
  { key: "trustMeasure" as const, text: undefined as string | undefined, Icon: MeasureIcon },
  { key: "trustShipping" as const, text: undefined as string | undefined, Icon: GlobeAltIcon },
  { key: "trustStyling" as const, text: undefined as string | undefined, Icon: ChatBubbleLeftRightIcon },
];

export default function TrustBar({ content }: { content?: TrustBarContent }) {
  const trustItems = content
    ? content.items.map((item) => ({
        key: item.textKey as "trustHandcrafted" | "trustMeasure" | "trustShipping" | "trustStyling",
        text: item.text || undefined,
        Icon: ICON_MAP[item.iconKey] || SparklesIcon,
      }))
    : defaultTrustItems;
  const t = useTranslations("home");
  const ref = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <section
      ref={ref}
      className="bg-cream border-b border-soft-gray/50 py-4 sm:py-5"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Desktop: flex row with dividers */}
        <div className="hidden sm:flex items-center justify-center gap-0">
          {trustItems.map((item, i) => (
            <div key={item.key} className="flex items-center">
              {i > 0 && (
                <span className="w-px h-4 bg-charcoal/10 mx-6 lg:mx-8" />
              )}
              <div
                className="flex items-center gap-2.5"
                style={{
                  opacity: visible ? 1 : 0,
                  transform: visible ? "none" : "translateY(8px)",
                  transition: `opacity 600ms cubic-bezier(0.16, 1, 0.3, 1) ${i * 100}ms, transform 600ms cubic-bezier(0.16, 1, 0.3, 1) ${i * 100}ms`,
                }}
              >
                <item.Icon className="w-4 h-4 text-gold/70 flex-shrink-0" />
                <span className="text-[11px] tracking-[0.2em] uppercase text-charcoal/50 whitespace-nowrap">
                  {item.text || t(item.key)}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Mobile: horizontal scroll strip */}
        <div className="sm:hidden -mx-4">
          <div className="flex items-center gap-5 overflow-x-auto scrollbar-hide px-4 py-1">
            {trustItems.map((item, i) => (
              <div
                key={item.key}
                className="flex items-center gap-2 flex-shrink-0"
                style={{
                  opacity: visible ? 1 : 0,
                  transform: visible ? "none" : "translateY(8px)",
                  transition: `opacity 600ms cubic-bezier(0.16, 1, 0.3, 1) ${i * 80}ms, transform 600ms cubic-bezier(0.16, 1, 0.3, 1) ${i * 80}ms`,
                }}
              >
                <item.Icon className="w-3.5 h-3.5 text-gold/70 flex-shrink-0" />
                <span className="text-[10px] tracking-[0.15em] uppercase text-charcoal/50 whitespace-nowrap">
                  {item.text || t(item.key)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
