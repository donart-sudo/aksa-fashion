"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { HeartIcon } from "@heroicons/react/24/outline";
import { HeartIcon as HeartIconSolid } from "@heroicons/react/24/solid";
import Badge from "@/components/ui/Badge";
import { formatPrice } from "@/lib/utils";
import { useCart } from "@/lib/cart";

interface ProductCardProps {
  product: {
    id: string;
    title: string;
    handle: string;
    price: number;
    originalPrice?: number;
    thumbnail: string;
    hoverImage?: string;
    badge?: "new" | "sale" | "bestseller";
  };
}

export default function ProductCard({ product }: ProductCardProps) {
  const t = useTranslations("common");
  const locale = useLocale();
  const { addItem } = useCart();
  const [wishlisted, setWishlisted] = useState(false);
  const [hovered, setHovered] = useState(false);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem({
      productId: product.id,
      variantId: product.id,
      title: product.title,
      thumbnail: product.thumbnail,
      price: product.price,
      quantity: 1,
    });
  };

  const discount = product.originalPrice
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : 0;

  return (
    <div
      className="group relative"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Image */}
      <Link
        href={`/${locale}/products/${product.handle}`}
        className="block relative aspect-[3/4] overflow-hidden bg-soft-gray/30"
      >
        <Image
          src={product.thumbnail}
          alt={product.title}
          fill
          className={`object-cover transition-all duration-700 ${
            hovered && product.hoverImage ? "opacity-0" : "opacity-100"
          }`}
          sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
        />
        {product.hoverImage && (
          <Image
            src={product.hoverImage}
            alt={product.title}
            fill
            className={`object-cover transition-all duration-700 ${
              hovered ? "opacity-100 scale-105" : "opacity-0"
            }`}
            sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        )}

        {/* Badge */}
        {product.badge && (
          <div className="absolute top-3 left-3">
            <Badge variant={product.badge}>
              {product.badge === "new" && t("newArrival")}
              {product.badge === "sale" && `−${discount}%`}
              {product.badge === "bestseller" && t("bestSeller")}
            </Badge>
          </div>
        )}

        {/* Quick actions */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: hovered ? 1 : 0, y: hovered ? 0 : 10 }}
          className="absolute bottom-3 left-3 right-3"
        >
          <button
            onClick={handleAddToCart}
            className="w-full bg-white/95 backdrop-blur-sm text-charcoal text-xs font-medium tracking-wider uppercase py-3 hover:bg-gold hover:text-white transition-colors min-h-[44px]"
          >
            {t("addToCart")}
          </button>
        </motion.div>
      </Link>

      {/* Wishlist */}
      <button
        onClick={() => setWishlisted(!wishlisted)}
        className="absolute top-3 right-3 p-2 bg-white/80 backdrop-blur-sm rounded-full hover:bg-white transition-colors min-w-[36px] min-h-[36px] flex items-center justify-center"
        aria-label={wishlisted ? t("removeFromWishlist") : t("addToWishlist")}
      >
        {wishlisted ? (
          <HeartIconSolid className="w-4 h-4 text-red-500" />
        ) : (
          <HeartIcon className="w-4 h-4 text-charcoal/60" />
        )}
      </button>

      {/* Info */}
      <div className="mt-3 space-y-1">
        <Link
          href={`/${locale}/products/${product.handle}`}
          className="block"
        >
          <h3 className="text-sm font-medium text-charcoal group-hover:text-gold transition-colors line-clamp-1">
            {product.title}
          </h3>
        </Link>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-charcoal">
            {formatPrice(product.price)}
          </span>
          {product.originalPrice && (
            <span className="text-xs text-charcoal/40 line-through">
              {formatPrice(product.originalPrice)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
