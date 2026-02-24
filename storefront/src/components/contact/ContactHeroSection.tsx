"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import type { ContactHeroContent } from "@/types/content-blocks";
import { DEFAULT_CONTACT_HERO } from "@/lib/data/content-defaults";
import { useSiteConstants } from "@/lib/site-constants";

const fadeUp = {
  hidden: { opacity: 0, y: 25 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.6, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

interface Props {
  content?: ContactHeroContent;
}

export default function ContactHeroSection({ content }: Props) {
  const c = { ...DEFAULT_CONTACT_HERO, ...content };
  const sc = useSiteConstants();

  const contactMethods = [
    {
      icon: (
        <svg className="w-5 h-5 sm:w-5.5 sm:h-5.5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
      ),
      label: "WhatsApp",
      value: sc.phone,
      description: "Fastest response — most brides prefer this",
      href: sc.whatsapp,
      external: true,
    },
    {
      icon: (
        <svg className="w-5 h-5 sm:w-5.5 sm:h-5.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
        </svg>
      ),
      label: "Email",
      value: sc.email,
      description: "For detailed inquiries and custom orders",
      href: `mailto:${sc.email}`,
      external: false,
    },
    {
      icon: (
        <svg className="w-5 h-5 sm:w-5.5 sm:h-5.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
        </svg>
      ),
      label: "Phone",
      value: sc.phone,
      description: "Available during business hours",
      href: `tel:${sc.phone.replace(/\s/g, "")}`,
      external: false,
    },
    {
      icon: (
        <svg className="w-5 h-5 sm:w-5.5 sm:h-5.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
        </svg>
      ),
      label: "Visit Us",
      value: "Prishtina",
      description: sc.address,
      href: "https://maps.google.com/?q=Prishtina+Kosovo",
      external: true,
    },
  ];

  return (
    <>
      {/* Hero */}
      <section className="relative h-[38vh] min-h-[260px] sm:h-[42vh] sm:min-h-[300px] md:h-[48vh] md:min-h-[340px] lg:h-[55vh] lg:min-h-[400px] xl:h-[60vh] xl:min-h-[440px] overflow-hidden">
        <Image
          src={c.heroImage}
          alt={c.heroAlt}
          fill
          className="object-cover object-top"
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 via-charcoal/40 to-charcoal/20" />
        <div className="absolute inset-0 flex items-end">
          <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 pb-6 sm:pb-10 md:pb-14 lg:pb-18 xl:pb-20">
            <motion.div initial="hidden" animate="visible">
              <motion.p custom={0} variants={fadeUp} className="text-gold text-[8px] sm:text-[9px] md:text-[10px] lg:text-xs tracking-[0.35em] sm:tracking-[0.4em] md:tracking-[0.5em] uppercase mb-1.5 sm:mb-2 md:mb-3">
                {c.tagline}
              </motion.p>
              <motion.h1 custom={1} variants={fadeUp} className="font-serif text-[1.5rem] sm:text-[1.75rem] md:text-4xl lg:text-5xl xl:text-6xl text-white leading-[1.15] sm:leading-[1.1] mb-1.5 sm:mb-2 md:mb-4">
                {c.heading}
                <br />
                <span className="italic text-gold/90">{c.headingAccent}</span>
              </motion.h1>
              <motion.p custom={2} variants={fadeUp} className="text-white/50 text-[12px] sm:text-[13px] md:text-[14px] lg:text-[15px] leading-relaxed max-w-[280px] sm:max-w-sm md:max-w-md lg:max-w-lg">
                {c.introParagraph}
              </motion.p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Contact Methods */}
      <section className="py-10 sm:py-14 md:py-20 lg:py-24 xl:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5 lg:gap-6">
            {contactMethods.map((method, i) => (
              <motion.a
                key={method.label}
                href={method.href}
                target={method.external ? "_blank" : undefined}
                rel={method.external ? "noopener noreferrer" : undefined}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="group relative bg-white border border-charcoal/[0.06] p-4 sm:p-5 md:p-6 hover:border-gold/30 hover:shadow-lg transition-all duration-500 cursor-pointer min-h-[140px] sm:min-h-[160px]"
              >
                <div className="w-9 h-9 sm:w-10 sm:h-10 md:w-11 md:h-11 flex items-center justify-center bg-cream text-gold/60 group-hover:bg-gold group-hover:text-white transition-all duration-500 mb-3 sm:mb-4 md:mb-5">
                  {method.icon}
                </div>
                <p className="text-[9px] sm:text-[10px] md:text-[11px] tracking-[0.2em] uppercase text-charcoal/30 mb-0.5 sm:mb-1">{method.label}</p>
                <p className="font-serif text-base sm:text-lg md:text-xl text-charcoal mb-1.5 sm:mb-2 group-hover:text-gold transition-colors duration-300 break-words">{method.value}</p>
                <p className="text-[10px] sm:text-[11px] md:text-[12px] text-charcoal/40 leading-relaxed">{method.description}</p>
                <div className="absolute top-4 right-4 sm:top-5 sm:right-5 md:top-6 md:right-6 text-charcoal/10 group-hover:text-gold/40 transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
                  <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
                  </svg>
                </div>
              </motion.a>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
