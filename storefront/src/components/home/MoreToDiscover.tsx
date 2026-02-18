"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";
import Image from "next/image";
import { HeartIcon } from "@heroicons/react/24/outline";
import { HeartIcon as HeartIconSolid } from "@heroicons/react/24/solid";
import { ShoppingBagIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { CheckIcon } from "@heroicons/react/24/solid";
import { formatPrice } from "@/lib/utils";
import { useCart } from "@/lib/cart";
import { useWishlist } from "@/lib/wishlist";
import useEmblaCarousel from "embla-carousel-react";
import type { ProductCardData } from "@/components/product/ProductCard";

/* ── Editorial card — clean image with info below, editorial index, size picker ── */
function EditorialCard({
  product,
  index,
  priority,
}: {
  product: ProductCardData;
  index: number;
  priority?: boolean;
}) {
  const t = useTranslations("common");
  const locale = useLocale();
  const { addItem } = useCart();
  const { toggleItem, isWishlisted } = useWishlist();
  const [hovered, setHovered] = useState(false);
  const [added, setAdded] = useState(false);
  const [showSizes, setShowSizes] = useState(false);
  const wishlisted = isWishlisted(product.id);
  const editorialNum = String(index + 1).padStart(2, "0");
  const hasSizes = product.sizes && product.sizes.length > 0;

  const addToCartDirect = useCallback(() => {
    addItem({
      productId: product.id,
      variantId: product.id,
      handle: product.handle,
      title: product.title,
      thumbnail: product.thumbnail,
      price: product.price,
      quantity: 1,
    });
    setAdded(true);
    setShowSizes(false);
    setTimeout(() => setAdded(false), 1800);
  }, [addItem, product]);

  const addToCartWithSize = useCallback(
    (e: React.MouseEvent, size: string) => {
      e.preventDefault();
      e.stopPropagation();
      addItem({
        productId: product.id,
        variantId: `${product.id}-${size}`,
        handle: product.handle,
        title: product.title,
        thumbnail: product.thumbnail,
        price: product.price,
        quantity: 1,
        size,
      });
      setAdded(true);
      setShowSizes(false);
      setTimeout(() => setAdded(false), 1800);
    },
    [addItem, product]
  );

  const handleAddToCart = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (added) return;
      if (hasSizes) {
        setShowSizes(true);
        return;
      }
      addToCartDirect();
    },
    [added, hasSizes, addToCartDirect]
  );

  const handleCloseSizes = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setShowSizes(false);
    },
    []
  );

  const handleWishlist = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      toggleItem(product);
    },
    [toggleItem, product]
  );

  return (
    <div
      className="group relative"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setShowSizes(false); }}
    >
      <Link
        href={`/${locale}/products/${product.handle}`}
        className="block relative aspect-[3/4] overflow-hidden bg-[#f0eeeb]"
      >
        {/* Image */}
        <Image
          src={product.thumbnail}
          alt={product.title}
          fill
          className={`object-cover object-top transition-all duration-[800ms] ease-out ${
            hovered ? "scale-[1.05]" : "scale-100"
          }`}
          sizes="(max-width: 640px) 72vw, (max-width: 1024px) 42vw, 25vw"
          priority={priority}
        />

        {/* Warm overlay that lifts on hover */}
        <div
          className={`absolute inset-0 bg-[#2D2D2D]/[0.06] transition-opacity duration-500 ${
            hovered ? "opacity-0" : "opacity-100"
          }`}
        />

        {/* Editorial index — bottom-left */}
        <span className="absolute bottom-3.5 left-3.5 z-10 text-[11px] font-medium tracking-[0.15em] text-white/60 drop-shadow-sm">
          {editorialNum}
        </span>

        {/* Badge */}
        {product.badge && (
          <span className="absolute top-3.5 left-11 z-10 px-2.5 py-0.5 text-[9px] font-bold tracking-[0.15em] uppercase bg-gold text-white">
            {product.badge === "new" ? t("newArrival") : t("bestSeller")}
          </span>
        )}

        {/* Wishlist */}
        <button
          onClick={handleWishlist}
          className="absolute top-3 right-3 z-10 w-10 h-10 flex items-center justify-center min-w-[40px] min-h-[40px]"
          aria-label={
            wishlisted ? t("removeFromWishlist") : t("addToWishlist")
          }
        >
          {wishlisted ? (
            <HeartIconSolid className="w-[22px] h-[22px] text-red-500 drop-shadow-md" />
          ) : (
            <HeartIcon
              className={`w-[22px] h-[22px] drop-shadow-md transition-all duration-300 ${
                hovered ? "text-white" : "text-white/70"
              }`}
            />
          )}
        </button>

        {/* ── Size picker overlay ── */}
        {showSizes && hasSizes && (
          <div
            className="absolute inset-0 z-30 bg-white/95 backdrop-blur-sm flex flex-col items-center justify-center p-4"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
          >
            <button
              onClick={handleCloseSizes}
              className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center text-charcoal/30 hover:text-charcoal transition-colors"
              aria-label={t("close")}
            >
              <XMarkIcon className="w-5 h-5" />
            </button>

            <p className="text-[10px] sm:text-[11px] tracking-[0.25em] uppercase text-charcoal/40 mb-4">
              {t("selectSize")}
            </p>

            <div className="flex flex-wrap justify-center gap-2 max-w-full">
              {product.sizes!.map((size) => (
                <button
                  key={size}
                  onClick={(e) => addToCartWithSize(e, size)}
                  className="min-w-[40px] min-h-[40px] px-3 py-2 border border-charcoal/[0.12] text-xs font-medium text-charcoal hover:bg-charcoal hover:text-white transition-all duration-200"
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Quick-add — desktop hover slide-up */}
        {!showSizes && (
          <div
            className={`absolute bottom-0 inset-x-0 z-20 p-2.5 transition-all duration-300 ease-out hidden sm:block ${
              hovered
                ? "translate-y-0 opacity-100"
                : "translate-y-full opacity-0"
            }`}
          >
            <button
              onClick={handleAddToCart}
              className={`w-full flex items-center justify-center gap-2 py-3 text-[10px] font-bold tracking-[0.15em] uppercase transition-all duration-200 backdrop-blur-md cursor-pointer ${
                added
                  ? "bg-charcoal text-white"
                  : "bg-white/90 text-charcoal hover:bg-charcoal hover:text-white"
              }`}
            >
              {added ? (
                <>
                  <CheckIcon className="w-3.5 h-3.5" />
                  {t("added")}
                </>
              ) : (
                <>
                  <ShoppingBagIcon className="w-3.5 h-3.5" />
                  {hasSizes ? t("selectSize") : t("addToCart")}
                </>
              )}
            </button>
          </div>
        )}

        {/* Quick-add — mobile bag icon */}
        {!showSizes && (
          <button
            onClick={handleAddToCart}
            className={`absolute bottom-2.5 right-2.5 z-20 sm:hidden w-10 h-10 min-w-[40px] min-h-[40px] flex items-center justify-center rounded-full shadow-md transition-all duration-200 cursor-pointer ${
              added
                ? "bg-charcoal text-white scale-110"
                : "bg-white/80 backdrop-blur-sm text-charcoal active:scale-95"
            }`}
            aria-label={added ? t("added") : t("addToCart")}
          >
            {added ? (
              <CheckIcon className="w-4 h-4" />
            ) : (
              <ShoppingBagIcon className="w-4 h-4" />
            )}
          </button>
        )}
      </Link>

      {/* Info below image — editorial style */}
      <div className="mt-3.5 space-y-1.5">
        {product.collection && (
          <span className="text-[10px] tracking-[0.3em] uppercase text-gold/70 block">
            {product.collection}
          </span>
        )}
        <h3 className="font-serif text-base sm:text-[17px] lg:text-lg font-medium text-charcoal leading-snug line-clamp-1 group-hover:underline decoration-charcoal/20 underline-offset-2 transition-all duration-300">
          {product.title}
        </h3>
        <span className="text-[15px] text-charcoal/80 font-semibold">
          {formatPrice(product.price)}
        </span>
      </div>
    </div>
  );
}

/* ── Main section ── */
interface MoreToDiscoverProps {
  products: ProductCardData[];
}

export default function MoreToDiscover({ products }: MoreToDiscoverProps) {
  const t = useTranslations("home");
  const tCommon = useTranslations("common");
  const locale = useLocale();
  const sectionRef = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    containScroll: "trimSnaps",
    dragFree: true,
    slidesToScroll: 1,
  });

  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const progressRef = useRef<HTMLDivElement>(null);

  const updateButtons = useCallback(() => {
    if (!emblaApi) return;
    setCanScrollLeft(emblaApi.canScrollPrev());
    setCanScrollRight(emblaApi.canScrollNext());
  }, [emblaApi]);

  const updateProgress = useCallback(() => {
    if (!emblaApi || !progressRef.current) return;
    const progress = Math.max(0, Math.min(1, emblaApi.scrollProgress()));
    progressRef.current.style.transform = `translateX(${progress * 400}%)`;
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on("select", updateButtons);
    emblaApi.on("reInit", updateButtons);
    emblaApi.on("scroll", updateProgress);
    emblaApi.on("reInit", updateProgress);
    updateButtons();
    updateProgress();
    return () => {
      emblaApi.off("select", updateButtons);
      emblaApi.off("reInit", updateButtons);
      emblaApi.off("scroll", updateProgress);
      emblaApi.off("reInit", updateProgress);
    };
  }, [emblaApi, updateButtons, updateProgress]);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.05 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  return (
    <section ref={sectionRef} className="py-20 lg:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="mb-12 lg:mb-14">
          <div className="flex items-center gap-4 mb-6">
            <span className="block h-[1.5px] w-10 bg-gold" />
            <span className="text-[11px] tracking-[0.35em] uppercase text-gold font-medium">
              Keep Exploring
            </span>
          </div>

          <div className="flex items-end justify-between">
            <h2 className="font-serif text-[2rem] sm:text-[2.5rem] lg:text-[3.25rem] font-bold text-charcoal leading-[0.95]">
              {t("moreToExplore")}
            </h2>

            <div className="flex items-center gap-4 flex-shrink-0">
              <Link
                href={`/${locale}/collections`}
                className="hidden sm:inline-flex items-center gap-2 group"
              >
                <span className="text-[11px] tracking-[0.2em] uppercase text-charcoal/50 group-hover:text-charcoal transition-colors duration-300 border-b border-charcoal/20 group-hover:border-charcoal pb-0.5">
                  {tCommon("viewAll")}
                </span>
                <svg
                  className="w-3.5 h-3.5 text-charcoal/30 group-hover:text-charcoal group-hover:translate-x-0.5 transition-all duration-300"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                  />
                </svg>
              </Link>

              <span className="hidden sm:block w-px h-5 bg-charcoal/10" />

              <div className="hidden sm:flex items-center gap-2">
                <button
                  onClick={scrollPrev}
                  disabled={!canScrollLeft}
                  className={`w-11 h-11 flex items-center justify-center border transition-all duration-300 ${
                    canScrollLeft
                      ? "border-charcoal/20 text-charcoal hover:border-charcoal hover:bg-charcoal hover:text-white"
                      : "border-charcoal/8 text-charcoal/15 cursor-default"
                  }`}
                  aria-label="Previous"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                  </svg>
                </button>
                <button
                  onClick={scrollNext}
                  disabled={!canScrollRight}
                  className={`w-11 h-11 flex items-center justify-center border transition-all duration-300 ${
                    canScrollRight
                      ? "border-charcoal/20 text-charcoal hover:border-charcoal hover:bg-charcoal hover:text-white"
                      : "border-charcoal/8 text-charcoal/15 cursor-default"
                  }`}
                  aria-label="Next"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Carousel — 4 columns on desktop */}
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex ml-4 sm:ml-6 lg:ml-[max(1.5rem,calc((100vw-80rem)/2+1.5rem))]">
          {products.map((product, i) => (
            <div
              key={product.id}
              className="flex-[0_0_72vw] sm:flex-[0_0_42vw] lg:flex-[0_0_25%] min-w-0 pr-3.5 sm:pr-4 lg:pr-5"
              style={{
                opacity: visible ? 1 : 0,
                transform: visible ? "none" : "translateY(24px)",
                transition: `opacity 500ms cubic-bezier(0.16, 1, 0.3, 1) ${i * 70}ms, transform 500ms cubic-bezier(0.16, 1, 0.3, 1) ${i * 70}ms`,
              }}
            >
              <EditorialCard product={product} index={i} priority={i < 4} />
            </div>
          ))}
        </div>
      </div>

      {/* Progress indicator */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        <div className="flex items-center gap-6">
          {/* Track bar */}
          <div className="flex-1 h-[1.5px] bg-charcoal/[0.08] relative overflow-hidden">
            <div
              ref={progressRef}
              className="absolute top-0 left-0 h-full bg-gold will-change-transform"
              style={{ width: "20%" }}
            />
          </div>

          {/* Mobile arrows */}
          <div className="flex sm:hidden items-center gap-1.5 flex-shrink-0">
            <button
              onClick={scrollPrev}
              disabled={!canScrollLeft}
              className={`w-8 h-8 flex items-center justify-center transition-colors duration-200 ${
                canScrollLeft ? "text-charcoal" : "text-charcoal/15"
              }`}
              aria-label="Previous"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
              </svg>
            </button>
            <button
              onClick={scrollNext}
              disabled={!canScrollRight}
              className={`w-8 h-8 flex items-center justify-center transition-colors duration-200 ${
                canScrollRight ? "text-charcoal" : "text-charcoal/15"
              }`}
              aria-label="Next"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile View All */}
      <div className="flex sm:hidden justify-center mt-6">
        <Link
          href={`/${locale}/collections`}
          className="inline-flex items-center gap-2 group"
        >
          <span className="text-[11px] tracking-[0.2em] uppercase text-charcoal/50 group-hover:text-charcoal transition-colors duration-300 border-b border-charcoal/20 group-hover:border-charcoal pb-0.5">
            {tCommon("viewAll")}
          </span>
          <svg className="w-3.5 h-3.5 text-charcoal/30 group-hover:text-charcoal group-hover:translate-x-0.5 transition-all duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
          </svg>
        </Link>
      </div>
    </section>
  );
}
