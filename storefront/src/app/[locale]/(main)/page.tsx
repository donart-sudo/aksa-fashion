import Image from "next/image";
import { getTranslations } from "next-intl/server";
import EditorialBanner from "@/components/home/EditorialBanner";
import CategoryBar from "@/components/home/CategoryBar";
import FeaturedCollections from "@/components/home/FeaturedCollections";
import NewArrivals from "@/components/home/NewArrivals";
import Newsletter from "@/components/home/Newsletter";
import { fetchNewProductsForCards, fetchProductsForCards } from "@/lib/data/medusa-products";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations("home");

  const [newProducts, moreProducts] = await Promise.all([
    fetchNewProductsForCards(12),
    fetchProductsForCards(12),
  ]);

  return (
    <>
      {/* 1. Cinematic Editorial Hero */}
      <EditorialBanner />

      {/* 2. Category Quick-Links */}
      <CategoryBar locale={locale} />

      {/* 3. New Arrivals */}
      <NewArrivals products={newProducts} sectionNumber="01" />

      {/* 4. Editorial Image Band — full-bleed divider */}
      <section className="relative h-[30vh] sm:h-[35vh] lg:h-[40vh] overflow-hidden">
        <Image
          src="https://ariart.shop/wp-content/uploads/2026/01/Arbennelle-Gold-1-scaled.jpg"
          alt="Handcrafted in Prishtina"
          fill
          className="object-cover object-[50%_40%]"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-charcoal/50" />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
          <span className="block h-[2px] w-10 bg-gold mb-5" />
          <p className="font-serif text-2xl sm:text-3xl lg:text-4xl text-white mb-2">
            {t("editorialLine")}
          </p>
          <p className="text-xs sm:text-sm tracking-[0.3em] uppercase text-white/50">
            {t("editorialSubline")}
          </p>
        </div>
      </section>

      {/* 5. Shop by Category — asymmetric mosaic */}
      <FeaturedCollections locale={locale} />

      {/* 6. More to Explore */}
      <NewArrivals
        products={moreProducts}
        title={t("moreToExplore")}
        showViewAll={false}
        sectionNumber="02"
      />

      {/* 7. Newsletter — editorial split */}
      <Newsletter />
    </>
  );
}
