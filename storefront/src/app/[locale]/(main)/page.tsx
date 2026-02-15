import Image from "next/image";
import { getTranslations } from "next-intl/server";
import EditorialBanner from "@/components/home/EditorialBanner";
import FeaturedCollections from "@/components/home/FeaturedCollections";
import NewArrivals from "@/components/home/NewArrivals";
import Newsletter from "@/components/home/Newsletter";
import ScrollReveal from "@/components/ui/ScrollReveal";
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
      {/* 1. Hero */}
      <EditorialBanner />

      {/* 2. New Arrivals */}
      <ScrollReveal>
        <NewArrivals products={newProducts} sectionNumber="01" />
      </ScrollReveal>

      {/* 3. Editorial Image Band — parallax */}
      <section className="relative h-[35vh] sm:h-[40vh] lg:h-[50vh] overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="https://ariart.shop/wp-content/uploads/2026/01/Ellea-scaled.jpg"
            alt="Handcrafted in Prishtina"
            fill
            className="object-cover object-[50%_30%]"
            sizes="100vw"
          />
        </div>
        <div className="absolute inset-0 bg-charcoal/55" />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4 z-10">
          <ScrollReveal delay={100} distance={15} duration={600}>
            <span className="block h-[2px] w-10 bg-gold mx-auto mb-5" />
          </ScrollReveal>
          <ScrollReveal delay={250} distance={20} duration={700}>
            <p className="text-2xl sm:text-3xl lg:text-[2.75rem] font-black uppercase tracking-tight text-white mb-3 leading-none">
              {t("editorialLine")}
            </p>
          </ScrollReveal>
          <ScrollReveal delay={400} distance={15} duration={700}>
            <p className="text-[11px] sm:text-xs tracking-[0.3em] uppercase text-white/40">
              {t("editorialSubline")}
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* 4. Shop by Category */}
      <ScrollReveal distance={50} duration={900}>
        <FeaturedCollections locale={locale} />
      </ScrollReveal>

      {/* 5. More to Explore */}
      <ScrollReveal>
        <NewArrivals
          products={moreProducts}
          title={t("moreToExplore")}
          showViewAll={false}
          sectionNumber="02"
        />
      </ScrollReveal>

      {/* 6. Newsletter */}
      <ScrollReveal direction="up" distance={40} duration={900}>
        <Newsletter />
      </ScrollReveal>
    </>
  );
}
