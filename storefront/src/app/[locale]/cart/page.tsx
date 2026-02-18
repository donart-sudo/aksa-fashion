"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingBagIcon,
  TrashIcon,
  HeartIcon,
  TruckIcon,
  ShieldCheckIcon,
  TagIcon,
  SparklesIcon,
  LockClosedIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";
import { CheckIcon } from "@heroicons/react/24/solid";
import { useCart } from "@/lib/cart";
import { useWishlist } from "@/lib/wishlist";
import { formatPrice } from "@/lib/utils";

const FREE_SHIPPING_THRESHOLD = 15000; // €150 in cents

/* ── Free Shipping Progress Bar ── */
function ShippingProgress({
  subtotal,
  t,
}: {
  subtotal: number;
  t: ReturnType<typeof useTranslations>;
}) {
  const reached = subtotal >= FREE_SHIPPING_THRESHOLD;
  const progress = Math.min(1, subtotal / FREE_SHIPPING_THRESHOLD);
  const remaining = Math.max(
    0,
    Math.ceil((FREE_SHIPPING_THRESHOLD - subtotal) / 100)
  );

  return (
    <div className="mb-6 sm:mb-8">
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-2">
          <TruckIcon
            className={`w-4 h-4 flex-shrink-0 ${
              reached ? "text-green-600" : "text-charcoal/30"
            }`}
          />
          <span
            className={`text-[11px] sm:text-xs ${
              reached
                ? "text-green-600 font-medium"
                : "text-charcoal/50"
            }`}
          >
            {reached
              ? t("cart.freeShippingUnlocked")
              : t("cart.freeShippingProgress", { amount: remaining })}
          </span>
        </div>
        {!reached && (
          <span className="text-[10px] text-charcoal/25 tabular-nums">
            {formatPrice(subtotal)} / {formatPrice(FREE_SHIPPING_THRESHOLD)}
          </span>
        )}
      </div>
      <div className="h-[3px] bg-charcoal/[0.06] overflow-hidden">
        <motion.div
          className={`h-full ${reached ? "bg-green-500" : "bg-gold"}`}
          initial={{ width: 0 }}
          animate={{ width: `${progress * 100}%` }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>
    </div>
  );
}

/* ── Cart Item Row ── */
function CartItemRow({
  item,
  locale,
  t,
  onUpdateQuantity,
  onRemove,
  onMoveToWishlist,
  index,
}: {
  item: ReturnType<typeof useCart>["items"][number];
  locale: string;
  t: ReturnType<typeof useTranslations>;
  onUpdateQuantity: (id: string, qty: number) => void;
  onRemove: (id: string) => void;
  onMoveToWishlist: (item: ReturnType<typeof useCart>["items"][number]) => void;
  index: number;
}) {
  const [removing, setRemoving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleRemove = useCallback(() => {
    setRemoving(true);
    setTimeout(() => onRemove(item.id), 300);
  }, [item.id, onRemove]);

  const handleMoveToWishlist = useCallback(() => {
    setSaved(true);
    onMoveToWishlist(item);
    setTimeout(() => {
      setRemoving(true);
      setTimeout(() => onRemove(item.id), 300);
    }, 800);
  }, [item, onMoveToWishlist, onRemove]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{
        opacity: removing ? 0 : 1,
        y: removing ? -10 : 0,
        height: removing ? 0 : "auto",
      }}
      transition={{
        duration: 0.4,
        delay: removing ? 0 : index * 0.05,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="overflow-hidden"
    >
      <div className="flex gap-3 sm:gap-5 py-5 sm:py-6 border-b border-charcoal/[0.06] group">
        {/* Thumbnail */}
        <Link
          href={`/${locale}/products/${item.productId}`}
          className="relative w-20 h-[106px] sm:w-[100px] sm:h-[133px] bg-[#f5f3f0] flex-shrink-0 overflow-hidden"
        >
          <Image
            src={item.thumbnail}
            alt={item.title}
            fill
            className="object-cover object-top transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 640px) 80px, 100px"
          />
        </Link>

        {/* Info */}
        <div className="flex-1 min-w-0 flex flex-col justify-between">
          <div>
            <Link
              href={`/${locale}/products/${item.productId}`}
              className="text-[13px] sm:text-sm font-medium text-charcoal hover:text-gold transition-colors line-clamp-2 leading-snug"
            >
              {item.title}
            </Link>
            {(item.size || item.color) && (
              <p className="text-[11px] sm:text-xs text-charcoal/35 mt-1">
                {[item.color, item.size].filter(Boolean).join(" · ")}
              </p>
            )}

            {/* Price — desktop right-aligned, mobile below title */}
            <p className="text-sm font-medium text-charcoal mt-1.5 sm:hidden">
              {formatPrice(item.price * item.quantity)}
              {item.quantity > 1 && (
                <span className="text-[10px] text-charcoal/30 ml-1.5">
                  ({formatPrice(item.price)} each)
                </span>
              )}
            </p>
          </div>

          {/* Bottom row: quantity + actions */}
          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center gap-3 sm:gap-4">
              {/* Quantity stepper */}
              <div className="flex items-center border border-charcoal/[0.08]">
                <button
                  onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                  disabled={item.quantity <= 1}
                  className="w-11 h-11 sm:w-9 sm:h-9 flex items-center justify-center text-charcoal/40 hover:text-charcoal disabled:opacity-20 transition-colors text-sm cursor-pointer"
                  aria-label="Decrease quantity"
                >
                  −
                </button>
                <span className="w-9 text-center text-xs sm:text-sm font-medium text-charcoal tabular-nums">
                  {item.quantity}
                </span>
                <button
                  onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                  className="w-11 h-11 sm:w-9 sm:h-9 flex items-center justify-center text-charcoal/40 hover:text-charcoal transition-colors text-sm cursor-pointer"
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>

              {/* Save for later */}
              <button
                onClick={handleMoveToWishlist}
                className="flex items-center gap-1.5 text-[10px] tracking-[0.1em] uppercase text-charcoal/25 hover:text-gold transition-colors cursor-pointer min-h-[44px] sm:min-h-0"
              >
                {saved ? (
                  <>
                    <CheckIcon className="w-3.5 h-3.5 sm:w-3 sm:h-3 text-gold" />
                    <span className="text-gold">{t("cart.movedToWishlist")}</span>
                  </>
                ) : (
                  <>
                    <HeartIcon className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
                    <span className="hidden sm:inline">{t("cart.moveToWishlist")}</span>
                    <span className="sm:hidden">{t("common.save")}</span>
                  </>
                )}
              </button>
            </div>

            {/* Remove */}
            <button
              onClick={handleRemove}
              className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center text-charcoal/20 hover:text-red-500 transition-colors cursor-pointer"
              aria-label={t("cart.removeItem")}
            >
              <TrashIcon className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Price — desktop */}
        <div className="hidden sm:flex flex-col items-end justify-start flex-shrink-0">
          <span className="text-sm font-medium text-charcoal">
            {formatPrice(item.price * item.quantity)}
          </span>
          {item.quantity > 1 && (
            <span className="text-[10px] text-charcoal/25 mt-0.5">
              {formatPrice(item.price)} each
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}

/* ── Empty Cart ── */
function EmptyCart({
  t,
  locale,
}: {
  t: ReturnType<typeof useTranslations>;
  locale: string;
}) {
  return (
    <div className="max-w-lg mx-auto px-4 py-20 sm:py-28 text-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Animated bag icon */}
        <div className="relative w-24 h-24 mx-auto mb-8">
          <div className="absolute inset-0 rounded-full bg-gold/[0.05]" />
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <ShoppingBagIcon className="w-10 h-10 text-gold/40" />
          </motion.div>
          <motion.div
            animate={{ scale: [1, 1.15, 1] }}
            transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
            className="absolute inset-0 rounded-full border border-gold/10"
          />
        </div>

        <h1 className="font-serif text-2xl sm:text-3xl text-charcoal mb-3">
          {t("cart.empty")}
        </h1>
        <p className="text-[13px] sm:text-sm text-charcoal/40 mb-2 leading-relaxed">
          {t("cart.emptyHint")}
        </p>
        <p className="text-[12px] text-charcoal/25 mb-8">
          {t("cart.emptySubtext")}
        </p>

        <Link
          href={`/${locale}/collections`}
          className="inline-flex items-center gap-2.5 bg-charcoal text-white px-8 py-3.5 text-xs tracking-[0.2em] uppercase font-medium hover:bg-charcoal/85 transition-colors cursor-pointer"
        >
          <SparklesIcon className="w-4 h-4" />
          {t("common.exploreCollections")}
        </Link>
      </motion.div>
    </div>
  );
}

/* ── Trust Badges ── */
function TrustBadges({ t }: { t: ReturnType<typeof useTranslations> }) {
  const badges = [
    { icon: TruckIcon, label: t("cart.guaranteeShipping") },
    { icon: ShieldCheckIcon, label: t("cart.guaranteeSecure") },
    { icon: SparklesIcon, label: t("cart.guaranteeHandmade") },
  ];

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-0 sm:divide-x sm:divide-charcoal/[0.06] py-5">
      {badges.map(({ icon: Icon, label }, i) => (
        <div
          key={i}
          className={`flex items-center gap-2 ${
            i === 0 ? "sm:pr-4" : i === badges.length - 1 ? "sm:pl-4" : "sm:px-4"
          }`}
        >
          <Icon className="w-4 h-4 text-gold/50 flex-shrink-0" />
          <span className="text-[10px] sm:text-[11px] text-charcoal/40">
            {label}
          </span>
        </div>
      ))}
    </div>
  );
}

/* ── Main Cart Page ── */
export default function CartPage() {
  const t = useTranslations();
  const locale = useLocale();
  const { items, removeItem, updateQuantity, subtotal, itemCount, clearCart } =
    useCart();
  const { toggleItem } = useWishlist();
  const [discountCode, setDiscountCode] = useState("");
  const [discountApplied, setDiscountApplied] = useState(false);
  const [note, setNote] = useState("");
  const [showNote, setShowNote] = useState(false);

  const handleMoveToWishlist = useCallback(
    (item: ReturnType<typeof useCart>["items"][number]) => {
      toggleItem({
        id: item.productId,
        title: item.title,
        handle: item.productId,
        price: item.price,
        thumbnail: item.thumbnail,
      });
    },
    [toggleItem]
  );

  const handleApplyDiscount = useCallback(() => {
    if (discountCode.trim()) {
      setDiscountApplied(true);
      setTimeout(() => setDiscountApplied(false), 3000);
    }
  }, [discountCode]);

  if (itemCount === 0) {
    return <EmptyCart t={t} locale={locale} />;
  }

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-10 lg:py-14">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-6 sm:mb-8"
      >
        <div className="flex items-center gap-3 mb-2">
          <span className="block h-[1.5px] w-8 bg-gold" />
          <span className="text-[10px] tracking-[0.3em] uppercase text-gold font-medium">
            {t("common.cart")}
          </span>
        </div>
        <div className="flex items-end justify-between">
          <h1 className="font-serif text-[1.75rem] sm:text-3xl lg:text-[2.25rem] text-charcoal leading-tight">
            {t("cart.title")}
          </h1>
          <span className="text-[11px] sm:text-xs text-charcoal/30 tabular-nums">
            {t("cart.itemsInBag", { count: itemCount })}
          </span>
        </div>
      </motion.div>

      {/* Free shipping progress */}
      <ShippingProgress subtotal={subtotal} t={t} />

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8 lg:gap-12">
        {/* ── Left: Cart Items ── */}
        <div>
          {/* Column headers — desktop */}
          <div className="hidden sm:flex items-center justify-between pb-3 border-b border-charcoal/[0.06] mb-1">
            <span className="text-[10px] tracking-[0.15em] uppercase text-charcoal/25 font-medium">
              {t("common.product")}
            </span>
            <span className="text-[10px] tracking-[0.15em] uppercase text-charcoal/25 font-medium">
              {t("common.total")}
            </span>
          </div>

          {/* Items */}
          <AnimatePresence mode="popLayout">
            {items.map((item, i) => (
              <CartItemRow
                key={item.id}
                item={item}
                locale={locale}
                t={t}
                onUpdateQuantity={updateQuantity}
                onRemove={removeItem}
                onMoveToWishlist={handleMoveToWishlist}
                index={i}
              />
            ))}
          </AnimatePresence>

          {/* Add note toggle */}
          <div className="mt-5">
            <button
              onClick={() => setShowNote(!showNote)}
              className="flex items-center gap-2 text-[11px] sm:text-xs text-charcoal/35 hover:text-charcoal transition-colors cursor-pointer"
            >
              <svg
                className={`w-3.5 h-3.5 transition-transform duration-200 ${
                  showNote ? "rotate-45" : ""
                }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 4.5v15m7.5-7.5h-15"
                />
              </svg>
              {t("cart.addNote")}
            </button>
            <AnimatePresence>
              {showNote && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  className="overflow-hidden"
                >
                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder={t("cart.notePlaceholder")}
                    rows={3}
                    className="mt-3 w-full px-4 py-3 bg-white border border-charcoal/[0.08] text-sm text-charcoal placeholder:text-charcoal/20 resize-none focus:outline-none focus:border-gold transition-colors"
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Continue shopping */}
          <div className="mt-6 sm:mt-8">
            <Link
              href={`/${locale}/collections`}
              className="inline-flex items-center gap-2 text-[11px] tracking-[0.15em] uppercase text-charcoal/35 hover:text-charcoal transition-colors group"
            >
              <svg
                className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform duration-200"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
                />
              </svg>
              {t("common.continueShopping")}
            </Link>
          </div>

          {/* Trust badges — mobile */}
          <div className="lg:hidden mt-6">
            <TrustBadges t={t} />
          </div>
        </div>

        {/* ── Right: Order Summary ── */}
        <div className="lg:sticky lg:top-20 lg:self-start">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="bg-[#faf9f7] p-5 sm:p-7"
          >
            <h2 className="font-serif text-lg sm:text-xl text-charcoal mb-5">
              {t("cart.orderSummary")}
            </h2>

            {/* Discount code */}
            <div className="mb-5 pb-5 border-b border-charcoal/[0.06]">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <TagIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal/20" />
                  <input
                    type="text"
                    value={discountCode}
                    onChange={(e) => setDiscountCode(e.target.value)}
                    placeholder={t("cart.discountCode")}
                    className="w-full pl-9 pr-3 py-2.5 bg-white border border-charcoal/[0.08] text-xs text-charcoal placeholder:text-charcoal/25 focus:outline-none focus:border-gold transition-colors"
                  />
                </div>
                <button
                  onClick={handleApplyDiscount}
                  disabled={!discountCode.trim()}
                  className="px-4 py-2.5 bg-charcoal text-white text-[10px] tracking-[0.15em] uppercase font-medium hover:bg-charcoal/85 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
                >
                  {discountApplied ? (
                    <CheckIcon className="w-4 h-4" />
                  ) : (
                    t("cart.applyCode")
                  )}
                </button>
              </div>
            </div>

            {/* Pricing */}
            <div className="space-y-3 text-sm mb-5">
              <div className="flex justify-between text-charcoal/50">
                <span>{t("common.subtotal")}</span>
                <span className="font-medium tabular-nums">
                  {formatPrice(subtotal)}
                </span>
              </div>
              <div className="flex justify-between text-charcoal/50">
                <span>{t("common.shipping")}</span>
                <span
                  className={
                    subtotal >= FREE_SHIPPING_THRESHOLD
                      ? "text-green-600 font-medium"
                      : ""
                  }
                >
                  {subtotal >= FREE_SHIPPING_THRESHOLD
                    ? t("common.free")
                    : t("cart.shippingAtCheckout")}
                </span>
              </div>
            </div>

            {/* Total */}
            <div className="flex justify-between items-baseline py-4 border-t border-charcoal/[0.08]">
              <span className="text-sm font-medium text-charcoal">
                {t("common.total")}
              </span>
              <div className="text-right">
                <span className="text-lg sm:text-xl font-semibold text-charcoal tabular-nums">
                  {formatPrice(subtotal)}
                </span>
                <p className="text-[10px] text-charcoal/25 mt-0.5">
                  {t("cart.taxNote")}
                </p>
              </div>
            </div>

            {/* Checkout button */}
            <Link
              href={`/${locale}/checkout`}
              className="mt-5 w-full flex items-center justify-center gap-2.5 bg-charcoal text-white py-3.5 sm:py-4 text-xs tracking-[0.2em] uppercase font-medium hover:bg-charcoal/85 transition-colors cursor-pointer"
            >
              <LockClosedIcon className="w-3.5 h-3.5" />
              {t("cart.proceedToCheckout")}
            </Link>

            {/* Express checkout */}
            <div className="mt-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="flex-1 h-px bg-charcoal/[0.06]" />
                <span className="text-[10px] text-charcoal/25 uppercase tracking-wider">
                  {t("cart.orPayWith")}
                </span>
                <div className="flex-1 h-px bg-charcoal/[0.06]" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button className="flex items-center justify-center gap-2 py-2.5 border border-charcoal/[0.08] hover:border-charcoal/20 transition-colors cursor-pointer">
                  <svg className="h-5" viewBox="0 0 165 40" fill="none">
                    <path
                      d="M150.7 0H14.3C6.4 0 0 6.4 0 14.3v11.4C0 33.6 6.4 40 14.3 40h136.4c7.9 0 14.3-6.4 14.3-14.3V14.3C165 6.4 158.6 0 150.7 0z"
                      fill="#000"
                    />
                    <text
                      x="82.5"
                      y="25"
                      textAnchor="middle"
                      fill="#fff"
                      fontSize="16"
                      fontFamily="system-ui"
                      fontWeight="500"
                    >
                      Apple Pay
                    </text>
                  </svg>
                </button>
                <button className="flex items-center justify-center gap-2 py-2.5 border border-charcoal/[0.08] hover:border-charcoal/20 transition-colors cursor-pointer">
                  <svg className="h-5" viewBox="0 0 165 40" fill="none">
                    <path
                      d="M150.7 0H14.3C6.4 0 0 6.4 0 14.3v11.4C0 33.6 6.4 40 14.3 40h136.4c7.9 0 14.3-6.4 14.3-14.3V14.3C165 6.4 158.6 0 150.7 0z"
                      fill="#5A31F4"
                    />
                    <text
                      x="82.5"
                      y="25"
                      textAnchor="middle"
                      fill="#fff"
                      fontSize="14"
                      fontFamily="system-ui"
                      fontWeight="600"
                    >
                      G Pay
                    </text>
                  </svg>
                </button>
              </div>
            </div>

            {/* Estimated delivery */}
            <div className="mt-5 pt-5 border-t border-charcoal/[0.06]">
              <div className="flex items-center gap-2.5">
                <TruckIcon className="w-4 h-4 text-charcoal/25 flex-shrink-0" />
                <div>
                  <p className="text-[11px] sm:text-xs font-medium text-charcoal/60">
                    {t("cart.estimatedDelivery")}
                  </p>
                  <p className="text-[10px] text-charcoal/30">
                    {t("cart.estimatedDays")}
                  </p>
                </div>
              </div>
            </div>

            {/* Security + trust */}
            <div className="mt-4 flex items-center gap-2 text-[10px] text-charcoal/25">
              <ShieldCheckIcon className="w-3.5 h-3.5 flex-shrink-0" />
              <span>{t("checkout.securePayment")}</span>
            </div>
          </motion.div>

          {/* Trust badges — desktop */}
          <div className="hidden lg:block mt-4">
            <TrustBadges t={t} />
          </div>
        </div>
      </div>
    </div>
  );
}
