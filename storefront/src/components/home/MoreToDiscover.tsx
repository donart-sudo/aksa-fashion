"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";
import Image from "next/image";
import { HeartIcon } from "@heroicons/react/24/outline";
import { HeartIcon as HeartIconSolid } from "@heroicons/react/24/solid";
import { ShoppingBagIcon } from "@heroicons/react/24/outline";
import { CheckIcon } from "@heroicons/react/24/solid";
import { formatPrice } from "@/lib/utils";
import { useCart } from "@/lib/cart";
import { useWishlist } from "@/lib/wishlist";
import useEmblaCarousel from "embla-carousel-react";
import type { ProductCardData } from "@/components/product/ProductCard";

/* ── Editorial overlay card — image-dominant with text on image ── */
function EditorialCard({
  product,
  priority,
}: {
  product: ProductCardData;
  priority?: boolean;
}) {
  const t = useTranslations("common");
  const locale = useLocale();
  const { addItem } = useCart();
  const { toggleItem, isWishlisted } = useWishlist();
  const [hovered, setHovered] = useState(false);
  const [added, setAdded] = useState(false);
  const wishlisted = isWishlisted(product.id);

  const handleAddToCart = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (added) return;
      addItem({
        productId: product.id,
        variantId: product.id,
        title: product.title,
        thumbnail: product.thumbnail,
        price: product.price,
        quantity: 1,
      });
      setAdded(true);
      setTimeout(() => setAdded(false), 1800);
    },
    [added, addItem, product]
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
      onMouseLeave={() => setHovered(false)}
    >
      <Link
        href={`/${locale}/products/${product.handle}`}
        className="block relative aspect-[2/3] overflow-hidden bg-[#f0eeeb]"
      >
        {/* Image */}
        <Image
          src={product.thumbnail}
          alt={product.title}
          fill
          className={`object-cover object-top transition-transform duration-[900ms] ease-out ${
            hovered ? "scale-[1.06]" : "scale-100"
          }`}
          sizes="(max-width: 768px) 75vw, (max-width: 1024px) 45vw, 25vw"
          priority={priority}
        />

        {/* Cinematic bottom gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

        {/* Badge */}
        {product.badge && (
          <span className="absolute top-3.5 left-3.5 z-10 px-2.5 py-1 text-[9px] font-bold tracking-[0.15em] uppercase bg-gold text-white">
            {product.badge === "new" ? t("newArrival") : t("bestSeller")}
          </span>
        )}

        {/* Wishlist */}
        <button
          onClick={handleWishlist}
          className="absolute top-3.5 right-3.5 z-10 w-9 h-9 flex items-center justify-center min-w-[36px] min-h-[36px]"
          aria-label={
            wishlisted ? t("removeFromWishlist") : t("addToWishlist")
          }
        >
          {wishlisted ? (
            <HeartIconSolid className="w-[22px] h-[22px] text-red-500 drop-shadow-lg" />
          ) : (
            <HeartIcon className="w-[22px] h-[22px] text-white/80 drop-shadow-lg" />
          )}
        </button>

        {/* Content overlay — bottom */}
        <div className="absolute bottom-0 inset-x-0 z-10 p-5 sm:p-6">
          {product.collection && (
            <span className="text-[9px] tracking-[0.3em] uppercase text-gold/80 block mb-2">
              {product.collection}
            </span>
          )}
          <h3 className="font-serif text-lg sm:text-xl font-semibold text-white leading-tight mb-1.5 line-clamp-2">
            {product.title}
          </h3>
          <span className="text-[15px] text-gold font-medium">
            {formatPrice(product.price)}
          </span>
        </div>

        {/* Quick-add — desktop hover slide-up */}
        <div
          className={`absolute bottom-0 inset-x-0 z-20 p-3 transition-all duration-300 ease-out hidden sm:block ${
            hovered
              ? "translate-y-0 opacity-100"
              : "translate-y-full opacity-0"
          }`}
        >
          <button
            onClick={handleAddToCart}
            className={`w-full flex items-center justify-center gap-2 py-3 text-[10px] font-bold tracking-[0.15em] uppercase transition-all duration-200 backdrop-blur-sm cursor-pointer ${
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
                {t("addToCart")}
              </>
            )}
          </button>
        </div>

        {/* Quick-add — mobile bag icon */}
        <button
          onClick={handleAddToCart}
          className={`absolute bottom-3 right-3 z-20 sm:hidden w-9 h-9 min-w-[36px] min-h-[36px] flex items-center justify-center rounded-full shadow-md transition-all duration-200 cursor-pointer ${
            added
              ? "bg-white text-charcoal scale-110"
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
      </Link>
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

      {/* Carousel */}
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex ml-4 sm:ml-6 lg:ml-[max(1.5rem,calc((100vw-80rem)/2+1.5rem))]">
          {products.map((product, i) => (
            <div
              key={product.id}
              className="flex-[0_0_75vw] sm:flex-[0_0_45vw] lg:flex-[0_0_33.333%] min-w-0 pr-4 lg:pr-5"
              style={{
                opacity: visible ? 1 : 0,
                transform: visible ? "none" : "translateY(30px)",
                transition: `opacity 600ms cubic-bezier(0.16, 1, 0.3, 1) ${i * 80}ms, transform 600ms cubic-bezier(0.16, 1, 0.3, 1) ${i * 80}ms`,
              }}
            >
              <EditorialCard product={product} priority={i < 4} />
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
