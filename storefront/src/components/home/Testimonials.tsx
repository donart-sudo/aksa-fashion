"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useTranslations, useLocale } from "next-intl";
import { StarIcon } from "@heroicons/react/24/solid";
import Image from "next/image";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";
import { SOCIAL_LINKS } from "@/lib/constants";

/* ── Enriched testimonial data — each review linked to a real product ── */
const BRIDE_STORIES = [
  {
    id: "1",
    name: "Elona K.",
    location: "Prishtina, Kosovo",
    text: "It's even more beautiful in person, it's perfect!",
    rating: 5,
    image:
      "http://localhost:9000/static/1771434664999-Crystal-Bloom-1-scaled.jpg",
    product: {
      name: "Crystal Bloom",
      handle: "crystal-bloom",
      price: 1250,
      category: "Bridal",
    },
  },
  {
    id: "2",
    name: "Arjeta M.",
    location: "Tirana, Albania",
    text: "The whole process was so smooth with you. Fast shipping and amazing quality.",
    rating: 5,
    image:
      "http://localhost:9000/static/1771434665009-Snow-1-scaled.jpg",
    product: {
      name: "Snow",
      handle: "snow",
      price: 1470,
      category: "Bridal",
    },
  },
  {
    id: "3",
    name: "Dafina S.",
    location: "Zurich, Switzerland",
    text: "From the first message to receiving my dress, everything was handled with such care. The attention to detail is incredible.",
    rating: 5,
    image:
      "http://localhost:9000/static/1771434664932-Verdant-Grace-scaled.jpg",
    product: {
      name: "Verdant Grace",
      handle: "verdant-grace",
      price: 980,
      category: "Cape & Train",
    },
  },
  {
    id: "4",
    name: "Liridona B.",
    location: "Munich, Germany",
    text: "I couldn't believe how perfectly it fit. The custom measurements made all the difference.",
    rating: 5,
    image:
      "http://localhost:9000/static/1771434665113-Golden-Dawn-scaled.jpg",
    product: {
      name: "Golden Dawn",
      handle: "golden-dawn",
      price: 960,
      category: "Cape & Train",
    },
  },
  {
    id: "5",
    name: "Fjolla H.",
    location: "London, United Kingdom",
    text: "My wedding dress exceeded every expectation. The craftsmanship is outstanding.",
    rating: 5,
    image:
      "http://localhost:9000/static/1771434665029-Ellea-scaled.jpg",
    product: {
      name: "Ellea",
      handle: "ellea",
      price: 950,
      category: "Evening",
    },
  },
];

/* ── Main section ── */
export default function Testimonials() {
  const t = useTranslations("home");
  const locale = useLocale();
  const sectionRef = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);
  const [active, setActive] = useState(0);
  const [direction, setDirection] = useState<"next" | "prev">("next");
  const [isAnimating, setIsAnimating] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [paused, setPaused] = useState(false);

  const story = BRIDE_STORIES[active];

  const goTo = useCallback(
    (index: number, dir?: "next" | "prev") => {
      if (isAnimating || index === active) return;
      setDirection(dir || (index > active ? "next" : "prev"));
      setIsAnimating(true);
      setTimeout(() => {
        setActive(index);
        setTimeout(() => setIsAnimating(false), 50);
      }, 300);
    },
    [active, isAnimating]
  );

  const goNext = useCallback(() => {
    const next = (active + 1) % BRIDE_STORIES.length;
    goTo(next, "next");
  }, [active, goTo]);

  const goPrev = useCallback(() => {
    const prev = (active - 1 + BRIDE_STORIES.length) % BRIDE_STORIES.length;
    goTo(prev, "prev");
  }, [active, goTo]);

  // Auto-play
  useEffect(() => {
    if (paused) return;
    timerRef.current = setInterval(goNext, 6000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [goNext, paused]);

  // Intersection observer
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

  return (
    <section
      ref={sectionRef}
      className="overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="grid lg:grid-cols-2 min-h-[600px] lg:min-h-[700px]">
        {/* ── Left — Bride image ── */}
        <div className="relative h-[420px] sm:h-[500px] lg:h-auto overflow-hidden">
          {BRIDE_STORIES.map((s, i) => (
            <div
              key={s.id}
              className="absolute inset-0 transition-all duration-700 ease-out"
              style={{
                opacity: i === active && !isAnimating ? 1 : 0,
                transform:
                  i === active && !isAnimating
                    ? "scale(1)"
                    : "scale(1.05)",
              }}
            >
              <Image
                src={s.image}
                alt={`${s.name} wearing ${s.product.name} by Aksa Fashion`}
                fill
                className="object-cover object-top"
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority={i === 0}
              />
            </div>
          ))}

          {/* Gradient overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-charcoal/60 via-transparent to-transparent lg:hidden" />
          <div className="absolute inset-0 hidden lg:block bg-gradient-to-r from-transparent via-transparent to-charcoal/30" />

          {/* Product tag on image — bottom-left */}
          <div className="absolute bottom-6 left-6 z-10 hidden lg:block">
            <Link
              href={`/${locale}/products/${story.product.handle}`}
              className="group flex items-center gap-3 bg-white/10 backdrop-blur-md px-4 py-3 border border-white/10 hover:border-white/25 transition-all duration-300"
            >
              <div className="w-8 h-8 rounded-full bg-gold/20 flex items-center justify-center flex-shrink-0">
                <svg
                  className="w-3.5 h-3.5 text-gold"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
                  />
                </svg>
              </div>
              <div>
                <p className="text-[10px] tracking-[0.2em] uppercase text-white/50">
                  She&apos;s wearing
                </p>
                <p className="text-[13px] font-serif font-medium text-white group-hover:text-gold transition-colors duration-300">
                  {story.product.name}
                </p>
              </div>
              <svg
                className="w-3.5 h-3.5 text-white/30 group-hover:text-gold group-hover:translate-x-0.5 transition-all duration-300 ml-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                />
              </svg>
            </Link>
          </div>

          {/* Image counter */}
          <div className="absolute top-6 left-6 z-10">
            <span className="text-[11px] tracking-[0.2em] text-white/40 font-medium">
              {String(active + 1).padStart(2, "0")} / {String(BRIDE_STORIES.length).padStart(2, "0")}
            </span>
          </div>
        </div>

        {/* ── Right — Content ── */}
        <div className="relative flex items-center">
          {/* Subtle radial warmth */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse at 30% 50%, rgba(184,146,106,0.04) 0%, transparent 60%)",
            }}
          />

          <div className="relative z-10 px-6 sm:px-10 lg:px-14 xl:px-20 py-14 sm:py-16 lg:py-20 w-full">
            {/* Section label */}
            <div
              className="mb-10 lg:mb-14"
              style={{
                opacity: visible ? 1 : 0,
                transform: visible ? "none" : "translateY(12px)",
                transition:
                  "opacity 700ms cubic-bezier(0.16, 1, 0.3, 1) 200ms, transform 700ms cubic-bezier(0.16, 1, 0.3, 1) 200ms",
              }}
            >
              <div className="flex items-center gap-4 mb-5">
                <span className="block h-[1.5px] w-10 bg-gold/60" />
                <span className="text-[11px] tracking-[0.35em] uppercase text-gold font-medium">
                  {t("testimonialsSubtitle")}
                </span>
              </div>
              <h2 className="font-serif text-[1.75rem] sm:text-[2.25rem] lg:text-[2.75rem] font-bold text-white leading-[1.05]">
                {t("testimonialsTitle")}
              </h2>
            </div>

            {/* Quote content — fixed height to prevent layout shift */}
            <div
              className="min-h-[340px] sm:min-h-[310px] lg:min-h-[320px]"
              style={{
                opacity: isAnimating ? 0 : 1,
                transform: isAnimating
                  ? direction === "next"
                    ? "translateY(16px)"
                    : "translateY(-16px)"
                  : "none",
                transition:
                  "opacity 250ms ease, transform 250ms ease",
              }}
            >
              {/* Stars */}
              <div className="flex gap-1 mb-5">
                {Array.from({ length: story.rating }).map((_, i) => (
                  <StarIcon key={i} className="w-4 h-4 text-gold" />
                ))}
              </div>

              {/* Quote */}
              <blockquote className="font-serif text-xl sm:text-2xl lg:text-[1.7rem] leading-relaxed text-white/90 mb-8 max-w-lg">
                &ldquo;{story.text}&rdquo;
              </blockquote>

              {/* Bride info */}
              <div className="flex items-center gap-4 mb-8">
                <div className="w-11 h-11 rounded-full border-2 border-gold/30 flex-shrink-0 bg-gold/10 flex items-center justify-center">
                  <span className="text-gold font-serif text-[15px] font-semibold">
                    {story.name.charAt(0)}
                  </span>
                </div>
                <div>
                  <p className="text-[14px] font-semibold text-white">
                    {story.name}
                  </p>
                  <p className="text-[12px] text-white/35 mt-0.5">
                    {story.location}
                  </p>
                </div>
              </div>

              {/* Divider */}
              <div className="h-px bg-white/[0.08] mb-6" />

              {/* Product link + WhatsApp */}
              <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
                <Link
                  href={`/${locale}/products/${story.product.handle}`}
                  className="group flex items-center gap-3"
                >
                  <div>
                    <p className="text-[10px] tracking-[0.2em] uppercase text-white/35">
                      She&apos;s wearing
                    </p>
                    <p className="text-[15px] font-serif font-medium text-white group-hover:text-gold transition-colors duration-300">
                      {story.product.name}{" "}
                      <span className="text-gold/60 font-sans text-[13px]">
                        {formatPrice(story.product.price)}
                      </span>
                    </p>
                  </div>
                  <svg
                    className="w-3.5 h-3.5 text-white/25 group-hover:text-gold group-hover:translate-x-0.5 transition-all duration-300"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                    />
                  </svg>
                </Link>

                <span className="hidden sm:block w-px h-5 bg-white/[0.08]" />

                <a
                  href={SOCIAL_LINKS.whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-[11px] tracking-[0.1em] uppercase text-white/30 hover:text-green-400 transition-colors duration-300"
                >
                  <svg
                    className="w-4 h-4"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                  Ask about this look
                </a>
              </div>
            </div>

            {/* ── Navigation ── */}
            <div className="mt-10 lg:mt-14 flex items-center gap-5">
              {/* Arrows */}
              <div className="flex items-center gap-2">
                <button
                  onClick={goPrev}
                  className="w-10 h-10 flex items-center justify-center border border-white/[0.12] text-white/40 hover:border-white/30 hover:text-white transition-all duration-300"
                  aria-label="Previous story"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
                    />
                  </svg>
                </button>
                <button
                  onClick={goNext}
                  className="w-10 h-10 flex items-center justify-center border border-white/[0.12] text-white/40 hover:border-white/30 hover:text-white transition-all duration-300"
                  aria-label="Next story"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                    />
                  </svg>
                </button>
              </div>

              {/* Progress dots */}
              <div className="flex items-center gap-2">
                {BRIDE_STORIES.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => goTo(i)}
                    className={`relative h-[3px] rounded-full transition-all duration-500 ${
                      i === active
                        ? "w-8 bg-gold"
                        : "w-3 bg-white/15 hover:bg-white/30"
                    }`}
                    aria-label={`Go to story ${i + 1}`}
                  >
                    {/* Auto-play progress fill */}
                    {i === active && !paused && (
                      <span
                        className="absolute inset-0 rounded-full bg-gold/40 origin-left"
                        style={{
                          animation: "progress-fill 6s linear",
                        }}
                      />
                    )}
                  </button>
                ))}
              </div>

              {/* Bride thumbnails — desktop */}
              <div className="hidden xl:flex items-center gap-2 ml-auto">
                {BRIDE_STORIES.map((s, i) => (
                  <button
                    key={s.id}
                    onClick={() => goTo(i)}
                    className={`relative w-9 h-9 rounded-full border-2 transition-all duration-300 flex items-center justify-center ${
                      i === active
                        ? "border-gold scale-110 bg-gold/15"
                        : "border-white/10 bg-white/5 opacity-50 hover:opacity-80 hover:border-white/25"
                    }`}
                    aria-label={`${s.name}'s story`}
                  >
                    <span className={`font-serif text-[12px] font-semibold ${i === active ? "text-gold" : "text-white/60"}`}>
                      {s.name.charAt(0)}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Auto-play progress animation */}
      <style jsx>{`
        @keyframes progress-fill {
          from {
            transform: scaleX(0);
          }
          to {
            transform: scaleX(1);
          }
        }
      `}</style>
    </section>
  );
}
