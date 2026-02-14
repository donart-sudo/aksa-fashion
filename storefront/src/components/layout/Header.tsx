"use client";

import { useState } from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
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

export default function Header() {
  const t = useTranslations();
  const locale = useLocale();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { openCart, itemCount } = useCart();

  const navItems = [
    { label: t("nav.bridalGowns"), href: `/${locale}/collections/bridal` },
    { label: t("nav.eveningWear"), href: `/${locale}/collections/evening` },
    { label: t("nav.accessories"), href: `/${locale}/collections/accessories` },
    { label: t("nav.newCollection"), href: `/${locale}/collections/new` },
    { label: t("nav.saleItems"), href: `/${locale}/collections/sale` },
  ];

  return (
    <>
      <header className="sticky top-0 z-50 bg-cream/95 backdrop-blur-md border-b border-soft-gray/50">
        {/* Top bar */}
        <div className="hidden md:block bg-charcoal text-warm-white text-center py-2 text-xs tracking-widest uppercase">
          {t("cart.freeShippingMessage")}
        </div>

        {/* Main header */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 -ml-2"
              aria-label="Open menu"
            >
              <Bars3Icon className="w-6 h-6" />
            </button>

            {/* Logo */}
            <Link href={`/${locale}`} className="flex-shrink-0">
              <h1 className="font-serif text-2xl lg:text-3xl tracking-wider text-charcoal">
                AKSA
              </h1>
              <p className="text-[10px] tracking-[0.3em] text-gold uppercase -mt-1 hidden sm:block">
                Fashion
              </p>
            </Link>

            {/* Desktop navigation */}
            <nav className="hidden lg:flex items-center gap-8">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-sm tracking-wide text-charcoal/80 hover:text-gold transition-colors duration-300 uppercase"
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-3 sm:gap-4">
              <LanguageSwitcher />
              <Link
                href={`/${locale}/search`}
                className="p-2 hover:text-gold transition-colors"
                aria-label={t("common.search")}
              >
                <MagnifyingGlassIcon className="w-5 h-5" />
              </Link>
              <Link
                href={`/${locale}/wishlist`}
                className="p-2 hover:text-gold transition-colors hidden sm:block"
                aria-label={t("common.wishlist")}
              >
                <HeartIcon className="w-5 h-5" />
              </Link>
              <Link
                href={`/${locale}/account`}
                className="p-2 hover:text-gold transition-colors hidden sm:block"
                aria-label={t("common.account")}
              >
                <UserIcon className="w-5 h-5" />
              </Link>
              <button
                onClick={openCart}
                className="p-2 hover:text-gold transition-colors relative"
                aria-label={t("common.cart")}
              >
                <ShoppingBagIcon className="w-5 h-5" />
                {itemCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-gold text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center">
                    {itemCount > 9 ? "9+" : itemCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile menu overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 z-50 lg:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "tween", duration: 0.3 }}
              className="fixed top-0 left-0 bottom-0 w-80 bg-cream z-50 lg:hidden overflow-y-auto"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="font-serif text-2xl tracking-wider">AKSA</h2>
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-2"
                    aria-label={t("common.close")}
                  >
                    <XMarkIcon className="w-6 h-6" />
                  </button>
                </div>
                <nav className="flex flex-col gap-4">
                  {navItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className="text-lg tracking-wide text-charcoal/80 hover:text-gold transition-colors py-2 border-b border-soft-gray/30"
                    >
                      {item.label}
                    </Link>
                  ))}
                </nav>
                <div className="mt-8 pt-8 border-t border-soft-gray/30">
                  <Link
                    href={`/${locale}/about`}
                    onClick={() => setMobileMenuOpen(false)}
                    className="block py-2 text-charcoal/60 hover:text-gold"
                  >
                    {t("common.about")}
                  </Link>
                  <Link
                    href={`/${locale}/contact`}
                    onClick={() => setMobileMenuOpen(false)}
                    className="block py-2 text-charcoal/60 hover:text-gold"
                  >
                    {t("common.contact")}
                  </Link>
                  <Link
                    href={`/${locale}/faq`}
                    onClick={() => setMobileMenuOpen(false)}
                    className="block py-2 text-charcoal/60 hover:text-gold"
                  >
                    {t("common.faq")}
                  </Link>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
