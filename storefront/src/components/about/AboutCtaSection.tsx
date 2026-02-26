"use client";

import Image from "next/image";
import Link from "next/link";
import { useLocale } from "next-intl";
import { motion } from "framer-motion";
import type { AboutCtaContent } from "@/types/content-blocks";
import { DEFAULT_ABOUT_CTA } from "@/lib/data/content-defaults";
import { useSiteConstants } from "@/lib/site-constants";

function isExternal(url: string): boolean {
  return /^https?:\/\//.test(url) || url.startsWith("www.") || url.startsWith("mailto:") || url.startsWith("tel:");
}

function normalizeHref(url: string): string {
  return url.startsWith("www.") ? `https://${url}` : url;
}

interface Props {
  content?: AboutCtaContent;
}

export default function AboutCtaSection({ content }: Props) {
  const c = { ...DEFAULT_ABOUT_CTA, ...content };
  const locale = useLocale();
  const sc = useSiteConstants();

  return (
    <>
      {/* Atelier Split */}
      <section className="relative">
        <div className="grid grid-cols-1 lg:grid-cols-2">
          <div className="relative aspect-[4/3] sm:aspect-[16/10] lg:aspect-auto lg:min-h-[550px] xl:min-h-[600px] overflow-hidden">
            <Image
              src={c.atelierImage}
              alt={c.atelierImageAlt}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>
          <div className="bg-charcoal flex items-center px-5 sm:px-8 md:px-12 lg:px-16 py-12 sm:py-16 md:py-20">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="max-w-md"
            >
              <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                <span className="h-px w-8 sm:w-10 bg-gold/40" />
                <span className="text-gold/60 text-[9px] sm:text-[10px] tracking-[0.4em] uppercase">{c.atelierLabel}</span>
              </div>
              <h2 className="font-serif text-[1.65rem] sm:text-3xl md:text-4xl text-white leading-tight mb-4 sm:mb-6">
                {c.atelierHeading}
                <br />
                <span className="italic text-gold">{c.atelierHeadingAccent}</span>
              </h2>
              {c.atelierParagraphs.map((p, i) => (
                <p key={i} className="text-white/45 text-[13px] sm:text-[15px] leading-relaxed mb-3 sm:mb-4">{p}</p>
              ))}
              <div className="space-y-2.5 sm:space-y-3 mt-4 sm:mt-6">
                <div className="flex items-center gap-2.5 sm:gap-3 text-[12px] sm:text-[14px]">
                  <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gold/50 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                  </svg>
                  <span className="text-white/50">{sc.address}</span>
                </div>
                <div className="flex items-center gap-2.5 sm:gap-3 text-[12px] sm:text-[14px]">
                  <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gold/50 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-white/50">{sc.hours}</span>
                </div>
                <div className="flex items-center gap-2.5 sm:gap-3 text-[12px] sm:text-[14px]">
                  <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gold/50 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                  </svg>
                  <span className="text-white/50">{sc.phone}</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Promise / CTA */}
      <section className="py-14 sm:py-20 md:py-28 lg:py-36">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="max-w-3xl mx-auto text-center"
          >
            <div className="flex items-center justify-center gap-3 sm:gap-4 mb-5 sm:mb-8">
              <span className="h-px w-8 sm:w-10 bg-gold/40" />
              <span className="text-gold/60 text-[9px] sm:text-[10px] tracking-[0.4em] uppercase">{c.promiseLabel}</span>
              <span className="h-px w-8 sm:w-10 bg-gold/40" />
            </div>
            <h2 className="font-serif text-[1.65rem] sm:text-3xl md:text-4xl lg:text-5xl text-charcoal leading-tight mb-4 sm:mb-6">
              {c.promiseHeading}
              <br />
              <span className="italic text-gold">{c.promiseHeadingAccent}</span>
            </h2>
            <p className="text-charcoal/45 text-[13px] sm:text-[15px] md:text-base leading-relaxed max-w-xl mx-auto mb-8 sm:mb-12 px-2">
              {c.promiseParagraph}
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
              {isExternal(c.ctaPrimaryLink) ? (
                <a
                  href={normalizeHref(c.ctaPrimaryLink)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-center justify-center gap-2 w-full sm:w-auto px-8 sm:px-10 py-3.5 sm:py-4 bg-charcoal text-white text-[10px] sm:text-[11px] tracking-[0.2em] uppercase hover:bg-gold transition-colors duration-500 sm:min-w-[220px]"
                >
                  {c.ctaPrimaryText}
                  <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </a>
              ) : (
                <Link
                  href={`/${locale}${c.ctaPrimaryLink}`}
                  className="group inline-flex items-center justify-center gap-2 w-full sm:w-auto px-8 sm:px-10 py-3.5 sm:py-4 bg-charcoal text-white text-[10px] sm:text-[11px] tracking-[0.2em] uppercase hover:bg-gold transition-colors duration-500 sm:min-w-[220px]"
                >
                  {c.ctaPrimaryText}
                  <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </Link>
              )}
              {(() => {
                const secHref = c.ctaSecondaryLink || sc.whatsapp;
                const secExternal = isExternal(secHref);
                const SecTag = secExternal ? "a" : Link;
                return (
                  <SecTag
                    href={secExternal ? normalizeHref(secHref) : `/${locale}${secHref}`}
                    {...(secExternal ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                    className="group inline-flex items-center justify-center gap-2 w-full sm:w-auto px-8 sm:px-10 py-3.5 sm:py-4 border border-charcoal/15 text-charcoal text-[10px] sm:text-[11px] tracking-[0.2em] uppercase hover:border-gold hover:text-gold transition-all duration-500 sm:min-w-[220px]"
                  >
                    <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                    </svg>
                    {c.ctaSecondaryText}
                  </SecTag>
                );
              })()}
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
}
