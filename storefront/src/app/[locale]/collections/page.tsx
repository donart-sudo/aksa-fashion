import { getTranslations } from "next-intl/server";
import Link from "next/link";
import Image from "next/image";
import {
  fetchCategories,
  fetchProductsByCategory,
} from "@/lib/data/medusa-products";

export default async function CollectionsPage() {
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
      <h1 className="font-serif text-4xl lg:text-5xl text-charcoal mb-4 text-center">
        {t("common.collections")}
      </h1>
      <p className="text-charcoal/60 text-center mb-12 max-w-md mx-auto">
        {t("home.featuredSubtitle")}
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
        {displayCategories.map(
          (col) =>
            col.image && (
              <Link
                key={col.handle}
                href={`collections/${col.handle}`}
                className="group block relative aspect-[3/4] overflow-hidden"
              >
                <Image
                  src={col.image}
                  alt={col.title}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-charcoal/70 via-charcoal/10 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6 lg:p-8">
                  <h2 className="font-serif text-2xl lg:text-3xl text-white mb-1">
                    {col.title}
                  </h2>
                  <p className="text-sm text-white/60 mb-2">
                    {col.count} products
                  </p>
                  <span className="text-sm text-white/70 tracking-wider uppercase group-hover:text-gold transition-colors">
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
