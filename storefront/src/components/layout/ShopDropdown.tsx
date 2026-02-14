"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { ChevronDownIcon } from "@heroicons/react/24/outline";

const CATEGORIES = [
  { key: "bridal", handle: "bridal" },
  { key: "evening", handle: "evening-dress" },
  { key: "cape", handle: "cape-and-train-elegance", label: "Cape & Train" },
  { key: "ball", handle: "ball-gown", label: "Ball Gown" },
  { key: "silhouette", handle: "silhouette-whisper", label: "Silhouette" },
  { key: "royal", handle: "royal-over-train", label: "Royal Over Train" },
  { key: "ruffled", handle: "ruffled-dream", label: "Ruffled Dream" },
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
    evening: t("nav.eveningWear"),
    cape: "Cape & Train",
    ball: "Ball Gown",
    silhouette: "Silhouette",
    royal: "Royal Over Train",
    ruffled: "Ruffled Dream",
  };

  return (
    <div
      className="relative"
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
    >
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1 text-sm tracking-wide text-charcoal/80 hover:text-gold transition-colors uppercase"
      >
        {t("common.shop")}
        <ChevronDownIcon
          className={`w-3.5 h-3.5 transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-2 w-56 bg-white shadow-lg border border-soft-gray/30 py-2 z-50">
          {/* New & Sale */}
          <Link
            href={`/${locale}/collections/new`}
            onClick={() => setOpen(false)}
            className="block px-5 py-2.5 text-sm text-gold font-medium hover:bg-cream transition-colors"
          >
            {t("nav.newCollection")}
          </Link>
          <Link
            href={`/${locale}/collections/sale`}
            onClick={() => setOpen(false)}
            className="block px-5 py-2.5 text-sm text-red-500 font-medium hover:bg-cream transition-colors"
          >
            {t("nav.saleItems")}
          </Link>

          <div className="border-t border-soft-gray/30 my-1" />

          {/* Categories */}
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.handle}
              href={`/${locale}/collections/${cat.handle}`}
              onClick={() => setOpen(false)}
              className="block px-5 py-2.5 text-sm text-charcoal/70 hover:text-gold hover:bg-cream transition-colors"
            >
              {cat.label || categoryLabels[cat.key]}
            </Link>
          ))}

          <div className="border-t border-soft-gray/30 my-1" />

          <Link
            href={`/${locale}/collections`}
            onClick={() => setOpen(false)}
            className="block px-5 py-2.5 text-xs tracking-wider uppercase text-charcoal/50 hover:text-gold transition-colors"
          >
            {t("common.viewAll")} →
          </Link>
        </div>
      )}
    </div>
  );
}
