"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  HeartIcon,
  XMarkIcon,
  ShoppingBagIcon,
  ArrowRightIcon,
  CheckIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";
import { HeartIcon as HeartIconSolid } from "@heroicons/react/24/solid";
import { useWishlist, type WishlistItem } from "@/lib/wishlist";
import { useCart } from "@/lib/cart";
import { formatPrice } from "@/lib/utils";
import EditableSection from "@/components/editor/EditableSection";

/* ── Wishlist item card with rich interactions ── */
function WishlistCard({
  item,
  index,
  onRemove,
  onMoveToCart,
  locale,
  t,
}: {
  item: WishlistItem;
  index: number;
  onRemove: (id: string) => void;
  onMoveToCart: (item: WishlistItem) => void;
  locale: string;
  t: ReturnType<typeof useTranslations>;
}) {
  const [hovered, setHovered] = useState(false);
  const [moved, setMoved] = useState(false);
  const [removing, setRemoving] = useState(false);

  const discount = item.originalPrice
    ? Math.round((1 - item.price / item.originalPrice) * 100)
    : 0;

  const handleMove = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (moved) return;
      setMoved(true);
      onMoveToCart(item);
      setTimeout(() => setMoved(false), 2000);
    },
    [moved, onMoveToCart, item]
  );

  const handleRemove = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setRemoving(true);
      setTimeout(() => onRemove(item.id), 300);
    },
    [onRemove, item.id]
  );

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 30, scale: 0.97 }}
      animate={{
        opacity: removing ? 0 : 1,
        y: removing ? -20 : 0,
        scale: removing ? 0.95 : 1,
      }}
      exit={{ opacity: 0, scale: 0.9, y: -30 }}
      transition={{
        duration: 0.5,
        delay: index * 0.06,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="group relative"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Image container */}
      <Link
        href={`/${locale}/products/${item.handle}`}
        className="block relative aspect-[3/4] overflow-hidden bg-[#f0eeeb] rounded-sm"
      >
        <Image
          src={item.thumbnail}
          alt={item.title}
          fill
          className={`object-cover object-top transition-all duration-700 ease-out ${
            hovered && item.hoverImage
              ? "opacity-0 scale-[1.03]"
              : hovered
                ? "scale-[1.05]"
                : "scale-100"
          }`}
          sizes="(max-width: 480px) 50vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
        />

        {item.hoverImage && (
          <Image
            src={item.hoverImage}
            alt={item.title}
            fill
            className={`object-cover object-top transition-all duration-700 ease-out ${
              hovered ? "opacity-100 scale-100" : "opacity-0 scale-[1.03]"
            }`}
            sizes="(max-width: 480px) 50vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        )}

        {/* Badge */}
        {item.badge && (
          <span className="absolute top-2 left-2 sm:top-3 sm:left-3 z-10 px-1.5 py-0.5 sm:px-2.5 sm:py-1 text-[8px] sm:text-[9px] font-bold tracking-[0.15em] uppercase bg-charcoal text-white">
            {item.badge === "sale"
              ? <>&minus;{discount}%</>
              : item.badge === "new"
                ? t("newArrival")
                : t("bestSeller")}
          </span>
        )}

        {/* Saved heart indicator */}
        <div className="absolute top-2 right-2 sm:top-3 sm:right-3 z-10">
          <HeartIconSolid className="w-5 h-5 sm:w-[22px] sm:h-[22px] text-red-500 drop-shadow-md" />
        </div>

        {/* Remove button — always visible on mobile, hover on desktop */}
        <button
          onClick={handleRemove}
          className={`absolute top-2 right-2 sm:top-3 sm:right-3 z-20 w-9 h-9 sm:w-9 sm:h-9 min-w-[36px] min-h-[36px] sm:min-w-[36px] sm:min-h-[36px] flex items-center justify-center rounded-full bg-white/90 backdrop-blur-sm shadow-sm transition-all duration-300 cursor-pointer sm:opacity-0 sm:scale-90 ${
            hovered ? "sm:opacity-100 sm:scale-100" : ""
          }`}
          aria-label={t("removeFromWishlist")}
        >
          <XMarkIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-charcoal" />
        </button>

        {/* Move to bag — desktop hover slide-up */}
        <div
          className={`absolute bottom-0 inset-x-0 z-10 p-2 sm:p-2.5 transition-all duration-300 ease-out hidden sm:block ${
            hovered ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"
          }`}
        >
          <button
            onClick={handleMove}
            className={`w-full flex items-center justify-center gap-2 py-2.5 sm:py-3 text-[10px] sm:text-[11px] font-bold tracking-[0.15em] uppercase transition-all duration-200 cursor-pointer ${
              moved
                ? "bg-charcoal text-white"
                : "bg-white/95 backdrop-blur-sm text-charcoal hover:bg-charcoal hover:text-white"
            }`}
          >
            {moved ? (
              <>
                <CheckIcon className="w-3.5 h-3.5" />
                {t("movedToBag")}
              </>
            ) : (
              <>
                <ShoppingBagIcon className="w-3.5 h-3.5" />
                {t("moveToCart")}
              </>
            )}
          </button>
        </div>

        {/* Move to bag — mobile icon overlay */}
        <button
          onClick={handleMove}
          className={`absolute bottom-2 right-2 z-10 sm:hidden w-9 h-9 min-w-[36px] min-h-[36px] flex items-center justify-center rounded-full shadow-md transition-all duration-200 cursor-pointer ${
            moved
              ? "bg-charcoal text-white scale-110"
              : "bg-white/90 backdrop-blur-sm text-charcoal active:scale-95"
          }`}
          aria-label={moved ? t("movedToBag") : t("moveToCart")}
        >
          {moved ? (
            <CheckIcon className="w-3.5 h-3.5" />
          ) : (
            <ShoppingBagIcon className="w-3.5 h-3.5" />
          )}
        </button>
      </Link>

      {/* Info */}
      <div className="mt-2 sm:mt-2.5 pb-1">
        {/* Title */}
        <Link href={`/${locale}/products/${item.handle}`}>
          <h3 className="font-serif text-[14px] sm:text-[15px] lg:text-[16px] font-medium text-charcoal leading-snug group-hover:underline decoration-charcoal/30 underline-offset-2 transition-all duration-300 line-clamp-1 sm:line-clamp-2">
            {item.title}
          </h3>
        </Link>

        {/* Price */}
        <div className="flex flex-wrap items-baseline gap-1 sm:gap-1.5 mt-0.5 sm:mt-1">
          <span className="text-[14px] sm:text-[16px] text-gold font-semibold">
            {formatPrice(item.price)}
          </span>
          {item.originalPrice && (
            <>
              <span className="text-[10px] sm:text-[12px] text-charcoal/30 line-through">
                {formatPrice(item.originalPrice)}
              </span>
              <span className="text-[9px] sm:text-[10px] font-bold text-red-500">
                -{discount}%
              </span>
            </>
          )}
        </div>

        {/* Mobile move to bag button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            if (moved) return;
            setMoved(true);
            onMoveToCart(item);
            setTimeout(() => setMoved(false), 2000);
          }}
          className={`sm:hidden w-full flex items-center justify-center gap-1.5 mt-2.5 py-2.5 min-h-[40px] text-[10px] font-bold tracking-[0.12em] uppercase transition-all duration-200 cursor-pointer ${
            moved
              ? "bg-charcoal text-white border border-charcoal"
              : "border border-charcoal/10 text-charcoal active:bg-charcoal active:text-white active:border-charcoal"
          }`}
        >
          {moved ? (
            <>
              <CheckIcon className="w-3 h-3" />
              {t("movedToBag")}
            </>
          ) : (
            <>
              <ShoppingBagIcon className="w-3 h-3" />
              {t("moveToCart")}
            </>
          )}
        </button>
      </div>
    </motion.div>
  );
}

/* ── Empty state with editorial design ── */
function EmptyWishlist({ locale, t }: { locale: string; t: ReturnType<typeof useTranslations> }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8, delay: 0.2 }}
      className="flex flex-col items-center justify-center text-center py-14 sm:py-24 lg:py-32 px-4 sm:px-6"
    >
      {/* Animated heart */}
      <motion.div
        initial={{ scale: 0, rotate: -20 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ duration: 0.6, delay: 0.3, type: "spring", stiffness: 200 }}
        className="relative mb-8 sm:mb-10"
      >
        <div className="w-20 h-20 sm:w-28 sm:h-28 rounded-full bg-gradient-to-br from-rose/10 to-gold/10 flex items-center justify-center">
          <HeartIcon className="w-9 h-9 sm:w-12 sm:h-12 text-gold/40" />
        </div>
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className="absolute inset-0 rounded-full border border-gold/10"
        />
      </motion.div>

      {/* Text */}
      <motion.h2
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="font-serif text-[1.25rem] sm:text-[1.5rem] lg:text-[2rem] text-charcoal mb-2 sm:mb-3"
      >
        {t("wishlistEmpty1")}
      </motion.h2>

      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.65 }}
        className="text-[13px] sm:text-[15px] text-charcoal/40 max-w-sm sm:max-w-md mb-8 sm:mb-10 leading-relaxed"
      >
        {t("wishlistEmpty2")}
      </motion.p>

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.8 }}
      >
        <Link
          href={`/${locale}/collections`}
          className="group inline-flex items-center gap-2.5 sm:gap-3 px-6 sm:px-8 py-3.5 sm:py-4 bg-charcoal text-white text-[11px] sm:text-[12px] font-bold tracking-[0.15em] uppercase hover:bg-charcoal/90 active:scale-[0.98] transition-all duration-300"
        >
          <SparklesIcon className="w-4 h-4 text-gold" />
          {t("exploreCollections")}
          <ArrowRightIcon className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform duration-300" />
        </Link>
      </motion.div>
    </motion.div>
  );
}

/* ── Main wishlist page ── */
export default function WishlistPage() {
  const t = useTranslations("common");
  const locale = useLocale();
  const { items, removeItem } = useWishlist();
  const { addItem, openCart } = useCart();
  const [totalValue, setTotalValue] = useState(0);
  const headerRef = useRef<HTMLDivElement>(null);
  const [headerVisible, setHeaderVisible] = useState(false);

  useEffect(() => {
    setTotalValue(items.reduce((sum, item) => sum + item.price, 0));
  }, [items]);

  useEffect(() => {
    setHeaderVisible(true);
  }, []);

  const handleMoveToCart = useCallback(
    (item: (typeof items)[0]) => {
      addItem({
        productId: item.id,
        variantId: item.id,
        handle: item.handle,
        title: item.title,
        thumbnail: item.thumbnail,
        price: item.price,
        quantity: 1,
      });
      removeItem(item.id);
    },
    [addItem, removeItem]
  );

  const handleMoveAllToCart = useCallback(() => {
    items.forEach((item) => {
      addItem({
        productId: item.id,
        variantId: item.id,
        handle: item.handle,
        title: item.title,
        thumbnail: item.thumbnail,
        price: item.price,
        quantity: 1,
      });
    });
    items.forEach((item) => removeItem(item.id));
    openCart();
  }, [items, addItem, removeItem, openCart]);

  return (
    <EditableSection sectionKey="i18n.common" label="Wishlist Text">
    <div className="min-h-[60vh] sm:min-h-[70vh]">
      {/* Hero header */}
      <div
        ref={headerRef}
        className="relative overflow-hidden border-b border-soft-gray/30"
      >
        {/* Subtle pattern bg */}
        <div className="absolute inset-0 opacity-[0.015] pointer-events-none" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, #2D2D2D 1px, transparent 0)`,
          backgroundSize: '24px 24px',
        }} />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-14 lg:py-20">
          <div className="flex flex-col gap-5 sm:gap-6 sm:flex-row sm:items-end sm:justify-between">
            {/* Left: Title block */}
            <div className="min-w-0">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: headerVisible ? 1 : 0, x: headerVisible ? 0 : -20 }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className="flex items-center gap-2.5 sm:gap-3 mb-3 sm:mb-4"
              >
                <span className="block h-[1.5px] w-6 sm:w-8 bg-gold" />
                <span className="text-[10px] sm:text-[11px] tracking-[0.3em] sm:tracking-[0.35em] uppercase text-gold font-medium">
                  {t("wishlistSubtitle")}
                </span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: headerVisible ? 1 : 0, y: headerVisible ? 0 : 20 }}
                transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
                className="font-serif text-[1.75rem] sm:text-[2.5rem] lg:text-[3.25rem] font-bold text-charcoal leading-[0.95]"
              >
                {t("wishlist")}
              </motion.h1>

              {items.length > 0 && (
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: headerVisible ? 1 : 0, y: headerVisible ? 0 : 10 }}
                  transition={{ duration: 0.5, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
                  className="text-[12px] sm:text-[13px] text-charcoal/40 mt-2 sm:mt-3 tracking-wide"
                >
                  {items.length} {items.length === 1 ? t("item") : t("items")}
                  {totalValue > 0 && (
                    <span className="ml-2 sm:ml-3 text-charcoal/25">
                      &middot;
                      <span className="ml-2 sm:ml-3">{formatPrice(totalValue)}</span>
                    </span>
                  )}
                </motion.p>
              )}
            </div>

            {/* Right: Actions */}
            {items.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: headerVisible ? 1 : 0, y: headerVisible ? 0 : 10 }}
                transition={{ duration: 0.5, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
                className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3"
              >
                <button
                  onClick={handleMoveAllToCart}
                  className="inline-flex items-center justify-center gap-2 sm:gap-2.5 px-5 sm:px-6 py-3 bg-charcoal text-white text-[10px] sm:text-[11px] font-bold tracking-[0.12em] uppercase hover:bg-charcoal/90 active:scale-[0.98] transition-all duration-200 cursor-pointer"
                >
                  <ShoppingBagIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  {t("moveToCart")} {t("all")}
                </button>
                <Link
                  href={`/${locale}/collections`}
                  className="inline-flex items-center justify-center gap-2 px-5 py-3 border border-charcoal/15 text-charcoal text-[10px] sm:text-[11px] font-bold tracking-[0.12em] uppercase hover:border-charcoal hover:bg-charcoal hover:text-white active:scale-[0.98] transition-all duration-300"
                >
                  {t("continueShopping")}
                </Link>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-10 lg:py-14">
        {items.length === 0 ? (
          <EmptyWishlist locale={locale} t={t} />
        ) : (
          <AnimatePresence mode="popLayout">
            <motion.div
              layout
              className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-3 gap-y-5 sm:gap-x-4 sm:gap-y-8 lg:gap-x-5 lg:gap-y-10"
            >
              {items.map((item, i) => (
                <WishlistCard
                  key={item.id}
                  item={item}
                  index={i}
                  onRemove={removeItem}
                  onMoveToCart={handleMoveToCart}
                  locale={locale}
                  t={t}
                />
              ))}
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </div>
    </EditableSection>
  );
}
