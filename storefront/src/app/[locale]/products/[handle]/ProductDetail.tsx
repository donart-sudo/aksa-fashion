"use client";

import { useState, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import {
  HeartIcon,
  ShareIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";
import { HeartIcon as HeartIconSolid } from "@heroicons/react/24/solid";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { formatPrice } from "@/lib/utils";
import { useCart } from "@/lib/cart";
import { useWishlist } from "@/lib/wishlist";
import StickyAddToCart from "@/components/product/StickyAddToCart";
import type { ScrapedProduct } from "@/lib/data/products";

interface ProductDetailProps {
  product: ScrapedProduct;
}

export default function ProductDetail({ product }: ProductDetailProps) {
  const t = useTranslations();
  const locale = useLocale();
  const { addItem } = useCart();
  const { toggleItem, isWishlisted } = useWishlist();
  const [currentImage, setCurrentImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState(
    product.colors[0] || ""
  );
  const [quantity, setQuantity] = useState(1);
  const addToCartRef = useRef<HTMLButtonElement>(null);

  // Touch swipe state
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  const wishlisted = isWishlisted(String(product.id));

  const images = product.images;
  const priceInCents = product.price * 100;
  const originalPriceInCents = product.salePrice
    ? product.regularPrice * 100
    : undefined;

  const nextImage = useCallback(() =>
    setCurrentImage((prev) => (prev + 1) % images.length), [images.length]);
  const prevImage = useCallback(() =>
    setCurrentImage((prev) => (prev - 1 + images.length) % images.length), [images.length]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };
  const handleTouchEnd = () => {
    const diff = touchStartX.current - touchEndX.current;
    if (Math.abs(diff) > 50) {
      if (diff > 0) nextImage();
      else prevImage();
    }
  };

  const handleAddToCart = () => {
    addItem({
      productId: String(product.id),
      variantId: `${product.id}-${selectedSize || "default"}`,
      title: product.name,
      thumbnail: images[0],
      price: priceInCents,
      quantity,
      size: selectedSize || undefined,
      color: selectedColor || undefined,
    });
  };

  const handleToggleWishlist = () => {
    toggleItem({
      id: String(product.id),
      title: product.name,
      handle: product.slug,
      price: priceInCents,
      originalPrice: originalPriceInCents,
      thumbnail: images[0],
      hoverImage: images[1],
    });
  };

  const categoryName = product.categories[0] || "Collection";
  const categorySlug = categoryName.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-12">
      {/* Breadcrumbs */}
      <nav className="text-xs text-charcoal/40 mb-6 tracking-wider uppercase">
        <Link href={`/${locale}`} className="hover:text-charcoal transition-colors">
          {t("common.home")}
        </Link>
        <span className="mx-2">/</span>
        {product.categories[0] && (
          <>
            <Link
              href={`/${locale}/collections/${categorySlug}`}
              className="hover:text-charcoal transition-colors"
            >
              {categoryName}
            </Link>
            <span className="mx-2">/</span>
          </>
        )}
        <span className="text-charcoal">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-12">
        {/* Gallery */}
        <div className="space-y-3">
          <div
            className="relative aspect-[3/4] overflow-hidden bg-soft-gray/30"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <Image
              key={currentImage}
              src={images[currentImage]}
              alt={product.name}
              fill
              className="object-cover"
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
            />

            {/* Sale badge */}
            {product.salePrice && (
              <div className="absolute top-4 left-4 z-10">
                <Badge variant="sale">
                  −{Math.round((1 - product.price / product.regularPrice) * 100)}%
                </Badge>
              </div>
            )}

            {/* Out of stock overlay */}
            {!product.inStock && (
              <div className="absolute inset-0 bg-charcoal/20 flex items-center justify-center z-10">
                <span className="bg-white/90 backdrop-blur-sm px-6 py-2 text-sm font-medium tracking-wider uppercase text-charcoal">
                  {t("common.soldOut")}
                </span>
              </div>
            )}

            {/* Gallery nav */}
            {images.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-3 top-1/2 -translate-y-1/2 p-2 bg-white/80 backdrop-blur-sm hover:bg-white transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center z-20 hidden sm:flex"
                  aria-label="Previous image"
                >
                  <ChevronLeftIcon className="w-5 h-5" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-white/80 backdrop-blur-sm hover:bg-white transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center z-20 hidden sm:flex"
                  aria-label="Next image"
                >
                  <ChevronRightIcon className="w-5 h-5" />
                </button>
              </>
            )}

            {/* Image dots */}
            {images.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
                {images.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentImage(i)}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      i === currentImage ? "bg-gold" : "bg-white/60"
                    }`}
                    aria-label={`View image ${i + 1}`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="hidden sm:grid grid-cols-4 gap-2">
              {images.map((src, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentImage(i)}
                  className={`relative aspect-square overflow-hidden border-2 transition-colors ${
                    i === currentImage
                      ? "border-gold"
                      : "border-transparent hover:border-soft-gray"
                  }`}
                >
                  <Image
                    src={src}
                    alt={`${product.name} - ${i + 1}`}
                    fill
                    className="object-cover"
                    sizes="100px"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product info */}
        <div className="lg:sticky lg:top-24 lg:self-start">
          <h1 className="font-serif text-2xl lg:text-3xl text-charcoal mb-2">
            {product.name}
          </h1>

          <div className="flex items-center gap-3 mb-4">
            <span className="text-xl font-medium text-charcoal">
              {formatPrice(priceInCents)}
            </span>
            {originalPriceInCents && (
              <span className="text-base text-charcoal/40 line-through">
                {formatPrice(originalPriceInCents)}
              </span>
            )}
          </div>

          <p className="text-sm text-charcoal/60 leading-relaxed mb-6">
            {product.description}
          </p>

          {/* Color */}
          {product.colors.length > 0 && (
            <div className="mb-5">
              <p className="text-sm font-medium text-charcoal mb-2">
                {t("common.color")}: <span className="text-charcoal/50">{selectedColor}</span>
              </p>
              <div className="flex flex-wrap gap-2">
                {product.colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`px-4 py-2 text-xs font-medium tracking-wider border transition-all min-h-[40px] ${
                      selectedColor === color
                        ? "border-gold bg-gold/5 text-charcoal"
                        : "border-soft-gray text-charcoal/60 hover:border-charcoal/30"
                    }`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Size */}
          <div className="mb-5">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-charcoal">
                {t("common.size")}: <span className="text-charcoal/50">{selectedSize || t("product.select")}</span>
              </p>
              <button className="text-xs text-gold hover:text-gold-dark underline">
                {t("common.sizeGuide")}
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {product.sizes.map((size) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`min-w-[44px] min-h-[44px] px-4 py-2 border text-sm font-medium transition-all ${
                    selectedSize === size
                      ? "border-gold bg-gold text-white"
                      : "border-soft-gray text-charcoal hover:border-charcoal/40"
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Quantity */}
          <div className="mb-6">
            <p className="text-sm font-medium text-charcoal mb-2">
              {t("common.quantity")}
            </p>
            <div className="flex items-center border border-soft-gray w-fit">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="px-4 py-3 text-charcoal/60 hover:text-charcoal min-w-[44px] min-h-[44px]"
              >
                −
              </button>
              <span className="px-4 py-3 text-sm font-medium min-w-[44px] text-center">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="px-4 py-3 text-charcoal/60 hover:text-charcoal min-w-[44px] min-h-[44px]"
              >
                +
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 mb-4">
            <Button
              ref={addToCartRef}
              variant="primary"
              size="lg"
              className="flex-1"
              onClick={handleAddToCart}
              disabled={!product.inStock}
            >
              {product.inStock ? t("common.addToCart") : t("common.soldOut")}
            </Button>
            <button
              onClick={handleToggleWishlist}
              className="p-4 border border-soft-gray hover:border-gold transition-colors min-w-[52px] min-h-[52px] flex items-center justify-center"
              aria-label={wishlisted ? t("common.removeFromWishlist") : t("common.addToWishlist")}
            >
              {wishlisted ? (
                <HeartIconSolid className="w-5 h-5 text-red-500" />
              ) : (
                <HeartIcon className="w-5 h-5" />
              )}
            </button>
            <button
              className="p-4 border border-soft-gray hover:border-gold transition-colors min-w-[52px] min-h-[52px] flex items-center justify-center"
              aria-label={t("common.share")}
            >
              <ShareIcon className="w-5 h-5" />
            </button>
          </div>

          {/* Details accordion */}
          <div className="mt-6 border-t border-soft-gray/50 pt-4 space-y-3">
            <details className="group" open>
              <summary className="flex items-center justify-between cursor-pointer text-sm font-medium text-charcoal py-2">
                {t("common.description")}
                <span className="text-charcoal/40 group-open:rotate-45 transition-transform">+</span>
              </summary>
              <p className="text-sm text-charcoal/60 leading-relaxed pb-4">
                {product.description}
              </p>
            </details>
            <details className="group border-t border-soft-gray/30">
              <summary className="flex items-center justify-between cursor-pointer text-sm font-medium text-charcoal py-2">
                {t("common.details")}
                <span className="text-charcoal/40 group-open:rotate-45 transition-transform">+</span>
              </summary>
              <ul className="text-sm text-charcoal/60 leading-relaxed pb-4 space-y-1">
                <li>{t("product.availableSizes")}: {product.sizes.join(", ")}</li>
                <li>{t("product.availableColors")}: {product.colors.join(", ")}</li>
                {product.categories[0] && <li>{t("product.category")}: {product.categories[0]}</li>}
                <li>{t("product.customization")}</li>
                <li>{t("product.handcrafted")}</li>
              </ul>
            </details>
            <details className="group border-t border-soft-gray/30">
              <summary className="flex items-center justify-between cursor-pointer text-sm font-medium text-charcoal py-2">
                {t("product.shippingReturns")}
                <span className="text-charcoal/40 group-open:rotate-45 transition-transform">+</span>
              </summary>
              <ul className="text-sm text-charcoal/60 leading-relaxed pb-4 space-y-1">
                <li>{t("product.madeToOrder")}</li>
                <li>{t("product.worldwideShipping")}</li>
                <li>{t("product.customAlterations")}</li>
                <li>{t("product.whatsappService")}</li>
              </ul>
            </details>
          </div>
        </div>
      </div>

      {/* Sticky Add to Cart (mobile) */}
      <StickyAddToCart
        productId={String(product.id)}
        title={product.name}
        thumbnail={images[0]}
        price={priceInCents}
        inStock={product.inStock}
        targetRef={addToCartRef}
      />
    </div>
  );
}
