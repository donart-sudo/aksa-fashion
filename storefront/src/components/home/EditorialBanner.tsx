"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { isRtl } from "@/i18n/config";

const MEDUSA_URL = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000";

const SLIDE_DURATION = 6000;

const HERO_SLIDES = [
  {
    image: `${MEDUSA_URL}/static/1771434665009-Snow-1-scaled.jpg`,
    alt: "Snow luxury bridal gown with flowing silhouette",
    ctaLink: "collections",
    key: "slide0",
  },
  {
    image: `${MEDUSA_URL}/static/1771434665196-Pure-Essence-1-scaled.jpg`,
    alt: "Pure Essence bridal gown with sparkling beadwork",
    ctaLink: "collections/bridal",
    key: "slide1",
  },
  {
    image: `${MEDUSA_URL}/static/1771434665133-Imperial-Flame-scaled.jpg`,
    alt: "Imperial Flame evening gown with elegant drama",
    ctaLink: "collections/evening-dress",
    key: "slide2",
  },
  {
    image: `${MEDUSA_URL}/static/1771434665088-Lumi-scaled.jpg`,
    alt: "Lumi gown with cascading drama and flowing cape",
    ctaLink: "collections/silhouette-whisper",
    key: "slide3",
  },
];

export default function EditorialBanner() {
  const t = useTranslations("home");
  const locale = useLocale();
  const rtl = isRtl(locale as "sq" | "en" | "tr" | "ar");

  const [current, setCurrent] = useState(0);
  const [transitioning, setTransitioning] = useState(false);
  const [animKey, setAnimKey] = useState(0);
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 });
  const touchStartX = useRef(0);
  const intervalRef = useRef<ReturnType<typeof setInterval>>(undefined);
  const imageContainerRef = useRef<HTMLDivElement>(null);

  const resetTimer = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setCurrent((p) => (p + 1) % HERO_SLIDES.length);
      setAnimKey((k) => k + 1);
      setTransitioning(true);
      setTimeout(() => setTransitioning(false), 1200);
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
      if (i === current || transitioning) return;
      setCurrent(i);
      setAnimKey((k) => k + 1);
      setTransitioning(true);
      resetTimer();
      setTimeout(() => setTransitioning(false), 1200);
    },
    [current, transitioning, resetTimer]
  );

  const goNext = useCallback(() => {
    goToSlide((current + 1) % HERO_SLIDES.length);
  }, [current, goToSlide]);

  const goPrev = useCallback(() => {
    goToSlide((current - 1 + HERO_SLIDES.length) % HERO_SLIDES.length);
  }, [current, goToSlide]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 60) {
      diff > 0 ? goNext() : goPrev();
    }
  };

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!imageContainerRef.current) return;
    const rect = imageContainerRef.current.getBoundingClientRect();
    setMousePos({
      x: (e.clientX - rect.left) / rect.width,
      y: (e.clientY - rect.top) / rect.height,
    });
  }, []);

  const slide = HERO_SLIDES[current];
  const parallaxX = (mousePos.x - 0.5) * -12;
  const parallaxY = (mousePos.y - 0.5) * -8;

  // Clip-path: wipe from left (or right for RTL)
  const clipFrom = rtl ? "inset(0 0 0 100%)" : "inset(0 100% 0 0)";
  const clipTo = "inset(0)";

  return (
    <section className="relative h-[100svh] min-h-[600px] overflow-hidden flex flex-col-reverse lg:flex-row">
      {/* ═══ Left: Text panel ═══ */}
      <div className="relative flex-shrink-0 w-full lg:w-[45%] bg-[#1a1a1a] flex items-center">
        {/* Decorative radial glow */}
        <div
          className="absolute inset-0 pointer-events-none opacity-30"
          style={{
            background: "radial-gradient(ellipse at 30% 60%, rgba(184,146,106,0.15) 0%, transparent 70%)",
          }}
        />

        <div className="relative z-10 w-full px-8 sm:px-12 lg:px-16 xl:px-20 py-10 lg:py-0">
          {/* Gold accent line */}
          <div
            key={`accent-${animKey}`}
            className="w-[2px] h-16 bg-gold mb-8 animate-accent-grow"
            style={{
              animationDelay: "50ms",
              boxShadow: "0 0 12px rgba(184,146,106,0.3)",
            }}
          />

          {/* Subtitle tag */}
          <p
            key={`sub-${animKey}`}
            className="text-gold text-[11px] sm:text-[12px] tracking-[0.3em] uppercase font-medium mb-5 animate-hero-fade-up"
          >
            {t(`${slide.key}Subtitle`)}
          </p>

          {/* Heading — two-line split reveal */}
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-white leading-[1.1] mb-5">
            <span className="block overflow-hidden">
              <span
                key={`h1a-${animKey}`}
                className="block animate-hero-line-up"
                style={{ animationDelay: "100ms" }}
              >
                {t(`${slide.key}Title1`)}
              </span>
            </span>
            <span className="block overflow-hidden">
              <span
                key={`h1b-${animKey}`}
                className="block animate-hero-line-up"
                style={{ animationDelay: "220ms" }}
              >
                {t(`${slide.key}Title2`)}
              </span>
            </span>
          </h1>

          {/* Description */}
          <p
            key={`desc-${animKey}`}
            className="text-white/50 text-sm sm:text-base leading-relaxed max-w-md mb-8 animate-hero-fade-up"
            style={{ animationDelay: "350ms" }}
          >
            {t(`${slide.key}Desc`)}
          </p>

          {/* CTA button */}
          <div
            key={`cta-${animKey}`}
            className="animate-hero-fade-up mb-10 lg:mb-12"
            style={{ animationDelay: "500ms" }}
          >
            <Link
              href={`/${locale}/${slide.ctaLink}`}
              className="inline-flex items-center gap-3 bg-gold hover:bg-gold-dark text-white text-[12px] sm:text-[13px] tracking-[0.2em] uppercase font-medium px-8 py-4 transition-colors duration-300 group"
            >
              {t(`${slide.key}Cta`)}
              <svg
                className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </Link>
          </div>

          {/* Slide indicators */}
          <div className="flex items-center gap-2.5">
            {HERO_SLIDES.map((_, i) => (
              <button
                key={i}
                onClick={() => goToSlide(i)}
                className={`relative h-[3px] overflow-hidden rounded-full transition-all duration-400 ${
                  i === current ? "w-10" : "w-5 hover:w-7"
                }`}
                aria-label={`Slide ${i + 1}`}
              >
                <span className="absolute inset-0 bg-white/20 rounded-full" />
                {i === current && (
                  <span
                    key={`prog-${animKey}`}
                    className="absolute inset-0 bg-gold rounded-full origin-left"
                    style={{
                      animation: `hero-progress ${SLIDE_DURATION}ms linear forwards`,
                    }}
                  />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ═══ Right: Image panel with clip-path transitions ═══ */}
      <div
        ref={imageContainerRef}
        className="relative flex-1 h-[55vh] lg:h-auto overflow-hidden"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onMouseMove={handleMouseMove}
      >
        {HERO_SLIDES.map((s, i) => {
          const isActive = i === current;
          return (
            <div
              key={i}
              className="absolute inset-0"
              style={{
                zIndex: isActive ? 2 : 1,
                clipPath: isActive ? clipTo : clipFrom,
                transition: isActive
                  ? "clip-path 1200ms cubic-bezier(0.77, 0, 0.175, 1)"
                  : "clip-path 0ms linear 1200ms",
              }}
            >
              <div
                className="absolute inset-[-20px]"
                style={{
                  transform: isActive
                    ? `translate(${parallaxX}px, ${parallaxY}px) scale(1.05)`
                    : "scale(1.05)",
                  transition: "transform 8s cubic-bezier(0.16, 1, 0.3, 1)",
                }}
              >
                <Image
                  src={s.image}
                  alt={s.alt}
                  fill
                  className="object-cover object-top"
                  priority={i === 0}
                  sizes="(max-width: 1024px) 100vw, 55vw"
                />
              </div>
            </div>
          );
        })}

        {/* Subtle edge vignette */}
        <div className="absolute inset-0 z-10 pointer-events-none bg-gradient-to-t from-black/20 via-transparent to-black/10 lg:bg-gradient-to-r lg:from-[#1a1a1a]/30 lg:via-transparent lg:to-transparent" />

        {/* Mobile dot indicators */}
        <div className="lg:hidden absolute bottom-5 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
          {HERO_SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => goToSlide(i)}
              className={`h-[6px] rounded-full transition-all duration-300 ${
                i === current ? "w-7 bg-white" : "w-[6px] bg-white/40"
              }`}
              aria-label={`Slide ${i + 1}`}
            />
          ))}
        </div>

        {/* ═══ Navigation arrows ═══ */}
        <div className="absolute inset-0 z-20 pointer-events-none">
          {/* Previous */}
          <button
            onClick={goPrev}
            disabled={transitioning}
            className="pointer-events-auto absolute left-4 lg:left-6 top-1/2 -translate-y-1/2 group"
            aria-label="Previous slide"
          >
            <span className="flex items-center justify-center w-12 h-12 lg:w-14 lg:h-14 rounded-full border border-white/20 hover:border-gold/60 bg-black/10 hover:bg-black/30 backdrop-blur-sm transition-all duration-500 group-hover:scale-110">
              <svg
                className="w-5 h-5 lg:w-6 lg:h-6 text-white/70 group-hover:text-gold transition-all duration-500 group-hover:-translate-x-0.5"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1}
              >
                <line
                  x1="19" y1="12" x2="5" y2="12"
                  stroke="currentColor"
                  strokeLinecap="round"
                  className="origin-right transition-all duration-500 group-hover:[stroke-dasharray:20] [stroke-dasharray:14]"
                />
                <polyline
                  points="11,5 4,12 11,19"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                />
              </svg>
            </span>
          </button>

          {/* Next */}
          <button
            onClick={goNext}
            disabled={transitioning}
            className="pointer-events-auto absolute right-4 lg:right-6 top-1/2 -translate-y-1/2 group"
            aria-label="Next slide"
          >
            <span className="flex items-center justify-center w-12 h-12 lg:w-14 lg:h-14 rounded-full border border-white/20 hover:border-gold/60 bg-black/10 hover:bg-black/30 backdrop-blur-sm transition-all duration-500 group-hover:scale-110">
              <svg
                className="w-5 h-5 lg:w-6 lg:h-6 text-white/70 group-hover:text-gold transition-all duration-500 group-hover:translate-x-0.5"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1}
              >
                <line
                  x1="5" y1="12" x2="19" y2="12"
                  stroke="currentColor"
                  strokeLinecap="round"
                  className="origin-left transition-all duration-500 group-hover:[stroke-dasharray:20] [stroke-dasharray:14]"
                />
                <polyline
                  points="13,5 20,12 13,19"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                />
              </svg>
            </span>
          </button>

          {/* Slide counter — bottom right */}
          <div className="pointer-events-none absolute bottom-6 right-6 hidden lg:flex items-baseline gap-1 text-white/40">
            <span className="text-[22px] font-light text-white/80 tabular-nums">{String(current + 1).padStart(2, "0")}</span>
            <span className="text-[13px] font-light">/</span>
            <span className="text-[13px] font-light tabular-nums">{String(HERO_SLIDES.length).padStart(2, "0")}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
