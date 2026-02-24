"use client";

import { useRef, useState, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import Image from "next/image";
import Link from "next/link";
import { EDITORIAL_BAND_IMAGE } from "@/lib/cdn-image-urls";
import type { EditorialBandContent } from "@/types/content-blocks";

export default function EditorialBand({ content }: { content?: EditorialBandContent }) {
  const bandImage = content?.image ?? EDITORIAL_BAND_IMAGE;
  const bandAlt = content?.alt ?? "Aksa Fashion cape and train bridal gown handcrafted in Prishtina atelier";
  const t = useTranslations("home");
  const locale = useLocale();
  const sectionRef = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);
  const [parallaxY, setParallaxY] = useState(0);

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
      { threshold: 0.15 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  // Parallax scroll effect
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    let raf: number;
    const onScroll = () => {
      raf = requestAnimationFrame(() => {
        const rect = el.getBoundingClientRect();
        const winH = window.innerHeight;
        if (rect.bottom > 0 && rect.top < winH) {
          const progress = (winH - rect.top) / (winH + rect.height);
          setParallaxY((progress - 0.5) * 60);
        }
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative h-[55vh] sm:h-[60vh] lg:h-[70vh] overflow-hidden"
    >
      {/* ── Parallax image ── */}
      <div
        className="absolute inset-0"
        style={{
          transform: `translateY(${parallaxY}px) scale(1.1)`,
          willChange: "transform",
        }}
      >
        <Image
          src={bandImage}
          alt={bandAlt}
          fill
          className="object-cover object-[50%_30%]"
          sizes="100vw"
        />
      </div>

      {/* ── Darker multi-layer overlay for bold contrast ── */}
      <div
        className="absolute inset-0"
        style={{
          background: [
            "linear-gradient(180deg, rgba(20,18,16,0.4) 0%, rgba(20,18,16,0.6) 50%, rgba(20,18,16,0.8) 100%)",
            "radial-gradient(ellipse at 50% 50%, transparent 20%, rgba(20,18,16,0.5) 100%)",
          ].join(", "),
        }}
      />

      {/* ── Content ── */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 z-10">
        {/* Top label */}
        <div
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? "none" : "translateY(15px)",
            transition:
              "opacity 800ms cubic-bezier(0.16, 1, 0.3, 1) 100ms, transform 800ms cubic-bezier(0.16, 1, 0.3, 1) 100ms",
          }}
        >
          <span className="text-[10px] sm:text-[11px] tracking-[0.4em] uppercase text-gold/70 block mb-6">
            {content?.topLabel || t("estLine")}
          </span>
        </div>

        {/* Thick gold line above heading */}
        <div
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? "scaleX(1)" : "scaleX(0)",
            transition:
              "opacity 800ms cubic-bezier(0.16, 1, 0.3, 1) 200ms, transform 1200ms cubic-bezier(0.16, 1, 0.3, 1) 200ms",
          }}
        >
          <span className="block h-[2.5px] w-16 bg-gold mx-auto mb-7" />
        </div>

        {/* Main heading — larger */}
        <div
          className="overflow-hidden"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? "none" : "translateY(40px)",
            transition:
              "opacity 1000ms cubic-bezier(0.16, 1, 0.3, 1) 350ms, transform 1000ms cubic-bezier(0.16, 1, 0.3, 1) 350ms",
          }}
        >
          <h2 className="font-serif text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-white leading-[1.05] mb-4">
            {content?.heading || t("editorialLine")}
          </h2>
        </div>

        {/* Subtext — brand tagline */}
        <div
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? "none" : "translateY(20px)",
            transition:
              "opacity 800ms cubic-bezier(0.16, 1, 0.3, 1) 550ms, transform 800ms cubic-bezier(0.16, 1, 0.3, 1) 550ms",
          }}
        >
          <p className="text-[13px] sm:text-[15px] tracking-[0.1em] text-white/60 mb-10 max-w-md mx-auto">
            {content?.tagline || t("brandTagline")}
          </p>
        </div>

        {/* CTA Button — white bordered, fills on hover */}
        <div
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? "none" : "translateY(15px)",
            transition:
              "opacity 800ms cubic-bezier(0.16, 1, 0.3, 1) 700ms, transform 800ms cubic-bezier(0.16, 1, 0.3, 1) 700ms",
          }}
        >
          {(() => {
            const btnLink = content?.buttonLink || `/${locale}/collections`;
            const btnText = content?.buttonText || t("discoverStory");
            const cls = "inline-flex items-center gap-3 px-8 py-3.5 border border-white/40 text-[11px] font-bold tracking-[0.2em] uppercase text-white hover:bg-white hover:text-charcoal transition-all duration-400";
            const arrow = <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>;
            return /^https?:\/\//.test(btnLink) ? (
              <a href={btnLink} target="_blank" rel="noopener noreferrer" className={cls}>{btnText}{arrow}</a>
            ) : (
              <Link href={btnLink.startsWith("/") ? `/${locale}${btnLink}` : `/${locale}/${btnLink}`} className={cls}>{btnText}{arrow}</Link>
            );
          })()}
        </div>
      </div>
    </section>
  );
}
