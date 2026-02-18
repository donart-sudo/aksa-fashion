"use client";

import { useState, useCallback } from "react";
import Image, { type ImageProps } from "next/image";

/**
 * ProductImage — wraps Next.js Image with broken-image detection.
 * When an image fails to load (404, timeout, CDN down), it shows
 * a styled placeholder with the product initials instead of a
 * broken-image icon.
 */

interface ProductImageProps extends Omit<ImageProps, "onError"> {
  /** Product or alt name — used to generate initials on the placeholder */
  fallbackLabel?: string;
}

export default function ProductImage({
  fallbackLabel,
  alt,
  className,
  ...props
}: ProductImageProps) {
  const [failed, setFailed] = useState(false);

  const handleError = useCallback(() => {
    setFailed(true);
  }, []);

  if (failed) {
    // Extract up to 2 initials from the label
    const label = fallbackLabel || alt || "";
    const initials = label
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase() ?? "")
      .join("");

    return (
      <div
        className="absolute inset-0 flex flex-col items-center justify-center bg-[#f0eeeb]"
        role="img"
        aria-label={alt}
      >
        {/* Decorative diamond */}
        <div className="w-8 h-8 border border-gold/20 rotate-45 mb-4" />
        {initials && (
          <span className="font-serif text-2xl text-charcoal/20 tracking-widest">
            {initials}
          </span>
        )}
        <span className="text-[9px] tracking-[0.25em] uppercase text-charcoal/15 mt-2">
          Image unavailable
        </span>
      </div>
    );
  }

  return (
    <Image
      alt={alt}
      className={className}
      onError={handleError}
      {...props}
    />
  );
}
