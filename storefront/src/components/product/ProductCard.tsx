"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { HeartIcon } from "@heroicons/react/24/outline";
import { HeartIcon as HeartIconSolid } from "@heroicons/react/24/solid";
import { ShoppingBagIcon } from "@heroicons/react/24/outline";
import { CheckIcon } from "@heroicons/react/24/solid";
import { formatPrice } from "@/lib/utils";
import { useCart } from "@/lib/cart";
import { useWishlist } from "@/lib/wishlist";

/*
 * Luxury product card — Zalando/Zara inspired
 *
 * - Clean image with smooth hover swap or zoom
 * - Wishlist heart fades in on hover (always visible on mobile)
 * - Quick-add slides up on hover with "Added!" feedback
 * - Bold readable typography
 * - Sale prices in red with strikethrough
 * - Color dots when available
 * - Collection label above title
 */

export interface ProductCardData {
  id: string;
  title: string;
  handle: string;
  price: number;
  originalPrice?: number;
  thumbnail: string;
  hoverImage?: string;
  badge?: "new" | "sale" | "bestseller";
  colors?: string[];
  sizes?: string[];
  collection?: string;
}

interface ProductCardProps {
  product: ProductCardData;
  priority?: boolean;
}


export default function ProductCard({ product, priority }: ProductCardProps) {
  const t = useTranslations("common");
  const locale = useLocale();
  const { addItem } = useCart();
  const { toggleItem, isWishlisted } = useWishlist();
  const [hovered, setHovered] = useState(false);
  const [added, setAdded] = useState(false);

  const wishlisted = isWishlisted(product.id);

  const discount = product.originalPrice
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : 0;

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

  const handleToggleWishlist = useCallback(
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
      {/* Image */}
      <Link
        href={`/${locale}/products/${product.handle}`}
        className="block relative aspect-[3/4] overflow-hidden bg-[#f0eeeb]"
      >
        <Image
          src={product.thumbnail}
          alt={product.title}
          fill
          className={`object-cover object-top transition-all duration-700 ease-out ${
            hovered && product.hoverImage
              ? "opacity-0 scale-[1.03]"
              : hovered
                ? "scale-[1.05]"
                : "scale-100"
          }`}
          sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
          priority={priority}
        />

        {product.hoverImage && (
          <Image
            src={product.hoverImage}
            alt={product.title}
            fill
            className={`object-cover object-top transition-all duration-700 ease-out ${
              hovered ? "opacity-100 scale-100" : "opacity-0 scale-[1.03]"
            }`}
            sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        )}

        {/* Badge — top left */}
        {product.badge && (
          <span className="absolute top-3 left-3 z-10 inline-block px-2.5 py-1 text-[9px] font-bold tracking-[0.15em] uppercase bg-charcoal text-white">
            {product.badge === "sale" ? <>&minus;{discount}%</> : product.badge === "new" ? t("newArrival") : t("bestSeller")}
          </span>
        )}

        {/* Wishlist — always visible */}
        <button
          onClick={handleToggleWishlist}
          className="absolute top-3 right-3 z-10 w-9 h-9 flex items-center justify-center min-w-[36px] min-h-[36px]"
          aria-label={wishlisted ? t("removeFromWishlist") : t("addToWishlist")}
        >
          {wishlisted ? (
            <HeartIconSolid className="w-[22px] h-[22px] text-red-500 drop-shadow-md" />
          ) : (
            <HeartIcon className="w-[22px] h-[22px] text-white drop-shadow-md" />
          )}
        </button>

        {/* Quick add — desktop hover */}
        <div
          className={`absolute bottom-0 inset-x-0 z-10 p-2.5 transition-all duration-300 ease-out hidden sm:block ${
            hovered ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
          }`}
        >
          <button
            onClick={handleAddToCart}
            className={`w-full flex items-center justify-center gap-2 py-2.5 text-[10px] font-bold tracking-[0.15em] uppercase transition-all duration-200 ${
              added
                ? "bg-charcoal text-white"
                : "bg-white text-charcoal hover:bg-charcoal hover:text-white"
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
      </Link>

      {/* Info */}
      <div className="mt-3 pb-4">
        {/* Row 1: Title + Price inline */}
        <div className="flex items-baseline justify-between gap-3">
          <Link href={`/${locale}/products/${product.handle}`} className="min-w-0 flex-1">
            <h3 className="text-[14px] font-semibold text-charcoal truncate group-hover:text-charcoal/70 transition-colors">
              {product.title}
            </h3>
          </Link>
          <span className="text-[14px] font-bold text-charcoal flex-shrink-0">
            {formatPrice(product.price)}
          </span>
        </div>

        {/* Row 2: Collection + Sale price */}
        <div className="flex items-baseline justify-between gap-3 mt-1">
          <span className="text-[11px] tracking-wide text-charcoal/35 truncate">
            {product.collection || "\u00A0"}
          </span>
          {product.originalPrice && (
            <div className="flex items-baseline gap-1.5 flex-shrink-0">
              <span className="text-[12px] text-charcoal/30 line-through">
                {formatPrice(product.originalPrice)}
              </span>
              <span className="text-[10px] font-bold text-red-500">
                -{discount}%
              </span>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
