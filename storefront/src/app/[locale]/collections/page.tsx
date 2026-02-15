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
      <nav className="flex items-center gap-2 text-[11px] text-charcoal/40 pt-6 pb-4 tracking-wide">
        <Link
          href={`/${locale}`}
          className="hover:text-charcoal transition-colors"
        >
          {t("common.home")}
        </Link>
        <span className="text-charcoal/20">/</span>
        <span className="text-charcoal font-medium">
          {t("common.collections")}
        </span>
      </nav>

      {/* Header */}
      <div className="text-center pt-4 pb-10 lg:pb-14">
        <h1 className="text-[1.75rem] sm:text-[2.25rem] lg:text-[2.75rem] font-black uppercase tracking-tight text-charcoal leading-none">
          {t("common.collections")}
        </h1>
        <p className="text-xs sm:text-sm text-charcoal/35 tracking-wide mt-3">
          {t("home.featuredSubtitle")}
        </p>
      </div>

      {/* Category grid — first item spans full width */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4 pb-12 lg:pb-20">
        {displayCategories.map(
          (col, i) =>
            col.image && (
              <Link
                key={col.handle}
                href={`/${locale}/collections/${col.handle}`}
                className={`group block relative overflow-hidden ${
                  i === 0
                    ? "col-span-2 lg:col-span-2 aspect-[16/9] lg:aspect-[2/1]"
                    : "aspect-[3/4]"
                }`}
              >
                <Image
                  src={col.image}
                  alt={col.title}
                  fill
                  className="object-cover object-top transition-transform duration-[1200ms] ease-out group-hover:scale-[1.04]"
                  sizes={
                    i === 0
                      ? "(max-width: 768px) 100vw, 66vw"
                      : "(max-width: 768px) 50vw, 33vw"
                  }
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent group-hover:from-black/70 transition-all duration-500" />

                <div className="absolute bottom-0 left-0 right-0 p-4 lg:p-6">
                  <h2
                    className={`font-black uppercase tracking-tight text-white leading-none mb-1.5 ${
                      i === 0
                        ? "text-xl sm:text-2xl lg:text-3xl"
                        : "text-base lg:text-xl"
                    }`}
                  >
                    {col.title}
                  </h2>
                  <div className="flex items-center gap-3">
                    <span className="text-[11px] text-white/45 tracking-wide">
                      {col.count}{" "}
                      {col.count === 1
                        ? t("common.product")
                        : t("common.products")}
                    </span>
                    <span className="text-[11px] text-white/35 group-hover:text-white transition-colors tracking-[0.15em] uppercase">
                      {t("common.viewAll")} →
                    </span>
                  </div>
                </div>
              </Link>
            )
        )}
      </div>
    </div>
  );
}
