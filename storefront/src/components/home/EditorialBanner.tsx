"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { formatPrice } from "@/lib/utils";

/*
 * ASYMMETRIC SPLIT HERO — "The Editorial"
 *
 * Desktop: Text panel (38%) on cream bg + Floating image panel (62%)
 * Mobile:  Image top (55vh) → Text below on cream
 *
 * Inspired by: Galia Lahav, Celine, The Row
 * Creative elements: Ghost slide numbers, animated line CTA,
 * vertical brand text, Ken Burns zoom, gold accent details
 */

const SLIDE_DURATION = 7000;

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

  useEffect(() => {
    requestAnimationFrame(() => setLoaded(true));
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
    <section className="flex flex-col lg:flex-row lg:h-[88vh] lg:min-h-[600px]">
      {/* ══════════ IMAGE PANEL ══════════ */}
      {/* On mobile: first (top). On desktop: second (right side, 62%) */}
      <div
        className="order-1 lg:order-2 relative h-[55vh] min-h-[360px] lg:h-auto lg:flex-[62] overflow-hidden bg-charcoal"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Stacked images — crossfade + Ken Burns */}
        {HERO_SLIDES.map((s, i) => (
          <div
            key={i}
            className={`absolute inset-0 transition-opacity duration-[1400ms] ease-in-out ${
              i === current ? "opacity-100 z-10" : "opacity-0 z-0"
            }`}
          >
            <div
              className="absolute inset-[-5%] w-[110%] h-[110%]"
              style={{
                transformOrigin: s.origin,
                animation: "hero-zoom 16s ease-in-out infinite alternate",
                animationDelay: `${-i * 4}s`,
              }}
            >
              <Image
                src={s.image}
                alt={s.name}
                fill
                className="object-cover"
                priority={i === 0}
                sizes="(max-width: 1024px) 100vw, 62vw"
              />
            </div>
          </div>
        ))}

        {/* Subtle vignette */}
        <div
          className="absolute inset-0 z-20 pointer-events-none"
          style={{
            background:
              "linear-gradient(to top, rgba(0,0,0,0.25) 0%, transparent 40%), radial-gradient(ellipse at center, transparent 60%, rgba(0,0,0,0.2) 100%)",
          }}
        />

        {/* Image overlay info — desktop only */}
        <div className="absolute bottom-0 left-0 right-0 z-30 hidden lg:flex items-end justify-between px-8 pb-8">
          <Link
            href={`/${locale}/products/${slide.handle}`}
            className="group flex items-center gap-3"
          >
            <span className="text-xs tracking-wider text-white/60 group-hover:text-white/90 transition-colors">
              {slide.name}
            </span>
            <span className="text-white/25">·</span>
            <span className="text-xs tracking-wider text-white/60 group-hover:text-white/90 transition-colors">
              {formatPrice(slide.price)}
            </span>
            <span className="text-xs text-gold/70 tracking-wider font-medium group-hover:text-gold transition-colors">
              {tc("shopNow")} →
            </span>
          </Link>

          <span className="text-xs tracking-wider tabular-nums text-white/35">
            {String(current + 1).padStart(2, "0")}
            <span className="mx-1.5 text-white/20">/</span>
            {String(HERO_SLIDES.length).padStart(2, "0")}
          </span>
        </div>
      </div>

      {/* ══════════ TEXT PANEL ══════════ */}
      {/* On mobile: second (below image). On desktop: first (left side, 38%) */}
      <div className="order-2 lg:order-1 relative lg:flex-[38] flex flex-col justify-between px-6 py-10 sm:px-10 lg:px-0 lg:py-0 bg-cream">
        {/* Vertical brand text — desktop only */}
        <div className="hidden lg:flex items-center justify-center w-12 absolute left-0 top-0 bottom-0 border-r border-soft-gray/30">
          <span
            className="text-[9px] tracking-[0.6em] text-charcoal/8 uppercase whitespace-nowrap select-none"
            style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
          >
            Aksa Fashion
          </span>
        </div>

        {/* Main content area */}
        <div className="lg:pl-20 xl:pl-24 lg:pr-12 xl:pr-16 lg:flex lg:flex-col lg:justify-center lg:h-full">
          {/* Top content */}
          <div>
            {/* Large ghost slide number */}
            <span
              className={`block font-serif text-[4rem] sm:text-[5rem] lg:text-[7rem] xl:text-[8rem] leading-none text-charcoal/[0.04] select-none tabular-nums transition-all duration-700 ${
                loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              }`}
              style={{ transitionDelay: "200ms" }}
            >
              {String(current + 1).padStart(2, "0")}
            </span>

            {/* Gold accent line */}
            <div
              className={`h-[2px] bg-gold mb-8 -mt-4 lg:-mt-6 transition-all duration-1000 ease-out ${
                loaded ? "w-10" : "w-0"
              }`}
              style={{ transitionDelay: "500ms" }}
            />

            {/* Heading */}
            <h1
              className={`font-serif text-[1.75rem] sm:text-[2rem] lg:text-[2.5rem] xl:text-[2.85rem] text-charcoal leading-[1.15] mb-5 lg:mb-6 max-w-md transition-all duration-700 ${
                loaded
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-5"
              }`}
              style={{ transitionDelay: "700ms" }}
            >
              {t("heroTitle")}
            </h1>

            {/* Subtitle */}
            <p
              className={`text-charcoal/65 text-sm leading-relaxed max-w-sm mb-8 lg:mb-10 transition-all duration-700 ${
                loaded
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-4"
              }`}
              style={{ transitionDelay: "900ms" }}
            >
              {t("heroSubtitle")}
            </p>

            {/* CTAs — editorial style with animated line */}
            <div
              className={`flex items-center gap-8 transition-all duration-700 ${
                loaded
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-4"
              }`}
              style={{ transitionDelay: "1100ms" }}
            >
              <Link
                href={`/${locale}/collections`}
                className="group inline-flex items-center gap-4"
              >
                <span className="text-xs font-medium tracking-[0.2em] uppercase text-charcoal group-hover:text-gold transition-colors duration-300">
                  {t("heroCta")}
                </span>
                <span className="block h-px bg-charcoal/40 w-8 group-hover:w-14 group-hover:bg-gold transition-all duration-500" />
              </Link>

              <Link
                href={`/${locale}/collections/bridal`}
                className="hidden sm:inline-block text-xs tracking-[0.2em] uppercase text-charcoal/60 hover:text-gold border-b border-charcoal/20 pb-0.5 hover:border-gold font-medium transition-all duration-300"
              >
                {t("bridalCta")}
              </Link>
            </div>
          </div>

          {/* Bottom bar — progress + product info */}
          <div
            className={`flex items-center justify-between mt-10 lg:mt-auto lg:pt-8 lg:pb-10 transition-all duration-700 ${
              loaded ? "opacity-100" : "opacity-0"
            }`}
            style={{ transitionDelay: "1300ms" }}
          >
            {/* Progress indicators */}
            <div className="flex items-center gap-2">
              {HERO_SLIDES.map((_, i) => (
                <button
                  key={i}
                  onClick={() => goToSlide(i)}
                  className={`relative h-[2px] overflow-hidden transition-all duration-300 ${
                    i === current
                      ? "w-10 bg-charcoal/25"
                      : "w-5 bg-charcoal/12 hover:bg-charcoal/25"
                  }`}
                  aria-label={`Slide ${i + 1}`}
                >
                  {i === current && (
                    <div
                      key={`p-${current}`}
                      className="absolute inset-0 bg-gold origin-left"
                      style={{
                        animation: `hero-progress ${SLIDE_DURATION}ms linear forwards`,
                      }}
                    />
                  )}
                </button>
              ))}
            </div>

            {/* Current slide product name — mobile + tablet */}
            <Link
              href={`/${locale}/products/${slide.handle}`}
              className="lg:hidden text-xs tracking-wider text-charcoal/50 hover:text-gold transition-colors"
            >
              {slide.name} · {formatPrice(slide.price)}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
