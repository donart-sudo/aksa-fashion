"use client";

import { useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useInView } from "framer-motion";
import { useLocale, useTranslations } from "next-intl";

interface CategoryDisplay {
  handle: string;
  title: string;
  image: string;
  secondImage?: string;
  count: number;
}

// Stagger-reveal wrapper
function RevealItem({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{ duration: 0.65, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Decorative ornament
function Ornament() {
  return (
    <div className="flex items-center justify-center gap-3 my-1">
      <span className="block w-8 h-px bg-gold/40" />
      <span className="block w-1.5 h-1.5 rotate-45 border border-gold/50" />
      <span className="block w-8 h-px bg-gold/40" />
    </div>
  );
}

// Category card
function CategoryCard({
  category,
  locale,
  size,
  index,
}: {
  category: CategoryDisplay;
  locale: string;
  size: "large" | "normal";
  index: number;
}) {
  const t = useTranslations();

  return (
    <RevealItem delay={index * 0.06}>
      <Link
        href={`/${locale}/collections/${category.handle}`}
        className="group block relative overflow-hidden h-full"
      >
        {/* On mobile: all cards col-span-1, same aspect-[3/4]
            On desktop: normal = aspect-[3/4], large (col-span-2) = aspect-[3/2]
            This keeps row heights equal: 1col * 4/3 = 2col * 2/3 */}
        <div
          className={`relative overflow-hidden h-full ${
            size === "large"
              ? "aspect-[3/4] lg:aspect-[3/2]"
              : "aspect-[3/4]"
          }`}
        >
          <Image
            src={category.image}
            alt={category.title}
            fill
            className="object-cover object-top transition-all duration-[1400ms] ease-out group-hover:scale-[1.05]"
            sizes={
              size === "large"
                ? "(max-width: 768px) 100vw, 66vw"
                : "(max-width: 768px) 50vw, 33vw"
            }
          />

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/15 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

          {/* Content */}
          <div className="absolute inset-0 flex flex-col justify-end p-4 sm:p-5 lg:p-7">
            <div>
              <h2
                className={`font-serif font-semibold text-white leading-[1.1] mb-1.5 transition-transform duration-500 group-hover:-translate-y-0.5 ${
                  size === "large"
                    ? "text-xl sm:text-2xl lg:text-4xl"
                    : "text-base sm:text-lg lg:text-2xl"
                }`}
              >
                {category.title}
              </h2>

              <div className="flex items-center gap-3">
                <span className="text-[11px] text-white/45 tracking-wider">
                  {category.count}{" "}
                  {category.count === 1
                    ? t("common.product")
                    : t("common.products")}
                </span>
                <span className="flex items-center gap-1 text-[11px] tracking-[0.12em] uppercase text-white/0 group-hover:text-white/70 transition-all duration-500">
                  {t("common.viewAll")}
                  <svg
                    className="w-3 h-3 transition-transform duration-500 group-hover:translate-x-0.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </span>
              </div>

              {/* Gold accent line on hover */}
              <div className="mt-2.5 h-[1.5px] w-0 bg-gold/50 group-hover:w-12 transition-all duration-700 ease-out" />
            </div>
          </div>
        </div>
      </Link>
    </RevealItem>
  );
}

// Promise badges — no refunds, so we highlight positive brand values
const PROMISE_ITEMS = [
  {
    // Sparkle — handcrafted
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
      </svg>
    ),
    label: "Handcrafted in Prishtina",
  },
  {
    // Ruler — made to order
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5M9 11.25v1.5M12 9v3.75m3-6v6" />
      </svg>
    ),
    label: "Made to Your Measure",
  },
  {
    // Globe — worldwide shipping
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
      </svg>
    ),
    label: "Worldwide Shipping",
  },
  {
    // Chat — WhatsApp styling service
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
      </svg>
    ),
    label: "Personal Styling Advice",
  },
];

export default function CollectionsShowcase({
  categories,
}: {
  categories: CategoryDisplay[];
}) {
  const locale = useLocale();
  const t = useTranslations();
  const heroRef = useRef(null);
  const heroInView = useInView(heroRef, { once: true });

  // Separate hero from the rest
  const heroCategory = categories[0];
  const remaining = categories.slice(1);

  // Zigzag pattern for desktop (3-col grid):
  // Row A: [span-2, span-1]  Row B: [span-1, span-2]  — repeating
  // Cycle every 4 items: [2, 1, 1, 2] columns on lg
  // On mobile: flat 2-col grid, all items equal — no gaps
  const isWide = (i: number) => i % 4 === 0 || i % 4 === 3;

  return (
    <div>
      {/* ─── Hero Section ─── */}
      <section ref={heroRef} className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 lg:pt-12">
          {/* Breadcrumbs */}
          <motion.nav
            initial={{ opacity: 0 }}
            animate={heroInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex items-center gap-2 text-[11px] text-charcoal/40 tracking-wide mb-6 lg:mb-8"
          >
            <Link href={`/${locale}`} className="hover:text-charcoal transition-colors">
              {t("common.home")}
            </Link>
            <span className="text-charcoal/20">/</span>
            <span className="text-charcoal font-medium">{t("common.collections")}</span>
          </motion.nav>

          {/* Heading — tight spacing */}
          <div className="text-center max-w-2xl mx-auto mb-6 lg:mb-8">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={heroInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            >
              <span className="inline-block text-[10px] sm:text-[11px] tracking-[0.3em] uppercase text-gold/80 font-medium mb-3">
                {t("home.editorialLine")}
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={heroInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="font-serif text-[2rem] sm:text-[2.75rem] lg:text-[3.25rem] font-semibold text-charcoal leading-[1.05] tracking-tight"
            >
              {t("common.collections")}
            </motion.h1>

            <motion.div
              initial={{ opacity: 0 }}
              animate={heroInView ? { opacity: 1 } : {}}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="mt-3"
            >
              <Ornament />
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={heroInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="text-[13px] sm:text-sm text-charcoal/40 tracking-wide mt-3 leading-relaxed max-w-md mx-auto"
            >
              {t("home.featuredSubtitle")}
            </motion.p>
          </div>
        </div>
      </section>

      {/* ─── Hero Category (full-width banner) ─── */}
      {heroCategory?.image && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-3 lg:mb-4">
          <RevealItem>
            <Link
              href={`/${locale}/collections/${heroCategory.handle}`}
              className="group block relative overflow-hidden"
            >
              <div className="relative aspect-[3/4] sm:aspect-[16/9] lg:aspect-[2.2/1] overflow-hidden">
                <Image
                  src={heroCategory.image}
                  alt={heroCategory.title}
                  fill
                  priority
                  className="object-cover object-top transition-all duration-[1400ms] ease-out group-hover:scale-[1.04]"
                  sizes="(max-width: 768px) 100vw, 90vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/15 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

                <div className="absolute inset-0 flex flex-col justify-end p-5 sm:p-7 lg:p-10">
                  <h2 className="font-serif font-semibold text-white text-2xl sm:text-3xl lg:text-5xl leading-[1.1] mb-2 transition-transform duration-500 group-hover:-translate-y-0.5">
                    {heroCategory.title}
                  </h2>
                  <div className="flex items-center gap-3">
                    <span className="text-[11px] text-white/45 tracking-wider">
                      {heroCategory.count}{" "}
                      {heroCategory.count === 1 ? t("common.product") : t("common.products")}
                    </span>
                    <span className="flex items-center gap-1 text-[11px] tracking-[0.12em] uppercase text-white/0 group-hover:text-white/70 transition-all duration-500">
                      {t("common.viewAll")}
                      <svg className="w-3 h-3 transition-transform duration-500 group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                      </svg>
                    </span>
                  </div>
                  <div className="mt-2.5 h-[1.5px] w-0 bg-gold/50 group-hover:w-14 transition-all duration-700 ease-out" />
                </div>
              </div>
            </Link>
          </RevealItem>
        </section>
      )}

      {/* ─── Metro Grid ─── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-6 lg:pb-10">
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4">
          {remaining.map(
            (cat, i) =>
              cat.image && (
                <div
                  key={cat.handle}
                  className={isWide(i) ? "lg:col-span-2" : "col-span-1"}
                >
                  <CategoryCard
                    category={cat}
                    locale={locale}
                    size={isWide(i) ? "large" : "normal"}
                    index={i + 1}
                  />
                </div>
              )
          )}
        </div>
      </section>

      {/* ─── View All CTA ─── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10 lg:pb-14">
        <RevealItem>
          <div className="text-center">
            <Link
              href={`/${locale}/collections/all`}
              className="inline-flex items-center gap-3 px-10 py-4 border border-charcoal/15 text-[12px] font-medium tracking-[0.15em] uppercase text-charcoal hover:bg-charcoal hover:text-white transition-all duration-400 group"
            >
              {t("common.viewAll")} {t("common.collections")}
              <svg
                className="w-4 h-4 transition-transform duration-400 group-hover:translate-x-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </Link>
          </div>
        </RevealItem>
      </section>

      {/* ─── The Aksa Promise ─── */}
      <section className="border-t border-soft-gray/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14">
          <RevealItem>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
              {PROMISE_ITEMS.map((item) => (
                <div
                  key={item.label}
                  className="flex flex-col items-center text-center gap-2.5"
                >
                  <span className="text-gold/70">{item.icon}</span>
                  <span className="text-[11px] tracking-[0.1em] uppercase text-charcoal/45 font-medium">
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </RevealItem>
        </div>
      </section>
    </div>
  );
}
