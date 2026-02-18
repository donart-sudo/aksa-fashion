"use client";

import Image from "next/image";
import Link from "next/link";
import { useLocale } from "next-intl";
import { motion } from "framer-motion";
import { PLACEHOLDER_IMAGES, CONTACT_INFO, SOCIAL_LINKS } from "@/lib/constants";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.7, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

const values = [
  {
    number: "01",
    title: "Handcrafted with Intention",
    description:
      "Every stitch, every bead, every fold is placed by hand in our Prishtina atelier. We don't mass-produce — we create.",
    icon: (
      <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
      </svg>
    ),
  },
  {
    number: "02",
    title: "Made to Your Measure",
    description:
      "No two women are the same, and neither are our gowns. Every dress is built from your exact measurements for a flawless fit.",
    icon: (
      <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
      </svg>
    ),
  },
  {
    number: "03",
    title: "European Fabrics",
    description:
      "We source only the finest silks, satins, tulles, and laces from trusted European mills — materials that drape, shimmer, and last.",
    icon: (
      <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
      </svg>
    ),
  },
  {
    number: "04",
    title: "Personal Styling",
    description:
      "From first WhatsApp message to final fitting, our stylists guide you through every detail. This is your dress, your way.",
    icon: (
      <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
      </svg>
    ),
  },
];

const stats = [
  { number: "2,000+", label: "Gowns Crafted" },
  { number: "35+", label: "Countries Shipped" },
  { number: "2024", label: "Founded in Prishtina" },
  { number: "100%", label: "Made to Order" },
];

const craftSteps = [
  {
    num: "01",
    title: "Select",
    desc: "European silks, satins & laces — chosen for drape and light",
    alt: "Selecting luxury fabrics",
  },
  {
    num: "02",
    title: "Measure",
    desc: "Cut from your exact body measurements — no standard sizes",
    alt: "Custom measurements and pattern cutting",
  },
  {
    num: "03",
    title: "Stitch",
    desc: "40+ hours of handwork — beading, embroidery, appliqué",
    alt: "Hand stitching and embroidery",
  },
  {
    num: "04",
    title: "Perfect",
    desc: "Final pressing, inspection & packaging — ready to wear",
    alt: "Final gown quality inspection",
  },
];

const craftImages = [
  PLACEHOLDER_IMAGES.aboutCraftsmanship,
  PLACEHOLDER_IMAGES.aboutFabric,
  PLACEHOLDER_IMAGES.aboutAtelier,
  PLACEHOLDER_IMAGES.aboutEvening,
];

export default function AboutPage() {
  const locale = useLocale();

  return (
    <div>
      {/* ── Hero ── */}
      <section className="relative h-[55vh] min-h-[360px] sm:h-[65vh] md:h-[70vh] lg:h-[80vh] xl:h-[85vh] overflow-hidden">
        <Image
          src={PLACEHOLDER_IMAGES.aboutHero}
          alt="Aksa Fashion — Elegant bridal gown"
          fill
          className="object-cover object-top"
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 via-charcoal/30 to-charcoal/10" />
        <div className="absolute inset-0 flex items-end">
          <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8 sm:pb-14 md:pb-20 lg:pb-24">
            <motion.div
              initial="hidden"
              animate="visible"
              className="max-w-2xl"
            >
              <motion.p
                custom={0}
                variants={fadeUp}
                className="text-gold text-[9px] sm:text-[10px] md:text-xs tracking-[0.4em] sm:tracking-[0.5em] uppercase mb-2 sm:mb-4"
              >
                Our Story
              </motion.p>
              <motion.h1
                custom={1}
                variants={fadeUp}
                className="font-serif text-[1.75rem] sm:text-4xl md:text-5xl lg:text-6xl text-white leading-[1.15] sm:leading-[1.1] mb-3 sm:mb-5"
              >
                Born in Prishtina,
                <br />
                <span className="italic text-gold/90">Worn Around the World</span>
              </motion.h1>
              <motion.p
                custom={2}
                variants={fadeUp}
                className="text-white/60 text-[13px] sm:text-[15px] md:text-base leading-relaxed max-w-sm sm:max-w-lg"
              >
                Aksa Fashion crafts gowns for women who refuse to blend in —
                each piece made with intention, artistry, and a deep love for
                the craft.
              </motion.p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Brand Intro ── */}
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
                <span className="text-gold/60 text-[9px] sm:text-[10px] tracking-[0.4em] uppercase">
                  The Beginning
                </span>
              </div>
              <h2 className="font-serif text-[1.65rem] sm:text-3xl md:text-4xl text-charcoal leading-tight mb-4 sm:mb-6">
                Where Tradition Meets
                <br />
                <span className="italic text-gold">Haute Couture</span>
              </h2>
              <div className="space-y-4 sm:space-y-5 text-charcoal/55 leading-relaxed text-[13px] sm:text-[15px]">
                <p>
                  Founded in the heart of Prishtina, Kosovo, Aksa Fashion was
                  born from a simple belief: every woman deserves to feel
                  extraordinary. What began as a small atelier with a handful
                  of gowns has grown into a destination for brides and
                  fashion-forward women across the Balkans, Europe, and beyond.
                </p>
                <p>
                  Our designs bridge the gap between timeless European elegance
                  and the bold, warm spirit of Kosovar craftsmanship. Each gown
                  is more than fabric and thread — it&apos;s a piece of art
                  that carries a story, your story.
                </p>
                <p>
                  We don&apos;t follow trends. We create gowns that make you
                  feel something — the moment you see it, you know it&apos;s
                  the one.
                </p>
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
                  src={PLACEHOLDER_IMAGES.aboutBride}
                  alt="Bride in handcrafted gown"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </div>
              <div className="absolute -bottom-4 sm:-bottom-6 left-4 sm:-left-4 md:-left-8 bg-white p-4 sm:p-5 md:p-6 shadow-lg max-w-[160px] sm:max-w-[200px] md:max-w-[240px]">
                <p className="text-gold font-serif text-xl sm:text-2xl md:text-3xl leading-none mb-1">
                  2024
                </p>
                <p className="text-charcoal/50 text-[9px] sm:text-[11px] tracking-wide uppercase">
                  Est. in Prishtina
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Stats Band ── */}
      <section className="bg-charcoal py-10 sm:py-14 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 lg:gap-12">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.6 }}
                className="text-center"
              >
                <p className="font-serif text-2xl sm:text-3xl md:text-4xl text-gold mb-0.5 sm:mb-1">
                  {stat.number}
                </p>
                <p className="text-white/40 text-[9px] sm:text-[11px] tracking-[0.15em] sm:tracking-[0.2em] uppercase">
                  {stat.label}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Craftsmanship — Compact Process ── */}
      <section className="py-14 sm:py-20 md:py-28 lg:py-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-10 sm:mb-14 md:mb-16"
          >
            <div className="flex items-center justify-center gap-3 sm:gap-4 mb-4 sm:mb-6">
              <span className="h-px w-8 sm:w-10 bg-gold/40" />
              <span className="text-gold/60 text-[9px] sm:text-[10px] tracking-[0.4em] uppercase">
                The Craft
              </span>
              <span className="h-px w-8 sm:w-10 bg-gold/40" />
            </div>
            <h2 className="font-serif text-[1.65rem] sm:text-3xl md:text-4xl lg:text-5xl text-charcoal mb-3 sm:mb-4">
              Every Detail, <span className="italic text-gold">By Hand</span>
            </h2>
            <p className="text-charcoal/45 text-[13px] sm:text-[15px] max-w-md mx-auto leading-relaxed px-2">
              A gown is not sewn — it is composed. Four stages, one promise:
              perfection.
            </p>
          </motion.div>

          {/* Process cards — 2x2 on mobile, 4 across on desktop */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
            {craftSteps.map((step, i) => (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{
                  delay: i * 0.1,
                  duration: 0.6,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="group relative aspect-[3/4] overflow-hidden cursor-default"
              >
                <Image
                  src={craftImages[i]}
                  alt={step.alt}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 50vw, 25vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-charcoal/90 via-charcoal/30 to-transparent" />

                {/* Step number */}
                <div className="absolute top-3 left-3 sm:top-4 sm:left-4 md:top-5 md:left-5">
                  <span className="font-serif text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-white/15 leading-none">
                    {step.num}
                  </span>
                </div>

                {/* Title + description */}
                <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 md:p-5">
                  <h3 className="font-serif text-base sm:text-lg md:text-xl text-white mb-1 sm:mb-1.5">
                    {step.title}
                  </h3>
                  <p className="text-white/50 text-[10px] sm:text-[11px] md:text-[12px] leading-relaxed line-clamp-2 sm:line-clamp-3">
                    {step.desc}
                  </p>
                  <div className="mt-2 sm:mt-3 h-px w-0 group-hover:w-full bg-gold/50 transition-all duration-500" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Values ── */}
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
              <span className="text-gold/60 text-[9px] sm:text-[10px] tracking-[0.4em] uppercase">
                What We Stand For
              </span>
              <span className="h-px w-8 sm:w-10 bg-gold/40" />
            </div>
            <h2 className="font-serif text-[1.65rem] sm:text-3xl md:text-4xl text-charcoal">
              The Aksa Difference
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 sm:gap-x-12 lg:gap-x-20 gap-y-10 sm:gap-y-14 lg:gap-y-16">
            {values.map((value, i) => (
              <motion.div
                key={value.number}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{
                  delay: i * 0.1,
                  duration: 0.6,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="group"
              >
                <div className="flex items-start gap-3.5 sm:gap-5">
                  <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center border border-gold/20 text-gold/50 group-hover:border-gold/40 group-hover:text-gold transition-all duration-500 bg-white/60">
                    {value.icon}
                  </div>
                  <div className="min-w-0">
                    <span className="text-gold/30 text-[10px] sm:text-[11px] tracking-[0.3em] uppercase">
                      {value.number}
                    </span>
                    <h3 className="font-serif text-lg sm:text-xl text-charcoal mt-0.5 sm:mt-1 mb-2 sm:mb-3">
                      {value.title}
                    </h3>
                    <p className="text-charcoal/45 text-[13px] sm:text-[14px] leading-relaxed">
                      {value.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Atelier Split ── */}
      <section className="relative">
        <div className="grid grid-cols-1 lg:grid-cols-2">
          <div className="relative aspect-[4/3] sm:aspect-[16/10] lg:aspect-auto lg:min-h-[550px] xl:min-h-[600px] overflow-hidden">
            <Image
              src="http://localhost:9000/static/1771434665097-Diva1-scaled.jpg"
              alt="Inside our Prishtina atelier — Maison gown"
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
                <span className="text-gold/60 text-[9px] sm:text-[10px] tracking-[0.4em] uppercase">
                  The Atelier
                </span>
              </div>
              <h2 className="font-serif text-[1.65rem] sm:text-3xl md:text-4xl text-white leading-tight mb-4 sm:mb-6">
                Where Every Gown
                <br />
                <span className="italic text-gold">Comes to Life</span>
              </h2>
              <p className="text-white/45 text-[13px] sm:text-[15px] leading-relaxed mb-3 sm:mb-4">
                Our Prishtina atelier is where fabric meets imagination. It&apos;s
                a space of quiet focus — where our seamstresses bring decades
                of expertise to every garment, and where you&apos;re invited to
                see your dress take shape.
              </p>
              <p className="text-white/45 text-[13px] sm:text-[15px] leading-relaxed mb-8 sm:mb-10">
                Book a private appointment to visit, try on samples, and work
                with our team to design something truly yours.
              </p>
              <div className="space-y-2.5 sm:space-y-3">
                <div className="flex items-center gap-2.5 sm:gap-3 text-[12px] sm:text-[14px]">
                  <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gold/50 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                  </svg>
                  <span className="text-white/50">{CONTACT_INFO.address}</span>
                </div>
                <div className="flex items-center gap-2.5 sm:gap-3 text-[12px] sm:text-[14px]">
                  <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gold/50 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-white/50">{CONTACT_INFO.hours}</span>
                </div>
                <div className="flex items-center gap-2.5 sm:gap-3 text-[12px] sm:text-[14px]">
                  <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gold/50 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                  </svg>
                  <span className="text-white/50">{CONTACT_INFO.phone}</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Promise / CTA ── */}
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
              <span className="text-gold/60 text-[9px] sm:text-[10px] tracking-[0.4em] uppercase">
                Our Promise
              </span>
              <span className="h-px w-8 sm:w-10 bg-gold/40" />
            </div>
            <h2 className="font-serif text-[1.65rem] sm:text-3xl md:text-4xl lg:text-5xl text-charcoal leading-tight mb-4 sm:mb-6">
              You Deserve to Feel
              <br />
              <span className="italic text-gold">Extraordinary</span>
            </h2>
            <p className="text-charcoal/45 text-[13px] sm:text-[15px] md:text-base leading-relaxed max-w-xl mx-auto mb-8 sm:mb-12 px-2">
              Whether it&apos;s your wedding day, a gala, or a moment you want
              to remember forever — we&apos;re here to make sure you feel like
              the most beautiful woman in the room.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
              <Link
                href={`/${locale}/collections`}
                className="group inline-flex items-center justify-center gap-2 w-full sm:w-auto px-8 sm:px-10 py-3.5 sm:py-4 bg-charcoal text-white text-[10px] sm:text-[11px] tracking-[0.2em] uppercase hover:bg-gold transition-colors duration-500 sm:min-w-[220px]"
              >
                Explore Collections
                <svg
                  className="w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform duration-300 group-hover:translate-x-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </Link>
              <a
                href={SOCIAL_LINKS.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center justify-center gap-2 w-full sm:w-auto px-8 sm:px-10 py-3.5 sm:py-4 border border-charcoal/15 text-charcoal text-[10px] sm:text-[11px] tracking-[0.2em] uppercase hover:border-gold hover:text-gold transition-all duration-500 sm:min-w-[220px]"
              >
                <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                Book Appointment
              </a>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
