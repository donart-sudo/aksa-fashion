"use client";

import { useRef, useState, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";
import Image from "next/image";
import { CONTACT_INFO, SOCIAL_LINKS } from "@/lib/constants";

export default function Appointment() {
  const t = useTranslations("home");
  const locale = useLocale();
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

  return (
    <section ref={sectionRef} className="bg-charcoal">
      <div className="grid lg:grid-cols-2 min-h-[550px] lg:min-h-[620px]">
        {/* Left — atelier image */}
        <div className="relative h-[360px] sm:h-[420px] lg:h-auto overflow-hidden">
          <Image
            src="https://ariart.shop/wp-content/uploads/2026/01/Snow-1-scaled.jpg"
            alt="Bride in Aksa Fashion gown at our Prishtina atelier"
            fill
            className="object-cover object-[50%_20%]"
            sizes="(max-width: 1024px) 100vw, 50vw"
          />
          {/* Vignette overlay */}
          <div
            className="absolute inset-0"
            style={{
              background: "linear-gradient(to right, transparent 50%, rgba(45,45,45,0.5) 100%), linear-gradient(to top, rgba(45,45,45,0.4) 0%, transparent 40%)",
            }}
          />
          {/* Mobile bottom gradient */}
          <div className="absolute inset-0 lg:hidden bg-gradient-to-t from-charcoal via-charcoal/40 to-transparent" />
        </div>

        {/* Right — content */}
        <div className="relative flex items-center">
          {/* Subtle radial warmth */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: "radial-gradient(ellipse at 30% 50%, rgba(184,146,106,0.05) 0%, transparent 60%)",
            }}
          />

          <div className="relative z-10 px-8 sm:px-12 lg:px-16 xl:px-20 py-16 sm:py-20 lg:py-24 w-full">
            {/* Decorative frame */}
            <div className="relative border border-white/[0.08] px-8 sm:px-10 py-12 sm:py-14">
              {/* Corner accents */}
              <span className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-gold/40 -translate-x-px -translate-y-px" />
              <span className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-gold/40 translate-x-px -translate-y-px" />
              <span className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-gold/40 -translate-x-px translate-y-px" />
              <span className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-gold/40 translate-x-px translate-y-px" />

              {/* Gold accent line */}
              <div
                style={{
                  opacity: visible ? 1 : 0,
                  transform: visible ? "scaleX(1)" : "scaleX(0)",
                  transformOrigin: "left",
                  transition:
                    "opacity 800ms cubic-bezier(0.16, 1, 0.3, 1) 100ms, transform 1000ms cubic-bezier(0.16, 1, 0.3, 1) 100ms",
                }}
              >
                <span className="block h-[2px] w-12 bg-gold/60 mb-8" />
              </div>

              {/* Location label */}
              <div
                style={{
                  opacity: visible ? 1 : 0,
                  transform: visible ? "none" : "translateY(10px)",
                  transition:
                    "opacity 700ms cubic-bezier(0.16, 1, 0.3, 1) 200ms, transform 700ms cubic-bezier(0.16, 1, 0.3, 1) 200ms",
                }}
              >
                <span className="text-[11px] tracking-[0.35em] uppercase text-gold block mb-5">
                  Prishtina, Kosovo
                </span>
              </div>

              {/* Heading */}
              <div
                style={{
                  opacity: visible ? 1 : 0,
                  transform: visible ? "none" : "translateY(20px)",
                  transition:
                    "opacity 800ms cubic-bezier(0.16, 1, 0.3, 1) 300ms, transform 800ms cubic-bezier(0.16, 1, 0.3, 1) 300ms",
                }}
              >
                <h2 className="font-serif text-[2rem] sm:text-[2.5rem] lg:text-[2.75rem] font-bold text-white leading-[1.1] mb-4">
                  {t("appointmentTitle")}
                </h2>
              </div>

              {/* Subtitle */}
              <p
                className="text-[15px] text-white/40 leading-relaxed max-w-sm mb-8"
                style={{
                  opacity: visible ? 1 : 0,
                  transform: visible ? "none" : "translateY(15px)",
                  transition:
                    "opacity 700ms cubic-bezier(0.16, 1, 0.3, 1) 400ms, transform 700ms cubic-bezier(0.16, 1, 0.3, 1) 400ms",
                }}
              >
                {t("appointmentSubtitle")}
              </p>

              {/* Contact details */}
              <div
                className="flex flex-wrap items-center gap-x-6 gap-y-2 mb-8"
                style={{
                  opacity: visible ? 1 : 0,
                  transform: visible ? "none" : "translateY(12px)",
                  transition:
                    "opacity 700ms cubic-bezier(0.16, 1, 0.3, 1) 500ms, transform 700ms cubic-bezier(0.16, 1, 0.3, 1) 500ms",
                }}
              >
                <span className="text-[12px] text-white/30 flex items-center gap-2">
                  <svg className="w-3.5 h-3.5 text-gold/50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                  </svg>
                  {CONTACT_INFO.phone}
                </span>
                <span className="text-[12px] text-white/30 flex items-center gap-2">
                  <svg className="w-3.5 h-3.5 text-gold/50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {CONTACT_INFO.hours}
                </span>
              </div>

              {/* CTAs */}
              <div
                className="flex flex-wrap items-center gap-4"
                style={{
                  opacity: visible ? 1 : 0,
                  transform: visible ? "none" : "translateY(12px)",
                  transition:
                    "opacity 700ms cubic-bezier(0.16, 1, 0.3, 1) 600ms, transform 700ms cubic-bezier(0.16, 1, 0.3, 1) 600ms",
                }}
              >
                <Link
                  href={`/${locale}/contact`}
                  className="inline-flex items-center gap-3 px-8 py-3.5 bg-white hover:bg-gold text-[11px] font-bold tracking-[0.2em] uppercase text-charcoal hover:text-white transition-all duration-300"
                >
                  {t("appointmentCta")}
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </Link>
                <a
                  href={SOCIAL_LINKS.whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2.5 px-6 py-3.5 border border-white/15 hover:border-green-500/50 text-[11px] font-bold tracking-[0.15em] uppercase text-white/60 hover:text-green-400 transition-all duration-300"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                  WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
