"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { ChevronDownIcon } from "@heroicons/react/24/outline";

const CATEGORIES = [
  { key: "bridal", handle: "bridal" },
  { key: "evening", handle: "evening-dress" },
  { key: "cape", handle: "cape-and-train-elegance" },
  { key: "ball", handle: "ball-gown" },
  { key: "silhouette", handle: "silhouette-whisper" },
  { key: "royal", handle: "royal-over-train" },
  { key: "ruffled", handle: "ruffled-dream" },
];

export default function ShopDropdown() {
  const t = useTranslations();
  const locale = useLocale();
  const [open, setOpen] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const handleEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setOpen(true);
  };

  const handleLeave = () => {
    timeoutRef.current = setTimeout(() => setOpen(false), 150);
  };

  const categoryLabels: Record<string, string> = {
    bridal: t("nav.bridalGowns"),
    evening: t("nav.eveningDress"),
    cape: t("nav.capeAndTrain"),
    ball: t("nav.ballGown"),
    silhouette: t("nav.silhouetteWhisper"),
    royal: t("nav.royalOverTrain"),
    ruffled: t("nav.ruffledDream"),
  };

  return (
    <div
      className="relative"
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
    >
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1 px-3 py-2 text-[12px] tracking-[0.15em] uppercase text-charcoal/60 hover:text-charcoal transition-colors duration-300 relative group"
      >
        {t("common.shop")}
        <ChevronDownIcon
          className={`w-3 h-3 transition-transform duration-300 ${
            open ? "rotate-180" : ""
          }`}
        />
        <span className="absolute bottom-1 left-3 right-3 h-[1px] bg-charcoal scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1 w-64 bg-white shadow-[0_8px_30px_rgba(0,0,0,0.08)] border border-charcoal/[0.06] py-3 z-50">
          {/* Featured links */}
          <Link
            href={`/${locale}/collections/new`}
            onClick={() => setOpen(false)}
            className="flex items-center justify-between px-6 py-2.5 text-[12px] tracking-[0.1em] uppercase text-gold font-medium hover:bg-cream/50 transition-colors"
          >
            {t("nav.newCollection")}
            <span className="text-[9px] tracking-wider bg-gold/10 text-gold px-1.5 py-0.5">
              New
            </span>
          </Link>
          <Link
            href={`/${locale}/collections/sale`}
            onClick={() => setOpen(false)}
            className="block px-6 py-2.5 text-[12px] tracking-[0.1em] uppercase text-red-500 font-medium hover:bg-cream/50 transition-colors"
          >
            {t("nav.saleItems")}
          </Link>

          <div className="border-t border-charcoal/[0.06] my-2 mx-6" />

          {/* Categories */}
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.handle}
              href={`/${locale}/collections/${cat.handle}`}
              onClick={() => setOpen(false)}
              className="block px-6 py-2.5 text-[12px] tracking-[0.1em] uppercase text-charcoal/50 hover:text-charcoal hover:bg-cream/50 transition-colors"
            >
              {categoryLabels[cat.key]}
            </Link>
          ))}

          <div className="border-t border-charcoal/[0.06] my-2 mx-6" />

          <Link
            href={`/${locale}/collections`}
            onClick={() => setOpen(false)}
            className="flex items-center gap-1 px-6 py-2.5 text-[11px] tracking-[0.15em] uppercase text-charcoal/30 hover:text-charcoal transition-colors"
          >
            {t("common.viewAll")}
            <span className="text-charcoal/20">→</span>
          </Link>
        </div>
      )}
    </div>
  );
}
