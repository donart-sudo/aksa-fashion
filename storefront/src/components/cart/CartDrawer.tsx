"use client";

import { useTranslations, useLocale } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { XMarkIcon, TrashIcon } from "@heroicons/react/24/outline";
import { useCart } from "@/lib/cart";
import Button from "@/components/ui/Button";
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
            className="fixed inset-0 bg-black/40 z-50"
            onClick={closeCart}
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.3 }}
            className="fixed top-0 right-0 bottom-0 w-full sm:w-[420px] bg-white z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-soft-gray/50">
              <h2 className="font-serif text-xl text-charcoal">
                {t("cart.title")} ({itemCount})
              </h2>
              <button
                onClick={closeCart}
                className="p-2 hover:text-gold transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
                aria-label={t("common.close")}
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            {/* Free shipping bar */}
            <div className="px-4 py-3 bg-cream">
              {subtotal >= FREE_SHIPPING_THRESHOLD ? (
                <p className="text-xs text-gold font-medium text-center">
                  {t("cart.freeShippingMessage")}
                </p>
              ) : (
                <>
                  <p className="text-xs text-charcoal/60 text-center mb-2">
                    {t("cart.freeShippingProgress", {
                      amount: amountToFreeShipping.toFixed(0),
                    })}
                  </p>
                  <div className="w-full h-1.5 bg-soft-gray/50 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gold rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${shippingProgress}%` }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                </>
              )}
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center p-8">
                  <p className="text-charcoal/40 mb-4">{t("cart.empty")}</p>
                  <Button variant="primary" onClick={closeCart}>
                    {t("common.continueShopping")}
                  </Button>
                </div>
              ) : (
                <ul className="divide-y divide-soft-gray/30">
                  {items.map((item) => (
                    <li key={item.id} className="p-4">
                      <div className="flex gap-4">
                        {/* Thumbnail */}
                        <div className="relative w-20 h-24 bg-soft-gray/30 flex-shrink-0">
                          <Image
                            src={item.thumbnail}
                            alt={item.title}
                            fill
                            className="object-cover"
                            sizes="80px"
                          />
                        </div>

                        {/* Details */}
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-medium text-charcoal truncate">
                            {item.title}
                          </h3>
                          {(item.size || item.color) && (
                            <p className="text-xs text-charcoal/40 mt-0.5">
                              {[item.color, item.size]
                                .filter(Boolean)
                                .join(" / ")}
                            </p>
                          )}
                          <p className="text-sm font-medium text-charcoal mt-1">
                            {formatPrice(item.price)}
                          </p>

                          {/* Quantity + Remove */}
                          <div className="flex items-center justify-between mt-2">
                            <div className="flex items-center border border-soft-gray">
                              <button
                                onClick={() =>
                                  updateQuantity(item.id, item.quantity - 1)
                                }
                                disabled={item.quantity <= 1}
                                className="px-2.5 py-1 text-xs text-charcoal/60 hover:text-charcoal disabled:opacity-30 min-w-[32px] min-h-[32px]"
                              >
                                −
                              </button>
                              <span className="px-2.5 py-1 text-xs font-medium min-w-[28px] text-center">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() =>
                                  updateQuantity(item.id, item.quantity + 1)
                                }
                                className="px-2.5 py-1 text-xs text-charcoal/60 hover:text-charcoal min-w-[32px] min-h-[32px]"
                              >
                                +
                              </button>
                            </div>
                            <button
                              onClick={() => removeItem(item.id)}
                              className="p-1.5 text-charcoal/30 hover:text-red-500 transition-colors min-w-[32px] min-h-[32px] flex items-center justify-center"
                              aria-label={t("cart.removeItem")}
                            >
                              <TrashIcon className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="border-t border-soft-gray/50 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-charcoal/60">
                    {t("common.subtotal")}
                  </span>
                  <span className="text-lg font-medium text-charcoal">
                    {formatPrice(subtotal)}
                  </span>
                </div>
                <p className="text-xs text-charcoal/40">
                  {t("cart.shippingAtCheckout")}
                </p>
                <Link href={`/${locale}/checkout`} onClick={closeCart}>
                  <Button variant="primary" size="lg" className="w-full">
                    {t("common.checkout")}
                  </Button>
                </Link>
                <button
                  onClick={closeCart}
                  className="w-full text-center text-sm text-charcoal/60 hover:text-gold transition-colors py-2"
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
