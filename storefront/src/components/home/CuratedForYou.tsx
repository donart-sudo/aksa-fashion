"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";
import Image from "next/image";
import { formatPrice } from "@/lib/utils";
import { useCart } from "@/lib/cart";
import { useWishlist } from "@/lib/wishlist";
import { HeartIcon, ShoppingBagIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { HeartIcon as HeartIconSolid, CheckIcon } from "@heroicons/react/24/solid";
import ProductCard from "@/components/product/ProductCard";
import type { ProductCardData } from "@/components/product/ProductCard";

interface CuratedForYouProps {
  products: ProductCardData[];
}

/* ── Hero feature card (large left panel) ── */
function HeroCard({ product }: { product: ProductCardData }) {
  const t = useTranslations("common");
  const locale = useLocale();
  const { addItem } = useCart();
  const { toggleItem, isWishlisted } = useWishlist();
  const [hovered, setHovered] = useState(false);
  const [added, setAdded] = useState(false);
  const [showSizes, setShowSizes] = useState(false);
  const wishlisted = isWishlisted(product.id);
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
      className="relative h-full group"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setShowSizes(false); }}
    >
      <Link
        href={`/${locale}/products/${product.handle}`}
        className="block relative h-full overflow-hidden bg-[#f0eeeb]"
      >
        <Image
          src={product.thumbnail}
          alt={product.title}
          fill
          className={`object-cover object-top transition-transform duration-[1200ms] ease-out ${
            hovered ? "scale-[1.04]" : "scale-100"
          }`}
          sizes="(max-width: 1024px) 100vw, 55vw"
          priority
        />

        {/* Cinematic gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

        {/* Wishlist */}
        <button
          onClick={handleWishlist}
          className="absolute top-5 right-5 z-20 w-10 h-10 flex items-center justify-center"
          aria-label={wishlisted ? t("removeFromWishlist") : t("addToWishlist")}
        >
          {wishlisted ? (
            <HeartIconSolid className="w-6 h-6 text-red-500 drop-shadow-lg" />
          ) : (
            <HeartIcon className="w-6 h-6 text-white/80 drop-shadow-lg hover:text-white transition-colors" />
          )}
        </button>

        {/* Badge */}
        {product.badge && (
          <span className="absolute top-5 left-5 z-10 px-3 py-1.5 text-[9px] font-bold tracking-[0.15em] uppercase bg-gold text-white">
            {product.badge === "new" ? t("newArrival") : product.badge === "sale" ? "Sale" : t("bestSeller")}
          </span>
        )}

        {/* Size picker overlay */}
        {showSizes && hasSizes && (
          <div
            className="absolute inset-0 z-30 bg-black/70 backdrop-blur-sm flex flex-col items-center justify-center p-6"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
          >
            <button
              onClick={handleCloseSizes}
              className="absolute top-5 right-5 w-9 h-9 flex items-center justify-center text-white/40 hover:text-white transition-colors"
              aria-label={t("close")}
            >
              <XMarkIcon className="w-5 h-5" />
            </button>

            <p className="text-[11px] tracking-[0.25em] uppercase text-white/50 mb-5">
              {t("selectSize")}
            </p>

            <div className="flex flex-wrap justify-center gap-2.5">
              {product.sizes!.map((size) => (
                <button
                  key={size}
                  onClick={(e) => addToCartWithSize(e, size)}
                  className="min-w-[48px] min-h-[44px] px-4 py-2.5 border border-white/20 text-[12px] font-medium text-white hover:bg-white hover:text-charcoal transition-all duration-200"
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Content overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8 lg:p-10 z-10">
          {product.collection && (
            <span className="text-[10px] tracking-[0.3em] uppercase text-gold/80 block mb-3">
              {product.collection}
            </span>
          )}
          <h3 className="font-serif text-3xl sm:text-4xl lg:text-[2.5rem] xl:text-[2.75rem] font-bold text-white leading-[1.1] mb-3">
            {product.title}
          </h3>
          <span className="text-lg text-gold font-medium">
            {formatPrice(product.price)}
          </span>

          {/* Add to Cart button that slides up on hover */}
          {!showSizes && (
            <div
              className={`mt-5 transition-all duration-400 ease-out hidden sm:block ${
                hovered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
              }`}
            >
              <button
                onClick={handleAddToCart}
                className={`inline-flex items-center gap-2.5 px-7 py-3 text-[10px] font-bold tracking-[0.2em] uppercase transition-all duration-200 ${
                  added
                    ? "bg-white text-charcoal"
                    : "bg-white/90 text-charcoal hover:bg-white"
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
          )}
        </div>
      </Link>
    </div>
  );
}

/* ── Main section ── */
export default function CuratedForYou({ products }: CuratedForYouProps) {
  const t = useTranslations("home");
  const tCommon = useTranslations("common");
  const locale = useLocale();
  const sectionRef = useRef<HTMLElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  const hero = products[0];
  const gridItems = products.slice(1, 5);
  const mobileItems = products.slice(0, 6);

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

  if (!hero) return null;

  return (
    <section ref={sectionRef} className="py-12 sm:py-20 lg:py-28 bg-cream">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="mb-8 sm:mb-12 lg:mb-16">
          {/* Top row: line + label */}
          <div
            className="flex items-center gap-4 mb-6"
            style={{
              opacity: visible ? 1 : 0,
              transform: visible ? "none" : "translateX(-20px)",
              transition: "opacity 700ms cubic-bezier(0.16, 1, 0.3, 1), transform 700ms cubic-bezier(0.16, 1, 0.3, 1)",
            }}
          >
            <span className="block h-[1.5px] w-10 bg-gold" />
            <span className="text-[11px] tracking-[0.35em] uppercase text-gold font-medium">
              {t("featuredSubtitle")}
            </span>
          </div>

          {/* Title row: heading + view all */}
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <h2
              className="font-serif text-[2rem] sm:text-[2.5rem] lg:text-[3.25rem] font-bold text-charcoal leading-[0.95]"
              style={{
                opacity: visible ? 1 : 0,
                transform: visible ? "none" : "translateY(25px)",
                transition: "opacity 800ms cubic-bezier(0.16, 1, 0.3, 1) 120ms, transform 800ms cubic-bezier(0.16, 1, 0.3, 1) 120ms",
              }}
            >
              {t("featuredTitle")}
            </h2>
            <Link
              href={`/${locale}/collections/new`}
              className="inline-flex items-center gap-2.5 group self-start sm:self-auto flex-shrink-0"
              style={{
                opacity: visible ? 1 : 0,
                transition: "opacity 700ms cubic-bezier(0.16, 1, 0.3, 1) 250ms",
              }}
            >
              <span className="text-[11px] tracking-[0.2em] uppercase text-charcoal/50 group-hover:text-charcoal transition-colors duration-300 border-b border-charcoal/20 group-hover:border-charcoal pb-0.5">
                {tCommon("viewAll")}
              </span>
              <svg className="w-4 h-4 text-charcoal/30 group-hover:text-charcoal group-hover:translate-x-1 transition-all duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </Link>
          </div>
        </div>

        {/* ── Desktop: hero + 2x2 grid ── */}
        <div className="hidden md:grid md:grid-cols-2 gap-5 min-h-[560px] lg:min-h-[720px]">
          {/* Left — hero feature card */}
          <div
            style={{
              opacity: visible ? 1 : 0,
              transform: visible ? "none" : "translateY(50px) scale(0.98)",
              transition: "opacity 800ms cubic-bezier(0.16, 1, 0.3, 1) 150ms, transform 800ms cubic-bezier(0.16, 1, 0.3, 1) 150ms",
            }}
          >
            <HeroCard product={hero} />
          </div>

          {/* Right — 2x2 product cards */}
          <div ref={gridRef} className="grid grid-cols-2 gap-5">
            {gridItems.map((product, i) => (
              <div
                key={product.id}
                style={{
                  opacity: visible ? 1 : 0,
                  transform: visible ? "none" : "translateY(40px) scale(0.97)",
                  transition: `opacity 700ms cubic-bezier(0.16, 1, 0.3, 1) ${250 + i * 100}ms, transform 700ms cubic-bezier(0.16, 1, 0.3, 1) ${250 + i * 100}ms`,
                  willChange: "opacity, transform",
                }}
              >
                <ProductCard product={product} priority={i < 2} />
              </div>
            ))}
          </div>
        </div>

        {/* ── Mobile/Tablet: horizontal swipe carousel ── */}
        <div className="md:hidden">
          <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-2">
            {mobileItems.map((product, i) => (
              <div
                key={product.id}
                className="flex-shrink-0 w-[55vw] snap-start"
                style={{
                  opacity: visible ? 1 : 0,
                  transform: visible ? "none" : "translateY(30px) scale(0.97)",
                  transition: `opacity 600ms cubic-bezier(0.16, 1, 0.3, 1) ${i * 80}ms, transform 600ms cubic-bezier(0.16, 1, 0.3, 1) ${i * 80}ms`,
                  willChange: "opacity, transform",
                }}
              >
                <ProductCard product={product} priority={i < 4} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
