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

export default function MobileNav() {
  const t = useTranslations("common");
  const locale = useLocale();
  const pathname = usePathname();

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
      href: `/${locale}/search`,
      icon: MagnifyingGlassIcon,
      activeIcon: SearchIconSolid,
    },
    {
      label: t("wishlist"),
      href: `/${locale}/wishlist`,
      icon: HeartIcon,
      activeIcon: HeartIconSolid,
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

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex flex-col items-center justify-center gap-0.5 min-w-[64px] min-h-[44px] ${
                isActive ? "text-gold" : "text-charcoal/50"
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] font-medium">{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
