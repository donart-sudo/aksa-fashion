"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { StarIcon } from "@heroicons/react/24/solid";
import { MOCK_TESTIMONIALS } from "@/lib/constants";
import Image from "next/image";
import useEmblaCarousel from "embla-carousel-react";

/* ── Photo-backed review card ── */
function ReviewCard({
  testimonial,
  visible,
  delay,
}: {
  testimonial: (typeof MOCK_TESTIMONIALS)[0];
  visible: boolean;
  delay: number;
}) {
  return (
    <div
      className="h-full flex flex-col overflow-hidden bg-white"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "none" : "translateY(24px)",
        transition: `opacity 700ms cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms, transform 700ms cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms`,
      }}
    >
      {/* Image */}
      <div className="relative aspect-[3/4] overflow-hidden">
        <Image
          src={testimonial.image}
          alt={`${testimonial.name} wearing Aksa Fashion`}
          fill
          className="object-cover object-top"
          sizes="(max-width: 640px) 85vw, (max-width: 1024px) 420px, 400px"
        />
        {/* Gradient overlay at bottom of image */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
        {/* Stars on image */}
        <div className="absolute bottom-4 left-5 flex gap-0.5">
          {Array.from({ length: testimonial.rating }).map((_, i) => (
            <StarIcon key={i} className="w-3.5 h-3.5 text-gold" />
          ))}
        </div>
      </div>

      {/* Quote panel */}
      <div className="flex-1 flex flex-col justify-between p-6 sm:p-7">
        <blockquote className="font-serif text-[16px] sm:text-[17px] leading-relaxed text-charcoal/85 mb-5">
          &ldquo;{testimonial.text}&rdquo;
        </blockquote>
        <div>
          <p className="text-[13px] font-semibold text-charcoal">
            {testimonial.name}
          </p>
          <p className="text-[11px] text-charcoal/40 mt-0.5">
            {testimonial.location}
          </p>
        </div>
      </div>
    </div>
  );
}

/* ── Main section ── */
export default function Testimonials() {
  const t = useTranslations("home");
  const sectionRef = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    containScroll: "trimSnaps",
    dragFree: true,
    slidesToScroll: 1,
  });

  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const updateButtons = useCallback(() => {
    if (!emblaApi) return;
    setCanScrollLeft(emblaApi.canScrollPrev());
    setCanScrollRight(emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on("select", updateButtons);
    emblaApi.on("reInit", updateButtons);
    updateButtons();
    return () => {
      emblaApi.off("select", updateButtons);
      emblaApi.off("reInit", updateButtons);
    };
  }, [emblaApi, updateButtons]);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  return (
    <section ref={sectionRef} className="py-24 lg:py-32 bg-cream">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-14 lg:mb-16">
          <div className="flex items-center gap-4 mb-6">
            <span className="block h-[1.5px] w-10 bg-gold" />
            <span className="text-[11px] tracking-[0.35em] uppercase text-gold font-medium">
              {t("testimonialsSubtitle")}
            </span>
          </div>

          <div className="flex items-end justify-between">
            <h2 className="font-serif text-[2rem] sm:text-[2.5rem] lg:text-[3.25rem] font-bold text-charcoal leading-[0.95]">
              {t("testimonialsTitle")}
            </h2>

            {/* Desktop arrows */}
            <div className="hidden sm:flex items-center gap-2 flex-shrink-0">
              <button
                onClick={scrollPrev}
                disabled={!canScrollLeft}
                className={`w-11 h-11 flex items-center justify-center border transition-all duration-300 ${
                  canScrollLeft
                    ? "border-charcoal/20 text-charcoal hover:border-charcoal hover:bg-charcoal hover:text-white"
                    : "border-charcoal/8 text-charcoal/15 cursor-default"
                }`}
                aria-label="Previous"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                </svg>
              </button>
              <button
                onClick={scrollNext}
                disabled={!canScrollRight}
                className={`w-11 h-11 flex items-center justify-center border transition-all duration-300 ${
                  canScrollRight
                    ? "border-charcoal/20 text-charcoal hover:border-charcoal hover:bg-charcoal hover:text-white"
                    : "border-charcoal/8 text-charcoal/15 cursor-default"
                }`}
                aria-label="Next"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Scrolling cards */}
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex ml-4 sm:ml-6 lg:ml-[max(1.5rem,calc((100vw-80rem)/2+1.5rem))]">
          {MOCK_TESTIMONIALS.map((testimonial, i) => (
            <div
              key={testimonial.id}
              className="flex-[0_0_75vw] sm:flex-[0_0_320px] lg:flex-[0_0_300px] min-w-0 pr-5"
            >
              <ReviewCard
                testimonial={testimonial}
                visible={visible}
                delay={i * 100}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
