"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Image from "next/image";
import ProductImage from "@/components/ui/ProductImage";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import {
  HeartIcon,
  ShareIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { HeartIcon as HeartIconSolid } from "@heroicons/react/24/solid";
import { formatPrice } from "@/lib/utils";
import { useCart } from "@/lib/cart";
import { useWishlist } from "@/lib/wishlist";
import StickyAddToCart from "@/components/product/StickyAddToCart";
import type { ScrapedProduct } from "@/lib/data/products";

/* ── Accordion sub-component ── */
function AccordionSection({
  title,
  isOpen,
  onToggle,
  children,
}: {
  title: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="border-t border-charcoal/[0.06]">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between py-4 sm:py-5 text-[13px] sm:text-sm font-medium text-charcoal/80 hover:text-charcoal transition-colors"
      >
        {title}
        <motion.span
          animate={{ rotate: isOpen ? 45 : 0 }}
          transition={{ duration: 0.2 }}
          className="text-charcoal/25 text-base sm:text-lg leading-none"
        >
          +
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="pb-5 sm:pb-6">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── Main component ── */
export default function ProductDetail({ product }: { product: ScrapedProduct }) {
  const t = useTranslations();
  const locale = useLocale();
  const { addItem } = useCart();
  const { toggleItem, isWishlisted } = useWishlist();

  // Image state
  const [currentImage, setCurrentImage] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [zoomingImage, setZoomingImage] = useState<number | null>(null);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });

  // Product state
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState(product.colors[0] || "");
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);
  const [sizeError, setSizeError] = useState(false);
  const [copied, setCopied] = useState(false);
  const [openAccordion, setOpenAccordion] = useState("description");
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);

  // Desktop gallery — active image tracking
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const imageRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Refs
  const addToCartRef = useRef<HTMLButtonElement>(null);
  const sizeRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  const mobileGalleryRef = useRef<HTMLDivElement>(null);

  // Swipe hint state
  const [showSwipeHint, setShowSwipeHint] = useState(false);

  // Derived
  const wishlisted = isWishlisted(String(product.id));
  const images = product.images;
  const priceInCents = product.price * 100;
  const originalPriceInCents = product.salePrice
    ? product.regularPrice * 100
    : undefined;
  const discountPercent = product.salePrice
    ? Math.round((1 - product.price / product.regularPrice) * 100)
    : 0;
  const categoryName = product.categories[0] || "Collection";
  const categorySlug = categoryName.toLowerCase().replace(/\s+/g, "-");

  // Navigation
  const nextImage = useCallback(
    () => setCurrentImage((p) => (p + 1) % images.length),
    [images.length]
  );
  const prevImage = useCallback(
    () => setCurrentImage((p) => (p - 1 + images.length) % images.length),
    [images.length]
  );

  // Touch swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };
  const handleTouchEnd = () => {
    const diff = touchStartX.current - touchEndX.current;
    if (Math.abs(diff) > 50) {
      diff > 0 ? nextImage() : prevImage();
    }
  };

  // Mobile gallery scroll-snap tracking
  const handleGalleryScroll = useCallback(() => {
    const el = mobileGalleryRef.current;
    if (!el) return;
    const index = Math.round(el.scrollLeft / el.clientWidth);
    if (index >= 0 && index < images.length) setCurrentImage(index);
  }, [images.length]);

  // Desktop zoom
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setZoomPos({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    });
  };

  // Lightbox keyboard + body scroll lock
  useEffect(() => {
    if (!lightboxOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightboxOpen(false);
      if (e.key === "ArrowRight") nextImage();
      if (e.key === "ArrowLeft") prevImage();
    };
    window.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [lightboxOpen, nextImage, prevImage]);

  // Desktop gallery — IntersectionObserver to track active image
  useEffect(() => {
    const observers: IntersectionObserver[] = [];
    imageRefs.current.forEach((el, index) => {
      if (!el) return;
      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setActiveImageIndex(index);
        },
        { threshold: 0.6 }
      );
      obs.observe(el);
      observers.push(obs);
    });
    return () => observers.forEach((obs) => obs.disconnect());
  }, [images.length]);

  const scrollToImage = useCallback((index: number) => {
    imageRefs.current[index]?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, []);

  // Size guide modal — ESC + body scroll lock
  useEffect(() => {
    if (!sizeGuideOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSizeGuideOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [sizeGuideOpen]);

  // Swipe hint on first visit
  useEffect(() => {
    if (images.length <= 1) return;
    try {
      if (localStorage.getItem("aksa_gallery_hint")) return;
    } catch { return; }
    setShowSwipeHint(true);
    const timer = setTimeout(() => {
      setShowSwipeHint(false);
      try { localStorage.setItem("aksa_gallery_hint", "1"); } catch { /* ignore */ }
    }, 3000);
    return () => clearTimeout(timer);
  }, [images.length]);

  // Add to cart with validation
  const handleAddToCart = () => {
    if (product.sizes.length > 0 && !selectedSize) {
      setSizeError(true);
      sizeRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      setTimeout(() => setSizeError(false), 3000);
      return;
    }
    setSizeError(false);
    addItem({
      productId: String(product.id),
      variantId: `${product.id}-${selectedSize || "default"}`,
      handle: product.slug,
      title: product.name,
      thumbnail: images[0],
      price: priceInCents,
      quantity,
      size: selectedSize || undefined,
      color: selectedColor || undefined,
    });
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2500);
  };

  // Wishlist
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

  // Share
  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: product.name, url });
      } catch {
        /* user cancelled */
      }
    } else {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const toggleAccordion = (id: string) =>
    setOpenAccordion(openAccordion === id ? "" : id);

  return (
    <div>
      {/* ═══════ Lightbox ═══════ */}
      <AnimatePresence>
        {lightboxOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center"
            onClick={() => setLightboxOpen(false)}
          >
            <button
              className="absolute top-4 right-4 sm:top-6 sm:right-6 z-[101] w-11 h-11 flex items-center justify-center text-white/50 hover:text-white transition-colors"
              onClick={() => setLightboxOpen(false)}
            >
              <XMarkIcon className="w-6 h-6" />
            </button>

            <div className="absolute top-4 left-4 sm:top-6 sm:left-6 text-white/30 text-xs sm:text-sm tracking-wider">
              {currentImage + 1} / {images.length}
            </div>

            <div
              className="relative w-full h-full max-w-4xl max-h-[85vh] mx-4 sm:mx-8"
              onClick={(e) => e.stopPropagation()}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentImage}
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.97 }}
                  transition={{ duration: 0.2 }}
                  className="relative w-full h-full"
                >
                  <ProductImage
                    src={images[currentImage]}
                    alt={`${product.name} - ${currentImage + 1}`}
                    fallbackLabel={product.name}
                    fill
                    className="object-contain"
                    sizes="90vw"
                    priority
                  />
                </motion.div>
              </AnimatePresence>
            </div>

            {images.length > 1 && (
              <>
                <button
                  onClick={(e) => { e.stopPropagation(); prevImage(); }}
                  className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 w-11 h-11 flex items-center justify-center text-white/30 hover:text-white transition-colors"
                >
                  <ChevronLeftIcon className="w-6 h-6" />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); nextImage(); }}
                  className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 w-11 h-11 flex items-center justify-center text-white/30 hover:text-white transition-colors"
                >
                  <ChevronRightIcon className="w-6 h-6" />
                </button>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══════ Size Guide Modal ═══════ */}
      <AnimatePresence>
        {sizeGuideOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4"
            onClick={() => setSizeGuideOpen(false)}
          >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.97 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="relative bg-white w-full max-w-lg max-h-[85vh] overflow-y-auto shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close button */}
              <button
                onClick={() => setSizeGuideOpen(false)}
                className="absolute top-4 right-4 z-10 w-10 h-10 min-w-[40px] min-h-[40px] flex items-center justify-center text-charcoal/30 hover:text-charcoal transition-colors cursor-pointer"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>

              {/* Header */}
              <div className="px-6 sm:px-8 pt-8 sm:pt-10 pb-6">
                <div className="flex items-center gap-3 mb-3">
                  <span className="block h-[1.5px] w-8 bg-gold" />
                  <span className="text-[10px] tracking-[0.3em] uppercase text-gold font-medium">
                    {t("common.sizeGuide")}
                  </span>
                </div>
                <h3 className="font-serif text-2xl sm:text-[1.75rem] text-charcoal leading-tight mb-3">
                  {t("common.sizeGuideSubtitle")}
                </h3>
                <p className="text-[12px] sm:text-[13px] text-charcoal/40 leading-relaxed">
                  {t("common.sizeGuideDescription")}
                </p>
              </div>

              {/* Size chart table */}
              <div className="px-6 sm:px-8 pb-6">
                <div className="overflow-x-auto -mx-1">
                  <table className="w-full text-[12px] sm:text-[13px]">
                    <thead>
                      <tr className="border-b-2 border-charcoal/[0.06]">
                        <th className="text-left py-3 pr-4 text-[10px] sm:text-[11px] font-semibold tracking-[0.15em] uppercase text-charcoal/50">
                          {t("common.size")}
                        </th>
                        <th className="text-center py-3 px-3 text-[10px] sm:text-[11px] font-semibold tracking-[0.15em] uppercase text-charcoal/50">
                          {t("common.sizeGuideBust")}
                        </th>
                        <th className="text-center py-3 px-3 text-[10px] sm:text-[11px] font-semibold tracking-[0.15em] uppercase text-charcoal/50">
                          {t("common.sizeGuideWaist")}
                        </th>
                        <th className="text-center py-3 px-3 text-[10px] sm:text-[11px] font-semibold tracking-[0.15em] uppercase text-charcoal/50">
                          {t("common.sizeGuideHips")}
                        </th>
                        <th className="text-center py-3 pl-3 text-[10px] sm:text-[11px] font-semibold tracking-[0.15em] uppercase text-charcoal/50">
                          {t("common.sizeGuideLength")}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { size: "XS", bust: "80–84", waist: "60–64", hips: "86–90", length: "140" },
                        { size: "S", bust: "84–88", waist: "64–68", hips: "90–94", length: "142" },
                        { size: "M", bust: "88–92", waist: "68–72", hips: "94–98", length: "144" },
                        { size: "L", bust: "92–96", waist: "72–76", hips: "98–102", length: "146" },
                        { size: "XL", bust: "96–100", waist: "76–80", hips: "102–106", length: "148" },
                        { size: "XXL", bust: "100–104", waist: "80–84", hips: "106–110", length: "150" },
                      ].map((row) => {
                        const isAvailable = product.sizes.some(
                          (s) => s.toUpperCase() === row.size
                        );
                        const isSelected =
                          selectedSize.toUpperCase() === row.size;

                        return (
                          <tr
                            key={row.size}
                            className={`border-b border-charcoal/[0.04] transition-colors ${
                              isSelected
                                ? "bg-gold/[0.06]"
                                : isAvailable
                                  ? "hover:bg-cream/60"
                                  : "opacity-35"
                            }`}
                          >
                            <td className="py-3 pr-4">
                              <span
                                className={`font-medium ${
                                  isSelected
                                    ? "text-gold"
                                    : "text-charcoal/70"
                                }`}
                              >
                                {row.size}
                              </span>
                              {isSelected && (
                                <span className="ml-2 inline-block w-1.5 h-1.5 bg-gold rounded-full" />
                              )}
                            </td>
                            <td className="text-center py-3 px-3 text-charcoal/50 tabular-nums">
                              {row.bust}
                            </td>
                            <td className="text-center py-3 px-3 text-charcoal/50 tabular-nums">
                              {row.waist}
                            </td>
                            <td className="text-center py-3 px-3 text-charcoal/50 tabular-nums">
                              {row.hips}
                            </td>
                            <td className="text-center py-3 pl-3 text-charcoal/50 tabular-nums">
                              {row.length}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Unit note */}
                <p className="text-[10px] text-charcoal/25 tracking-wider uppercase mt-3">
                  cm
                </p>
              </div>

              {/* How to measure illustration */}
              <div className="mx-6 sm:mx-8 border-t border-charcoal/[0.06] py-6">
                <div className="flex gap-5 sm:gap-8">
                  {[
                    {
                      label: t("common.sizeGuideBust"),
                      icon: (
                        <svg className="w-8 h-8 text-gold/50" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth={1.2}>
                          <ellipse cx="16" cy="12" rx="8" ry="6" />
                          <path d="M8 12v10c0 2 3.5 4 8 4s8-2 8-4V12" />
                          <path d="M10 12h12" strokeDasharray="2 2" />
                        </svg>
                      ),
                    },
                    {
                      label: t("common.sizeGuideWaist"),
                      icon: (
                        <svg className="w-8 h-8 text-gold/50" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth={1.2}>
                          <path d="M8 6c0 0 2 10 2 16s-2 4-2 4" />
                          <path d="M24 6c0 0-2 10-2 16s2 4 2 4" />
                          <path d="M10 16h12" strokeDasharray="2 2" />
                        </svg>
                      ),
                    },
                    {
                      label: t("common.sizeGuideHips"),
                      icon: (
                        <svg className="w-8 h-8 text-gold/50" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth={1.2}>
                          <path d="M10 6v4c0 4-2 6-2 10s4 6 8 6 8-2 8-6-2-6-2-10V6" />
                          <path d="M8 20h16" strokeDasharray="2 2" />
                        </svg>
                      ),
                    },
                  ].map((item) => (
                    <div key={item.label} className="flex flex-col items-center gap-2 flex-1">
                      {item.icon}
                      <span className="text-[10px] tracking-[0.15em] uppercase text-charcoal/35 font-medium">
                        {item.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Custom sizing note */}
              <div className="mx-6 sm:mx-8 border-t border-charcoal/[0.06] py-6">
                <p className="text-[12px] sm:text-[13px] text-charcoal/40 leading-relaxed italic">
                  {t("common.sizeGuideNote")}
                </p>
              </div>

              {/* WhatsApp CTA */}
              <div className="px-6 sm:px-8 pb-8 sm:pb-10">
                <div className="bg-cream p-5 sm:p-6">
                  <p className="text-[13px] sm:text-sm font-medium text-charcoal/70 mb-1.5">
                    {t("common.sizeGuideNeedHelp")}
                  </p>
                  <p className="text-[11px] sm:text-[12px] text-charcoal/35 leading-relaxed">
                    {t("common.sizeGuideContact")}
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══════ Page Content ═══════ */}
      <div className="max-w-7xl mx-auto px-0 lg:px-6 xl:px-8">
        {/* Desktop breadcrumbs */}
        <nav className="hidden lg:flex items-center text-[11px] text-charcoal/35 tracking-[0.15em] uppercase py-5">
          <Link href={`/${locale}`} className="hover:text-charcoal transition-colors">
            {t("common.home")}
          </Link>
          <span className="mx-2.5 text-charcoal/15">/</span>
          {product.categories[0] && (
            <>
              <Link
                href={`/${locale}/collections/${categorySlug}`}
                className="hover:text-charcoal transition-colors"
              >
                {categoryName}
              </Link>
              <span className="mx-2.5 text-charcoal/15">/</span>
            </>
          )}
          <span className="text-charcoal/60">{product.name}</span>
        </nav>

        {/* ── Two-column layout ── */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] xl:grid-cols-[1fr_440px] gap-0 lg:gap-10 xl:gap-14">
          {/* ═══ Left: Images ═══ */}
          <div>
            {/* Mobile scroll-snap gallery */}
            <div className="lg:hidden relative aspect-[3/4] overflow-hidden bg-[#f5f3f0]">
              <div
                ref={mobileGalleryRef}
                className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide w-full h-full"
                onScroll={handleGalleryScroll}
              >
                {images.map((src, i) => (
                  <div
                    key={i}
                    className="flex-shrink-0 w-full h-full snap-start relative"
                    onClick={() => { setCurrentImage(i); setLightboxOpen(true); }}
                  >
                    <ProductImage
                      src={src}
                      alt={`${product.name} - ${i + 1}`}
                      fallbackLabel={product.name}
                      fill
                      className="object-cover"
                      priority={i === 0}
                      sizes="100vw"
                    />
                  </div>
                ))}
              </div>

              {product.salePrice && (
                <div className="absolute top-3 left-3 sm:top-4 sm:left-4 z-10 pointer-events-none">
                  <span className="bg-red-500 text-white text-[10px] sm:text-[11px] font-medium tracking-wider uppercase px-2.5 py-1">
                    −{discountPercent}%
                  </span>
                </div>
              )}

              {!product.inStock && (
                <div className="absolute inset-0 bg-charcoal/20 flex items-center justify-center z-10 pointer-events-none">
                  <span className="bg-white/90 backdrop-blur-sm px-6 py-2.5 text-xs sm:text-sm font-medium tracking-[0.2em] uppercase text-charcoal">
                    {t("common.soldOut")}
                  </span>
                </div>
              )}

              {images.length > 1 && (
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1.5 pointer-events-none">
                  {images.map((_, i) => (
                    <span
                      key={i}
                      className={`rounded-full transition-all duration-300 ${
                        i === currentImage ? "w-5 h-[5px] bg-white" : "w-[5px] h-[5px] bg-white/40"
                      }`}
                    />
                  ))}
                </div>
              )}

              {/* Swipe hint */}
              <AnimatePresence>
                {showSwipeHint && images.length > 1 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none"
                  >
                    <div className="flex items-center gap-2 bg-black/40 backdrop-blur-sm px-4 py-2.5 rounded-full">
                      <svg className="w-5 h-5 text-white/80" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
                      </svg>
                      <span className="text-[11px] text-white/80 tracking-[0.15em] uppercase font-medium">Swipe</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Mobile progress bar */}
            {images.length > 1 && (
              <div className="lg:hidden h-[2px] bg-charcoal/[0.06] mx-4 mt-3">
                <motion.div
                  className="h-full bg-gold"
                  animate={{ width: `${((currentImage + 1) / images.length) * 100}%` }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                />
              </div>
            )}

            {/* Mobile breadcrumbs */}
            <nav className="lg:hidden flex items-center text-[10px] sm:text-[11px] text-charcoal/35 tracking-[0.12em] uppercase px-4 sm:px-5 pt-4 pb-1">
              <Link href={`/${locale}`} className="hover:text-charcoal transition-colors">
                {t("common.home")}
              </Link>
              <span className="mx-1.5 text-charcoal/15">/</span>
              {product.categories[0] && (
                <>
                  <Link
                    href={`/${locale}/collections/${categorySlug}`}
                    className="hover:text-charcoal transition-colors"
                  >
                    {categoryName}
                  </Link>
                  <span className="mx-1.5 text-charcoal/15">/</span>
                </>
              )}
              <span className="text-charcoal/50 truncate">{product.name}</span>
            </nav>

            {/* Desktop: vertical scroll with thumbnails inside gallery */}
            <div className="hidden lg:block relative">
              {/* Thumbnails floating inside the gallery */}
              {images.length > 1 && (
                <div className="absolute left-4 top-4 bottom-0 z-20 pointer-events-none">
                  <div className="sticky top-24 flex flex-col gap-2 pointer-events-auto">
                    {images.map((src, i) => (
                      <button
                        key={i}
                        onClick={() => scrollToImage(i)}
                        className={`relative w-[52px] h-[68px] overflow-hidden border-2 transition-all duration-300 shadow-md ${
                          activeImageIndex === i
                            ? "border-gold opacity-100 scale-105"
                            : "border-white/60 opacity-60 hover:opacity-90 hover:border-white"
                        }`}
                      >
                        <ProductImage
                          src={src}
                          alt={`Thumbnail ${i + 1}`}
                          fallbackLabel={product.name}
                          fill
                          className="object-cover"
                          sizes="52px"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Main stacked images */}
              <div className="flex flex-col gap-1">
                {images.map((src, i) => (
                  <div
                    key={i}
                    ref={(el) => { imageRefs.current[i] = el; }}
                    className="relative overflow-hidden bg-[#f5f3f0] cursor-pointer aspect-[3/4]"
                    onClick={() => {
                      setCurrentImage(i);
                      setLightboxOpen(true);
                    }}
                  >
                    <ProductImage
                      src={src}
                      alt={`${product.name} - ${i + 1}`}
                      fallbackLabel={product.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 1024px) 100vw, 55vw"
                      priority={i < 2}
                    />

                    {i === 0 && product.salePrice && (
                      <div className="absolute top-4 right-4 z-10 pointer-events-none">
                        <span className="bg-red-500 text-white text-[11px] font-medium tracking-wider uppercase px-3 py-1">
                          −{discountPercent}%
                        </span>
                      </div>
                    )}

                    {i === 0 && !product.inStock && (
                      <div className="absolute inset-0 bg-charcoal/20 flex items-center justify-center z-10 pointer-events-none">
                        <span className="bg-white/90 backdrop-blur-sm px-8 py-3 text-sm font-medium tracking-[0.2em] uppercase text-charcoal">
                          {t("common.soldOut")}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ═══ Right: Product Info ═══ */}
          <div className="px-4 sm:px-5 lg:px-0 pt-5 sm:pt-6 lg:pt-0 lg:sticky lg:top-20 lg:self-start pb-8 lg:pb-16">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            >
              {/* Category */}
              {product.categories[0] && (
                <Link
                  href={`/${locale}/collections/${categorySlug}`}
                  className="inline-block text-[10px] sm:text-[11px] tracking-[0.25em] uppercase text-gold/50 hover:text-gold transition-colors mb-2 sm:mb-3"
                >
                  {categoryName}
                </Link>
              )}

              {/* Title */}
              <h1 className="font-serif text-[1.5rem] sm:text-[1.75rem] md:text-3xl lg:text-[1.85rem] xl:text-[2rem] text-charcoal leading-tight mb-3 sm:mb-4">
                {product.name}
              </h1>

              {/* Price */}
              <div className="flex items-baseline gap-2.5 sm:gap-3 mb-4 sm:mb-5">
                <span
                  className={`text-lg sm:text-xl font-medium ${
                    product.salePrice ? "text-red-600" : "text-charcoal"
                  }`}
                >
                  {formatPrice(priceInCents)}
                </span>
                {originalPriceInCents && (
                  <>
                    <span className="text-sm text-charcoal/25 line-through">
                      {formatPrice(originalPriceInCents)}
                    </span>
                    <span className="text-[10px] font-medium tracking-wider uppercase text-red-500 bg-red-50 px-2 py-0.5">
                      Save {discountPercent}%
                    </span>
                  </>
                )}
              </div>

              {/* Description — hidden on mobile (shown in accordion below) */}
              <p className="hidden lg:block text-[13px] sm:text-sm text-charcoal/45 leading-relaxed mb-6 sm:mb-7 max-w-md">
                {product.description}
              </p>

              <div className="h-px bg-charcoal/[0.06] mb-5 sm:mb-6" />

              {/* Color selector */}
              {product.colors.length > 0 && (
                <div className="mb-5 sm:mb-6">
                  <p className="text-[11px] sm:text-xs font-medium text-charcoal/35 tracking-[0.15em] uppercase mb-2.5 sm:mb-3">
                    {t("common.color")}{" "}
                    <span className="text-charcoal/60">— {selectedColor}</span>
                  </p>
                  <div className="flex flex-wrap gap-1.5 sm:gap-2">
                    {product.colors.map((color) => (
                      <button
                        key={color}
                        onClick={() => setSelectedColor(color)}
                        className={`px-3.5 sm:px-4 py-2 sm:py-2.5 text-[11px] sm:text-xs tracking-wider transition-all duration-300 min-h-[40px] sm:min-h-[40px] ${
                          selectedColor === color
                            ? "bg-charcoal text-white"
                            : "border border-charcoal/[0.08] text-charcoal/50 hover:border-charcoal/25 hover:text-charcoal"
                        }`}
                      >
                        {color}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Size selector */}
              <div ref={sizeRef} className="mb-5 sm:mb-6">
                <div className="flex items-center justify-between mb-2.5 sm:mb-3">
                  <p className={`text-[11px] sm:text-xs font-medium tracking-[0.15em] uppercase transition-colors duration-300 ${
                    sizeError ? "text-red-500" : "text-charcoal/35"
                  }`}>
                    {t("common.size")}{" "}
                    {selectedSize ? (
                      <span className="text-charcoal/60">— {selectedSize}</span>
                    ) : sizeError ? (
                      <span className="normal-case tracking-normal">— {t("product.selectSize")}</span>
                    ) : null}
                  </p>
                  <button
                    onClick={() => setSizeGuideOpen(true)}
                    className="text-[11px] sm:text-xs text-charcoal/35 hover:text-gold underline underline-offset-2 transition-colors cursor-pointer"
                  >
                    {t("common.sizeGuide")}
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => { setSelectedSize(size); setSizeError(false); }}
                      className={`min-w-[44px] min-h-[44px] px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium transition-all duration-300 ${
                        selectedSize === size
                          ? "bg-charcoal text-white"
                          : sizeError
                            ? "border border-red-300 text-charcoal/70 hover:border-red-400"
                            : "border border-charcoal/[0.08] text-charcoal/70 hover:border-charcoal/30"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quantity */}
              <div className="mb-6 sm:mb-7">
                <p className="text-[11px] sm:text-xs font-medium text-charcoal/35 tracking-[0.15em] uppercase mb-2.5 sm:mb-3">
                  {t("common.quantity")}
                </p>
                <div className="inline-flex items-center border border-charcoal/[0.08]">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-11 h-11 sm:w-12 sm:h-12 flex items-center justify-center text-charcoal/30 hover:text-charcoal transition-colors text-lg"
                    aria-label="Decrease quantity"
                  >
                    −
                  </button>
                  <span className="w-10 sm:w-12 text-center text-sm font-medium text-charcoal tabular-nums">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-11 h-11 sm:w-12 sm:h-12 flex items-center justify-center text-charcoal/30 hover:text-charcoal transition-colors text-lg"
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Add to Cart + Wishlist + Share */}
              <div className="flex gap-2 sm:gap-2.5 mb-5 sm:mb-6">
                <motion.button
                  ref={addToCartRef}
                  onClick={handleAddToCart}
                  disabled={!product.inStock}
                  whileTap={product.inStock ? { scale: 0.98 } : undefined}
                  className={`flex-1 min-h-[48px] sm:min-h-[52px] flex items-center justify-center gap-2 text-[11px] sm:text-xs tracking-[0.2em] uppercase font-medium transition-all duration-500 ${
                    addedToCart
                      ? "bg-gold text-white"
                      : product.inStock
                        ? "bg-charcoal text-white hover:bg-charcoal/85"
                        : "bg-charcoal/20 text-charcoal/40 cursor-not-allowed"
                  }`}
                >
                  <AnimatePresence mode="wait">
                    {addedToCart ? (
                      <motion.span
                        key="added"
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        className="flex items-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                        </svg>
                        {t("product.addedToCart")}
                      </motion.span>
                    ) : (
                      <motion.span
                        key="add"
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                      >
                        {product.inStock ? t("common.addToCart") : t("common.soldOut")}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.button>

                <button
                  onClick={handleToggleWishlist}
                  className={`w-[48px] sm:w-[52px] h-[48px] sm:h-[52px] flex items-center justify-center border transition-all duration-300 ${
                    wishlisted
                      ? "border-red-200 bg-red-50"
                      : "border-charcoal/[0.08] hover:border-charcoal/20"
                  }`}
                  aria-label={
                    wishlisted
                      ? t("common.removeFromWishlist")
                      : t("common.addToWishlist")
                  }
                >
                  {wishlisted ? (
                    <HeartIconSolid className="w-5 h-5 text-red-500" />
                  ) : (
                    <HeartIcon className="w-5 h-5 text-charcoal/30" />
                  )}
                </button>

                <div className="relative">
                  <button
                    onClick={handleShare}
                    className="w-[48px] sm:w-[52px] h-[48px] sm:h-[52px] flex items-center justify-center border border-charcoal/[0.08] hover:border-charcoal/20 transition-all duration-300"
                    aria-label={t("common.share")}
                  >
                    <ShareIcon className="w-5 h-5 text-charcoal/30" />
                  </button>
                  <AnimatePresence>
                    {copied && (
                      <motion.span
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 4 }}
                        className="absolute -top-8 left-1/2 -translate-x-1/2 text-[10px] bg-charcoal text-white px-2.5 py-1 whitespace-nowrap"
                      >
                        Copied!
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Trust signals */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-0 sm:divide-x sm:divide-charcoal/[0.06] py-5 sm:py-6 border-t border-charcoal/[0.06]">
                <div className="flex items-center gap-2.5 sm:pr-4 lg:pr-3 xl:pr-4">
                  <svg className="w-[18px] h-[18px] text-gold/40 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
                  </svg>
                  <span className="text-[11px] sm:text-[10px] text-charcoal/40">Handcrafted</span>
                </div>
                <div className="flex items-center gap-2.5 sm:px-4 lg:px-3 xl:px-4">
                  <svg className="w-[18px] h-[18px] text-gold/40 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
                  </svg>
                  <span className="text-[11px] sm:text-[10px] text-charcoal/40">Worldwide Shipping</span>
                </div>
                <div className="flex items-center gap-2.5 sm:pl-4 lg:pl-3 xl:pl-4">
                  <svg className="w-[18px] h-[18px] text-gold/40 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
                  </svg>
                  <span className="text-[11px] sm:text-[10px] text-charcoal/40">WhatsApp Support</span>
                </div>
              </div>

              {/* Accordion sections */}
              <AccordionSection
                title={t("common.description")}
                isOpen={openAccordion === "description"}
                onToggle={() => toggleAccordion("description")}
              >
                <p className="text-[13px] sm:text-sm text-charcoal/45 leading-relaxed">
                  {product.description}
                </p>
              </AccordionSection>

              <AccordionSection
                title={t("common.details")}
                isOpen={openAccordion === "details"}
                onToggle={() => toggleAccordion("details")}
              >
                <ul className="text-[13px] sm:text-sm text-charcoal/45 leading-relaxed space-y-1.5">
                  <li>
                    {t("product.availableSizes")}: {product.sizes.join(", ")}
                  </li>
                  <li>
                    {t("product.availableColors")}: {product.colors.join(", ")}
                  </li>
                  {product.categories[0] && (
                    <li>
                      {t("product.category")}: {product.categories[0]}
                    </li>
                  )}
                  <li>{t("product.customization")}</li>
                  <li>{t("product.handcrafted")}</li>
                </ul>
              </AccordionSection>

              <AccordionSection
                title={t("product.shippingInfo")}
                isOpen={openAccordion === "shipping"}
                onToggle={() => toggleAccordion("shipping")}
              >
                <ul className="text-[13px] sm:text-sm text-charcoal/45 leading-relaxed space-y-1.5">
                  <li>{t("product.madeToOrder")}</li>
                  <li>{t("product.worldwideShipping")}</li>
                  <li>{t("product.customAlterations")}</li>
                  <li>{t("product.whatsappService")}</li>
                </ul>
              </AccordionSection>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Mobile sticky CTA */}
      <StickyAddToCart
        productId={String(product.id)}
        handle={product.slug}
        title={product.name}
        thumbnail={images[0]}
        price={priceInCents}
        inStock={product.inStock}
        targetRef={addToCartRef}
      />
    </div>
  );
}
