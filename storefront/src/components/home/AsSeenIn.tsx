"use client";

import { useTranslations } from "next-intl";
import type { AsSeenInContent } from "@/types/content-blocks";

const DEFAULT_PRESS_MARKS = [
  "Vogue Sposa",
  "Brides Magazine",
  "Kosovo Fashion Week",
  "Elle Bridal",
  "Harper's Bazaar",
];

export default function AsSeenIn({ content }: { content?: AsSeenInContent }) {
  const PRESS_MARKS = content?.names ?? DEFAULT_PRESS_MARKS;
  const t = useTranslations("home");

  return (
    <section className="py-12 sm:py-14">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Divider line + label */}
        <div className="flex items-center gap-4 mb-10 sm:mb-12">
          <span className="block h-px flex-1 bg-white/[0.06]" />
          <span className="text-[10px] tracking-[0.35em] uppercase text-white/25 flex-shrink-0">
            {content?.heading || t("asSeenIn")}
          </span>
          <span className="block h-px flex-1 bg-white/[0.06]" />
        </div>

        {/* Press names */}
        <div className="flex flex-wrap items-center justify-center gap-x-10 sm:gap-x-14 lg:gap-x-16 gap-y-5">
          {PRESS_MARKS.map((name) => (
            <span
              key={name}
              className="font-serif text-lg sm:text-xl lg:text-2xl text-white/[0.12] hover:text-white/30 transition-colors duration-500 select-none whitespace-nowrap"
            >
              {name}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
