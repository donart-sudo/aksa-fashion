"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import ProductImage from "@/components/ui/ProductImage";
import { useLocale, useTranslations } from "next-intl";
import { HeartIcon } from "@heroicons/react/24/outline";
import { HeartIcon as HeartIconSolid } from "@heroicons/react/24/solid";
import { ShoppingBagIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { CheckIcon } from "@heroicons/react/24/solid";
import { formatPrice } from "@/lib/utils";
import { useCart } from "@/lib/cart";
import { useWishlist } from "@/lib/wishlist";
import { useToast } from "@/components/ui/Toast";

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
  const { toast } = useToast();
  const [hovered, setHovered] = useState(false);
  const [added, setAdded] = useState(false);
  const [showSizes, setShowSizes] = useState(false);

  const wishlisted = isWishlisted(product.id);
  const hasSizes = product.sizes && product.sizes.length > 0;

  const discount = product.originalPrice
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : 0;

  const addToCartDirect = useCallback(() => {
    addItem({
      productId: product.id,
      variantId: product.id,
      handle: product.handle,
      title: product.title,
      thumbnail: product.thumbnail,
      price: product.price,
      quantity: 1,
    });
    setAdded(true);
    setShowSizes(false);
    toast(t("added"), "cart");
    setTimeout(() => setAdded(false), 1800);
  }, [addItem, product, toast, t]);

  const addToCartWithSize = useCallback(
    (e: React.MouseEvent, size: string) => {
      e.preventDefault();
      e.stopPropagation();
      addItem({
        productId: product.id,
        variantId: `${product.id}-${size}`,
        handle: product.handle,
        title: product.title,
        thumbnail: product.thumbnail,
        price: product.price,
        quantity: 1,
        size,
      });
      setAdded(true);
      setShowSizes(false);
      toast(t("added"), "cart");
      setTimeout(() => setAdded(false), 1800);
    },
    [addItem, product, toast, t]
  );

  const handleAddToCart = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (added) return;

      if (hasSizes) {
        setShowSizes(true);
        return;
      }

      addToCartDirect();
    },
    [added, hasSizes, addToCartDirect]
  );

  const handleCloseSizes = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setShowSizes(false);
    },
    []
  );

  const handleToggleWishlist = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const wasWishlisted = isWishlisted(product.id);
      toggleItem(product);
      toast(
        wasWishlisted ? t("removeFromWishlist") : t("addToWishlist"),
        "wishlist"
      );
    },
    [toggleItem, product, isWishlisted, toast, t]
  );

  return (
    <div
      className="group relative"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setShowSizes(false); }}
    >
      {/* Image */}
      <Link
        href={`/${locale}/products/${product.handle}`}
        className="block relative aspect-[3/4] overflow-hidden bg-[#f0eeeb] active:scale-[0.97] transition-transform duration-200"
      >
        <ProductImage
          src={product.thumbnail}
          alt={product.title}
          fallbackLabel={product.title}
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
          <ProductImage
            src={product.hoverImage}
            alt={product.title}
            fallbackLabel={product.title}
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
          className="absolute top-3 right-3 z-10 w-10 h-10 flex items-center justify-center min-w-[40px] min-h-[40px] sm:w-9 sm:h-9 sm:min-w-[36px] sm:min-h-[36px]"
          aria-label={wishlisted ? t("removeFromWishlist") : t("addToWishlist")}
        >
          {wishlisted ? (
            <HeartIconSolid className="w-[22px] h-[22px] text-red-500 drop-shadow-md" />
          ) : (
            <HeartIcon className="w-[22px] h-[22px] text-white drop-shadow-md" />
          )}
        </button>

        {/* ── Size picker overlay ── */}
        {showSizes && hasSizes && (
          <div
            className="absolute inset-0 z-20 bg-white/95 backdrop-blur-sm flex flex-col items-center justify-center p-3 sm:p-4"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
          >
            <button
              onClick={handleCloseSizes}
              className="absolute top-2.5 right-2.5 w-7 h-7 flex items-center justify-center text-charcoal/30 hover:text-charcoal transition-colors"
              aria-label={t("close")}
            >
              <XMarkIcon className="w-4.5 h-4.5" />
            </button>

            <p className="text-[10px] sm:text-[11px] tracking-[0.2em] uppercase text-charcoal/40 mb-3 sm:mb-4">
              {t("selectSize")}
            </p>

            <div className="flex flex-wrap justify-center gap-1.5 sm:gap-2 max-w-full">
              {product.sizes!.map((size) => (
                <button
                  key={size}
                  onClick={(e) => addToCartWithSize(e, size)}
                  className="min-w-[42px] sm:min-w-[42px] min-h-[40px] sm:min-h-[40px] px-2.5 sm:px-3 py-1.5 sm:py-2 border border-charcoal/[0.1] text-[11px] sm:text-xs font-medium text-charcoal hover:bg-charcoal hover:text-white transition-all duration-200"
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Quick add — desktop hover slide-up */}
        {!showSizes && (
          <div
            className={`absolute bottom-0 inset-x-0 z-10 p-2.5 transition-all duration-300 ease-out hidden sm:block ${
              hovered ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"
            }`}
          >
            <button
              onClick={handleAddToCart}
              className={`w-full flex items-center justify-center gap-2 py-3 text-[11px] font-bold tracking-[0.15em] uppercase transition-all duration-200 cursor-pointer ${
                added
                  ? "bg-charcoal text-white"
                  : "bg-white/95 backdrop-blur-sm text-charcoal hover:bg-charcoal hover:text-white"
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
        )}

        {/* Quick add — mobile bag icon (always visible) */}
        {!showSizes && (
          <button
            onClick={handleAddToCart}
            className={`absolute bottom-2.5 right-2.5 z-10 sm:hidden w-10 h-10 min-w-[40px] min-h-[40px] flex items-center justify-center rounded-full shadow-md transition-all duration-200 cursor-pointer ${
              added
                ? "bg-charcoal text-white scale-110"
                : "bg-white/90 backdrop-blur-sm text-charcoal active:scale-95"
            }`}
            aria-label={added ? t("added") : t("addToCart")}
          >
            {added ? (
              <CheckIcon className="w-[18px] h-[18px]" />
            ) : (
              <ShoppingBagIcon className="w-[18px] h-[18px]" />
            )}
          </button>
        )}
      </Link>

      {/* Info */}
      <div className="mt-3 sm:mt-4 pb-1">
        <Link href={`/${locale}/products/${product.handle}`}>
          <h3 className="font-serif text-[17px] sm:text-[18px] lg:text-[20px] font-medium text-charcoal leading-snug group-hover:underline decoration-charcoal/30 underline-offset-2 transition-all duration-300 line-clamp-2">
            {product.title}
          </h3>
        </Link>

        <div className="flex items-baseline gap-1.5 mt-1.5">
          <span className="text-[16px] text-gold font-semibold">
            {formatPrice(product.price)}
          </span>
          {product.originalPrice && (
            <>
              <span className="text-[12px] text-charcoal/30 line-through">
                {formatPrice(product.originalPrice)}
              </span>
              <span className="text-[10px] font-bold text-red-500">
                Save {discount}%
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
