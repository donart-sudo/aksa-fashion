"use client";

import { useEffect } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { useTranslations } from "next-intl";
import { PRICE_RANGES, ColorDot } from "./CollectionClient";

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
        {/* Header — sticky */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-soft-gray/40">
          <h3 className="text-base font-semibold text-charcoal">
            {t("filters")}
          </h3>
          <button
            onClick={onClose}
            className="p-2 -mr-2 min-w-[44px] min-h-[44px] flex items-center justify-center"
          >
            <XMarkIcon className="w-5 h-5 text-charcoal/60" />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-7">
          {/* Sizes */}
          {sizes.length > 0 && (
            <div>
              <p className="text-xs font-semibold tracking-widest uppercase text-charcoal mb-3">
                {t("size")}
              </p>
              <div className="flex flex-wrap gap-2">
                {sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => onToggleSize(size)}
                    className={`min-w-[48px] min-h-[44px] px-4 py-2.5 border text-sm font-medium transition-all ${
                      selectedSizes.includes(size)
                        ? "border-charcoal bg-charcoal text-white"
                        : "border-soft-gray text-charcoal/70 active:bg-charcoal/5"
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
            <div>
              <p className="text-xs font-semibold tracking-widest uppercase text-charcoal mb-3">
                {t("color")}
              </p>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                {colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => onToggleColor(color)}
                    className={`flex items-center gap-2.5 text-left text-sm py-2.5 transition-colors min-h-[44px] ${
                      selectedColors.includes(color)
                        ? "text-charcoal font-semibold"
                        : "text-charcoal/60 active:text-charcoal"
                    }`}
                  >
                    <ColorDot
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
            <p className="text-xs font-semibold tracking-widest uppercase text-charcoal mb-3">
              {t("price")}
            </p>
            <div className="flex flex-wrap gap-2">
              {PRICE_RANGES.map((range) => (
                <button
                  key={range.value}
                  onClick={() =>
                    onPriceChange(
                      selectedPrice === range.value ? "" : range.value
                    )
                  }
                  className={`px-4 py-2.5 border text-sm font-medium transition-all min-h-[44px] ${
                    selectedPrice === range.value
                      ? "border-charcoal bg-charcoal text-white"
                      : "border-soft-gray text-charcoal/70 active:bg-charcoal/5"
                  }`}
                >
                  {range.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer — sticky */}
        <div className="flex gap-3 px-5 py-4 border-t border-soft-gray/40 bg-white">
          <button
            onClick={onClear}
            className={`flex-1 py-3.5 text-sm font-medium tracking-wide border transition-colors min-h-[48px] ${
              hasFilters
                ? "border-charcoal/20 text-charcoal hover:bg-charcoal/5"
                : "border-soft-gray/40 text-charcoal/30 cursor-not-allowed"
            }`}
            disabled={!hasFilters}
          >
            {t("clearAll")}
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-3.5 text-sm font-medium tracking-wide text-white bg-charcoal hover:bg-charcoal/90 transition-colors min-h-[48px]"
          >
            {resultCount} {resultCount === 1 ? t("result") : t("results")}
          </button>
        </div>
      </div>
    </>
  );
}
