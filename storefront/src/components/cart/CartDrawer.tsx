"use client";

import { useTranslations, useLocale } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import {
  XMarkIcon,
  MinusIcon,
  PlusIcon,
  ShoppingBagIcon,
  ArrowRightIcon,
} from "@heroicons/react/24/outline";
import { useCart } from "@/lib/cart";
import { formatPrice } from "@/lib/utils";
import { FREE_SHIPPING_THRESHOLD } from "@/lib/constants";

export default function CartDrawer() {
  const t = useTranslations();
  const locale = useLocale();
  const {
    items,
    isOpen,
    closeCart,
    removeItem,
    updateQuantity,
    itemCount,
    subtotal,
  } = useCart();

  const shippingProgress = Math.min(
    (subtotal / FREE_SHIPPING_THRESHOLD) * 100,
    100
  );
  const amountToFreeShipping = Math.max(
    0,
    (FREE_SHIPPING_THRESHOLD - subtotal) / 100
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
            className="fixed inset-0 bg-black/30 backdrop-blur-[2px] z-[80]"
            onClick={closeCart}
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="fixed top-0 right-0 bottom-0 w-full sm:w-[400px] bg-cream z-[81] flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 h-16 flex-shrink-0">
              <div className="flex items-center gap-3">
                <ShoppingBagIcon className="w-5 h-5 text-charcoal/40" />
                <h2 className="text-[15px] font-bold tracking-tight text-charcoal uppercase">
                  {t("cart.title")}
                </h2>
                <span className="text-[12px] text-charcoal/30">
                  ({itemCount})
                </span>
              </div>
              <button
                onClick={closeCart}
                className="p-2 -mr-2 text-charcoal/40 hover:text-charcoal transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
                aria-label={t("common.close")}
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            {/* Free shipping bar */}
            <div className="px-6 pb-4 flex-shrink-0">
              {subtotal >= FREE_SHIPPING_THRESHOLD ? (
                <div className="flex items-center justify-center gap-2 py-2.5 bg-charcoal/[0.03] border border-charcoal/[0.06]">
                  <span className="text-[11px] tracking-[0.1em] uppercase text-gold font-medium">
                    {t("cart.freeShippingMessage")}
                  </span>
                </div>
              ) : (
                <div className="py-2.5 px-4 bg-charcoal/[0.03] border border-charcoal/[0.06]">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] text-charcoal/40">
                      {t("cart.freeShippingProgress", {
                        amount: amountToFreeShipping.toFixed(0),
                      })}
                    </span>
                    <span className="text-[10px] text-charcoal/25">
                      {Math.round(shippingProgress)}%
                    </span>
                  </div>
                  <div className="w-full h-[3px] bg-charcoal/[0.06] overflow-hidden">
                    <motion.div
                      className="h-full bg-charcoal"
                      initial={{ width: 0 }}
                      animate={{ width: `${shippingProgress}%` }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto px-6">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <ShoppingBagIcon className="w-12 h-12 text-charcoal/10 mb-4" />
                  <p className="text-[14px] text-charcoal/35 mb-6">
                    {t("cart.empty")}
                  </p>
                  <button
                    onClick={closeCart}
                    className="text-[11px] font-bold tracking-[0.15em] uppercase text-charcoal border-b border-charcoal pb-0.5 hover:text-gold hover:border-gold transition-colors"
                  >
                    {t("common.continueShopping")}
                  </button>
                </div>
              ) : (
                <div className="space-y-0">
                  {items.map((item, i) => (
                    <div
                      key={item.id}
                      className={`flex gap-4 py-5 ${
                        i < items.length - 1
                          ? "border-b border-charcoal/[0.06]"
                          : ""
                      }`}
                    >
                      {/* Thumbnail */}
                      <Link
                        href={`/${locale}/products/${item.productId}`}
                        onClick={closeCart}
                        className="relative w-[80px] h-[104px] bg-[#f0eeeb] flex-shrink-0 overflow-hidden"
                      >
                        <Image
                          src={item.thumbnail}
                          alt={item.title}
                          fill
                          className="object-cover object-top"
                          sizes="80px"
                        />
                      </Link>

                      {/* Details */}
                      <div className="flex-1 min-w-0 flex flex-col justify-between">
                        <div>
                          <h3 className="text-[13px] font-semibold text-charcoal truncate">
                            {item.title}
                          </h3>
                          {(item.size || item.color) && (
                            <p className="text-[11px] text-charcoal/35 mt-0.5">
                              {[item.color, item.size]
                                .filter(Boolean)
                                .join(" / ")}
                            </p>
                          )}
                          <p className="text-[14px] font-bold text-charcoal mt-1.5">
                            {formatPrice(item.price * item.quantity)}
                          </p>
                        </div>

                        {/* Quantity + Remove */}
                        <div className="flex items-center justify-between mt-3">
                          <div className="flex items-center">
                            <button
                              onClick={() =>
                                updateQuantity(item.id, item.quantity - 1)
                              }
                              disabled={item.quantity <= 1}
                              className="w-8 h-8 flex items-center justify-center border border-charcoal/10 text-charcoal/50 hover:text-charcoal hover:border-charcoal/30 disabled:opacity-20 disabled:hover:border-charcoal/10 transition-colors"
                            >
                              <MinusIcon className="w-3 h-3" />
                            </button>
                            <span className="w-10 h-8 flex items-center justify-center text-[12px] font-semibold text-charcoal border-y border-charcoal/10">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() =>
                                updateQuantity(item.id, item.quantity + 1)
                              }
                              className="w-8 h-8 flex items-center justify-center border border-charcoal/10 text-charcoal/50 hover:text-charcoal hover:border-charcoal/30 transition-colors"
                            >
                              <PlusIcon className="w-3 h-3" />
                            </button>
                          </div>
                          <button
                            onClick={() => removeItem(item.id)}
                            className="text-[10px] tracking-[0.1em] uppercase text-charcoal/25 hover:text-red-500 transition-colors"
                            aria-label={t("cart.removeItem")}
                          >
                            {t("cart.removeItem")}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="flex-shrink-0 border-t border-charcoal/[0.06] bg-white px-6 pt-5 pb-6">
                {/* Subtotal */}
                <div className="flex items-center justify-between mb-5">
                  <span className="text-[12px] tracking-[0.1em] uppercase text-charcoal/40">
                    {t("common.subtotal")}
                  </span>
                  <span className="text-[18px] font-bold text-charcoal">
                    {formatPrice(subtotal)}
                  </span>
                </div>

                {/* Checkout button */}
                <Link
                  href={`/${locale}/checkout`}
                  onClick={closeCart}
                  className="flex items-center justify-center gap-2 w-full py-4 bg-charcoal text-white text-[11px] font-bold tracking-[0.15em] uppercase hover:bg-charcoal/90 transition-colors"
                >
                  {t("common.checkout")}
                  <ArrowRightIcon className="w-3.5 h-3.5" />
                </Link>

                {/* Continue shopping */}
                <button
                  onClick={closeCart}
                  className="w-full text-center text-[11px] tracking-[0.1em] uppercase text-charcoal/30 hover:text-charcoal transition-colors mt-4"
                >
                  {t("common.continueShopping")}
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
