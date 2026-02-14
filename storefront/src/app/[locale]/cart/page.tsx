"use client";

import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";
import Button from "@/components/ui/Button";
import { ShoppingBagIcon } from "@heroicons/react/24/outline";

export default function CartPage() {
  const t = useTranslations();
  const locale = useLocale();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
      <h1 className="font-serif text-3xl lg:text-4xl text-charcoal mb-8">
        {t("cart.title")}
      </h1>

      {/* Empty state */}
      <div className="text-center py-16">
        <ShoppingBagIcon className="w-16 h-16 text-soft-gray mx-auto mb-4" />
        <p className="text-charcoal/60 mb-6">{t("cart.empty")}</p>
        <Link href={`/${locale}/collections`}>
          <Button variant="primary">{t("common.continueShopping")}</Button>
        </Link>
      </div>
    </div>
  );
}
