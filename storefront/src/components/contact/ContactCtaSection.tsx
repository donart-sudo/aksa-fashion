"use client";

import Link from "next/link";
import { useLocale } from "next-intl";
import { motion } from "framer-motion";
import type { ContactCtaContent } from "@/types/content-blocks";
import { DEFAULT_CONTACT_CTA } from "@/lib/data/content-defaults";
import { useSiteConstants } from "@/lib/site-constants";

function isExternal(url: string): boolean {
  return /^https?:\/\//.test(url) || url.startsWith("mailto:") || url.startsWith("tel:");
}

interface Props {
  content?: ContactCtaContent;
}

export default function ContactCtaSection({ content }: Props) {
  const c = { ...DEFAULT_CONTACT_CTA, ...content };
  const locale = useLocale();
  const sc = useSiteConstants();

  return (
    <>
      {/* WhatsApp CTA Banner */}
      <section className="py-10 sm:py-14 md:py-20 lg:py-24 xl:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative overflow-hidden bg-charcoal p-5 sm:p-8 md:p-12 lg:p-16 xl:p-20"
          >
            <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)", backgroundSize: "32px 32px" }} />
            <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-gold/[0.04] to-transparent" />

            <div className="relative flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5 sm:gap-6 md:gap-8">
              <div className="max-w-lg">
                <div className="flex items-center gap-2.5 sm:gap-3 mb-3 sm:mb-4">
                  <div className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 flex items-center justify-center bg-green-500/10 text-green-400">
                    <svg className="w-4 h-4 sm:w-4.5 sm:h-4.5 md:w-5 md:h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                    </svg>
                  </div>
                  <span className="text-[9px] sm:text-[10px] md:text-[11px] tracking-[0.15em] sm:tracking-[0.2em] uppercase text-white/30">{c.whatsappBadge}</span>
                </div>
                <h3 className="font-serif text-xl sm:text-2xl md:text-3xl lg:text-4xl text-white leading-tight mb-2 sm:mb-3 md:mb-4">
                  {c.whatsappHeading} <span className="italic text-gold/80">{c.whatsappHeadingAccent}</span>
                </h3>
                <p className="text-white/40 text-[12px] sm:text-[13px] md:text-[14px] lg:text-[15px] leading-relaxed">{c.whatsappDescription}</p>
              </div>

              <a
                href={sc.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center justify-center gap-2 sm:gap-3 w-full sm:w-auto px-6 sm:px-8 md:px-10 py-3.5 sm:py-4 md:py-5 bg-green-500 hover:bg-green-400 text-white text-[10px] sm:text-[11px] md:text-[12px] font-medium tracking-[0.12em] sm:tracking-[0.15em] uppercase transition-all duration-300 flex-shrink-0 min-h-[44px] sm:min-h-[48px]"
              >
                <svg className="w-4.5 h-4.5 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                {c.whatsappButtonText}
                <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Explore CTA */}
      <section className="pb-10 sm:pb-14 md:pb-20 lg:pb-24 xl:pb-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <div className="flex items-center justify-center gap-2.5 sm:gap-3 md:gap-4 mb-4 sm:mb-5 md:mb-6">
              <span className="h-px w-6 sm:w-8 md:w-10 bg-gold/40" />
              <span className="text-gold/60 text-[8px] sm:text-[9px] md:text-[10px] tracking-[0.35em] sm:tracking-[0.4em] uppercase">{c.exploreLabel}</span>
              <span className="h-px w-6 sm:w-8 md:w-10 bg-gold/40" />
            </div>
            <h2 className="font-serif text-[1.4rem] sm:text-[1.65rem] md:text-3xl lg:text-4xl xl:text-[2.65rem] text-charcoal mb-2 sm:mb-3 md:mb-4">
              {c.exploreHeading} <span className="italic text-gold">{c.exploreHeadingAccent}</span>
            </h2>
            <p className="text-charcoal/45 text-[12px] sm:text-[13px] md:text-[14px] lg:text-[15px] max-w-[280px] sm:max-w-sm md:max-w-md mx-auto leading-relaxed mb-6 sm:mb-8 md:mb-10">{c.exploreDescription}</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 sm:gap-3 md:gap-4">
              {isExternal(c.explorePrimaryLink) ? (
                <a
                  href={c.explorePrimaryLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-center justify-center gap-2 w-full sm:w-auto px-6 sm:px-8 md:px-10 py-3 sm:py-3.5 md:py-4 bg-charcoal text-white text-[10px] sm:text-[11px] tracking-[0.2em] uppercase hover:bg-gold transition-colors duration-500 sm:min-w-[200px] min-h-[44px] sm:min-h-[48px]"
                >
                  {c.explorePrimaryText}
                  <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </a>
              ) : (
                <Link
                  href={`/${locale}${c.explorePrimaryLink}`}
                  className="group inline-flex items-center justify-center gap-2 w-full sm:w-auto px-6 sm:px-8 md:px-10 py-3 sm:py-3.5 md:py-4 bg-charcoal text-white text-[10px] sm:text-[11px] tracking-[0.2em] uppercase hover:bg-gold transition-colors duration-500 sm:min-w-[200px] min-h-[44px] sm:min-h-[48px]"
                >
                  {c.explorePrimaryText}
                  <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </Link>
              )}
              {isExternal(c.exploreSecondaryLink) ? (
                <a
                  href={c.exploreSecondaryLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-center justify-center gap-2 w-full sm:w-auto px-6 sm:px-8 md:px-10 py-3 sm:py-3.5 md:py-4 border border-charcoal/15 text-charcoal text-[10px] sm:text-[11px] tracking-[0.2em] uppercase hover:border-gold hover:text-gold transition-all duration-500 sm:min-w-[200px] min-h-[44px] sm:min-h-[48px]"
                >
                  {c.exploreSecondaryText}
                </a>
              ) : (
                <Link
                  href={`/${locale}${c.exploreSecondaryLink}`}
                  className="group inline-flex items-center justify-center gap-2 w-full sm:w-auto px-6 sm:px-8 md:px-10 py-3 sm:py-3.5 md:py-4 border border-charcoal/15 text-charcoal text-[10px] sm:text-[11px] tracking-[0.2em] uppercase hover:border-gold hover:text-gold transition-all duration-500 sm:min-w-[200px] min-h-[44px] sm:min-h-[48px]"
                >
                  {c.exploreSecondaryText}
                </Link>
              )}
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
}
