"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import type { AboutCraftContent } from "@/types/content-blocks";
import { DEFAULT_ABOUT_CRAFT } from "@/lib/data/content-defaults";
import { PLACEHOLDER_IMAGES } from "@/lib/constants";

const craftImages = [
  PLACEHOLDER_IMAGES.aboutCraftsmanship,
  PLACEHOLDER_IMAGES.aboutFabric,
  PLACEHOLDER_IMAGES.aboutAtelier,
  PLACEHOLDER_IMAGES.aboutEvening,
];

const VALUE_ICONS: Record<string, React.ReactNode> = {
  sparkles: (
    <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
    </svg>
  ),
  person: (
    <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
    </svg>
  ),
  heart: (
    <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
    </svg>
  ),
  chat: (
    <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
    </svg>
  ),
  globe: (
    <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
    </svg>
  ),
  measure: (
    <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
    </svg>
  ),
};

interface Props {
  content?: AboutCraftContent;
}

export default function AboutCraftSection({ content }: Props) {
  const c = { ...DEFAULT_ABOUT_CRAFT, ...content };

  return (
    <>
      {/* Craftsmanship — Process */}
      <section className="py-14 sm:py-20 md:py-28 lg:py-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-10 sm:mb-14 md:mb-16"
          >
            <div className="flex items-center justify-center gap-3 sm:gap-4 mb-4 sm:mb-6">
              <span className="h-px w-8 sm:w-10 bg-gold/40" />
              <span className="text-gold/60 text-[9px] sm:text-[10px] tracking-[0.4em] uppercase">{c.craftLabel}</span>
              <span className="h-px w-8 sm:w-10 bg-gold/40" />
            </div>
            <h2 className="font-serif text-[1.65rem] sm:text-3xl md:text-4xl lg:text-5xl text-charcoal mb-3 sm:mb-4">
              {c.craftHeading} <span className="italic text-gold">{c.craftHeadingAccent}</span>
            </h2>
            <p className="text-charcoal/45 text-[13px] sm:text-[15px] max-w-md mx-auto leading-relaxed px-2">{c.craftDescription}</p>
          </motion.div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
            {c.craftSteps.map((step, i) => (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ delay: i * 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className="group relative aspect-[3/4] overflow-hidden cursor-default"
              >
                <Image
                  src={craftImages[i] || craftImages[0]}
                  alt={step.title}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 50vw, 25vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-charcoal/90 via-charcoal/30 to-transparent" />
                <div className="absolute top-3 left-3 sm:top-4 sm:left-4 md:top-5 md:left-5">
                  <span className="font-serif text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-white/15 leading-none">{step.num}</span>
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 md:p-5">
                  <h3 className="font-serif text-base sm:text-lg md:text-xl text-white mb-1 sm:mb-1.5">{step.title}</h3>
                  <p className="text-white/50 text-[10px] sm:text-[11px] md:text-[12px] leading-relaxed line-clamp-2 sm:line-clamp-3">{step.desc}</p>
                  <div className="mt-2 sm:mt-3 h-px w-0 group-hover:w-full bg-gold/50 transition-all duration-500" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-14 sm:py-20 md:py-28 lg:py-32 bg-[#f5f0eb]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-10 sm:mb-16 md:mb-20"
          >
            <div className="flex items-center justify-center gap-3 sm:gap-4 mb-4 sm:mb-6">
              <span className="h-px w-8 sm:w-10 bg-gold/40" />
              <span className="text-gold/60 text-[9px] sm:text-[10px] tracking-[0.4em] uppercase">{c.valuesLabel}</span>
              <span className="h-px w-8 sm:w-10 bg-gold/40" />
            </div>
            <h2 className="font-serif text-[1.65rem] sm:text-3xl md:text-4xl text-charcoal">{c.valuesHeading}</h2>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 sm:gap-x-12 lg:gap-x-20 gap-y-10 sm:gap-y-14 lg:gap-y-16">
            {c.values.map((value, i) => (
              <motion.div
                key={value.number}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: i * 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className="group"
              >
                <div className="flex items-start gap-3.5 sm:gap-5">
                  <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center border border-gold/20 text-gold/50 group-hover:border-gold/40 group-hover:text-gold transition-all duration-500 bg-white/60">
                    {VALUE_ICONS[value.iconKey] || VALUE_ICONS.sparkles}
                  </div>
                  <div className="min-w-0">
                    <span className="text-gold/30 text-[10px] sm:text-[11px] tracking-[0.3em] uppercase">{value.number}</span>
                    <h3 className="font-serif text-lg sm:text-xl text-charcoal mt-0.5 sm:mt-1 mb-2 sm:mb-3">{value.title}</h3>
                    <p className="text-charcoal/45 text-[13px] sm:text-[14px] leading-relaxed">{value.description}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
