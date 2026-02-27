"use client";

import { useState, useRef, useEffect } from "react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { NEWSLETTER_IMAGES } from "@/lib/cdn-image-urls";
import type { NewsletterContent } from "@/types/content-blocks";

/* ── Product images for the scrolling marquee ── */
const DEFAULT_MARQUEE_IMAGES = NEWSLETTER_IMAGES;

/* ── Infinite scrolling marquee ── */
function ImageMarquee({ images: marqueeImages }: { images: typeof DEFAULT_MARQUEE_IMAGES }) {
  const images = [...marqueeImages, ...marqueeImages];

  return (
    <div className="relative overflow-hidden py-1">
      {/* Fade edges — matches parent charcoal bg */}
      <div className="absolute left-0 top-0 bottom-0 w-16 sm:w-24 z-10 bg-gradient-to-r from-charcoal to-transparent pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-16 sm:w-24 z-10 bg-gradient-to-l from-charcoal to-transparent pointer-events-none" />

      <div className="flex gap-3 sm:gap-4 animate-marquee">
        {images.map((img, i) => (
          <div
            key={`${img.alt}-${i}`}
            className="flex-shrink-0 w-[140px] sm:w-[170px] lg:w-[200px] aspect-[3/4] relative overflow-hidden group"
          >
            <Image
              src={img.src}
              alt={img.alt}
              fill
              className="object-cover object-top group-hover:scale-105 transition-transform duration-700"
              sizes="200px"
            />
            <div className="absolute inset-0 bg-charcoal/10 group-hover:bg-transparent transition-colors duration-500" />
          </div>
        ))}
      </div>

      <style jsx>{`
        @keyframes marquee-scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee-scroll 40s linear infinite;
        }
        .animate-marquee:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
}

/* ── Benefits ── */
const BENEFITS = [
  {
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
      </svg>
    ),
    key: "earlyAccess",
  },
  {
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
      </svg>
    ),
    key: "stylingTips",
  },
  {
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 11.25v8.25a1.5 1.5 0 01-1.5 1.5H5.25a1.5 1.5 0 01-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 109.375 7.5H12m0-2.625V7.5m0-2.625A2.625 2.625 0 1114.625 7.5H12m0 0V21m-8.625-9.75h18c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125h-18c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
      </svg>
    ),
    key: "exclusiveOffers",
  },
];

/* ── Main section ── */
export default function Newsletter({ content }: { content?: NewsletterContent }) {
  const marqueeImages = content?.marqueeImages ?? DEFAULT_MARQUEE_IMAGES;
  const t = useTranslations("home");
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [focused, setFocused] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubmitted(true);
      setEmail("");
    }
  };

  return (
    <section ref={sectionRef} className="relative overflow-hidden">
      {/* ── Scrolling product marquee ── */}
      <div className="pb-10 sm:pb-12">
        <ImageMarquee images={marqueeImages} />
      </div>

      {/* ── Centered content ── */}
      <div
        className="max-w-2xl mx-auto px-6 sm:px-8 pb-16 sm:pb-20 lg:pb-24 text-center"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? "none" : "translateY(16px)",
          transition: "opacity 700ms cubic-bezier(0.16, 1, 0.3, 1), transform 700ms cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      >
        {/* Label */}
        <div className="flex items-center justify-center gap-4 mb-8">
          <span className="block h-px w-8 bg-gold/40" />
          <span className="text-[10px] tracking-[0.4em] uppercase text-gold/70 font-medium">
            {t("newsletterLabel")}
          </span>
          <span className="block h-px w-8 bg-gold/40" />
        </div>

        {/* Heading */}
        <h2 className="font-serif text-3xl sm:text-4xl lg:text-[3rem] font-bold text-white leading-[1.1] mb-4">
          {content?.heading || t("newsletterTitle")}
        </h2>

        {/* Subtitle */}
        <p className="text-[15px] sm:text-base text-white/45 leading-relaxed max-w-md mx-auto mb-8">
          {content?.subtitle || t("newsletterSubtitle")}
        </p>

        {/* Benefits */}
        <div className="flex flex-wrap items-center justify-center gap-x-6 sm:gap-x-8 gap-y-3 mb-10">
          {BENEFITS.map((b) => (
            <div key={b.key} className="flex items-center gap-2 text-white/30">
              <span className="text-gold/60">{b.icon}</span>
              <span className="text-[11px] sm:text-xs tracking-wide">
                {t(b.key)}
              </span>
            </div>
          ))}
        </div>

        {/* Form / Success */}
        {submitted ? (
          <div className="flex flex-col items-center gap-4">
            <span className="w-12 h-12 rounded-full border border-gold/40 flex items-center justify-center">
              <svg className="w-5 h-5 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            </span>
            <div>
              <p className="text-[15px] font-semibold text-white">
                {t("newsletterSuccess")}
              </p>
              <p className="text-[13px] text-white/40 mt-1">
                {t("newsletterSuccessDetail")}
              </p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="max-w-md mx-auto">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 min-w-0">
                <input
                  type="email"
                  placeholder={content?.placeholder || t("newsletterPlaceholder")}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setFocused(true)}
                  onBlur={() => setFocused(false)}
                  required
                  className={`w-full bg-white/[0.05] border px-5 py-3.5 text-[14px] text-white placeholder:text-white/30 focus:outline-none transition-all duration-500 ${
                    focused
                      ? "border-gold/50 bg-white/[0.08]"
                      : "border-white/[0.1]"
                  }`}
                />
              </div>
              <button
                type="submit"
                className="flex-shrink-0 w-full sm:w-auto px-8 py-3.5 bg-gold hover:bg-gold/90 text-[11px] font-bold tracking-[0.2em] uppercase text-white transition-all duration-300 min-h-[48px]"
              >
                {content?.buttonText || t("newsletterButton")}
              </button>
            </div>
            <p className="text-[11px] text-white/20 mt-4 tracking-wide leading-relaxed">
              {t("newsletterDisclaimer")}
            </p>
          </form>
        )}

        {/* Bottom brand line */}
        <div className="mt-14 sm:mt-16">
          <div className="flex items-center justify-center gap-4">
            <span className="block h-px w-12 sm:w-16 bg-white/[0.06]" />
            <span className="text-[10px] tracking-[0.35em] uppercase text-white/20">
              {t("estLine")}
            </span>
            <span className="block h-px w-12 sm:w-16 bg-white/[0.06]" />
          </div>
        </div>
      </div>
    </section>
  );
}
