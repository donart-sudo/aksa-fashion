"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import type { AboutHeroContent } from "@/types/content-blocks";
import { DEFAULT_ABOUT_HERO } from "@/lib/data/content-defaults";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.7, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

interface Props {
  content?: AboutHeroContent;
}

export default function AboutHeroSection({ content }: Props) {
  const c = { ...DEFAULT_ABOUT_HERO, ...content };

  return (
    <>
      {/* Hero */}
      <section className="relative h-[55vh] min-h-[360px] sm:h-[65vh] md:h-[70vh] lg:h-[80vh] xl:h-[85vh] overflow-hidden">
        <Image
          src={c.heroImage}
          alt={c.heroAlt}
          fill
          className="object-cover object-top"
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 via-charcoal/30 to-charcoal/10" />
        <div className="absolute inset-0 flex items-end">
          <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8 sm:pb-14 md:pb-20 lg:pb-24">
            <motion.div initial="hidden" animate="visible" className="max-w-2xl">
              <motion.p custom={0} variants={fadeUp} className="text-gold text-[9px] sm:text-[10px] md:text-xs tracking-[0.4em] sm:tracking-[0.5em] uppercase mb-2 sm:mb-4">
                {c.tagline}
              </motion.p>
              <motion.h1 custom={1} variants={fadeUp} className="font-serif text-[1.75rem] sm:text-4xl md:text-5xl lg:text-6xl text-white leading-[1.15] sm:leading-[1.1] mb-3 sm:mb-5">
                {c.heading}
                <br />
                <span className="italic text-gold/90">{c.headingAccent}</span>
              </motion.h1>
              <motion.p custom={2} variants={fadeUp} className="text-white/60 text-[13px] sm:text-[15px] md:text-base leading-relaxed max-w-sm sm:max-w-lg">
                {c.introParagraph}
              </motion.p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Brand Intro */}
      <section className="py-14 sm:py-20 md:py-28 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 sm:gap-14 lg:gap-24 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="flex items-center gap-3 sm:gap-4 mb-5 sm:mb-8">
                <span className="h-px w-8 sm:w-10 bg-gold/40" />
                <span className="text-gold/60 text-[9px] sm:text-[10px] tracking-[0.4em] uppercase">{c.brandLabel}</span>
              </div>
              <h2 className="font-serif text-[1.65rem] sm:text-3xl md:text-4xl text-charcoal leading-tight mb-4 sm:mb-6">
                {c.brandHeading}
                <br />
                <span className="italic text-gold">{c.brandHeadingAccent}</span>
              </h2>
              <div className="space-y-4 sm:space-y-5 text-charcoal/55 leading-relaxed text-[13px] sm:text-[15px]">
                {c.brandParagraphs.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="relative"
            >
              <div className="relative aspect-[3/4] overflow-hidden">
                <Image
                  src={c.brandImage}
                  alt={c.brandImageAlt}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </div>
              <div className="absolute -bottom-4 sm:-bottom-6 left-4 sm:-left-4 md:-left-8 bg-white p-4 sm:p-5 md:p-6 shadow-lg max-w-[160px] sm:max-w-[200px] md:max-w-[240px]">
                <p className="text-gold font-serif text-xl sm:text-2xl md:text-3xl leading-none mb-1">{c.yearBadge}</p>
                <p className="text-charcoal/50 text-[9px] sm:text-[11px] tracking-wide uppercase">{c.yearBadgeLabel}</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Band */}
      <section className="bg-charcoal py-10 sm:py-14 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 lg:gap-12">
            {c.stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.6 }}
                className="text-center"
              >
                <p className="font-serif text-2xl sm:text-3xl md:text-4xl text-gold mb-0.5 sm:mb-1">{stat.number}</p>
                <p className="text-white/40 text-[9px] sm:text-[11px] tracking-[0.15em] sm:tracking-[0.2em] uppercase">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
