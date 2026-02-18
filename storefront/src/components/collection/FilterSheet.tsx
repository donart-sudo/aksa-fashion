"use client";

import { useEffect } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { useTranslations } from "next-intl";
import { PRICE_RANGES, ColorSwatch } from "./CollectionClient";

interface FilterSheetProps {
  isOpen: boolean;
  onClose: () => void;
  sizes: string[];
  colors: string[];
  selectedSizes: string[];
  selectedColors: string[];
  selectedPrice: string;
  onToggleSize: (size: string) => void;
  onToggleColor: (color: string) => void;
  onPriceChange: (price: string) => void;
  onClear: () => void;
  resultCount: number;
}

export default function FilterSheet({
  isOpen,
  onClose,
  sizes,
  colors,
  selectedSizes,
  selectedColors,
  selectedPrice,
  onToggleSize,
  onToggleColor,
  onPriceChange,
  onClear,
  resultCount,
}: FilterSheetProps) {
  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const t = useTranslations("common");

  if (!isOpen) return null;

  const hasFilters =
    selectedSizes.length > 0 || selectedColors.length > 0 || selectedPrice;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 z-50 md:hidden animate-fade-in"
        onClick={onClose}
      />

      {/* Sheet */}
      <div className="fixed bottom-0 left-0 right-0 bg-white z-50 md:hidden rounded-t-2xl max-h-[85vh] flex flex-col animate-slide-up">
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1">
          <span className="w-10 h-1 rounded-full bg-charcoal/15" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-charcoal/[0.06]">
          <h3 className="font-serif text-lg text-charcoal">
            {t("filters")}
          </h3>
          <button
            onClick={onClose}
            className="p-2 -mr-2 min-w-[44px] min-h-[44px] flex items-center justify-center"
          >
            <XMarkIcon className="w-5 h-5 text-charcoal/40" />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto overscroll-contain px-5 py-6">

          {/* Sizes */}
          {sizes.length > 0 && (
            <div className="mb-8">
              <p className="font-serif text-[15px] text-charcoal mb-4">
                {t("size")}
              </p>
              <div className="flex flex-wrap gap-2">
                {sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => onToggleSize(size)}
                    className={`min-w-[48px] min-h-[44px] px-4 py-2.5 border text-[13px] font-medium tracking-wide transition-all ${
                      selectedSizes.includes(size)
                        ? "border-charcoal bg-charcoal text-white"
                        : "border-charcoal/[0.08] text-charcoal/50 active:border-charcoal/20"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Colors */}
          {colors.length > 0 && (
            <div className="mb-8">
              <p className="font-serif text-[15px] text-charcoal mb-4">
                {t("color")}
              </p>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                {colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => onToggleColor(color)}
                    className={`flex items-center gap-3 text-left text-[13px] py-2.5 transition-colors min-h-[44px] ${
                      selectedColors.includes(color)
                        ? "text-charcoal font-medium"
                        : "text-charcoal/40 active:text-charcoal/60"
                    }`}
                  >
                    <ColorSwatch
                      color={color}
                      selected={selectedColors.includes(color)}
                    />
                    {color}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Price */}
          <div>
            <p className="font-serif text-[15px] text-charcoal mb-4">
              {t("price")}
            </p>
            <div className="space-y-1">
              {PRICE_RANGES.map((range) => {
                const active = selectedPrice === range.value;
                return (
                  <button
                    key={range.value}
                    onClick={() =>
                      onPriceChange(active ? "" : range.value)
                    }
                    className={`w-full flex items-center gap-3 py-3 text-[13px] transition-colors min-h-[44px] ${
                      active
                        ? "text-charcoal font-medium"
                        : "text-charcoal/40 active:text-charcoal/60"
                    }`}
                  >
                    {/* Radio indicator */}
                    <span
                      className={`w-[18px] h-[18px] rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all duration-200 ${
                        active ? "border-charcoal" : "border-charcoal/15"
                      }`}
                    >
                      {active && (
                        <span className="w-2.5 h-2.5 rounded-full bg-charcoal" />
                      )}
                    </span>
                    {range.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-5 py-4 border-t border-charcoal/[0.06] bg-white">
          <button
            onClick={onClear}
            className={`flex-1 py-3.5 text-[13px] font-medium tracking-wide border transition-colors min-h-[48px] ${
              hasFilters
                ? "border-charcoal/15 text-charcoal active:bg-charcoal/5"
                : "border-charcoal/[0.06] text-charcoal/25 cursor-not-allowed"
            }`}
            disabled={!hasFilters}
          >
            {t("clearAll")}
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-3.5 text-[13px] font-medium tracking-wide text-white bg-charcoal active:bg-charcoal/90 transition-colors min-h-[48px]"
          >
            {resultCount} {resultCount === 1 ? t("result") : t("results")}
          </button>
        </div>
      </div>
    </>
  );
}
