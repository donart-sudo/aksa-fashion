import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import { SITE_NAME, SITE_URL, SITE_DESCRIPTION, CONTACT_INFO } from "@/lib/constants";

const MEDUSA_URL = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000";
import EditorialBanner from "@/components/home/EditorialBanner";
import TrustBar from "@/components/home/TrustBar";
import CuratedForYou from "@/components/home/CuratedForYou";
import EditorialBand from "@/components/home/EditorialBand";
import FeaturedCollections from "@/components/home/FeaturedCollections";
import Appointment from "@/components/home/Appointment";
import MoreToDiscover from "@/components/home/MoreToDiscover";
import Testimonials from "@/components/home/Testimonials";
import AsSeenIn from "@/components/home/AsSeenIn";
import Newsletter from "@/components/home/Newsletter";
import ScrollReveal from "@/components/ui/ScrollReveal";
import { fetchNewProductsForCards, fetchProductsForCards } from "@/lib/data/medusa-products";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "common" });

  return {
    title: `${SITE_NAME} — ${t("tagline")}`,
    description: SITE_DESCRIPTION,
    alternates: {
      canonical: `${SITE_URL}/${locale}`,
    },
  };
}

/* JSON-LD structured data for LocalBusiness + Organization */
function StructuredData({ locale }: { locale: string }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ClothingStore",
    name: SITE_NAME,
    description: SITE_DESCRIPTION,
    url: `${SITE_URL}/${locale}`,
    logo: `${SITE_URL}/icons/icon-512.png`,
    image: `${MEDUSA_URL}/static/1771434664999-Crystal-Bloom-1-scaled.jpg`,
    telephone: CONTACT_INFO.phone,
    email: CONTACT_INFO.email,
    address: {
      "@type": "PostalAddress",
      addressLocality: "Prishtina",
      addressCountry: "XK",
    },
    openingHours: "Mo-Sa 10:00-20:00",
    priceRange: "€€€",
    sameAs: [
      "https://instagram.com/aksafashion",
      "https://facebook.com/aksafashion",
      "https://tiktok.com/@aksafashion",
    ],
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Bridal & Evening Wear",
      itemListElement: [
        { "@type": "OfferCatalog", name: "Bridal Gowns" },
        { "@type": "OfferCatalog", name: "Evening Dresses" },
        { "@type": "OfferCatalog", name: "Ball Gowns" },
      ],
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

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
      <StructuredData locale={locale} />

      {/* 1. Hero */}
      <EditorialBanner />

      {/* 2. Trust Bar */}
      <TrustBar />

      {/* 3. Curated for You — bento grid */}
      <ScrollReveal>
        <CuratedForYou products={newProducts} />
      </ScrollReveal>

      {/* 4. Editorial Image Band */}
      <EditorialBand />

      {/* 5. Shop by Category */}
      <ScrollReveal distance={50} duration={900}>
        <FeaturedCollections locale={locale} />
      </ScrollReveal>

      {/* 6. Appointment — primary conversion for bridal */}
      <ScrollReveal direction="up" distance={40} duration={900}>
        <Appointment />
      </ScrollReveal>

      {/* 7. More to Discover — horizontal carousel */}
      <ScrollReveal>
        <MoreToDiscover products={moreProducts} />
      </ScrollReveal>

      {/* 8–10. Unified dark section: Testimonials → Press → Newsletter */}
      <div className="bg-charcoal">
        <Testimonials />
        <AsSeenIn />
        <Newsletter />
      </div>
    </>
  );
}
