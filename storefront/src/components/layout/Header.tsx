"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { AnimatePresence, motion } from "framer-motion";
import {
  MagnifyingGlassIcon,
  ShoppingBagIcon,
  HeartIcon,
  UserIcon,
  Bars3Icon,
  XMarkIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/outline";
import LanguageSwitcher from "./LanguageSwitcher";
import { useCart } from "@/lib/cart";
import { useWishlist } from "@/lib/wishlist";
import { useSearch } from "@/lib/search";

/* ── Navigation structure ── */
const PAGE_LINKS = [
  { key: "home", handle: "" },
  { key: "about", handle: "about" },
  { key: "contact", handle: "contact" },
] as const;

const COLLECTION_LINKS = [
  { key: "newCollection", handle: "collections/new" },
  { key: "bridalGowns", handle: "collections/bridal" },
  { key: "eveningDress", handle: "collections/evening-dress" },
  { key: "ballGown", handle: "collections/ball-gown" },
  { key: "capeAndTrain", handle: "collections/cape-and-train-elegance" },
  { key: "royalOverTrain", handle: "collections/royal-over-train" },
  { key: "silhouetteWhisper", handle: "collections/silhouette-whisper" },
  { key: "ruffledDream", handle: "collections/ruffled-dream" },
] as const;

export default function Header() {
  const t = useTranslations();
  const locale = useLocale();
  const pathname = usePathname();
  const { openCart, itemCount } = useCart();
  const { itemCount: wishlistCount } = useWishlist();
  const { isOpen: searchOpen, openSearch, closeSearch } = useSearch();
  const [scrolled, setScrolled] = useState(false);
  const [showSuperSticky, setShowSuperSticky] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [shopOpen, setShopOpen] = useState(false);
  const [mobileShopOpen, setMobileShopOpen] = useState(false);
  const [hoveredCollection, setHoveredCollection] = useState("bridalGowns");
  const shopTimeout = useRef<ReturnType<typeof setTimeout>>(undefined);
  const shopRef = useRef<HTMLDivElement>(null);
  const superStickyShopRef = useRef<HTMLDivElement>(null);
  const searchFromStickyRef = useRef(false);

  const collectionImages: Record<string, string> = {
    newCollection: "https://ariart.shop/wp-content/uploads/2026/01/Crystal-Bloom-1-scaled.jpg",
    bridalGowns: "https://ariart.shop/wp-content/uploads/2026/01/Snow-1-scaled.jpg",
    eveningDress: "https://ariart.shop/wp-content/uploads/2026/01/Ellea-scaled.jpg",
    ballGown: "https://ariart.shop/wp-content/uploads/2026/01/Royal-Lilac-Aura-scaled.jpg",
    capeAndTrain: "https://ariart.shop/wp-content/uploads/2026/01/Golden-Dawn-scaled.jpg",
    royalOverTrain: "https://ariart.shop/wp-content/uploads/2026/01/Midnight-Gold-scaled.jpg",
    silhouetteWhisper: "https://ariart.shop/wp-content/uploads/2026/01/Verdant-Grace-scaled.jpg",
    ruffledDream: "https://ariart.shop/wp-content/uploads/2026/01/Solar-Elegance-scaled.jpg",
  };

  const isActive = useCallback(
    (handle: string) => {
      if (handle === "") {
        return pathname === `/${locale}` || pathname === `/${locale}/`;
      }
      const linkPath = `/${locale}/${handle}`;
      if (handle === "collections") {
        return pathname === linkPath || pathname === `${linkPath}/`;
      }
      return pathname.startsWith(linkPath);
    },
    [locale, pathname]
  );

  const isShopActive = useCallback(() => {
    return pathname.startsWith(`/${locale}/collections`);
  }, [locale, pathname]);

  const handleScroll = useCallback(() => {
    const y = window.scrollY;
    setScrolled(y > 80);
    const shouldShow = y > 100;
    setShowSuperSticky(shouldShow);
    // Close search on scroll
    if (searchOpen) closeSearch();
  }, [searchOpen, closeSearch]);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        openSearch();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [openSearch]);

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  /* Shop dropdown hover handlers */
  const openShopDropdown = useCallback(() => {
    if (shopTimeout.current) clearTimeout(shopTimeout.current);
    setShopOpen(true);
  }, []);

  const closeShopDropdown = useCallback(() => {
    shopTimeout.current = setTimeout(() => setShopOpen(false), 200);
  }, []);

  const getLabel = useCallback(
    (key: string) => {
      if (key === "home") return t("common.home");
      if (key === "shop") return t("common.shop");
      if (key === "about") return t("common.about");
      if (key === "contact") return t("common.contact");
      return t(`nav.${key}`);
    },
    [t]
  );

  return (
    <>
      {/* ═══ Desktop top nav bar ═══ */}
      <nav className="hidden lg:block bg-charcoal z-[70]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center gap-0 py-3">
            {/* Home */}
            {PAGE_LINKS.filter((l) => l.key === "home").map((link) => {
              const active = isActive(link.handle);
              return (
                <Link
                  key={link.key}
                  href={`/${locale}`}
                  className={`relative px-3 py-1.5 text-[11px] font-medium tracking-widest uppercase transition-colors duration-300 whitespace-nowrap group ${
                    active ? "text-gold" : "text-white/60 hover:text-white"
                  }`}
                >
                  {getLabel(link.key)}
                  <span
                    className={`absolute bottom-0 left-1/2 -translate-x-1/2 h-[1.5px] bg-gold transition-all duration-400 ${
                      active ? "w-full" : "w-0 group-hover:w-full"
                    }`}
                  />
                </Link>
              );
            })}

            <span className="text-white/15 mx-4 select-none">/</span>

            {/* Shop dropdown */}
            <div
              ref={shopRef}
              className="relative"
              onMouseEnter={openShopDropdown}
              onMouseLeave={closeShopDropdown}
            >
              <Link
                href={`/${locale}/collections`}
                className={`relative flex items-center gap-1 px-3 py-1.5 text-[11px] font-medium tracking-widest uppercase transition-colors duration-300 whitespace-nowrap group ${
                  isShopActive() ? "text-gold" : "text-white/60 hover:text-white"
                }`}
              >
                {getLabel("shop")}
                <ChevronDownIcon
                  className={`w-3 h-3 transition-transform duration-200 ${
                    shopOpen ? "rotate-180" : ""
                  }`}
                />
                <span
                  className={`absolute bottom-0 left-1/2 -translate-x-1/2 h-[1.5px] bg-gold transition-all duration-400 ${
                    isShopActive() ? "w-full" : "w-0 group-hover:w-full"
                  }`}
                />
              </Link>

              {/* Mega dropdown (only when super sticky is hidden) */}
              <AnimatePresence>
                {shopOpen && !showSuperSticky && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 6 }}
                    transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                    className="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-[520px] bg-white shadow-[0_20px_60px_rgba(0,0,0,0.1)] border border-charcoal/[0.06] z-[80]"
                  >
                    {/* Arrow */}
                    <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-l border-t border-charcoal/[0.06] rotate-45" />

                    <div className="relative flex">
                      {/* Left: collection links */}
                      <div className="flex-1 py-5 pr-0">
                        <Link
                          href={`/${locale}/collections`}
                          onClick={() => setShopOpen(false)}
                          className="flex items-center justify-between px-6 py-2 mb-1 group"
                        >
                          <span className={`text-[11px] tracking-[0.2em] uppercase font-semibold transition-colors ${
                            isActive("collections") ? "text-gold" : "text-charcoal group-hover:text-gold"
                          }`}>
                            {t("common.allCollections")}
                          </span>
                          <svg className="w-3.5 h-3.5 text-charcoal/20 group-hover:text-gold group-hover:translate-x-0.5 transition-all duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                          </svg>
                        </Link>

                        <div className="mx-6 h-px bg-charcoal/[0.05] mb-2" />

                        {COLLECTION_LINKS.map((link, i) => {
                          const active = isActive(link.handle);
                          return (
                            <motion.div
                              key={link.key}
                              initial={{ opacity: 0, x: -8 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.05 + i * 0.03, duration: 0.25 }}
                            >
                              <Link
                                href={`/${locale}/${link.handle}`}
                                onClick={() => setShopOpen(false)}
                                onMouseEnter={() => setHoveredCollection(link.key)}
                                className={`flex items-center gap-3 px-6 py-2.5 transition-all duration-200 group/item ${
                                  active
                                    ? "text-gold"
                                    : "text-charcoal/55 hover:text-charcoal hover:bg-cream/60"
                                }`}
                              >
                                <span className={`w-1 h-1 rounded-full transition-all duration-200 ${
                                  active ? "bg-gold scale-125" : "bg-charcoal/15 group-hover/item:bg-gold group-hover/item:scale-125"
                                }`} />
                                <span className={`text-[12px] tracking-[0.05em] transition-colors duration-200 ${
                                  active ? "font-medium" : ""
                                }`}>
                                  {getLabel(link.key)}
                                </span>
                                {link.key === "newCollection" && (
                                  <span className="text-[8px] tracking-wider font-bold bg-gold/10 text-gold px-1.5 py-0.5 uppercase">
                                    New
                                  </span>
                                )}
                              </Link>
                            </motion.div>
                          );
                        })}
                      </div>

                      {/* Right: preview image */}
                      <div className="w-[200px] m-4 ml-0 relative overflow-hidden bg-[#f0eeeb]">
                        <motion.div
                          key={hoveredCollection}
                          initial={{ opacity: 0, scale: 1.05 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.4 }}
                          className="absolute inset-0"
                        >
                          <Image
                            src={collectionImages[hoveredCollection] || collectionImages.bridalGowns}
                            alt=""
                            fill
                            className="object-cover object-top"
                            sizes="200px"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                        </motion.div>
                        <div className="absolute bottom-3 left-3 right-3 z-10">
                          <span className="text-[10px] tracking-[0.2em] uppercase text-white/70 font-medium">
                            {getLabel(hoveredCollection)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <span className="text-white/15 mx-4 select-none">/</span>

            {/* About & Contact */}
            {PAGE_LINKS.filter((l) => l.key !== "home").map((link, i) => {
              const active = isActive(link.handle);
              return (
                <span key={link.key} className="flex items-center flex-shrink-0">
                  {i > 0 && (
                    <span className="text-white/15 mx-4 select-none">/</span>
                  )}
                  <Link
                    href={`/${locale}/${link.handle}`}
                    className={`relative px-3 py-1.5 text-[11px] font-medium tracking-widest uppercase transition-colors duration-300 whitespace-nowrap group ${
                      active ? "text-gold" : "text-white/60 hover:text-white"
                    }`}
                  >
                    {getLabel(link.key)}
                    <span
                      className={`absolute bottom-0 left-1/2 -translate-x-1/2 h-[1.5px] bg-gold transition-all duration-400 ${
                        active ? "w-full" : "w-0 group-hover:w-full"
                      }`}
                    />
                  </Link>
                </span>
              );
            })}
          </div>
        </div>
      </nav>

      {/* ═══ Sticky header ═══ */}
      <header
        className={`sticky top-0 lg:static z-[70] transition-all duration-300 border-b ${
          scrolled
            ? "bg-white/95 backdrop-blur-md border-charcoal/[0.08]"
            : "bg-cream border-soft-gray/60"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 lg:h-16">
            {/* Left icons */}
            <div className="flex items-center flex-1 min-w-0">
              {/* Hamburger — mobile */}
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="lg:hidden flex items-center gap-1.5 p-2 -ml-2 text-charcoal/70 hover:text-charcoal transition-colors"
                aria-label="Menu"
              >
                <Bars3Icon className="w-6 h-6" />
                <span className="text-[11px] tracking-[0.12em] uppercase hidden sm:inline">
                  Menu
                </span>
              </button>

              {/* Search */}
              <button
                onClick={() => { searchFromStickyRef.current = false; searchOpen ? closeSearch() : openSearch(); }}
                className="flex items-center gap-2 px-3 py-2 text-charcoal/70 hover:text-charcoal transition-colors"
                aria-label={searchOpen ? t("common.close") : t("common.search")}
              >
                {searchOpen ? (
                  <XMarkIcon className="w-[22px] h-[22px]" />
                ) : (
                  <MagnifyingGlassIcon className="w-[22px] h-[22px]" />
                )}
                <span className="text-[12px] tracking-[0.12em] uppercase">
                  {searchOpen ? t("common.close") : t("common.search")}
                </span>
              </button>

              {/* Language — desktop */}
              <div className="hidden lg:block">
                <LanguageSwitcher />
              </div>
            </div>

            {/* Center: Logo */}
            <Link href={`/${locale}`} className="flex-shrink-0" aria-label="Aksa Fashion — Home">
              <span className="text-charcoal leading-none block text-[26px] lg:text-[30px]">
                <span className="font-black tracking-tight">aksa</span>
                <span className="font-extralight tracking-tight">fashion</span>
              </span>
            </Link>

            {/* Right icons */}
            <div className="flex items-center justify-end flex-1 min-w-0">
              <Link
                href={`/${locale}/account`}
                className="hidden lg:block p-2.5 text-charcoal/70 hover:text-charcoal transition-colors"
                aria-label={t("common.account")}
              >
                <UserIcon className="w-[22px] h-[22px]" />
              </Link>

              <Link
                href={`/${locale}/wishlist`}
                className="hidden lg:block p-2.5 text-charcoal/70 hover:text-charcoal transition-colors relative"
                aria-label={t("common.wishlist")}
              >
                <HeartIcon className="w-[22px] h-[22px]" />
                {wishlistCount > 0 && (
                  <span className="absolute top-1 right-1 bg-charcoal text-white text-[8px] font-medium rounded-full w-4 h-4 flex items-center justify-center">
                    {wishlistCount > 9 ? "9+" : wishlistCount}
                  </span>
                )}
              </Link>

              <button
                onClick={openCart}
                className="p-2.5 text-charcoal/70 hover:text-charcoal transition-colors relative cursor-pointer"
                aria-label={t("common.cart")}
              >
                <ShoppingBagIcon className="w-[22px] h-[22px]" />
                {itemCount > 0 && (
                  <span className="absolute top-1 right-1 bg-charcoal text-white text-[8px] font-medium rounded-full w-4 h-4 flex items-center justify-center">
                    {itemCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ═══ Super sticky header (desktop only, scroll-triggered) ═══ */}
      <div
        data-super-sticky
        className="fixed top-0 left-0 right-0 z-[75] hidden lg:block"
        style={{
          transform: showSuperSticky ? "translateY(0)" : "translateY(-100%)",
          transition: "transform 400ms cubic-bezier(0.22, 1, 0.36, 1)",
        }}
      >
        <div className="bg-white/95 backdrop-blur-md shadow-[0_2px_20px_rgba(0,0,0,0.08)] border-b border-charcoal/[0.06]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="relative flex items-center h-14">
              {/* Left: Nav links */}
              <nav className="flex items-center gap-0">
                {/* Home */}
                {PAGE_LINKS.filter((l) => l.key === "home").map((link) => {
                  const active = isActive(link.handle);
                  return (
                    <Link
                      key={link.key}
                      href={`/${locale}`}
                      className={`relative px-3 py-1.5 text-[11px] font-medium tracking-widest uppercase transition-colors duration-300 whitespace-nowrap group ${
                        active ? "text-gold" : "text-charcoal/50 hover:text-charcoal"
                      }`}
                    >
                      {getLabel(link.key)}
                      <span
                        className={`absolute bottom-0 left-1/2 -translate-x-1/2 h-[1.5px] bg-gold transition-all duration-400 ${
                          active ? "w-full" : "w-0 group-hover:w-full"
                        }`}
                      />
                    </Link>
                  );
                })}

                <span className="text-charcoal/10 mx-2 select-none">/</span>

                {/* Shop dropdown */}
                <div
                  ref={superStickyShopRef}
                  className="relative"
                  onMouseEnter={openShopDropdown}
                  onMouseLeave={closeShopDropdown}
                >
                  <Link
                    href={`/${locale}/collections`}
                    className={`relative flex items-center gap-1 px-3 py-1.5 text-[11px] font-medium tracking-widest uppercase transition-colors duration-300 whitespace-nowrap group ${
                      isShopActive() ? "text-gold" : "text-charcoal/50 hover:text-charcoal"
                    }`}
                  >
                    {getLabel("shop")}
                    <ChevronDownIcon
                      className={`w-3 h-3 transition-transform duration-200 ${
                        shopOpen ? "rotate-180" : ""
                      }`}
                    />
                    <span
                      className={`absolute bottom-0 left-1/2 -translate-x-1/2 h-[1.5px] bg-gold transition-all duration-400 ${
                        isShopActive() ? "w-full" : "w-0 group-hover:w-full"
                      }`}
                    />
                  </Link>

                  {/* Mega dropdown (same content as top nav) */}
                  <AnimatePresence>
                    {shopOpen && showSuperSticky && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 6 }}
                        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                        className="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-[520px] bg-white shadow-[0_20px_60px_rgba(0,0,0,0.1)] border border-charcoal/[0.06] z-[80]"
                      >
                        {/* Arrow */}
                        <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-l border-t border-charcoal/[0.06] rotate-45" />

                        <div className="relative flex">
                          {/* Left: collection links */}
                          <div className="flex-1 py-5 pr-0">
                            <Link
                              href={`/${locale}/collections`}
                              onClick={() => setShopOpen(false)}
                              className="flex items-center justify-between px-6 py-2 mb-1 group"
                            >
                              <span className={`text-[11px] tracking-[0.2em] uppercase font-semibold transition-colors ${
                                isActive("collections") ? "text-gold" : "text-charcoal group-hover:text-gold"
                              }`}>
                                {t("common.allCollections")}
                              </span>
                              <svg className="w-3.5 h-3.5 text-charcoal/20 group-hover:text-gold group-hover:translate-x-0.5 transition-all duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                              </svg>
                            </Link>

                            <div className="mx-6 h-px bg-charcoal/[0.05] mb-2" />

                            {COLLECTION_LINKS.map((link, i) => {
                              const active = isActive(link.handle);
                              return (
                                <motion.div
                                  key={link.key}
                                  initial={{ opacity: 0, x: -8 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: 0.05 + i * 0.03, duration: 0.25 }}
                                >
                                  <Link
                                    href={`/${locale}/${link.handle}`}
                                    onClick={() => setShopOpen(false)}
                                    onMouseEnter={() => setHoveredCollection(link.key)}
                                    className={`flex items-center gap-3 px-6 py-2.5 transition-all duration-200 group/item ${
                                      active
                                        ? "text-gold"
                                        : "text-charcoal/55 hover:text-charcoal hover:bg-cream/60"
                                    }`}
                                  >
                                    <span className={`w-1 h-1 rounded-full transition-all duration-200 ${
                                      active ? "bg-gold scale-125" : "bg-charcoal/15 group-hover/item:bg-gold group-hover/item:scale-125"
                                    }`} />
                                    <span className={`text-[12px] tracking-[0.05em] transition-colors duration-200 ${
                                      active ? "font-medium" : ""
                                    }`}>
                                      {getLabel(link.key)}
                                    </span>
                                    {link.key === "newCollection" && (
                                      <span className="text-[8px] tracking-wider font-bold bg-gold/10 text-gold px-1.5 py-0.5 uppercase">
                                        New
                                      </span>
                                    )}
                                  </Link>
                                </motion.div>
                              );
                            })}
                          </div>

                          {/* Right: preview image */}
                          <div className="w-[200px] m-4 ml-0 relative overflow-hidden bg-[#f0eeeb]">
                            <motion.div
                              key={hoveredCollection}
                              initial={{ opacity: 0, scale: 1.05 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ duration: 0.4 }}
                              className="absolute inset-0"
                            >
                              <Image
                                src={collectionImages[hoveredCollection] || collectionImages.bridalGowns}
                                alt=""
                                fill
                                className="object-cover object-top"
                                sizes="200px"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                            </motion.div>
                            <div className="absolute bottom-3 left-3 right-3 z-10">
                              <span className="text-[10px] tracking-[0.2em] uppercase text-white/70 font-medium">
                                {getLabel(hoveredCollection)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <span className="text-charcoal/10 mx-2 select-none">/</span>

                {/* About & Contact */}
                {PAGE_LINKS.filter((l) => l.key !== "home").map((link, i) => {
                  const active = isActive(link.handle);
                  return (
                    <span key={link.key} className="flex items-center flex-shrink-0">
                      {i > 0 && (
                        <span className="text-charcoal/10 mx-2 select-none">/</span>
                      )}
                      <Link
                        href={`/${locale}/${link.handle}`}
                        className={`relative px-3 py-1.5 text-[11px] font-medium tracking-widest uppercase transition-colors duration-300 whitespace-nowrap group ${
                          active ? "text-gold" : "text-charcoal/50 hover:text-charcoal"
                        }`}
                      >
                        {getLabel(link.key)}
                        <span
                          className={`absolute bottom-0 left-1/2 -translate-x-1/2 h-[1.5px] bg-gold transition-all duration-400 ${
                            active ? "w-full" : "w-0 group-hover:w-full"
                          }`}
                        />
                      </Link>
                    </span>
                  );
                })}
              </nav>

              {/* Center: Logo (absolutely centered) */}
              <Link
                href={`/${locale}`}
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
                aria-label="Aksa Fashion — Home"
              >
                <span className="text-charcoal leading-none block text-[22px]">
                  <span className="font-black tracking-tight">aksa</span>
                  <span className="font-extralight tracking-tight">fashion</span>
                </span>
              </Link>

              {/* Right: Icons */}
              <div className="flex items-center gap-0.5 ml-auto">
                {/* Search */}
                <button
                  onClick={() => { searchFromStickyRef.current = true; searchOpen ? closeSearch() : openSearch(); }}
                  className="p-2 text-charcoal/50 hover:text-charcoal transition-colors"
                  aria-label={searchOpen ? t("common.close") : t("common.search")}
                >
                  {searchOpen ? (
                    <XMarkIcon className="w-[18px] h-[18px]" />
                  ) : (
                    <MagnifyingGlassIcon className="w-[18px] h-[18px]" />
                  )}
                </button>

                {/* Wishlist */}
                <Link
                  href={`/${locale}/wishlist`}
                  className="p-2 text-charcoal/50 hover:text-charcoal transition-colors relative"
                  aria-label={t("common.wishlist")}
                >
                  <HeartIcon className="w-[18px] h-[18px]" />
                  {wishlistCount > 0 && (
                    <span className="absolute top-0.5 right-0.5 bg-gold text-white text-[7px] font-bold rounded-full w-3.5 h-3.5 flex items-center justify-center">
                      {wishlistCount > 9 ? "9+" : wishlistCount}
                    </span>
                  )}
                </Link>

                {/* Cart */}
                <button
                  onClick={openCart}
                  className="p-2 text-charcoal/50 hover:text-charcoal transition-colors relative cursor-pointer"
                  aria-label={t("common.cart")}
                >
                  <ShoppingBagIcon className="w-[18px] h-[18px]" />
                  {itemCount > 0 && (
                    <span className="absolute top-0.5 right-0.5 bg-gold text-white text-[7px] font-bold rounded-full w-3.5 h-3.5 flex items-center justify-center">
                      {itemCount}
                    </span>
                  )}
                </button>

                {/* Language */}
                <div className="ml-1">
                  <LanguageSwitcher />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ═══ Mobile slide-out menu ═══ */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="fixed inset-0 z-[60] bg-black/30 backdrop-blur-[2px]"
              onClick={() => setMobileMenuOpen(false)}
            />

            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="fixed top-0 left-0 bottom-0 z-[61] w-[85%] max-w-[380px] bg-cream flex flex-col"
            >
              {/* Menu header */}
              <div className="flex items-center justify-between px-6 sm:px-7 h-[64px] sm:h-[72px] flex-shrink-0">
                <Link
                  href={`/${locale}`}
                  onClick={() => setMobileMenuOpen(false)}
                  className="font-serif text-[20px] sm:text-[22px] tracking-[0.3em] text-charcoal"
                >
                  AKSA
                </Link>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 -mr-2 text-charcoal/50 hover:text-charcoal transition-colors"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>

              {/* Navigation */}
              <nav className="flex-1 overflow-y-auto">
                {/* Page links — Home, About, Contact */}
                <div className="px-6 sm:px-7 pt-2 pb-4">
                  <p className="text-[9px] sm:text-[10px] tracking-[0.2em] uppercase text-charcoal/30 mb-2">
                    Pages
                  </p>
                  {PAGE_LINKS.map((link, i) => {
                    const active = isActive(link.handle);
                    return (
                      <motion.div
                        key={link.key}
                        initial={{ opacity: 0, x: -12 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 + i * 0.04, duration: 0.3 }}
                      >
                        <Link
                          href={link.handle ? `/${locale}/${link.handle}` : `/${locale}`}
                          onClick={() => setMobileMenuOpen(false)}
                          className={`block py-3 sm:py-3.5 text-[16px] sm:text-[18px] tracking-[0.06em] transition-colors border-b border-charcoal/[0.06] ${
                            active
                              ? "text-gold font-medium"
                              : "text-charcoal hover:text-gold"
                          }`}
                        >
                          {getLabel(link.key)}
                        </Link>
                      </motion.div>
                    );
                  })}
                </div>

                {/* Shop / Collections */}
                <div className="px-6 sm:px-7 pb-4">
                  <motion.div
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.22, duration: 0.3 }}
                  >
                    <button
                      onClick={() => setMobileShopOpen(!mobileShopOpen)}
                      className={`flex items-center justify-between w-full py-3 sm:py-3.5 text-[16px] sm:text-[18px] tracking-[0.06em] transition-colors border-b border-charcoal/[0.06] ${
                        isShopActive()
                          ? "text-gold font-medium"
                          : "text-charcoal"
                      }`}
                    >
                      {getLabel("shop")}
                      <ChevronDownIcon
                        className={`w-4 h-4 text-charcoal/30 transition-transform duration-300 ${
                          mobileShopOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                  </motion.div>

                  {/* Expandable collection list */}
                  <AnimatePresence>
                    {mobileShopOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                        className="overflow-hidden"
                      >
                        <div className="pt-1 pb-2 pl-3 sm:pl-4">
                          {/* All collections */}
                          <Link
                            href={`/${locale}/collections`}
                            onClick={() => setMobileMenuOpen(false)}
                            className={`block py-2 sm:py-2.5 text-[13px] sm:text-[14px] transition-colors border-l-2 pl-3 ${
                              isActive("collections")
                                ? "text-gold border-gold font-medium"
                                : "text-charcoal/50 border-charcoal/[0.08] hover:text-charcoal hover:border-charcoal/20"
                            }`}
                          >
                            {t("common.allCollections")}
                          </Link>
                          {COLLECTION_LINKS.map((link) => {
                            const active = isActive(link.handle);
                            return (
                              <Link
                                key={link.key}
                                href={`/${locale}/${link.handle}`}
                                onClick={() => setMobileMenuOpen(false)}
                                className={`block py-2 sm:py-2.5 text-[13px] sm:text-[14px] transition-colors border-l-2 pl-3 ${
                                  active
                                    ? "text-gold border-gold font-medium"
                                    : "text-charcoal/50 border-charcoal/[0.08] hover:text-charcoal hover:border-charcoal/20"
                                }`}
                              >
                                {getLabel(link.key)}
                              </Link>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </nav>

              {/* Footer actions */}
              <div className="border-t border-charcoal/[0.06] px-6 sm:px-7 py-4 sm:py-5 flex-shrink-0 bg-white/50">
                <div className="flex items-center justify-between">
                  <LanguageSwitcher />
                  <div className="flex items-center gap-1">
                    <Link
                      href={`/${locale}/account`}
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 text-charcoal/50 hover:text-charcoal transition-colors"
                    >
                      <UserIcon className="w-5 h-5" />
                      <span className="text-[11px] tracking-[0.1em] uppercase">
                        {t("common.account")}
                      </span>
                    </Link>
                    <Link
                      href={`/${locale}/wishlist`}
                      onClick={() => setMobileMenuOpen(false)}
                      className="p-2 text-charcoal/50 hover:text-charcoal transition-colors relative"
                    >
                      <HeartIcon className="w-5 h-5" />
                      {wishlistCount > 0 && (
                        <span className="absolute -top-0.5 -right-0.5 bg-charcoal text-white text-[8px] rounded-full w-4 h-4 flex items-center justify-center">
                          {wishlistCount > 9 ? "9+" : wishlistCount}
                        </span>
                      )}
                    </Link>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
