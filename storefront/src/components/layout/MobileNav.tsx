"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import {
  HomeIcon,
  MagnifyingGlassIcon,
  HeartIcon,
  UserIcon,
  Squares2X2Icon,
} from "@heroicons/react/24/outline";
import {
  HomeIcon as HomeIconSolid,
  MagnifyingGlassIcon as SearchIconSolid,
  HeartIcon as HeartIconSolid,
  UserIcon as UserIconSolid,
  Squares2X2Icon as ShopIconSolid,
} from "@heroicons/react/24/solid";
import { useWishlist } from "@/lib/wishlist";
import { useSearch } from "@/lib/search";

export default function MobileNav() {
  const t = useTranslations("common");
  const locale = useLocale();
  const pathname = usePathname();
  const { itemCount: wishlistCount } = useWishlist();
  const { openSearch } = useSearch();

  const tabs = [
    {
      label: t("home"),
      href: `/${locale}`,
      icon: HomeIcon,
      activeIcon: HomeIconSolid,
    },
    {
      label: t("shop"),
      href: `/${locale}/collections`,
      icon: Squares2X2Icon,
      activeIcon: ShopIconSolid,
    },
    {
      label: t("search"),
      href: "#search",
      icon: MagnifyingGlassIcon,
      activeIcon: SearchIconSolid,
      action: openSearch,
    },
    {
      label: t("wishlist"),
      href: `/${locale}/wishlist`,
      icon: HeartIcon,
      activeIcon: HeartIconSolid,
      badge: wishlistCount,
    },
    {
      label: t("account"),
      href: `/${locale}/account`,
      icon: UserIcon,
      activeIcon: UserIconSolid,
    },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-soft-gray/50 safe-area-pb">
      <div className="flex items-center justify-around h-16">
        {tabs.map((tab) => {
          const isActive =
            tab.href === `/${locale}`
              ? pathname === `/${locale}` || pathname === `/${locale}/`
              : pathname.startsWith(tab.href);
          const Icon = isActive ? tab.activeIcon : tab.icon;

          if (tab.action) {
            return (
              <button
                key={tab.label}
                onClick={tab.action}
                className="flex flex-col items-center justify-center gap-0.5 min-w-[64px] min-h-[44px] text-charcoal/50 active:scale-95 transition-transform"
              >
                <Icon className="w-5 h-5" />
                <span className="text-[10px] font-medium">{tab.label}</span>
              </button>
            );
          }

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`relative flex flex-col items-center justify-center gap-0.5 min-w-[64px] min-h-[44px] active:scale-95 transition-transform ${
                isActive ? "text-gold" : "text-charcoal/50"
              }`}
            >
              <div className="relative w-6 h-6 flex items-center justify-center">
                <Icon className="w-5 h-5" />
                {tab.badge && tab.badge > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-gold rounded-full w-2 h-2" />
                )}
              </div>
              <span className="text-[10px] font-medium">{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
