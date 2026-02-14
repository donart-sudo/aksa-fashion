"use client";

import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import ProductCard from "@/components/product/ProductCard";
import type { ProductCardData } from "@/components/product/ProductCard";
import FilterBar from "./FilterBar";
import FilterSheet from "./FilterSheet";

interface CollectionClientProps {
  products: ProductCardData[];
  allSizes: string[];
  allColors: string[];
}

const PAGE_SIZE = 8;

export default function CollectionClient({
  products,
  allSizes,
  allColors,
}: CollectionClientProps) {
  const t = useTranslations("common");
  const [sortBy, setSortBy] = useState("newest");
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedPrice, setSelectedPrice] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const filtered = useMemo(() => {
    let result = [...products];

    // Size filter — show products that have ANY selected size
    if (selectedSizes.length > 0) {
      result = result.filter((p) =>
        p.sizes?.some((s) => selectedSizes.includes(s))
      );
    }

    // Color filter — show products that have ANY selected color
    if (selectedColors.length > 0) {
      result = result.filter((p) =>
        p.colors?.some((c) =>
          selectedColors.some(
            (sc) => c.toLowerCase() === sc.toLowerCase()
          )
        )
      );
    }

    // Price filter
    if (selectedPrice) {
      const [min, max] = selectedPrice.split("-").map(Number);
      result = result.filter((p) => {
        const priceEur = p.price / 100;
        return priceEur >= min && priceEur <= max;
      });
    }

    // Sort
    switch (sortBy) {
      case "price-asc":
        result.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        result.sort((a, b) => b.price - a.price);
        break;
      case "name-asc":
        result.sort((a, b) => a.title.localeCompare(b.title));
        break;
      default:
        break;
    }

    return result;
  }, [products, selectedSizes, selectedColors, selectedPrice, sortBy]);

  // Reset visible count when filters change
  const filterKey = `${selectedSizes.join()}-${selectedColors.join()}-${selectedPrice}-${sortBy}`;
  const prevFilterKey = useRef(filterKey);
  useEffect(() => {
    if (prevFilterKey.current !== filterKey) {
      setVisibleCount(PAGE_SIZE);
      prevFilterKey.current = filterKey;
    }
  }, [filterKey]);

  const visible = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;

  const activeFilters = [
    ...selectedSizes.map((s) => ({ key: "size", value: s })),
    ...selectedColors.map((c) => ({ key: "color", value: c })),
    ...(selectedPrice
      ? [
          {
            key: "price",
            value: selectedPrice
              .replace("-", " – €")
              .replace("99999", "+"),
          },
        ]
      : []),
  ];

  const handleRemoveFilter = useCallback(
    (key: string, value?: string) => {
      if (key === "size" && value) {
        setSelectedSizes((prev) => prev.filter((s) => s !== value));
      } else if (key === "color" && value) {
        setSelectedColors((prev) => prev.filter((c) => c !== value));
      } else if (key === "price") {
        setSelectedPrice("");
      }
    },
    []
  );

  const handleClearAll = useCallback(() => {
    setSelectedSizes([]);
    setSelectedColors([]);
    setSelectedPrice("");
  }, []);

  const toggleSize = useCallback((size: string) => {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );
  }, []);

  const toggleColor = useCallback((color: string) => {
    setSelectedColors((prev) =>
      prev.includes(color)
        ? prev.filter((c) => c !== color)
        : [...prev, color]
    );
  }, []);

  return (
    <>
      <FilterBar
        sortBy={sortBy}
        onSortChange={setSortBy}
        activeFilters={activeFilters}
        onRemoveFilter={handleRemoveFilter}
        onClearAll={handleClearAll}
        onOpenFilters={() => setFilterOpen(true)}
        totalCount={filtered.length}
      />

      {/* Desktop sidebar + grid */}
      <div className="flex gap-8 lg:gap-10">
        {/* Desktop sidebar filters */}
        <aside className="hidden md:block w-52 flex-shrink-0 space-y-8 pt-2">
          {/* Sizes */}
          {allSizes.length > 0 && (
            <div>
              <p className="text-xs font-semibold tracking-widest uppercase text-charcoal mb-3">
                {t("size")}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {allSizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => toggleSize(size)}
                    className={`px-3 py-2 border text-xs font-medium transition-all min-w-[40px] ${
                      selectedSizes.includes(size)
                        ? "border-charcoal bg-charcoal text-white"
                        : "border-soft-gray/60 text-charcoal/70 hover:border-charcoal/40"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Colors */}
          {allColors.length > 0 && (
            <div>
              <p className="text-xs font-semibold tracking-widest uppercase text-charcoal mb-3">
                {t("color")}
              </p>
              <div className="flex flex-col gap-1">
                {allColors.slice(0, 12).map((color) => (
                  <button
                    key={color}
                    onClick={() => toggleColor(color)}
                    className={`flex items-center gap-2.5 text-left text-sm py-1.5 transition-colors ${
                      selectedColors.includes(color)
                        ? "text-charcoal font-semibold"
                        : "text-charcoal/60 hover:text-charcoal"
                    }`}
                  >
                    <ColorDot color={color} selected={selectedColors.includes(color)} />
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
            <div className="flex flex-col gap-1">
              {PRICE_RANGES.map((range) => (
                <button
                  key={range.value}
                  onClick={() =>
                    setSelectedPrice(
                      selectedPrice === range.value ? "" : range.value
                    )
                  }
                  className={`text-left text-sm py-1.5 transition-colors ${
                    selectedPrice === range.value
                      ? "text-charcoal font-semibold"
                      : "text-charcoal/60 hover:text-charcoal"
                  }`}
                >
                  {selectedPrice === range.value && (
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-charcoal mr-2 -translate-y-px" />
                  )}
                  {range.label}
                </button>
              ))}
            </div>
          </div>

          {/* Clear all (sidebar) */}
          {activeFilters.length > 0 && (
            <button
              onClick={handleClearAll}
              className="text-xs tracking-wider uppercase text-charcoal/50 hover:text-charcoal underline underline-offset-4 transition-colors"
            >
              {t("clearAllFilters")}
            </button>
          )}
        </aside>

        {/* Product grid */}
        <div className="flex-1 min-w-0">
          {visible.length > 0 ? (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-3 lg:gap-5">
                {visible.map((product, i) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    priority={i < 4}
                  />
                ))}
              </div>

              {/* Load More */}
              {hasMore && (
                <div className="text-center mt-12 lg:mt-14">
                  <button
                    onClick={() =>
                      setVisibleCount((v) => v + PAGE_SIZE)
                    }
                    className="inline-flex items-center gap-2 px-10 py-4 border border-charcoal/20 text-sm font-medium tracking-wide text-charcoal hover:border-charcoal hover:bg-charcoal hover:text-white transition-all duration-300"
                  >
                    {t("loadMore")}
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={1.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M19.5 13.5L12 21m0 0l-7.5-7.5M12 21V3"
                      />
                    </svg>
                  </button>
                  <p className="text-xs text-charcoal/40 mt-3">
                    {t("showing")} {visible.length} {t("of")} {filtered.length}
                  </p>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-24">
              <p className="font-serif text-xl text-charcoal/60 mb-2">
                {t("noProductsFound")}
              </p>
              <p className="text-sm text-charcoal/40 mb-6">
                {t("tryAdjustingFilters")}
              </p>
              <button
                onClick={handleClearAll}
                className="px-6 py-3 text-xs font-medium tracking-widest uppercase border border-charcoal/20 text-charcoal hover:bg-charcoal hover:text-white transition-all duration-300"
              >
                {t("clearAllFilters")}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile filter sheet */}
      <FilterSheet
        isOpen={filterOpen}
        onClose={() => setFilterOpen(false)}
        sizes={allSizes}
        colors={allColors}
        selectedSizes={selectedSizes}
        selectedColors={selectedColors}
        selectedPrice={selectedPrice}
        onToggleSize={toggleSize}
        onToggleColor={toggleColor}
        onPriceChange={setSelectedPrice}
        onClear={handleClearAll}
        resultCount={filtered.length}
      />
    </>
  );
}

/* ═══ Shared constants ═══ */

export const PRICE_RANGES = [
  { label: "Under €500", value: "0-500" },
  { label: "€500 – €800", value: "500-800" },
  { label: "€800 – €1,200", value: "800-1200" },
  { label: "Over €1,200", value: "1200-99999" },
];

/* ═══ Color dot helper ═══ */

const COLOR_HEX: Record<string, string> = {
  white: "#FFFFFF",
  ivory: "#FFFFF0",
  cream: "#FFFDD0",
  champagne: "#F7E7CE",
  nude: "#E8BEAC",
  blush: "#DE98AB",
  pink: "#F4C2C2",
  rose: "#C08081",
  red: "#C41E3A",
  burgundy: "#800020",
  wine: "#722F37",
  coral: "#FF7F50",
  gold: "#D4AF37",
  green: "#2D5F2D",
  emerald: "#50C878",
  sage: "#B2AC88",
  teal: "#008080",
  blue: "#2B4F81",
  navy: "#1B2A4A",
  lavender: "#B57EDC",
  purple: "#6A0DAD",
  lilac: "#C8A2C8",
  silver: "#C0C0C0",
  gray: "#808080",
  grey: "#808080",
  charcoal: "#36454F",
  black: "#1A1A1A",
  brown: "#6B3A2A",
  beige: "#D9C5A0",
  taupe: "#B5A08E",
  mauve: "#E0B0FF",
  peach: "#FFCBA4",
};

export function ColorDot({
  color,
  selected,
}: {
  color: string;
  selected?: boolean;
}) {
  const hex = COLOR_HEX[color.toLowerCase().trim()] ?? "#D9D9D9";
  const isLight =
    hex === "#FFFFFF" || hex === "#FFFFF0" || hex === "#FFFDD0" || hex === "#FAF0E6";
  return (
    <span
      className={`inline-block w-4 h-4 rounded-full border-2 flex-shrink-0 transition-all ${
        selected
          ? "border-charcoal ring-1 ring-charcoal ring-offset-1"
          : isLight
            ? "border-soft-gray/80"
            : "border-transparent"
      }`}
      style={{ backgroundColor: hex }}
    />
  );
}
