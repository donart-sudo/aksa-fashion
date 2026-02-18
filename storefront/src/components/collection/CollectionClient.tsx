"use client";

import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { motion, useInView, AnimatePresence } from "framer-motion";
import {
  AdjustmentsHorizontalIcon,
  ChevronDownIcon,
  XMarkIcon,
  CheckIcon,
} from "@heroicons/react/24/outline";
import ProductCard from "@/components/product/ProductCard";
import type { ProductCardData } from "@/components/product/ProductCard";
import FilterSheet from "./FilterSheet";

interface CollectionClientProps {
  products: ProductCardData[];
  title: string;
  locale: string;
}

const PAGE_SIZE = 12;

export default function CollectionClient({
  products,
  title,
  locale,
}: CollectionClientProps) {
  const t = useTranslations("common");
  const [sortBy, setSortBy] = useState("newest");
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedPrice, setSelectedPrice] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [sortOpen, setSortOpen] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  /* Accordion: which sidebar sections are open (all open by default) */
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    size: true,
    color: true,
    price: true,
  });

  const heroRef = useRef(null);
  const heroInView = useInView(heroRef, { once: true });
  const sortRef = useRef<HTMLDivElement>(null);

  /* ── Derive filters from ACTUAL product data ── */
  const availableSizes = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => p.sizes?.forEach((s) => set.add(s)));
    return Array.from(set);
  }, [products]);

  const availableColors = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => p.colors?.forEach((c) => set.add(c)));
    return Array.from(set);
  }, [products]);

  const activePriceRanges = useMemo(() => {
    return PRICE_RANGES.filter((range) => {
      const [min, max] = range.value.split("-").map(Number);
      return products.some((p) => {
        const eur = p.price / 100;
        return eur >= min && eur <= max;
      });
    });
  }, [products]);

  const showSizes = availableSizes.length > 0;
  const showColors = availableColors.length > 0;
  const showPrice = activePriceRanges.length >= 2;
  const hasAnyFilter = showSizes || showColors || showPrice;

  /* ── Filtered + sorted products ── */
  const filtered = useMemo(() => {
    let result = [...products];

    if (selectedSizes.length > 0) {
      result = result.filter((p) =>
        p.sizes?.some((s) => selectedSizes.includes(s))
      );
    }

    if (selectedColors.length > 0) {
      result = result.filter((p) =>
        p.colors?.some((c) =>
          selectedColors.some(
            (sc) => c.toLowerCase() === sc.toLowerCase()
          )
        )
      );
    }

    if (selectedPrice) {
      const [min, max] = selectedPrice.split("-").map(Number);
      result = result.filter((p) => {
        const priceEur = p.price / 100;
        return priceEur >= min && priceEur <= max;
      });
    }

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

  /* ── Reset visible count when filters change ── */
  const filterKey = `${selectedSizes.join()}-${selectedColors.join()}-${selectedPrice}-${sortBy}`;
  const prevFilterKey = useRef(filterKey);
  const filterUsed = useRef(false);
  useEffect(() => {
    if (prevFilterKey.current !== filterKey) {
      setVisibleCount(PAGE_SIZE);
      prevFilterKey.current = filterKey;
    }
  }, [filterKey]);

  /* ── Close sort dropdown on outside click ── */
  useEffect(() => {
    if (!sortOpen) return;
    const handler = (e: MouseEvent) => {
      if (sortRef.current && !sortRef.current.contains(e.target as Node)) {
        setSortOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [sortOpen]);

  /* ── Infinite scroll: auto-load more when sentinel is near viewport ── */
  const sentinelRef = useRef<HTMLDivElement>(null);
  const [mobileSortOpen, setMobileSortOpen] = useState(false);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !loadingMore) {
          setLoadingMore(true);
          setTimeout(() => {
            setVisibleCount((v) => v + PAGE_SIZE);
            setLoadingMore(false);
          }, 400);
        }
      },
      { rootMargin: "200px" }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [loadingMore, filtered.length, visibleCount]);

  /* Lock body scroll when mobile sort sheet is open */
  useEffect(() => {
    if (mobileSortOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [mobileSortOpen]);

  const prevVisibleCount = useRef(visibleCount);
  useEffect(() => {
    prevVisibleCount.current = visibleCount;
  }, [visibleCount]);

  const visible = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;

  const activeFilterCount =
    selectedSizes.length +
    selectedColors.length +
    (selectedPrice ? 1 : 0);

  const currentSortLabel =
    SORT_OPTIONS.find((o) => o.value === sortBy)?.key || "newest";

  /* ── Handlers ── */
  const handleClearAll = useCallback(() => {
    filterUsed.current = true;
    setSelectedSizes([]);
    setSelectedColors([]);
    setSelectedPrice("");
  }, []);

  const toggleSize = useCallback((size: string) => {
    filterUsed.current = true;
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );
  }, []);

  const toggleColor = useCallback((color: string) => {
    filterUsed.current = true;
    setSelectedColors((prev) =>
      prev.includes(color)
        ? prev.filter((c) => c !== color)
        : [...prev, color]
    );
  }, []);

  const handlePriceChange = useCallback((price: string) => {
    filterUsed.current = true;
    setSelectedPrice(price);
  }, []);

  const handleSortChange = useCallback((value: string) => {
    filterUsed.current = true;
    setSortBy(value);
  }, []);

  const toggleSection = useCallback((key: string) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  return (
    <div>
      {/* ─── Hero Header ─── */}
      <section
        ref={heroRef}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 lg:pt-12"
      >
        <motion.nav
          initial={{ opacity: 0 }}
          animate={heroInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex items-center gap-2 text-[11px] text-charcoal/40 tracking-wide mb-6 lg:mb-8"
        >
          <Link
            href={`/${locale}`}
            className="hover:text-charcoal transition-colors"
          >
            {t("home")}
          </Link>
          <span className="text-charcoal/20">/</span>
          <Link
            href={`/${locale}/collections`}
            className="hover:text-charcoal transition-colors"
          >
            {t("collections")}
          </Link>
          <span className="text-charcoal/20">/</span>
          <span className="text-charcoal font-medium">{title}</span>
        </motion.nav>

        <div className="text-center max-w-2xl mx-auto mb-8 lg:mb-10">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={heroInView ? { opacity: 1, y: 0 } : {}}
            transition={{
              duration: 0.7,
              delay: 0.15,
              ease: [0.22, 1, 0.36, 1] as const,
            }}
          >
            <span className="inline-block text-[10px] sm:text-[11px] tracking-[0.3em] uppercase text-gold/80 font-medium mb-3">
              {t("collections")}
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={heroInView ? { opacity: 1, y: 0 } : {}}
            transition={{
              duration: 0.8,
              delay: 0.25,
              ease: [0.22, 1, 0.36, 1] as const,
            }}
            className="font-serif text-[2rem] sm:text-[2.75rem] lg:text-[3.25rem] font-semibold text-charcoal leading-[1.05] tracking-tight"
          >
            {title}
          </motion.h1>

          <motion.div
            initial={{ opacity: 0 }}
            animate={heroInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex items-center justify-center gap-3 mt-3"
          >
            <span className="block w-8 h-px bg-gold/40" />
            <span className="block w-1.5 h-1.5 rotate-45 border border-gold/50" />
            <span className="block w-8 h-px bg-gold/40" />
          </motion.div>
        </div>
      </section>

      {/* ─── Main: Sidebar + Products ─── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10 lg:pb-16">

        {/* ── Mobile toolbar ── */}
        <div className="lg:hidden">
          <div className="flex items-center justify-between py-3 border-y border-soft-gray/40 mb-4">
            {hasAnyFilter ? (
              <button
                onClick={() => setFilterOpen(true)}
                className="flex items-center gap-2 text-sm font-medium text-charcoal min-h-[44px]"
              >
                <AdjustmentsHorizontalIcon className="w-5 h-5" />
                {t("filters")}
                {activeFilterCount > 0 && (
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-charcoal text-white text-[10px] font-bold">
                    {activeFilterCount}
                  </span>
                )}
              </button>
            ) : (
              <span className="text-[12px] text-charcoal/30 tracking-wide">
                {filtered.length} {t("items")}
              </span>
            )}

            {/* Mobile sort — opens bottom sheet */}
            <button
              onClick={() => setMobileSortOpen(true)}
              className="flex items-center gap-1.5 text-sm font-medium text-charcoal min-h-[44px]"
            >
              {t(currentSortLabel)}
              <ChevronDownIcon className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Active filter pills — mobile */}
          {activeFilterCount > 0 && (
            <div className="flex flex-wrap items-center gap-2 pb-4">
              {selectedSizes.map((s) => (
                <button
                  key={`ms-${s}`}
                  onClick={() => toggleSize(s)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-full border border-charcoal/15 text-xs text-charcoal font-medium min-h-[32px]"
                >
                  {s}
                  <XMarkIcon className="w-3 h-3 text-charcoal/40" />
                </button>
              ))}
              {selectedColors.map((c) => (
                <button
                  key={`mc-${c}`}
                  onClick={() => toggleColor(c)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-charcoal/15 text-xs text-charcoal font-medium min-h-[32px]"
                >
                  <ColorDot color={c} />
                  {c}
                  <XMarkIcon className="w-3 h-3 text-charcoal/40" />
                </button>
              ))}
              {selectedPrice && (
                <button
                  onClick={() => handlePriceChange("")}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-full border border-charcoal/15 text-xs text-charcoal font-medium min-h-[32px]"
                >
                  {PRICE_RANGES.find((r) => r.value === selectedPrice)?.label}
                  <XMarkIcon className="w-3 h-3 text-charcoal/40" />
                </button>
              )}
              <button
                onClick={handleClearAll}
                className="text-[11px] text-charcoal/35 underline underline-offset-4 ml-1"
              >
                {t("clearAll")}
              </button>
            </div>
          )}
        </div>

        {/* ── Desktop: sidebar + grid ── */}
        <div className="flex gap-8 lg:gap-12">

          {/* ══ Left sidebar — desktop only ══ */}
          {hasAnyFilter && (
            <motion.aside
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] as const }}
              className="hidden lg:block w-[230px] xl:w-[250px] flex-shrink-0"
            >
              <div className="sticky top-28 pb-8">

                {/* Clear all — top of filters */}
                {activeFilterCount > 0 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3, delay: 0.2 }}
                    className="pb-3 mb-1 border-b border-charcoal/[0.07]"
                  >
                    <button
                      onClick={handleClearAll}
                      className="text-[12px] text-charcoal/40 underline underline-offset-4 decoration-charcoal/15 hover:text-charcoal hover:decoration-charcoal/40 transition-all tracking-wide"
                    >
                      {t("clearAll")} ({activeFilterCount})
                    </button>
                  </motion.div>
                )}

                {/* Size accordion */}
                {showSizes && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.15, ease: [0.22, 1, 0.36, 1] as const }}
                    className="border-b border-charcoal/[0.07]"
                  >
                    <button
                      onClick={() => toggleSection("size")}
                      className="flex items-center justify-between w-full py-5 group"
                    >
                      <span className="font-serif text-[15px] text-charcoal tracking-wide">
                        {t("size")}
                        {selectedSizes.length > 0 && (
                          <span className="ml-2 text-[11px] font-sans text-gold font-medium">
                            ({selectedSizes.length})
                          </span>
                        )}
                      </span>
                      <motion.span
                        animate={{ rotate: openSections.size ? 180 : 0 }}
                        transition={{ duration: 0.25, ease: "easeInOut" }}
                      >
                        <ChevronDownIcon className="w-4 h-4 text-charcoal/25 group-hover:text-charcoal/50 transition-colors" />
                      </motion.span>
                    </button>
                    <AnimatePresence initial={false}>
                      {openSections.size && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] as const }}
                          className="overflow-hidden"
                        >
                          <div className="flex flex-wrap gap-2 pb-5">
                            {availableSizes.map((size) => {
                              const active = selectedSizes.includes(size);
                              return (
                                <button
                                  key={size}
                                  onClick={() => toggleSize(size)}
                                  className={`h-10 min-w-[46px] px-4 text-[13px] font-medium tracking-wide border transition-all duration-200 ${
                                    active
                                      ? "border-charcoal bg-charcoal text-white"
                                      : "border-charcoal/[0.08] text-charcoal/50 hover:border-charcoal/20 hover:text-charcoal"
                                  }`}
                                >
                                  {size}
                                </button>
                              );
                            })}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                )}

                {/* Color accordion */}
                {showColors && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.25, ease: [0.22, 1, 0.36, 1] as const }}
                    className="border-b border-charcoal/[0.07]"
                  >
                    <button
                      onClick={() => toggleSection("color")}
                      className="flex items-center justify-between w-full py-5 group"
                    >
                      <span className="font-serif text-[15px] text-charcoal tracking-wide">
                        {t("color")}
                        {selectedColors.length > 0 && (
                          <span className="ml-2 text-[11px] font-sans text-gold font-medium">
                            ({selectedColors.length})
                          </span>
                        )}
                      </span>
                      <motion.span
                        animate={{ rotate: openSections.color ? 180 : 0 }}
                        transition={{ duration: 0.25, ease: "easeInOut" }}
                      >
                        <ChevronDownIcon className="w-4 h-4 text-charcoal/25 group-hover:text-charcoal/50 transition-colors" />
                      </motion.span>
                    </button>
                    <AnimatePresence initial={false}>
                      {openSections.color && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] as const }}
                          className="overflow-hidden"
                        >
                          <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 pb-5 px-0.5">
                            {availableColors.map((color) => {
                              const active = selectedColors.includes(color);
                              return (
                                <button
                                  key={color}
                                  onClick={() => toggleColor(color)}
                                  className={`flex items-center gap-2.5 py-2 rounded text-[13px] transition-all duration-150 ${
                                    active
                                      ? "text-charcoal font-medium"
                                      : "text-charcoal/40 hover:text-charcoal/65"
                                  }`}
                                >
                                  <ColorSwatch color={color} selected={active} />
                                  {color}
                                </button>
                              );
                            })}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                )}

                {/* Price accordion */}
                {showPrice && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.35, ease: [0.22, 1, 0.36, 1] as const }}
                    className="border-b border-charcoal/[0.07]"
                  >
                    <button
                      onClick={() => toggleSection("price")}
                      className="flex items-center justify-between w-full py-5 group"
                    >
                      <span className="font-serif text-[15px] text-charcoal tracking-wide">
                        {t("price")}
                        {selectedPrice && (
                          <span className="ml-2 text-[11px] font-sans text-gold font-medium">
                            (1)
                          </span>
                        )}
                      </span>
                      <motion.span
                        animate={{ rotate: openSections.price ? 180 : 0 }}
                        transition={{ duration: 0.25, ease: "easeInOut" }}
                      >
                        <ChevronDownIcon className="w-4 h-4 text-charcoal/25 group-hover:text-charcoal/50 transition-colors" />
                      </motion.span>
                    </button>
                    <AnimatePresence initial={false}>
                      {openSections.price && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] as const }}
                          className="overflow-hidden"
                        >
                          <div className="space-y-1 pb-5">
                            {activePriceRanges.map((range) => {
                              const active = selectedPrice === range.value;
                              return (
                                <button
                                  key={range.value}
                                  onClick={() =>
                                    handlePriceChange(active ? "" : range.value)
                                  }
                                  className={`w-full flex items-center gap-3 py-2 text-[13px] transition-all duration-150 ${
                                    active
                                      ? "text-charcoal font-medium"
                                      : "text-charcoal/40 hover:text-charcoal/65"
                                  }`}
                                >
                                  {/* Radio indicator */}
                                  <span
                                    className={`w-[18px] h-[18px] rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all duration-200 ${
                                      active
                                        ? "border-charcoal"
                                        : "border-charcoal/15"
                                    }`}
                                  >
                                    {active && (
                                      <motion.span
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        className="w-2.5 h-2.5 rounded-full bg-charcoal"
                                      />
                                    )}
                                  </span>
                                  {range.label}
                                </button>
                              );
                            })}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                )}

              </div>
            </motion.aside>
          )}

          {/* ── Right: products ── */}
          <div className="flex-1 min-w-0">

            {/* Top bar — sort + count (desktop) */}
            <div className="hidden lg:flex items-center justify-between pb-5">
              <span className="text-[12px] text-charcoal/30 tracking-wide">
                {filtered.length}{" "}
                {filtered.length === 1 ? t("product") : t("products")}
              </span>

              {/* Floating sort dropdown */}
              <div ref={sortRef} className="relative">
                <button
                  onClick={() => setSortOpen((v) => !v)}
                  className="flex items-center gap-2 text-[13px] font-medium text-charcoal/50 hover:text-charcoal transition-colors"
                >
                  {t("sortBy")}:{" "}
                  <span className="text-charcoal">{t(currentSortLabel)}</span>
                  <ChevronDownIcon
                    className={`w-3.5 h-3.5 transition-transform duration-200 ${
                      sortOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>
                <AnimatePresence>
                  {sortOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-full mt-2 z-30 bg-white border border-soft-gray/40 shadow-lg rounded-lg py-1.5 min-w-[210px]"
                    >
                      {SORT_OPTIONS.map((opt) => (
                        <button
                          key={opt.value}
                          onClick={() => {
                            handleSortChange(opt.value);
                            setSortOpen(false);
                          }}
                          className={`w-full text-left px-4 py-2.5 text-[13px] transition-colors ${
                            sortBy === opt.value
                              ? "text-charcoal font-medium bg-charcoal/[0.04]"
                              : "text-charcoal/45 hover:text-charcoal hover:bg-charcoal/[0.02]"
                          }`}
                        >
                          {t(opt.key)}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Product grid */}
            {visible.length > 0 ? (
              <>
                <div
                  className={`grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-y-10 ${
                    hasAnyFilter
                      ? "sm:grid-cols-2 lg:grid-cols-3 lg:gap-x-4 lg:gap-y-12"
                      : "sm:grid-cols-3 lg:grid-cols-4 lg:gap-x-5 lg:gap-y-12"
                  }`}
                >
                  {visible.map((product, i) => {
                    const isNew = i >= prevVisibleCount.current;
                    if (filterUsed.current && !isNew) {
                      return (
                        <div key={product.id}>
                          <ProductCard product={product} priority={i < 4} />
                        </div>
                      );
                    }
                    return (
                      <motion.div
                        key={product.id}
                        initial={{ opacity: 0, y: isNew ? 30 : 20, scale: isNew ? 0.97 : 1 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{
                          duration: 0.5,
                          delay: isNew
                            ? (i - prevVisibleCount.current) * 0.06
                            : Math.min(i * 0.04, 0.3),
                          ease: [0.22, 1, 0.36, 1] as const,
                        }}
                      >
                        <ProductCard product={product} priority={i < 4} />
                      </motion.div>
                    );
                  })}
                </div>

                {/* Infinite scroll sentinel */}
                {hasMore && (
                  <div ref={sentinelRef} className="flex justify-center py-10 lg:py-14">
                    {loadingMore && (
                      <div className="w-5 h-5 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
                    )}
                  </div>
                )}
                {!hasMore && visible.length > PAGE_SIZE && (
                  <p className="text-center text-[11px] text-charcoal/25 mt-10 tracking-wide">
                    {t("showing")} {visible.length} {t("of")}{" "}
                    {filtered.length}
                  </p>
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
                  className="px-8 py-3.5 text-[12px] font-medium tracking-[0.15em] uppercase border border-charcoal/15 text-charcoal hover:bg-charcoal hover:text-white transition-all duration-300"
                >
                  {t("clearAllFilters")}
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Mobile filter sheet */}
      <FilterSheet
        isOpen={filterOpen}
        onClose={() => setFilterOpen(false)}
        sizes={availableSizes}
        colors={availableColors}
        selectedSizes={selectedSizes}
        selectedColors={selectedColors}
        selectedPrice={selectedPrice}
        onToggleSize={toggleSize}
        onToggleColor={toggleColor}
        onPriceChange={handlePriceChange}
        onClear={handleClearAll}
        resultCount={filtered.length}
      />

      {/* Mobile sort bottom sheet */}
      {mobileSortOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/40 z-50 lg:hidden animate-fade-in"
            onClick={() => setMobileSortOpen(false)}
          />
          <div className="fixed bottom-0 left-0 right-0 bg-white z-50 lg:hidden rounded-t-2xl animate-slide-up">
            {/* Drag handle */}
            <div className="flex justify-center pt-3 pb-1">
              <span className="w-10 h-1 rounded-full bg-charcoal/15" />
            </div>
            <div className="flex items-center justify-between px-5 py-3 border-b border-charcoal/[0.06]">
              <h3 className="font-serif text-lg text-charcoal">
                {t("sortBy")}
              </h3>
              <button
                onClick={() => setMobileSortOpen(false)}
                className="p-2 -mr-2 min-w-[44px] min-h-[44px] flex items-center justify-center"
              >
                <XMarkIcon className="w-5 h-5 text-charcoal/40" />
              </button>
            </div>
            <div className="py-2 safe-area-pb">
              {SORT_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => {
                    handleSortChange(opt.value);
                    setMobileSortOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-5 py-4 text-[14px] transition-colors min-h-[48px] ${
                    sortBy === opt.value
                      ? "text-charcoal font-medium"
                      : "text-charcoal/45 active:bg-charcoal/[0.03]"
                  }`}
                >
                  {t(opt.key)}
                  {sortBy === opt.value && (
                    <CheckIcon className="w-5 h-5 text-gold" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

/* ═══ Constants ═══ */

const SORT_OPTIONS = [
  { value: "newest", key: "newest" },
  { value: "price-asc", key: "priceLowToHigh" },
  { value: "price-desc", key: "priceHighToLow" },
  { value: "name-asc", key: "nameAZ" },
];

export const PRICE_RANGES = [
  { label: "Under €500", value: "0-500" },
  { label: "€500 – €800", value: "500-800" },
  { label: "€800 – €1,200", value: "800-1200" },
  { label: "Over €1,200", value: "1200-99999" },
];

/* ═══ Color helpers ═══ */

export const COLOR_HEX: Record<string, string> = {
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

/** Small dot for filter chips */
export function ColorDot({ color }: { color: string }) {
  const hex = COLOR_HEX[color.toLowerCase().trim()] ?? "#D9D9D9";
  const isLight =
    hex === "#FFFFFF" || hex === "#FFFFF0" || hex === "#FFFDD0";
  return (
    <span
      className={`inline-block w-3.5 h-3.5 rounded-full flex-shrink-0 ${
        isLight ? "ring-1 ring-inset ring-charcoal/10" : ""
      }`}
      style={{ backgroundColor: hex }}
    />
  );
}

/** Larger swatch with checkmark for sidebar & sheet */
export function ColorSwatch({
  color,
  selected,
}: {
  color: string;
  selected?: boolean;
}) {
  const hex = COLOR_HEX[color.toLowerCase().trim()] ?? "#D9D9D9";
  const isLight =
    hex === "#FFFFFF" ||
    hex === "#FFFFF0" ||
    hex === "#FFFDD0" ||
    hex === "#F7E7CE" ||
    hex === "#E8BEAC" ||
    hex === "#FFCBA4" ||
    hex === "#D9C5A0" ||
    hex === "#C0C0C0" ||
    hex === "#F4C2C2";
  return (
    <span
      className={`relative inline-flex items-center justify-center flex-shrink-0 w-8 h-8 rounded-full transition-all duration-200 ${
        selected ? "border-2 border-charcoal" : "border-2 border-transparent"
      }`}
    >
      <span
        className={`w-5 h-5 rounded-full ${
          isLight ? "shadow-[inset_0_0_0_1px_rgba(0,0,0,0.08)]" : ""
        }`}
        style={{ backgroundColor: hex }}
      />
      {selected && (
        <CheckIcon
          className={`absolute w-2.5 h-2.5 stroke-[3] ${
            isLight ? "text-charcoal" : "text-white"
          }`}
        />
      )}
    </span>
  );
}
