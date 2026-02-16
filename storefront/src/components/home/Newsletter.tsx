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
    <section
      ref={sectionRef}
      className="relative overflow-hidden"
    >
      {/* ── Split layout: image left, content right ── */}
      <div className="grid lg:grid-cols-2 min-h-[500px] lg:min-h-[580px]">

        {/* Left — editorial image */}
        <div className="relative h-[360px] sm:h-[420px] lg:h-auto overflow-hidden">
          <Image
            src="https://ariart.shop/wp-content/uploads/2026/01/Royal-Lilac-Aura-scaled.jpg"
            alt="Aksa Fashion luxury lilac ball gown from the Royal Lilac Aura collection"
            fill
            className="object-cover object-[50%_15%]"
            sizes="(max-width: 1024px) 100vw, 50vw"
          />
          {/* Soft vignette overlay */}
          <div
            className="absolute inset-0"
            style={{
              background: [
                "linear-gradient(to right, transparent 60%, rgba(26,26,26,0.4) 100%)",
                "linear-gradient(to top, rgba(26,26,26,0.3) 0%, transparent 40%)",
              ].join(", "),
            }}
          />
          {/* Mobile bottom gradient for text readability on small screens */}
          <div className="absolute inset-0 lg:hidden bg-gradient-to-t from-[#1a1a1a] via-[#1a1a1a]/40 to-transparent" />

          {/* Floating brand stamp */}
          <div
            className="absolute top-8 left-8 sm:top-10 sm:left-10"
            style={{
              opacity: visible ? 1 : 0,
              transition: "opacity 1000ms cubic-bezier(0.16, 1, 0.3, 1) 200ms",
            }}
          >
            <span className="text-[10px] tracking-[0.4em] uppercase text-white/50 font-light">
              {t("estLine")}
            </span>
          </div>
        </div>

        {/* Right — dark content panel */}
        <div className="relative bg-[#1a1a1a]">
          {/* Subtle radial warmth */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse at 20% 30%, rgba(184,146,106,0.04) 0%, transparent 60%)",
            }}
          />

          {/* Grain */}
          <div
            className="absolute inset-0 opacity-[0.025] pointer-events-none mix-blend-overlay"
            style={{
              backgroundImage:
                "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
              backgroundSize: "128px 128px",
            }}
          />

          <div className="relative z-10 flex flex-col justify-center h-full px-8 sm:px-12 lg:px-16 xl:px-20 py-14 sm:py-16 lg:py-20">
            {/* Gold accent */}
            <div
              style={{
                opacity: visible ? 1 : 0,
                transform: visible ? "scaleX(1)" : "scaleX(0)",
                transformOrigin: "left",
                transition:
                  "opacity 800ms cubic-bezier(0.16, 1, 0.3, 1) 200ms, transform 1000ms cubic-bezier(0.16, 1, 0.3, 1) 200ms",
              }}
            >
              <span className="block h-[1.5px] w-12 bg-gold/70 mb-8" />
            </div>

            {/* Label */}
            <div
              style={{
                opacity: visible ? 1 : 0,
                transform: visible ? "none" : "translateY(12px)",
                transition:
                  "opacity 700ms cubic-bezier(0.16, 1, 0.3, 1) 300ms, transform 700ms cubic-bezier(0.16, 1, 0.3, 1) 300ms",
              }}
            >
              <span className="text-[11px] tracking-[0.3em] uppercase text-gold block mb-5">
                {t("newsletterLabel")}
              </span>
            </div>

            {/* Heading — larger */}
            <div
              className="overflow-hidden mb-3"
              style={{
                opacity: visible ? 1 : 0,
                transform: visible ? "none" : "translateY(30px)",
                transition:
                  "opacity 900ms cubic-bezier(0.16, 1, 0.3, 1) 400ms, transform 900ms cubic-bezier(0.16, 1, 0.3, 1) 400ms",
              }}
            >
              <h2 className="font-serif text-3xl sm:text-4xl lg:text-[3.25rem] font-bold text-white leading-[1.1]">
                {t("newsletterTitle")}
              </h2>
            </div>

            {/* Incentive */}
            <div
              style={{
                opacity: visible ? 1 : 0,
                transform: visible ? "none" : "translateY(15px)",
                transition:
                  "opacity 800ms cubic-bezier(0.16, 1, 0.3, 1) 480ms, transform 800ms cubic-bezier(0.16, 1, 0.3, 1) 480ms",
              }}
            >
              <p className="text-[13px] text-gold/80 font-medium tracking-wide mb-3">
                {t("newsletterIncentive")}
              </p>
            </div>

            {/* Subtitle */}
            <p
              className="text-[14px] sm:text-[16px] text-white/60 leading-relaxed max-w-sm mb-10"
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
                transform: visible ? "none" : "translateY(16px)",
                transition:
                  "opacity 800ms cubic-bezier(0.16, 1, 0.3, 1) 700ms, transform 800ms cubic-bezier(0.16, 1, 0.3, 1) 700ms",
              }}
            >
              {submitted ? (
                <div className="flex items-center gap-4">
                  <span className="w-10 h-10 rounded-full border border-gold/50 flex items-center justify-center flex-shrink-0">
                    <svg
                      className="w-4.5 h-4.5 text-gold"
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
                    <p className="text-[14px] font-semibold text-white">
                      {t("newsletterSuccess")}
                    </p>
                    <p className="text-[13px] text-white/50 mt-0.5">
                      {t("newsletterSuccessDetail")}
                    </p>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="max-w-sm">
                  {/* Input + button stacked on mobile, inline on sm+ */}
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="flex-1 min-w-0">
                      <input
                        type="email"
                        placeholder={t("newsletterPlaceholder")}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        onFocus={() => setFocused(true)}
                        onBlur={() => setFocused(false)}
                        required
                        className={`w-full bg-white/[0.05] border px-4 py-3.5 text-[14px] text-white placeholder:text-white/35 focus:outline-none transition-all duration-500 ${
                          focused
                            ? "border-gold/50 bg-white/[0.08]"
                            : "border-white/[0.12]"
                        }`}
                      />
                    </div>
                    <button
                      type="submit"
                      className="flex-shrink-0 group px-8 py-4 bg-gold/90 hover:bg-gold text-[11px] font-bold tracking-[0.2em] uppercase text-white transition-all duration-300 min-h-[48px] hover:scale-[1.02]"
                    >
                      {t("newsletterButton")}
                    </button>
                  </div>
                  <p className="text-[11px] text-white/30 mt-4 tracking-wide leading-relaxed">
                    {t("newsletterDisclaimer")}
                  </p>
                </form>
              )}
            </div>

            {/* Decorative bottom line */}
            <div
              className="mt-12 lg:mt-16"
              style={{
                opacity: visible ? 1 : 0,
                transition: "opacity 1000ms cubic-bezier(0.16, 1, 0.3, 1) 900ms",
              }}
            >
              <div className="flex items-center gap-4">
                <span className="block h-[1px] flex-1 bg-white/[0.1]" />
                <span className="text-[10px] tracking-[0.3em] uppercase text-white/30">
                  Aksa Fashion
                </span>
                <span className="block h-[1px] flex-1 bg-white/[0.1]" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
