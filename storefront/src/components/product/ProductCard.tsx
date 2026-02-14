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

const COLOR_MAP: Record<string, string> = {
  white: "#FFFFFF",
  ivory: "#FFFFF0",
  cream: "#FFFDD0",
  champagne: "#F7E7CE",
  nude: "#E8BEAC",
  blush: "#DE98AB",
  pink: "#F4C2C2",
  rose: "#C08081",
  red: "#C41E3A",
  burgundy: "#800020",
  wine: "#722F37",
  coral: "#FF7F50",
  orange: "#E8711E",
  gold: "#D4AF37",
  yellow: "#F5D300",
  green: "#2D5F2D",
  emerald: "#50C878",
  sage: "#B2AC88",
  teal: "#008080",
  blue: "#2B4F81",
  navy: "#1B2A4A",
  royal: "#4169E1",
  lavender: "#B57EDC",
  purple: "#6A0DAD",
  lilac: "#C8A2C8",
  silver: "#C0C0C0",
  gray: "#808080",
  grey: "#808080",
  charcoal: "#36454F",
  black: "#1A1A1A",
  brown: "#6B3A2A",
  bronze: "#CD7F32",
  copper: "#B87333",
  "dusty rose": "#DCAE96",
  "baby pink": "#F4C2C2",
  "light blue": "#ADD8E6",
  "dark green": "#1B4D2E",
  "off-white": "#FAF0E6",
  beige: "#D9C5A0",
  taupe: "#B5A08E",
  mauve: "#E0B0FF",
  peach: "#FFCBA4",
  turquoise: "#40E0D0",
};

function getColorHex(name: string): string | null {
  const lower = name.toLowerCase().trim();
  return COLOR_MAP[lower] ?? null;
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

  // Resolve color dots
  const colorDots = product.colors
    ?.slice(0, 4)
    .map((c) => ({ name: c, hex: getColorHex(c) }))
    .filter((c) => c.hex) ?? [];

  return (
    <div
      className="group relative"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* ═══ IMAGE ═══ */}
      <Link
        href={`/${locale}/products/${product.handle}`}
        className="block relative aspect-[3/4] overflow-hidden bg-soft-gray/20"
      >
        {/* Primary image */}
        <Image
          src={product.thumbnail}
          alt={product.title}
          fill
          className={`object-cover transition-all duration-700 ease-out ${
            hovered && product.hoverImage
              ? "opacity-0 scale-[1.02]"
              : hovered && !product.hoverImage
                ? "scale-[1.06]"
                : "opacity-100 scale-100"
          }`}
          sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
          priority={priority}
        />

        {/* Hover image */}
        {product.hoverImage && (
          <Image
            src={product.hoverImage}
            alt={product.title}
            fill
            className={`object-cover transition-all duration-700 ease-out ${
              hovered ? "opacity-100 scale-100" : "opacity-0 scale-[1.02]"
            }`}
            sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        )}

        {/* ═══ BADGE ═══ */}
        {product.badge && (
          <div className="absolute top-3 left-3 z-10">
            {product.badge === "new" && (
              <span className="inline-block px-3 py-1.5 bg-charcoal text-white text-[10px] font-semibold tracking-widest uppercase">
                {t("newArrival")}
              </span>
            )}
            {product.badge === "sale" && (
              <span className="inline-block px-3 py-1.5 bg-red-600 text-white text-[10px] font-semibold tracking-widest uppercase">
                &minus;{discount}%
              </span>
            )}
            {product.badge === "bestseller" && (
              <span className="inline-block px-3 py-1.5 bg-gold text-white text-[10px] font-semibold tracking-widest uppercase">
                {t("bestSeller")}
              </span>
            )}
          </div>
        )}

        {/* ═══ WISHLIST HEART ═══ */}
        <button
          onClick={handleToggleWishlist}
          className={`absolute top-3 right-3 z-10 w-9 h-9 flex items-center justify-center rounded-full transition-all duration-300 min-w-[36px] min-h-[36px] ${
            wishlisted
              ? "bg-white shadow-sm opacity-100"
              : "bg-white/90 shadow-sm opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
          }`}
          aria-label={wishlisted ? t("removeFromWishlist") : t("addToWishlist")}
        >
          {wishlisted ? (
            <HeartIconSolid className="w-[18px] h-[18px] text-red-500" />
          ) : (
            <HeartIcon className="w-[18px] h-[18px] text-charcoal/70" />
          )}
        </button>

        {/* ═══ QUICK ADD TO CART ═══ */}
        <div
          className={`absolute bottom-0 left-0 right-0 z-10 transition-all duration-300 ease-out ${
            hovered ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"
          }`}
        >
          <button
            onClick={handleAddToCart}
            className={`w-full flex items-center justify-center gap-2 py-3.5 text-xs font-semibold tracking-widest uppercase transition-all duration-300 min-h-[48px] ${
              added
                ? "bg-charcoal text-white"
                : "bg-white text-charcoal hover:bg-charcoal hover:text-white"
            }`}
          >
            {added ? (
              <>
                <CheckIcon className="w-4 h-4" />
                {t("added")}
              </>
            ) : (
              <>
                <ShoppingBagIcon className="w-4 h-4" />
                {t("addToCart")}
              </>
            )}
          </button>
        </div>
      </Link>

      {/* ═══ PRODUCT INFO ═══ */}
      <div className="mt-3 px-0.5">
        {/* Collection label */}
        {product.collection && (
          <p className="text-[10px] font-medium tracking-widest uppercase text-charcoal/45 mb-0.5 line-clamp-1">
            {product.collection}
          </p>
        )}

        {/* Title */}
        <Link href={`/${locale}/products/${product.handle}`} className="block">
          <h3 className="text-sm font-semibold text-charcoal leading-snug group-hover:text-charcoal/80 transition-colors line-clamp-1">
            {product.title}
          </h3>
        </Link>

        {/* Price row */}
        <div className="flex items-baseline gap-2 mt-1">
          <span
            className={`text-sm font-bold ${
              product.originalPrice ? "text-red-600" : "text-charcoal"
            }`}
          >
            {formatPrice(product.price)}
          </span>
          {product.originalPrice && (
            <span className="text-xs text-charcoal/45 line-through">
              {formatPrice(product.originalPrice)}
            </span>
          )}
        </div>

        {/* Color dots */}
        {colorDots.length > 0 && (
          <div className="flex items-center gap-1.5 mt-2">
            {colorDots.map((c) => (
              <span
                key={c.name}
                className="w-3 h-3 rounded-full border border-soft-gray/60"
                style={{ backgroundColor: c.hex! }}
                title={c.name}
              />
            ))}
            {product.colors && product.colors.length > 4 && (
              <span className="text-[10px] text-charcoal/40 ml-0.5">
                +{product.colors.length - 4}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
