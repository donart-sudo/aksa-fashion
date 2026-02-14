"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";
import ProductCard from "@/components/product/ProductCard";
import type { ProductCardData } from "@/components/product/ProductCard";

const ITEMS_PER_PAGE = 4;

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

  const displayedProducts = products.slice(0, visible);
  const hasMore = visible < products.length;

  return (
    <section className="py-14 lg:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="flex items-end justify-between mb-8 lg:mb-10">
          <div className="flex items-start gap-4 lg:gap-6">
            {sectionNumber && (
              <span className="hidden sm:block font-serif text-[3.5rem] lg:text-[4.5rem] leading-none text-charcoal/[0.06] select-none -mt-2 tabular-nums">
                {sectionNumber}
              </span>
            )}
            <div>
              <span className="block h-px w-8 bg-gold mb-4" />
              <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl text-charcoal leading-tight mb-1.5">
                {title || t("newArrivalsTitle")}
              </h2>
              <p className="text-sm text-charcoal/70">
                {t("newArrivalsSubtitle")}
              </p>
            </div>
          </div>

          {showViewAll && (
            <Link
              href={`/${locale}/collections/new`}
              className="hidden sm:inline-flex items-center gap-3 group"
            >
              <span className="text-xs tracking-widest uppercase text-charcoal/60 group-hover:text-charcoal transition-colors duration-300">
                {tCommon("viewAll")}
              </span>
              <span className="block h-px bg-charcoal/30 w-6 group-hover:w-10 group-hover:bg-charcoal transition-all duration-500" />
            </Link>
          )}
        </div>

        {/* Product grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-5">
          {displayedProducts.map((product, i) => (
            <ProductCard key={product.id} product={product} priority={i < 4} />
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
          <div className="sm:hidden text-center mt-8">
            <Link
              href={`/${locale}/collections/new`}
              className="inline-flex items-center gap-3 group"
            >
              <span className="text-xs tracking-widest uppercase text-charcoal/60 group-hover:text-charcoal transition-colors duration-300">
                {tCommon("viewAll")}
              </span>
              <span className="block h-px bg-charcoal/30 w-6 group-hover:w-10 group-hover:bg-charcoal transition-all duration-500" />
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
