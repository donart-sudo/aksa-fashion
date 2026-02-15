"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { AnimatePresence, motion } from "framer-motion";
import {
  MagnifyingGlassIcon,
  ShoppingBagIcon,
  HeartIcon,
  UserIcon,
  Bars3Icon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import LanguageSwitcher from "./LanguageSwitcher";
import { useCart } from "@/lib/cart";
import { useWishlist } from "@/lib/wishlist";
import { useSearch } from "@/lib/search";

const NAV_LINKS = [
  { key: "shop", handle: "collections", isDynamic: true },
  { key: "newCollection", handle: "collections/new" },
  { key: "bridalGowns", handle: "collections/bridal" },
  { key: "eveningDress", handle: "collections/evening-dress" },
  { key: "ballGown", handle: "collections/ball-gown" },
] as const;

export default function Header() {
  const t = useTranslations();
  const locale = useLocale();
  const { openCart, itemCount } = useCart();
  const { itemCount: wishlistCount } = useWishlist();
  const { isOpen: searchOpen, openSearch, closeSearch } = useSearch();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleScroll = useCallback(() => {
    setScrolled(window.scrollY > 80);
  }, []);

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

  return (
    <>
      {/* Top nav bar — scrolls away */}
      <nav className="hidden lg:block bg-charcoal z-[70]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center gap-0 py-3">
            {NAV_LINKS.map((link, i) => (
              <span key={link.key} className="flex items-center flex-shrink-0">
                {i > 0 && (
                  <span className="text-white/15 mx-4 select-none">/</span>
                )}
                <Link
                  href={`/${locale}/${link.handle}`}
                  className="relative px-3 py-1.5 text-[11px] font-medium tracking-widest uppercase text-white/60 hover:text-white transition-colors duration-300 whitespace-nowrap group"
                >
                  {t(
                    link.key === "shop"
                      ? "common.shop"
                      : `nav.${link.key}`
                  )}
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 h-[1.5px] w-0 bg-gold group-hover:w-full transition-all duration-400" />
                </Link>
              </span>
            ))}
          </div>
        </div>
      </nav>

      <header
        className={`sticky top-0 z-[70] transition-all duration-300 ${
          scrolled
            ? "bg-white/95 backdrop-blur-md shadow-[0_1px_0_rgba(0,0,0,0.04)]"
            : "bg-cream"
        }`}
      >
        {/* Main row — balanced: icons left | logo center | icons right */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div
            className={`flex items-center justify-between transition-all duration-300 ${
              scrolled ? "h-11" : "h-14 lg:h-16"
            }`}
          >
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

              {/* Search — always visible */}
              <button
                onClick={searchOpen ? closeSearch : openSearch}
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
            <Link href={`/${locale}`} className="flex-shrink-0">
              <h1
                className={`text-charcoal leading-none transition-all duration-300 ${
                  scrolled ? "text-[26px]" : "text-[26px] lg:text-[30px]"
                }`}
              >
                <span className="font-black tracking-tight">aksa</span>
                <span className="font-extralight tracking-tight">fashion</span>
              </h1>
            </Link>

            {/* Right icons */}
            <div className="flex items-center justify-end flex-1 min-w-0">
              {/* Account — desktop */}
              <Link
                href={`/${locale}/account`}
                className="hidden lg:block p-2.5 text-charcoal/70 hover:text-charcoal transition-colors"
                aria-label={t("common.account")}
              >
                <UserIcon className="w-[22px] h-[22px]" />
              </Link>

              {/* Wishlist — desktop */}
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

              {/* Cart — always visible */}
              <button
                onClick={openCart}
                className="p-2.5 text-charcoal/70 hover:text-charcoal transition-colors relative"
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

      {/* Mobile slide-out menu */}
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
              <div className="flex items-center justify-between px-7 h-[72px] flex-shrink-0">
                <Link
                  href={`/${locale}`}
                  onClick={() => setMobileMenuOpen(false)}
                  className="font-serif text-[22px] tracking-[0.3em] text-charcoal"
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

              {/* Primary nav — same as desktop header */}
              <nav className="flex-1 overflow-y-auto">
                <div className="px-7 pt-2 pb-6">
                  {NAV_LINKS.map((link, i) => (
                    <motion.div
                      key={link.key}
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 + i * 0.04, duration: 0.3 }}
                    >
                      <Link
                        href={`/${locale}/${link.handle}`}
                        onClick={() => setMobileMenuOpen(false)}
                        className="block py-4 text-[18px] tracking-[0.08em] text-charcoal hover:text-gold transition-colors border-b border-charcoal/[0.06]"
                      >
                        {t(
                          link.key === "shop"
                            ? "common.shop"
                            : `nav.${link.key}`
                        )}
                      </Link>
                    </motion.div>
                  ))}
                </div>

                {/* Secondary links */}
                <div className="px-7 pb-6">
                  <p className="text-[10px] tracking-[0.2em] uppercase text-charcoal/30 mb-3">
                    {t("search.browseCollections")}
                  </p>
                  {[
                    { key: "capeAndTrain", handle: "collections/cape-and-train-elegance" },
                    { key: "royalOverTrain", handle: "collections/royal-over-train" },
                    { key: "silhouetteWhisper", handle: "collections/silhouette-whisper" },
                    { key: "ruffledDream", handle: "collections/ruffled-dream" },
                  ].map((item) => (
                    <Link
                      key={item.key}
                      href={`/${locale}/${item.handle}`}
                      onClick={() => setMobileMenuOpen(false)}
                      className="block py-2.5 text-[14px] text-charcoal/45 hover:text-charcoal transition-colors"
                    >
                      {t(`nav.${item.key}`)}
                    </Link>
                  ))}
                </div>
              </nav>

              {/* Footer actions */}
              <div className="border-t border-charcoal/[0.06] px-7 py-5 flex-shrink-0 bg-white/50">
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
