"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { formatPrice } from "@/lib/utils";

const SLIDE_DURATION = 6000;

const HERO_SLIDES = [
  {
    image: "https://ariart.shop/wp-content/uploads/2026/01/Royal-Lilac-Aura-scaled.jpg",
    name: "Royal Lilac Aura",
    alt: "Royal Lilac Aura luxury ball gown by Aksa Fashion",
    handle: "royal-lilac-aura",
    price: 115000,
    origin: "center center",
  },
  {
    image: "https://ariart.shop/wp-content/uploads/2026/01/Crystal-Bloom-1-scaled.jpg",
    name: "Crystal Bloom",
    alt: "Crystal Bloom handcrafted bridal gown with beaded bodice",
    handle: "crystal-bloom",
    price: 125000,
    origin: "70% 30%",
  },
  {
    image: "https://ariart.shop/wp-content/uploads/2026/01/Midnight-Gold-scaled.jpg",
    name: "Midnight Gold",
    alt: "Midnight Gold evening dress with gold embroidery details",
    handle: "midnight-gold",
    price: 96000,
    origin: "30% 60%",
  },
  {
    image: "https://ariart.shop/wp-content/uploads/2026/01/Solar-Elegance-scaled.jpg",
    name: "Solar Elegance",
    alt: "Solar Elegance silhouette gown in warm golden fabric",
    handle: "solar-elegance",
    price: 88000,
    origin: "60% 20%",
  },
];

export default function EditorialBanner() {
  const t = useTranslations("home");
  const locale = useLocale();

  const [current, setCurrent] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const touchStartX = useRef(0);
  const intervalRef = useRef<ReturnType<typeof setInterval>>(undefined);

  useEffect(() => {
    const timer = setTimeout(() => setLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const resetTimer = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setCurrent((prev) => (prev + 1) % HERO_SLIDES.length);
    }, SLIDE_DURATION);
  }, []);

  useEffect(() => {
    resetTimer();
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [resetTimer]);

  const goToSlide = useCallback(
    (i: number) => {
      setCurrent(i);
      resetTimer();
    },
    [resetTimer]
  );

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 60) {
      goToSlide(
        diff > 0
          ? (current + 1) % HERO_SLIDES.length
          : (current - 1 + HERO_SLIDES.length) % HERO_SLIDES.length
      );
    }
  };

  const slide = HERO_SLIDES[current];

  return (
    <section
      className="relative h-[calc(100svh-3.5rem)] lg:h-[calc(100svh-6.75rem)] overflow-hidden"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* ═══ Full-bleed image slideshow ═══ */}
      <div
        className="absolute inset-0 transition-all duration-[1500ms] ease-[cubic-bezier(0.16,1,0.3,1)]"
        style={{
          clipPath: loaded ? "inset(0)" : "inset(2%)",
          transform: loaded ? "scale(1)" : "scale(1.03)",
        }}
      >
        {HERO_SLIDES.map((s, i) => (
          <div
            key={i}
            className={`absolute inset-0 transition-opacity duration-[1200ms] ease-in-out ${
              i === current ? "opacity-100 z-10" : "opacity-0 z-0"
            }`}
          >
            <div
              className="absolute inset-0"
              style={{
                transformOrigin: s.origin,
                animation: "hero-zoom 14s ease-in-out infinite alternate",
                animationDelay: `${-i * 3.5}s`,
              }}
            >
              <Image
                src={s.image}
                alt={s.alt}
                fill
                className="object-cover object-top"
                priority={i === 0}
                sizes="100vw"
              />
            </div>
          </div>
        ))}
      </div>

      {/* ═══ Cinematic gradient overlay ═══ */}
      <div className="absolute inset-0 z-20 pointer-events-none bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

      {/* ═══ Text overlay — bottom-left ═══ */}
      <div className="absolute inset-0 z-30 flex items-end">
        <div className="w-full px-6 sm:px-10 lg:px-16 xl:px-20 pb-20 sm:pb-24 lg:pb-28">
          <div className="flex items-end justify-between gap-8">
            {/* Left: branding + CTA */}
            <div className="max-w-3xl">
              {/* Heading */}
              <h1
                className="font-serif text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-white leading-[1.08] mb-5 transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)]"
                style={{
                  opacity: loaded ? 1 : 0,
                  transform: loaded ? "none" : "translateY(40px)",
                  transitionDelay: "400ms",
                }}
              >
                {t("heroTitle")}
              </h1>

              {/* Subtitle */}
              <p
                className="text-white/60 text-sm sm:text-base leading-relaxed max-w-md mb-8 transition-all duration-800 ease-out"
                style={{
                  opacity: loaded ? 1 : 0,
                  transform: loaded ? "none" : "translateY(20px)",
                  transitionDelay: "650ms",
                }}
              >
                {t("heroSubtitle")}
              </p>

              {/* Primary CTA */}
              <div
                className="transition-all duration-800 ease-out"
                style={{
                  opacity: loaded ? 1 : 0,
                  transform: loaded ? "none" : "translateY(20px)",
                  transitionDelay: "850ms",
                }}
              >
                <Link
                  href={`/${locale}/collections`}
                  className="inline-flex items-center justify-center px-9 py-4 bg-white text-charcoal text-[13px] font-semibold tracking-wide hover:bg-gold hover:text-white transition-all duration-300"
                >
                  {t("heroCta")}
                </Link>
              </div>

              {/* Dot indicators */}
              <div
                className="flex items-center gap-2.5 mt-10 transition-all duration-700 ease-out"
                style={{
                  opacity: loaded ? 1 : 0,
                  transitionDelay: "1100ms",
                }}
              >
                {HERO_SLIDES.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => goToSlide(i)}
                    className={`transition-all duration-300 rounded-full ${
                      i === current
                        ? "w-8 h-2 bg-white"
                        : "w-2 h-2 bg-white/40 hover:bg-white/70"
                    }`}
                    aria-label={`Slide ${i + 1}`}
                  />
                ))}
              </div>
            </div>

            {/* Right: "Shop this look" product link — desktop only */}
            <div
              className="hidden lg:block flex-shrink-0 text-right transition-all duration-700 ease-out"
              style={{
                opacity: loaded ? 1 : 0,
                transform: loaded ? "none" : "translateY(16px)",
                transitionDelay: "1000ms",
              }}
            >
              <Link
                href={`/${locale}/products/${slide.handle}`}
                className="group inline-flex flex-col items-end gap-2"
              >
                <span className="text-[10px] tracking-[0.3em] uppercase text-white/40 group-hover:text-white/60 transition-colors">
                  {t("heroShopLook")}
                </span>
                <span className="text-[15px] text-white/70 group-hover:text-white transition-colors font-medium">
                  {slide.name}
                </span>
                <span className="text-[13px] text-gold/70 group-hover:text-gold transition-colors">
                  {formatPrice(slide.price)}
                </span>
                <span className="h-[1px] w-8 bg-white/20 group-hover:w-12 group-hover:bg-gold transition-all duration-300 mt-1" />
              </Link>
            </div>
          </div>

          {/* Mobile: product link below dots */}
          <div
            className="lg:hidden mt-6 transition-all duration-700 ease-out"
            style={{
              opacity: loaded ? 1 : 0,
              transitionDelay: "1200ms",
            }}
          >
            <Link
              href={`/${locale}/products/${slide.handle}`}
              className="group inline-flex items-center gap-3"
            >
              <span className="text-[12px] text-white/50 group-hover:text-white transition-colors">
                {slide.name} &middot; {formatPrice(slide.price)}
              </span>
              <span className="text-[12px] text-gold/50 group-hover:text-gold group-hover:translate-x-1 transition-all duration-300">
                &rarr;
              </span>
            </Link>
          </div>
        </div>
      </div>

      {/* ═══ Scroll hint arrow ═══ */}
      <div
        className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 hidden sm:flex flex-col items-center gap-1.5 animate-bounce"
        style={{
          opacity: loaded ? 0.5 : 0,
          transition: "opacity 1000ms ease-out 1500ms",
        }}
      >
        <span className="text-[9px] tracking-[0.3em] uppercase text-white/50">Scroll</span>
        <svg className="w-4 h-4 text-white/50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 13.5L12 21m0 0l-7.5-7.5M12 21V3" />
        </svg>
      </div>
    </section>
  );
}
