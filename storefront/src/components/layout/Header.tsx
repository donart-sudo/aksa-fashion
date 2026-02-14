"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import {
  MagnifyingGlassIcon,
  ShoppingBagIcon,
  HeartIcon,
  UserIcon,
} from "@heroicons/react/24/outline";
import LanguageSwitcher from "./LanguageSwitcher";
import ShopDropdown from "./ShopDropdown";
import { useCart } from "@/lib/cart";
import { useWishlist } from "@/lib/wishlist";
import { useSearch } from "@/lib/search";

export default function Header() {
  const t = useTranslations();
  const locale = useLocale();
  const { openCart, itemCount } = useCart();
  const { itemCount: wishlistCount } = useWishlist();
  const { openSearch } = useSearch();

  return (
    <header className="sticky top-0 z-50 bg-cream/95 backdrop-blur-md shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 lg:h-16">
          {/* Left: Shop dropdown (desktop only) */}
          <div className="hidden lg:flex items-center gap-8 w-1/3">
            <ShopDropdown />
            <Link
              href={`/${locale}/collections/new`}
              className="text-sm tracking-wide text-charcoal/80 hover:text-gold transition-colors uppercase"
            >
              {t("nav.newCollection")}
            </Link>
          </div>

          {/* Mobile spacer */}
          <div className="w-1/3 lg:hidden" />

          {/* Center: Logo */}
          <Link href={`/${locale}`} className="flex-shrink-0 text-center">
            <h1 className="font-serif text-xl sm:text-2xl lg:text-3xl tracking-wider text-charcoal">
              AKSA
            </h1>
            <p className="text-[9px] tracking-[0.3em] text-gold uppercase -mt-0.5 hidden sm:block">
              Fashion
            </p>
          </Link>

          {/* Right: Actions */}
          <div className="flex items-center justify-end gap-2 sm:gap-3 w-1/3">
            {/* Desktop-only actions */}
            <div className="hidden lg:contents">
              <LanguageSwitcher />
              <button
                onClick={openSearch}
                className="p-2 hover:text-gold transition-colors"
                aria-label={t("common.search")}
              >
                <MagnifyingGlassIcon className="w-5 h-5" />
              </button>
              <Link
                href={`/${locale}/wishlist`}
                className="p-2 hover:text-gold transition-colors relative"
                aria-label={t("common.wishlist")}
              >
                <HeartIcon className="w-5 h-5" />
                {wishlistCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-gold text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center">
                    {wishlistCount > 9 ? "9+" : wishlistCount}
                  </span>
                )}
              </Link>
              <Link
                href={`/${locale}/account`}
                className="p-2 hover:text-gold transition-colors"
                aria-label={t("common.account")}
              >
                <UserIcon className="w-5 h-5" />
              </Link>
            </div>

            {/* Cart: always visible */}
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
  );
}
