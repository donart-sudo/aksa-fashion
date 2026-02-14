"use client";

import { useEffect, useState, useRef } from "react";
import { useTranslations } from "next-intl";
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
      ([entry]) => {
        setVisible(!entry.isIntersecting);
      },
      { threshold: 0 }
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [targetRef]);

  if (!visible || !inStock) return null;

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
    <div className="fixed bottom-16 left-0 right-0 z-40 md:hidden bg-white border-t border-soft-gray/50 px-4 py-3 safe-area-pb">
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-charcoal flex-shrink-0">
          {formatPrice(price)}
        </span>
        <button
          onClick={handleAdd}
          className="flex-1 bg-gold text-white text-sm font-medium tracking-wider uppercase py-3 hover:bg-gold-dark transition-colors min-h-[44px]"
        >
          {t("addToCart")}
        </button>
      </div>
    </div>
  );
}
