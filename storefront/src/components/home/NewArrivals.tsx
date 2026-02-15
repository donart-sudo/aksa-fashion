"use client";

import { useState, useRef, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";
import ProductCard from "@/components/product/ProductCard";
import type { ProductCardData } from "@/components/product/ProductCard";

const ITEMS_PER_PAGE = 8;

interface NewArrivalsProps {
  products: ProductCardData[];
  title?: string;
  showViewAll?: boolean;
  sectionNumber?: string;
}

export default function NewArrivals({
  products,
  title,
  showViewAll = true,
  sectionNumber,
}: NewArrivalsProps) {
  const t = useTranslations("home");
  const tCommon = useTranslations("common");
  const locale = useLocale();
  const [visible, setVisible] = useState(ITEMS_PER_PAGE);

  const gridRef = useRef<HTMLDivElement>(null);
  const [gridVisible, setGridVisible] = useState(false);

  const displayedProducts = products.slice(0, visible);
  const hasMore = visible < products.length;

  useEffect(() => {
    const el = gridRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setGridVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.05 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section className="py-12 lg:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-10 lg:mb-12">
          {sectionNumber && (
            <span className="text-[11px] tracking-[0.3em] text-charcoal/20 tabular-nums block mb-3">
              {sectionNumber}
            </span>
          )}
          <h2 className="text-[1.75rem] sm:text-[2.25rem] lg:text-[2.75rem] font-black uppercase tracking-tight text-charcoal leading-none">
            {title || t("newArrivalsTitle")}
          </h2>
          <p className="text-xs sm:text-sm text-charcoal/35 tracking-wide mt-3">
            {t("newArrivalsSubtitle")}
          </p>
          {showViewAll && (
            <Link
              href={`/${locale}/collections/new`}
              className="inline-flex items-center gap-2 mt-5 group"
            >
              <span className="text-[11px] tracking-[0.2em] uppercase text-charcoal/40 group-hover:text-charcoal transition-colors duration-300 border-b border-charcoal/15 group-hover:border-charcoal pb-0.5">
                {tCommon("viewAll")}
              </span>
              <span className="text-charcoal/30 group-hover:text-charcoal group-hover:translate-x-1 transition-all duration-300 text-sm">→</span>
            </Link>
          )}
        </div>

        {/* Product grid */}
        <div ref={gridRef} className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-5">
          {displayedProducts.map((product, i) => (
            <div
              key={product.id}
              style={{
                opacity: gridVisible ? 1 : 0,
                transform: gridVisible ? "none" : "translateY(40px) scale(0.97)",
                transition: `opacity 700ms cubic-bezier(0.16, 1, 0.3, 1) ${i * 100}ms, transform 700ms cubic-bezier(0.16, 1, 0.3, 1) ${i * 100}ms`,
                willChange: "opacity, transform",
              }}
            >
              <ProductCard product={product} priority={i < 4} />
            </div>
          ))}
        </div>

        {/* Load More button */}
        {hasMore && (
          <div className="text-center mt-10 lg:mt-12">
            <button
              onClick={() => setVisible((v) => v + ITEMS_PER_PAGE)}
              className="inline-flex items-center gap-2 px-8 py-3.5 border border-charcoal/20 text-sm tracking-wide text-charcoal hover:border-charcoal hover:bg-charcoal hover:text-white transition-all duration-300"
            >
              {tCommon("loadMore")}
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 13.5L12 21m0 0l-7.5-7.5M12 21V3" />
              </svg>
            </button>
          </div>
        )}

        {/* Mobile view all */}
        {showViewAll && !hasMore && (
          <div className="sm:hidden text-center mt-10">
            <Link
              href={`/${locale}/collections/new`}
              className="inline-flex items-center gap-3 group"
            >
              <span className="text-[11px] tracking-[0.2em] uppercase text-charcoal/40 group-hover:text-charcoal transition-colors duration-300 border-b border-charcoal/15 pb-0.5">
                {tCommon("viewAll")}
              </span>
              <span className="text-charcoal/30 group-hover:text-charcoal group-hover:translate-x-1 transition-all duration-300">
                →
              </span>
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
