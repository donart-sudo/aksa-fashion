"use client";

import { useEffect, useCallback, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { motion, AnimatePresence, useMotionValue, useTransform, PanInfo } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import {
  XMarkIcon,
  MinusIcon,
  PlusIcon,
  ShoppingBagIcon,
  ArrowRightIcon,
  LockClosedIcon,
  TruckIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";
import { useCart } from "@/lib/cart";
import { formatPrice } from "@/lib/utils";
import { useSiteConstants } from "@/lib/site-constants";

/* ── Swipeable cart item (mobile gesture to reveal delete) ── */

function CartItemRow({
  item,
  onRemove,
  onUpdateQuantity,
  locale,
  closeCart,
  t,
  isLast,
}: {
  item: { id: string; productId: string; title: string; thumbnail: string; price: number; quantity: number; size?: string; color?: string };
  onRemove: (id: string) => void;
  onUpdateQuantity: (id: string, qty: number) => void;
  locale: string;
  closeCart: () => void;
  t: ReturnType<typeof useTranslations>;
  isLast: boolean;
}) {
  const x = useMotionValue(0);
  const deleteOpacity = useTransform(x, [-120, -60], [1, 0]);
  const deleteScale = useTransform(x, [-120, -60], [1, 0.8]);
  const [swiped, setSwiped] = useState(false);

  const handleDragEnd = useCallback(
    (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      if (info.offset.x < -80) {
        setSwiped(true);
      } else {
        setSwiped(false);
      }
    },
    []
  );

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -200, transition: { duration: 0.25 } }}
      transition={{ duration: 0.3 }}
      className={`relative ${!isLast ? "border-b border-charcoal/[0.05]" : ""}`}
    >
      {/* Delete zone behind the item (mobile swipe) */}
      <motion.div
        className="absolute inset-y-0 right-0 w-[100px] bg-red-500 flex items-center justify-center sm:hidden"
        style={{ opacity: deleteOpacity, scale: deleteScale }}
      >
        <button
          onClick={() => onRemove(item.id)}
          className="text-white text-[13px] font-bold tracking-wider uppercase"
        >
          {t("cart.removeItem")}
        </button>
      </motion.div>

      {/* Main item content — draggable on mobile */}
      <motion.div
        drag="x"
        dragConstraints={{ left: -100, right: 0 }}
        dragElastic={0.1}
        onDragEnd={handleDragEnd}
        animate={{ x: swiped ? -100 : 0 }}
        transition={{ type: "spring", stiffness: 400, damping: 35 }}
        style={{ x }}
        className="relative bg-cream flex gap-4 py-5 px-6 sm:px-0 cursor-grab active:cursor-grabbing sm:cursor-default"
        onTap={() => swiped && setSwiped(false)}
      >
        {/* Thumbnail */}
        <Link
          href={`/${locale}/products/${item.productId}`}
          onClick={closeCart}
          className="relative w-[76px] h-[100px] sm:w-[82px] sm:h-[108px] bg-[#f0eeeb] flex-shrink-0 overflow-hidden group"
        >
          <Image
            src={item.thumbnail}
            alt={item.title}
            fill
            className="object-cover object-top transition-transform duration-500 group-hover:scale-105"
            sizes="82px"
          />
        </Link>

        {/* Details */}
        <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
          <div>
            <Link
              href={`/${locale}/products/${item.productId}`}
              onClick={closeCart}
              className="block"
            >
              <h3 className="font-serif text-[15px] font-medium text-charcoal leading-snug line-clamp-2 hover:text-gold transition-colors">
                {item.title}
              </h3>
            </Link>
            {(item.size || item.color) && (
              <p className="text-[12px] text-charcoal/45 mt-1 tracking-wide">
                {[item.color, item.size].filter(Boolean).join(" \u00b7 ")}
              </p>
            )}
          </div>

          {/* Price + Quantity */}
          <div className="flex items-end justify-between mt-2.5">
            {/* Quantity stepper */}
            <div className="flex items-center border border-charcoal/[0.08] rounded-sm">
              <button
                onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                disabled={item.quantity <= 1}
                className="w-10 h-10 sm:w-8 sm:h-8 flex items-center justify-center text-charcoal/40 hover:text-charcoal disabled:opacity-20 transition-colors"
                aria-label="Decrease quantity"
              >
                <MinusIcon className="w-3.5 h-3.5 sm:w-3 sm:h-3" />
              </button>
              <span className="w-10 h-10 sm:w-8 sm:h-8 flex items-center justify-center text-[13px] font-semibold text-charcoal border-x border-charcoal/[0.08]">
                {item.quantity}
              </span>
              <button
                onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                className="w-10 h-10 sm:w-8 sm:h-8 flex items-center justify-center text-charcoal/40 hover:text-charcoal transition-colors"
                aria-label="Increase quantity"
              >
                <PlusIcon className="w-3.5 h-3.5 sm:w-3 sm:h-3" />
              </button>
            </div>

            {/* Price */}
            <div className="text-right">
              <p className="text-[16px] font-semibold text-charcoal">
                {formatPrice(item.price * item.quantity)}
              </p>
              {item.quantity > 1 && (
                <p className="text-[11px] text-charcoal/40 mt-0.5">
                  {formatPrice(item.price)} each
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Remove — desktop only (visible on hover) */}
        <button
          onClick={() => onRemove(item.id)}
          className="hidden sm:flex absolute top-4 right-0 p-1.5 text-charcoal/20 hover:text-red-400 transition-colors"
          aria-label={t("cart.removeItem") as string}
        >
          <XMarkIcon className="w-4 h-4" />
        </button>
      </motion.div>
    </motion.div>
  );
}

/* ── Main CartDrawer ── */

export default function CartDrawer() {
  const t = useTranslations();
  const locale = useLocale();
  const sc = useSiteConstants();
  const {
    items,
    isOpen,
    closeCart,
    removeItem,
    updateQuantity,
    itemCount,
    subtotal,
  } = useCart();

  const freeThreshold = sc.freeShippingThreshold;
  const shippingProgress = Math.min(
    (subtotal / freeThreshold) * 100,
    100
  );
  const hasFreeShipping = subtotal >= freeThreshold;
  const amountToFreeShipping = Math.max(
    0,
    (freeThreshold - subtotal) / 100
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 bg-black/35 backdrop-blur-[2px] z-[80]"
            onClick={closeCart}
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.35, ease: [0.22, 1, 0.36, 1] as const }}
            className="fixed top-0 right-0 bottom-0 w-full sm:w-[420px] bg-cream z-[81] flex flex-col shadow-2xl"
          >
            {/* ─── Header ─── */}
            <div className="flex items-center justify-between px-6 h-[60px] flex-shrink-0 border-b border-charcoal/[0.05]">
              <div className="flex items-baseline gap-2.5">
                <h2 className="font-serif text-[18px] text-charcoal">
                  {t("cart.title")}
                </h2>
                {itemCount > 0 && (
                  <span className="text-[13px] text-charcoal/40 font-medium">
                    {itemCount} {itemCount === 1 ? t("common.item") : t("common.items")}
                  </span>
                )}
              </div>
              <button
                onClick={closeCart}
                className="p-2 -mr-2 text-charcoal/40 hover:text-charcoal transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
                aria-label={t("common.close")}
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            {/* ─── Free shipping progress ─── */}
            {items.length > 0 && (
              <div className="px-6 py-3 flex-shrink-0 border-b border-charcoal/[0.04]">
                {hasFreeShipping ? (
                  <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="flex items-center justify-center gap-2 py-2"
                  >
                    <CheckCircleIcon className="w-4 h-4 text-green-600" />
                    <span className="text-[12px] tracking-[0.06em] uppercase text-green-700 font-medium">
                      {t("cart.freeShippingMessage")}
                    </span>
                  </motion.div>
                ) : (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <TruckIcon className="w-3.5 h-3.5 text-charcoal/30" />
                      <span className="text-[12px] text-charcoal/50">
                        {t("cart.freeShippingProgress", {
                          amount: amountToFreeShipping.toFixed(0),
                        })}
                      </span>
                    </div>
                    <div className="w-full h-[3px] bg-charcoal/[0.06] rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-gold rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${shippingProgress}%` }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ─── Items ─── */}
            <div className="flex-1 overflow-y-auto overscroll-contain">
              {items.length === 0 ? (
                /* Empty state */
                <div className="flex flex-col items-center justify-center h-full text-center px-8">
                  <div className="w-20 h-20 rounded-full bg-charcoal/[0.03] flex items-center justify-center mb-5">
                    <ShoppingBagIcon className="w-8 h-8 text-charcoal/15" />
                  </div>
                  <p className="font-serif text-[18px] text-charcoal/70 mb-1.5">
                    {t("cart.empty")}
                  </p>
                  <p className="text-[13px] text-charcoal/40 mb-8">
                    {t("cart.emptyHint")}
                  </p>
                  <Link
                    href={`/${locale}/collections`}
                    onClick={closeCart}
                    className="inline-flex items-center gap-2 px-6 py-3 text-[12px] font-bold tracking-[0.12em] uppercase text-charcoal border border-charcoal/15 hover:border-charcoal hover:bg-charcoal hover:text-white transition-all duration-300"
                  >
                    {t("common.continueShopping")}
                    <ArrowRightIcon className="w-3.5 h-3.5" />
                  </Link>
                </div>
              ) : (
                <div className="sm:px-6">
                  <AnimatePresence mode="popLayout">
                    {items.map((item, i) => (
                      <CartItemRow
                        key={item.id}
                        item={item}
                        onRemove={removeItem}
                        onUpdateQuantity={updateQuantity}
                        locale={locale}
                        closeCart={closeCart}
                        t={t}
                        isLast={i === items.length - 1}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>

            {/* ─── Footer ─── */}
            {items.length > 0 && (
              <div className="flex-shrink-0 border-t border-charcoal/[0.06] bg-white">
                {/* Summary */}
                <div className="px-6 pt-5 pb-4">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[14px] text-charcoal/60">
                      {t("common.subtotal")}
                    </span>
                    <span className="text-[22px] font-serif font-semibold text-charcoal">
                      {formatPrice(subtotal)}
                    </span>
                  </div>
                  <p className="text-[11px] text-charcoal/35">
                    {t("cart.taxNote")}
                  </p>
                </div>

                {/* Actions */}
                <div className="px-6 pb-5 space-y-2.5">
                  {/* Checkout button */}
                  <Link
                    href={`/${locale}/checkout`}
                    onClick={closeCart}
                    className="flex items-center justify-center gap-2.5 w-full py-4 bg-charcoal text-white text-[13px] font-bold tracking-[0.12em] uppercase hover:bg-charcoal/90 active:scale-[0.99] transition-all duration-200"
                  >
                    <LockClosedIcon className="w-3.5 h-3.5" />
                    {t("cart.secureCheckout")}
                  </Link>

                  {/* Continue shopping */}
                  <button
                    onClick={closeCart}
                    className="w-full flex items-center justify-center gap-2 py-3 text-[12px] tracking-[0.08em] uppercase text-charcoal/40 hover:text-charcoal transition-colors"
                  >
                    {t("common.continueShopping")}
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
