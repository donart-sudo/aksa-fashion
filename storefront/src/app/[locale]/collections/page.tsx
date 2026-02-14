import { getTranslations } from "next-intl/server";
import Link from "next/link";
import Image from "next/image";
import {
  fetchCategories,
  fetchProductsByCategory,
} from "@/lib/data/medusa-products";

export default async function CollectionsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations();

  const categories = await fetchCategories();

  const displayCategories = await Promise.all(
    categories.map(async (cat) => {
      const products = await fetchProductsByCategory(cat.handle);
      return {
        ...cat,
        image: products[0]?.images[0] || "",
        count: products.length,
      };
    })
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-xs text-charcoal/50 pt-6 pb-4 tracking-wide">
        <Link
          href={`/${locale}`}
          className="hover:text-charcoal transition-colors"
        >
          {t("common.home")}
        </Link>
        <span className="text-charcoal/25">/</span>
        <span className="text-charcoal font-medium">
          {t("common.collections")}
        </span>
      </nav>

      {/* Editorial header */}
      <div className="pb-8 lg:pb-12 border-b border-soft-gray/40">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-charcoal leading-tight">
              {t("common.collections")}
            </h1>
            <p className="text-sm text-charcoal/60 mt-2">
              {t("home.featuredSubtitle")}
            </p>
          </div>
          <span className="hidden sm:block h-[2px] w-12 bg-gold mb-3" />
        </div>
      </div>

      {/* Category grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-5 py-8 lg:py-12">
        {displayCategories.map(
          (col, i) =>
            col.image && (
              <Link
                key={col.handle}
                href={`/${locale}/collections/${col.handle}`}
                className="group block relative aspect-[3/4] overflow-hidden"
              >
                <Image
                  src={col.image}
                  alt={col.title}
                  fill
                  className="object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-[1.06]"
                  sizes="(max-width: 768px) 50vw, 33vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/15 to-transparent group-hover:from-black/75 transition-all duration-500" />

                {/* Ghost number */}
                <span className="absolute top-4 right-5 lg:top-6 lg:right-7 font-serif text-[3rem] lg:text-[4rem] leading-none text-white/[0.08] select-none tabular-nums">
                  {String(i + 1).padStart(2, "0")}
                </span>

                <div className="absolute bottom-0 left-0 right-0 p-4 lg:p-6">
                  <span className="block h-[2px] w-5 bg-gold mb-2.5 group-hover:w-8 transition-all duration-500" />
                  <h2 className="font-serif text-lg lg:text-2xl text-white leading-tight mb-1">
                    {col.title}
                  </h2>
                  <p className="text-xs text-white/50 font-medium mb-1.5">
                    {col.count} {col.count === 1 ? t("common.product") : t("common.products")}
                  </p>
                  <span className="text-xs text-white/60 tracking-widest uppercase group-hover:text-gold font-medium transition-colors">
                    {t("common.viewAll")} →
                  </span>
                </div>
              </Link>
            )
        )}
      </div>
    </div>
  );
}
