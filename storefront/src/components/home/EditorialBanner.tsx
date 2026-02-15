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
    handle: "royal-lilac-aura",
    price: 115000,
    origin: "center center",
  },
  {
    image: "https://ariart.shop/wp-content/uploads/2026/01/Crystal-Bloom-1-scaled.jpg",
    name: "Crystal Bloom",
    handle: "crystal-bloom",
    price: 125000,
    origin: "70% 30%",
  },
  {
    image: "https://ariart.shop/wp-content/uploads/2026/01/Midnight-Gold-scaled.jpg",
    name: "Midnight Gold",
    handle: "midnight-gold",
    price: 96000,
    origin: "30% 60%",
  },
  {
    image: "https://ariart.shop/wp-content/uploads/2026/01/Solar-Elegance-scaled.jpg",
    name: "Solar Elegance",
    handle: "solar-elegance",
    price: 88000,
    origin: "60% 20%",
  },
];

export default function EditorialBanner() {
  const t = useTranslations("home");
  const tc = useTranslations("common");
  const locale = useLocale();

  const [current, setCurrent] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const touchStartX = useRef(0);
  const intervalRef = useRef<ReturnType<typeof setInterval>>(undefined);

  // Cinematic entrance
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
    <section className="flex flex-col lg:flex-row h-[calc(100svh-3.5rem)] lg:h-[calc(100svh-6.75rem)]">
      {/* ═══ LEFT: Content on dark bg ═══ */}
      <div className="order-2 lg:order-1 relative lg:flex-[40] flex items-center bg-charcoal overflow-hidden">
        {/* Decorative radial glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "radial-gradient(ellipse at 30% 50%, rgba(184,146,106,0.06) 0%, transparent 60%)",
          }}
        />

        {/* Gold accent line — vertical left edge */}
        <div className="hidden lg:block absolute left-0 top-[15%] bottom-[15%] w-[2px] bg-gradient-to-b from-transparent via-gold/30 to-transparent" />

        {/* Content */}
        <div className="relative z-10 px-8 py-14 sm:px-12 lg:px-14 xl:px-20 w-full">
          {/* Slide counter */}
          <div
            className="flex items-center gap-3 mb-10 transition-all duration-700 ease-out"
            style={{
              opacity: loaded ? 1 : 0,
              transform: loaded ? "none" : "translateY(15px)",
              transitionDelay: "300ms",
            }}
          >
            <span className="text-[11px] font-medium tracking-[0.3em] text-gold/70 tabular-nums">
              {String(current + 1).padStart(2, "0")}
            </span>
            <span className="h-[1px] w-6 bg-white/15" />
            <span className="text-[11px] tracking-[0.3em] text-white/20 tabular-nums">
              {String(HERO_SLIDES.length).padStart(2, "0")}
            </span>
          </div>

          {/* Heading */}
          <div className="overflow-hidden mb-5">
            <h1
              className="font-black text-[1.85rem] sm:text-[2.25rem] lg:text-[2.75rem] xl:text-[3.25rem] text-white leading-[1.08] max-w-md uppercase tracking-tight transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)]"
              style={{
                opacity: loaded ? 1 : 0,
                transform: loaded ? "none" : "translateY(100%)",
                transitionDelay: "500ms",
              }}
            >
              {t("heroTitle")}
            </h1>
          </div>

          {/* Subtitle */}
          <p
            className="text-white/40 text-[13px] lg:text-sm leading-relaxed max-w-xs mb-10 transition-all duration-800 ease-out"
            style={{
              opacity: loaded ? 1 : 0,
              transform: loaded ? "none" : "translateY(20px)",
              transitionDelay: "700ms",
            }}
          >
            {t("heroSubtitle")}
          </p>

          {/* CTAs */}
          <div
            className="flex items-center gap-5 transition-all duration-800 ease-out"
            style={{
              opacity: loaded ? 1 : 0,
              transform: loaded ? "none" : "translateY(20px)",
              transitionDelay: "900ms",
            }}
          >
            <Link
              href={`/${locale}/collections`}
              className="inline-flex items-center justify-center px-8 py-3.5 bg-white text-charcoal text-[13px] font-semibold tracking-wide hover:bg-gold hover:text-white transition-all duration-300"
            >
              {t("heroCta")}
            </Link>
            <Link
              href={`/${locale}/collections/bridal`}
              className="text-[13px] tracking-wide text-white/40 hover:text-white border-b border-white/15 hover:border-white/50 pb-0.5 transition-all duration-300"
            >
              {t("bridalCta")}
            </Link>
          </div>

          {/* Bottom: product thumbnails + progress */}
          <div
            className="mt-12 lg:mt-16 transition-all duration-800 ease-out"
            style={{
              opacity: loaded ? 1 : 0,
              transform: loaded ? "none" : "translateY(20px)",
              transitionDelay: "1100ms",
            }}
          >
            {/* Thumbnail strip */}
            <div className="flex items-center gap-2 mb-6">
              {HERO_SLIDES.map((s, i) => (
                <button
                  key={i}
                  onClick={() => goToSlide(i)}
                  className={`relative w-12 h-16 overflow-hidden transition-all duration-300 ${
                    i === current
                      ? "ring-1 ring-gold/60 opacity-100"
                      : "opacity-30 hover:opacity-60"
                  }`}
                >
                  <Image
                    src={s.image}
                    alt={s.name}
                    fill
                    className="object-cover object-top"
                    sizes="48px"
                  />
                </button>
              ))}
            </div>

            {/* Current product link */}
            <Link
              href={`/${locale}/products/${slide.handle}`}
              className="group inline-flex items-center gap-3"
            >
              <span className="text-[13px] text-white/60 group-hover:text-white transition-colors underline underline-offset-4 decoration-white/20 group-hover:decoration-gold">
                {slide.name} · {formatPrice(slide.price)}
              </span>
              <span className="text-[13px] text-gold/60 group-hover:text-gold group-hover:translate-x-1 transition-all duration-300">
                →
              </span>
            </Link>
          </div>
        </div>
      </div>

      {/* ═══ RIGHT: Image slideshow ═══ */}
      <div
        className="order-1 lg:order-2 relative flex-1 lg:flex-[60] overflow-hidden bg-charcoal transition-all duration-[1500ms] ease-[cubic-bezier(0.16,1,0.3,1)]"
        style={{
          clipPath: loaded ? "inset(0)" : "inset(3%)",
          transform: loaded ? "scale(1)" : "scale(1.05)",
        }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {HERO_SLIDES.map((s, i) => (
          <div
            key={i}
            className={`absolute inset-0 transition-opacity duration-[1200ms] ease-in-out ${
              i === current ? "opacity-100 z-10" : "opacity-0 z-0"
            }`}
          >
            <div
              className="absolute inset-[-4%] w-[108%] h-[108%]"
              style={{
                transformOrigin: s.origin,
                animation: "hero-zoom 14s ease-in-out infinite alternate",
                animationDelay: `${-i * 3.5}s`,
              }}
            >
              <Image
                src={s.image}
                alt={s.name}
                fill
                className="object-cover object-top"
                priority={i === 0}
                sizes="(max-width: 1024px) 100vw, 60vw"
              />
            </div>
          </div>
        ))}

        {/* Subtle vignette */}
        <div
          className="absolute inset-0 z-20 pointer-events-none"
          style={{
            background: "linear-gradient(to right, rgba(45,45,45,0.3) 0%, transparent 25%), linear-gradient(to top, rgba(0,0,0,0.12) 0%, transparent 30%)",
          }}
        />

        {/* Navigation arrows */}
        <div className="absolute bottom-6 right-6 z-30 hidden lg:flex items-center gap-2">
          <button
            onClick={() =>
              goToSlide((current - 1 + HERO_SLIDES.length) % HERO_SLIDES.length)
            }
            className="w-10 h-10 flex items-center justify-center bg-white/10 backdrop-blur-sm text-white/70 hover:bg-white/20 hover:text-white transition-all"
            aria-label="Previous"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </button>
          <button
            onClick={() => goToSlide((current + 1) % HERO_SLIDES.length)}
            className="w-10 h-10 flex items-center justify-center bg-white/10 backdrop-blur-sm text-white/70 hover:bg-white/20 hover:text-white transition-all"
            aria-label="Next"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
}
