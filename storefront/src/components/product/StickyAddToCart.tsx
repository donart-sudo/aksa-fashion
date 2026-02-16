"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "@/lib/cart";
import { formatPrice } from "@/lib/utils";

interface StickyAddToCartProps {
  productId: string;
  title: string;
  thumbnail: string;
  price: number;
  inStock: boolean;
  targetRef: React.RefObject<HTMLElement | null>;
}

export default function StickyAddToCart({
  productId,
  title,
  thumbnail,
  price,
  inStock,
  targetRef,
}: StickyAddToCartProps) {
  const t = useTranslations("common");
  const { addItem } = useCart();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const target = targetRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      ([entry]) => setVisible(!entry.isIntersecting),
      { threshold: 0 }
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [targetRef]);

  if (!inStock) return null;

  const handleAdd = () => {
    addItem({
      productId,
      variantId: productId,
      title,
      thumbnail,
      price,
      quantity: 1,
    });
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          exit={{ y: 100 }}
          transition={{ type: "spring", damping: 28, stiffness: 320 }}
          className="fixed bottom-16 left-0 right-0 z-40 md:hidden bg-white/95 backdrop-blur-md border-t border-charcoal/[0.06] px-3 sm:px-4 py-2.5 sm:py-3 safe-area-pb"
        >
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-10 h-10 sm:w-11 sm:h-11 relative flex-shrink-0 bg-[#f5f3f0] overflow-hidden">
              <Image
                src={thumbnail}
                alt={title}
                fill
                className="object-cover"
                sizes="44px"
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] sm:text-xs font-medium text-charcoal truncate">
                {title}
              </p>
              <p className="text-[13px] sm:text-sm font-medium text-charcoal">
                {formatPrice(price)}
              </p>
            </div>
            <button
              onClick={handleAdd}
              className="bg-charcoal text-white px-4 sm:px-5 py-2.5 sm:py-3 text-[10px] sm:text-[11px] tracking-[0.18em] uppercase font-medium hover:bg-gold transition-colors min-h-[40px] sm:min-h-[44px] flex-shrink-0"
            >
              {t("addToCart")}
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
