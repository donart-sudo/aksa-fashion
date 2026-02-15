"use client";

import { useState, useRef, useEffect } from "react";
import { useTranslations } from "next-intl";
import Image from "next/image";

export default function Newsletter() {
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
      { threshold: 0.15 }
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
    <section
      ref={sectionRef}
      className="relative h-[85vh] min-h-[600px] max-h-[900px] overflow-hidden"
    >
      {/* ── Full-bleed editorial image ── */}
      <div className="absolute inset-0">
        <Image
          src="https://ariart.shop/wp-content/uploads/2026/01/Royal-Lilac-Aura-scaled.jpg"
          alt="Aksa Fashion"
          fill
          className="object-cover object-[50%_15%] scale-105"
          sizes="100vw"
        />
      </div>

      {/* ── Cinematic multi-layer overlay ── */}
      <div
        className="absolute inset-0"
        style={{
          background: [
            "linear-gradient(180deg, rgba(20,20,20,0.15) 0%, rgba(20,20,20,0.4) 40%, rgba(20,20,20,0.85) 100%)",
            "linear-gradient(90deg, rgba(20,20,20,0.5) 0%, transparent 50%)",
            "radial-gradient(ellipse at 30% 80%, rgba(184,146,106,0.08) 0%, transparent 50%)",
          ].join(", "),
        }}
      />

      {/* ── Grain texture ── */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
          backgroundSize: "128px 128px",
        }}
      />

      {/* ── Content ── */}
      <div className="relative z-10 h-full max-w-7xl mx-auto px-6 sm:px-10 lg:px-14 flex flex-col justify-end pb-16 sm:pb-20 lg:pb-24">
        {/* Top-right editorial label */}
        <div
          className="absolute top-8 right-6 sm:top-10 sm:right-10 lg:top-12 lg:right-14"
          style={{
            opacity: visible ? 1 : 0,
            transition: "opacity 1200ms cubic-bezier(0.16, 1, 0.3, 1) 200ms",
          }}
        >
          <span className="text-[10px] tracking-[0.5em] uppercase text-white/25">
            {t("estLine")}
          </span>
        </div>

        {/* Main content block — left-aligned, editorial asymmetry */}
        <div className="max-w-xl">
          {/* Gold accent line */}
          <div
            className="mb-8"
            style={{
              opacity: visible ? 1 : 0,
              transform: visible ? "scaleX(1)" : "scaleX(0)",
              transformOrigin: "left",
              transition:
                "opacity 800ms cubic-bezier(0.16, 1, 0.3, 1) 100ms, transform 1000ms cubic-bezier(0.16, 1, 0.3, 1) 100ms",
            }}
          >
            <span className="block h-[1px] w-16 bg-gold/50" />
          </div>

          {/* Heading */}
          <div className="overflow-hidden mb-5">
            <h2
              className="text-[2rem] sm:text-[2.75rem] lg:text-[3.5rem] xl:text-[4rem] font-black uppercase text-white leading-[0.95] tracking-tight"
              style={{
                opacity: visible ? 1 : 0,
                transform: visible ? "none" : "translateY(100%)",
                transition:
                  "opacity 1000ms cubic-bezier(0.16, 1, 0.3, 1) 300ms, transform 1000ms cubic-bezier(0.16, 1, 0.3, 1) 300ms",
              }}
            >
              {t("newsletterTitle")}
            </h2>
          </div>

          {/* Subtitle */}
          <p
            className="text-[13px] sm:text-[15px] text-white/40 leading-relaxed max-w-md mb-10 lg:mb-12"
            style={{
              opacity: visible ? 1 : 0,
              transform: visible ? "none" : "translateY(20px)",
              transition:
                "opacity 800ms cubic-bezier(0.16, 1, 0.3, 1) 550ms, transform 800ms cubic-bezier(0.16, 1, 0.3, 1) 550ms",
            }}
          >
            {t("newsletterSubtitle")}
          </p>

          {/* Form / Success */}
          <div
            style={{
              opacity: visible ? 1 : 0,
              transform: visible ? "none" : "translateY(20px)",
              transition:
                "opacity 800ms cubic-bezier(0.16, 1, 0.3, 1) 750ms, transform 800ms cubic-bezier(0.16, 1, 0.3, 1) 750ms",
            }}
          >
            {submitted ? (
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-full border border-gold/40 flex items-center justify-center flex-shrink-0">
                  <svg
                    className="w-4 h-4 text-gold"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M4.5 12.75l6 6 9-13.5"
                    />
                  </svg>
                </span>
                <div>
                  <p className="text-sm font-bold uppercase tracking-wide text-white">
                    {t("newsletterSuccess")}
                  </p>
                  <p className="text-[12px] text-white/35 mt-0.5">
                    {t("newsletterSuccessDetail")}
                  </p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="max-w-md">
                <div className="flex items-end gap-0">
                  <div className="flex-1 min-w-0">
                    <input
                      type="email"
                      placeholder={t("newsletterPlaceholder")}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onFocus={() => setFocused(true)}
                      onBlur={() => setFocused(false)}
                      required
                      className={`w-full bg-transparent border-b pb-3 pt-1 text-[15px] text-white placeholder:text-white/20 focus:outline-none transition-colors duration-500 ${
                        focused ? "border-gold/60" : "border-white/20"
                      }`}
                    />
                  </div>
                  <button
                    type="submit"
                    className="ml-6 flex-shrink-0 group flex items-center gap-2.5 pb-3 border-b border-gold/40 hover:border-gold transition-colors duration-300 min-h-[44px]"
                  >
                    <span className="text-[11px] font-bold tracking-[0.25em] uppercase text-gold/70 group-hover:text-gold transition-colors duration-300">
                      {t("newsletterButton")}
                    </span>
                    <svg
                      className="w-4 h-4 text-gold/50 group-hover:text-gold group-hover:translate-x-1 transition-all duration-300"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                      />
                    </svg>
                  </button>
                </div>
                <p className="text-[10px] text-white/15 mt-4 tracking-wide">
                  {t("newsletterDisclaimer")}
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
