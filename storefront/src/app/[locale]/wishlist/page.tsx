"use client";

import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";
import Image from "next/image";
import Button from "@/components/ui/Button";
import { HeartIcon, TrashIcon } from "@heroicons/react/24/outline";
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
      <h1 className="font-serif text-3xl lg:text-4xl text-charcoal mb-2">
        {t("wishlist")}
      </h1>
      <p className="text-charcoal/50 text-sm mb-8">
        {items.length} {items.length === 1 ? t("item") : t("items")}
      </p>

      {items.length === 0 ? (
        <div className="text-center py-16">
          <HeartIcon className="w-16 h-16 text-soft-gray mx-auto mb-4" />
          <p className="text-charcoal/60 mb-6">{t("emptyWishlist")}</p>
          <Link href={`/${locale}/collections`}>
            <Button variant="primary">{t("continueShopping")}</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
          {items.map((item) => (
            <div key={item.id} className="group relative">
              <Link
                href={`/${locale}/products/${item.handle}`}
                className="block relative aspect-[3/4] overflow-hidden bg-soft-gray/30"
              >
                <Image
                  src={item.thumbnail}
                  alt={item.title}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                />
              </Link>

              {/* Remove button */}
              <button
                onClick={() => removeItem(item.id)}
                className="absolute top-3 right-3 p-2 bg-white/80 backdrop-blur-sm rounded-full hover:bg-white transition-colors min-w-[36px] min-h-[36px] flex items-center justify-center"
                aria-label={t("removeFromWishlist")}
              >
                <TrashIcon className="w-4 h-4 text-charcoal/60 hover:text-red-500" />
              </button>

              <div className="mt-3 space-y-2">
                <Link href={`/${locale}/products/${item.handle}`}>
                  <h3 className="text-sm font-medium text-charcoal group-hover:text-gold transition-colors line-clamp-1">
                    {item.title}
                  </h3>
                </Link>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-charcoal">
                    {formatPrice(item.price)}
                  </span>
                  {item.originalPrice && (
                    <span className="text-xs text-charcoal/40 line-through">
                      {formatPrice(item.originalPrice)}
                    </span>
                  )}
                </div>
                <button
                  onClick={() => handleMoveToCart(item)}
                  className="w-full bg-charcoal text-white text-xs font-medium tracking-wider uppercase py-2.5 hover:bg-gold transition-colors min-h-[40px]"
                >
                  {t("addToCart")}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
