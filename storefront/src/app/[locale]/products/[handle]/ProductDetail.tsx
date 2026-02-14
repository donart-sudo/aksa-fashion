"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import { motion } from "framer-motion";
import {
  HeartIcon,
  ShareIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";
import {
  HeartIcon as HeartIconSolid,
  StarIcon,
} from "@heroicons/react/24/solid";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { formatPrice } from "@/lib/utils";
import { useCart } from "@/lib/cart";
import type { ScrapedProduct } from "@/lib/data/products";

interface ProductDetailProps {
  product: ScrapedProduct;
}

export default function ProductDetail({ product }: ProductDetailProps) {
  const t = useTranslations();
  const locale = useLocale();
  const { addItem, openCart } = useCart();
  const [currentImage, setCurrentImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState(
    product.colors[0] || ""
  );
  const [wishlisted, setWishlisted] = useState(false);
  const [quantity, setQuantity] = useState(1);

  const images = product.images;
  const priceInCents = product.price * 100;
  const originalPriceInCents = product.salePrice
    ? product.regularPrice * 100
    : undefined;

  const nextImage = () =>
    setCurrentImage((prev) => (prev + 1) % images.length);
  const prevImage = () =>
    setCurrentImage((prev) => (prev - 1 + images.length) % images.length);

  const handleAddToCart = () => {
    addItem({
      productId: String(product.id),
      variantId: `${product.id}-${selectedSize || "default"}`,
      title: product.name,
      thumbnail: images[0],
      price: priceInCents,
      quantity,
    });
    openCart();
  };

  const categoryName =
    product.categories[0] || "Collection";
  const categorySlug = categoryName
    .toLowerCase()
    .replace(/\s+/g, "-");

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-16">
      {/* Breadcrumbs */}
      <nav className="text-xs text-charcoal/40 mb-8 tracking-wider uppercase">
        <Link
          href={`/${locale}`}
          className="hover:text-charcoal transition-colors"
        >
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
        {/* Gallery */}
        <div className="space-y-4">
          <div className="relative aspect-[3/4] overflow-hidden bg-soft-gray/30">
            <motion.div
              key={currentImage}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0"
            >
              <Image
                src={images[currentImage]}
                alt={product.name}
                fill
                className="object-cover"
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </motion.div>

            {/* Sale badge */}
            {product.salePrice && (
              <div className="absolute top-4 left-4 z-10">
                <Badge variant="sale">
                  −
                  {Math.round(
                    (1 - product.price / product.regularPrice) * 100
                  )}
                  %
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
                  className="absolute left-3 top-1/2 -translate-y-1/2 p-2 bg-white/80 backdrop-blur-sm hover:bg-white transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center z-20"
                  aria-label="Previous image"
                >
                  <ChevronLeftIcon className="w-5 h-5" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-white/80 backdrop-blur-sm hover:bg-white transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center z-20"
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
        <div className="lg:sticky lg:top-32 lg:self-start">
          {/* Reviews */}
          <div className="flex items-center gap-2 mb-3">
            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <StarIcon key={star} className="w-4 h-4 text-gold" />
              ))}
            </div>
            <span className="text-xs text-charcoal/50">
              (24 {t("common.reviews")})
            </span>
          </div>

          <h1 className="font-serif text-3xl lg:text-4xl text-charcoal mb-2">
            {product.name}
          </h1>

          <div className="flex items-center gap-3 mb-6">
            <span className="text-2xl font-medium text-charcoal">
              {formatPrice(priceInCents)}
            </span>
            {originalPriceInCents && (
              <span className="text-lg text-charcoal/40 line-through">
                {formatPrice(originalPriceInCents)}
              </span>
            )}
          </div>

          <p className="text-charcoal/60 leading-relaxed mb-8">
            {product.description}
          </p>

          {/* Color */}
          {product.colors.length > 0 && (
            <div className="mb-6">
              <p className="text-sm font-medium text-charcoal mb-3">
                {t("common.color")}:{" "}
                <span className="text-charcoal/60">{selectedColor}</span>
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
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium text-charcoal">
                {t("common.size")}:{" "}
                <span className="text-charcoal/60">
                  {selectedSize || "Select"}
                </span>
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
          <div className="mb-8">
            <p className="text-sm font-medium text-charcoal mb-3">
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
          <div className="flex gap-3 mb-6">
            <Button
              variant="primary"
              size="lg"
              className="flex-1"
              onClick={handleAddToCart}
              disabled={!product.inStock}
            >
              {product.inStock ? t("common.addToCart") : t("common.soldOut")}
            </Button>
            <button
              onClick={() => setWishlisted(!wishlisted)}
              className="p-4 border border-soft-gray hover:border-gold transition-colors min-w-[52px] min-h-[52px] flex items-center justify-center"
              aria-label={
                wishlisted
                  ? t("common.removeFromWishlist")
                  : t("common.addToWishlist")
              }
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

          {product.inStock && (
            <Button variant="secondary" size="lg" className="w-full">
              {t("common.buyNow")}
            </Button>
          )}

          {/* Details accordion */}
          <div className="mt-8 border-t border-soft-gray/50 pt-6 space-y-4">
            <details className="group" open>
              <summary className="flex items-center justify-between cursor-pointer text-sm font-medium text-charcoal py-2">
                {t("common.description")}
                <span className="text-charcoal/40 group-open:rotate-45 transition-transform">
                  +
                </span>
              </summary>
              <p className="text-sm text-charcoal/60 leading-relaxed pb-4">
                {product.description}
              </p>
            </details>
            <details className="group border-t border-soft-gray/30">
              <summary className="flex items-center justify-between cursor-pointer text-sm font-medium text-charcoal py-2">
                {t("common.details")}
                <span className="text-charcoal/40 group-open:rotate-45 transition-transform">
                  +
                </span>
              </summary>
              <ul className="text-sm text-charcoal/60 leading-relaxed pb-4 space-y-1">
                <li>
                  Available sizes: {product.sizes.join(", ")}
                </li>
                <li>
                  Colors: {product.colors.join(", ")}
                </li>
                {product.categories[0] && (
                  <li>Category: {product.categories[0]}</li>
                )}
                {product.collection && (
                  <li>Collection: {product.collection}</li>
                )}
                <li>Customization available upon request</li>
                <li>Handcrafted in Prishtina, Kosovo</li>
              </ul>
            </details>
            <details className="group border-t border-soft-gray/30">
              <summary className="flex items-center justify-between cursor-pointer text-sm font-medium text-charcoal py-2">
                Shipping & Returns
                <span className="text-charcoal/40 group-open:rotate-45 transition-transform">
                  +
                </span>
              </summary>
              <ul className="text-sm text-charcoal/60 leading-relaxed pb-4 space-y-1">
                <li>Made-to-order: 2-5 business days production</li>
                <li>Worldwide shipping available</li>
                <li>Custom alterations available</li>
                <li>Contact us via WhatsApp for tailored service</li>
              </ul>
            </details>
          </div>
        </div>
      </div>
    </div>
  );
}
