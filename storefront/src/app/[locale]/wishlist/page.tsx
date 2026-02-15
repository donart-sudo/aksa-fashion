"use client";

import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";
import Image from "next/image";
import {
  HeartIcon,
  XMarkIcon,
  ShoppingBagIcon,
  ArrowRightIcon,
} from "@heroicons/react/24/outline";
import { useWishlist } from "@/lib/wishlist";
import { useCart } from "@/lib/cart";
import { formatPrice } from "@/lib/utils";

export default function WishlistPage() {
  const t = useTranslations("common");
  const locale = useLocale();
  const { items, removeItem } = useWishlist();
  const { addItem } = useCart();

  const handleMoveToCart = (item: (typeof items)[0]) => {
    addItem({
      productId: item.id,
      variantId: item.id,
      title: item.title,
      thumbnail: item.thumbnail,
      price: item.price,
      quantity: 1,
    });
    removeItem(item.id);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
      {/* Header */}
      <div className="text-center mb-10 lg:mb-14">
        <h1 className="text-[1.75rem] sm:text-[2.25rem] lg:text-[2.75rem] font-black uppercase tracking-tight text-charcoal leading-none">
          {t("wishlist")}
        </h1>
        <p className="text-xs sm:text-sm text-charcoal/35 tracking-wide mt-3">
          {items.length} {items.length === 1 ? t("item") : t("items")}
        </p>
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center py-20">
          <HeartIcon className="w-14 h-14 text-charcoal/10 mb-5" />
          <p className="text-[14px] text-charcoal/35 mb-8">
            {t("emptyWishlist")}
          </p>
          <Link
            href={`/${locale}/collections`}
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-charcoal text-white text-[11px] font-bold tracking-[0.15em] uppercase hover:bg-charcoal/90 transition-colors"
          >
            {t("continueShopping")}
            <ArrowRightIcon className="w-3.5 h-3.5" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 lg:gap-5">
          {items.map((item) => {
            const discount = item.originalPrice
              ? Math.round((1 - item.price / item.originalPrice) * 100)
              : 0;

            return (
              <div key={item.id} className="group relative">
                {/* Image */}
                <Link
                  href={`/${locale}/products/${item.handle}`}
                  className="block relative aspect-[3/4] overflow-hidden bg-[#f0eeeb]"
                >
                  <Image
                    src={item.thumbnail}
                    alt={item.title}
                    fill
                    className="object-cover object-top transition-transform duration-700 group-hover:scale-105"
                    sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  />
                </Link>

                {/* Remove */}
                <button
                  onClick={() => removeItem(item.id)}
                  className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center min-w-[32px] min-h-[32px] transition-colors"
                  aria-label={t("removeFromWishlist")}
                >
                  <XMarkIcon className="w-5 h-5 text-white drop-shadow-md" />
                </button>

                {/* Move to cart — hover overlay */}
                <div className="absolute bottom-0 inset-x-0 z-10 p-2.5 transition-all duration-300 ease-out translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 hidden sm:block">
                  <button
                    onClick={() => handleMoveToCart(item)}
                    className="w-full flex items-center justify-center gap-2 py-2.5 bg-white text-charcoal text-[10px] font-bold tracking-[0.15em] uppercase hover:bg-charcoal hover:text-white transition-all duration-200"
                  >
                    <ShoppingBagIcon className="w-3.5 h-3.5" />
                    {t("addToCart")}
                  </button>
                </div>

                {/* Info */}
                <div className="mt-3 pb-4">
                  {/* Title + Price */}
                  <div className="flex items-baseline justify-between gap-3">
                    <Link
                      href={`/${locale}/products/${item.handle}`}
                      className="min-w-0 flex-1"
                    >
                      <h3 className="text-[14px] font-semibold text-charcoal truncate group-hover:text-charcoal/70 transition-colors">
                        {item.title}
                      </h3>
                    </Link>
                    <span className="text-[14px] font-bold text-charcoal flex-shrink-0">
                      {formatPrice(item.price)}
                    </span>
                  </div>

                  {/* Sale price */}
                  {item.originalPrice && (
                    <div className="flex items-baseline justify-end gap-1.5 mt-1">
                      <span className="text-[12px] text-charcoal/30 line-through">
                        {formatPrice(item.originalPrice)}
                      </span>
                      <span className="text-[10px] font-bold text-red-500">
                        -{discount}%
                      </span>
                    </div>
                  )}

                  {/* Mobile add to cart */}
                  <button
                    onClick={() => handleMoveToCart(item)}
                    className="sm:hidden w-full flex items-center justify-center gap-2 mt-3 py-2.5 border border-charcoal/10 text-charcoal text-[10px] font-bold tracking-[0.15em] uppercase hover:bg-charcoal hover:text-white hover:border-charcoal transition-all"
                  >
                    <ShoppingBagIcon className="w-3.5 h-3.5" />
                    {t("addToCart")}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
