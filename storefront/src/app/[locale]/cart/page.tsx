"use client";

import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";
import Image from "next/image";
import Button from "@/components/ui/Button";
import { ShoppingBagIcon, TrashIcon } from "@heroicons/react/24/outline";
import { useCart } from "@/lib/cart";
import { formatPrice } from "@/lib/utils";

export default function CartPage() {
  const t = useTranslations();
  const locale = useLocale();
  const { items, removeItem, updateQuantity, subtotal, itemCount } = useCart();

  if (itemCount === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
        <h1 className="font-serif text-3xl lg:text-4xl text-charcoal mb-8">
          {t("cart.title")}
        </h1>
        <div className="text-center py-16">
          <ShoppingBagIcon className="w-16 h-16 text-soft-gray mx-auto mb-4" />
          <p className="text-charcoal/60 mb-6">{t("cart.empty")}</p>
          <Link href={`/${locale}/collections`}>
            <Button variant="primary">{t("common.continueShopping")}</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
      <h1 className="font-serif text-3xl lg:text-4xl text-charcoal mb-8">
        {t("cart.title")} ({itemCount})
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart items */}
        <div className="lg:col-span-2">
          <ul className="divide-y divide-soft-gray/30">
            {items.map((item) => (
              <li key={item.id} className="py-4 first:pt-0">
                <div className="flex gap-4">
                  <div className="relative w-24 h-32 bg-soft-gray/30 flex-shrink-0">
                    <Image
                      src={item.thumbnail}
                      alt={item.title}
                      fill
                      className="object-cover"
                      sizes="96px"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/${locale}/products/${item.productId}`}
                      className="text-sm font-medium text-charcoal hover:text-gold transition-colors line-clamp-2"
                    >
                      {item.title}
                    </Link>
                    {(item.size || item.color) && (
                      <p className="text-xs text-charcoal/40 mt-1">
                        {[item.color, item.size].filter(Boolean).join(" / ")}
                      </p>
                    )}
                    <p className="text-sm font-medium text-charcoal mt-1">
                      {formatPrice(item.price)}
                    </p>

                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center border border-soft-gray">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                          className="px-3 py-2 text-sm text-charcoal/60 hover:text-charcoal disabled:opacity-30 min-w-[36px] min-h-[36px]"
                        >
                          −
                        </button>
                        <span className="px-3 py-2 text-sm font-medium min-w-[36px] text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="px-3 py-2 text-sm text-charcoal/60 hover:text-charcoal min-w-[36px] min-h-[36px]"
                        >
                          +
                        </button>
                      </div>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="p-2 text-charcoal/30 hover:text-red-500 transition-colors min-w-[36px] min-h-[36px] flex items-center justify-center"
                        aria-label="Remove item"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Order summary */}
        <div>
          <div className="bg-warm-white p-6 sticky top-24">
            <h2 className="font-serif text-xl text-charcoal mb-4">
              {t("cart.orderSummary")}
            </h2>
            <div className="space-y-3 text-sm border-b border-soft-gray/50 pb-4 mb-4">
              <div className="flex justify-between text-charcoal/60">
                <span>{t("common.subtotal")}</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-charcoal/60">
                <span>{t("common.shipping")}</span>
                <span>{t("common.free")}</span>
              </div>
            </div>
            <div className="flex justify-between font-medium text-charcoal mb-6">
              <span>{t("common.total")}</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <Link href={`/${locale}/checkout`}>
              <Button variant="primary" size="lg" className="w-full">
                {t("common.checkout")}
              </Button>
            </Link>
            <Link
              href={`/${locale}/collections`}
              className="block text-center text-sm text-charcoal/50 hover:text-gold transition-colors mt-3 py-2"
            >
              {t("common.continueShopping")}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
