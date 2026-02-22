import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import { SITE_NAME, SITE_URL, SITE_DESCRIPTION } from "@/lib/constants";
import { getSiteConstants } from "@/lib/data/content-blocks";
import { cdnUrl } from "@/lib/cdn-image-urls";
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
import EditableSection from "@/components/editor/EditableSection";
import { fetchNewProductsForCards, fetchProductsForCards } from "@/lib/data/supabase-products";
import { getContentBlocks } from "@/lib/data/content-blocks";
import type {
  HeroContent,
  TrustBarContent,
  EditorialBandContent,
  FeaturedCollectionsContent,
  AppointmentContent,
  TestimonialsContent,
  AsSeenInContent,
  NewsletterContent,
} from "@/types/content-blocks";

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
function StructuredData({ locale, contactInfo }: { locale: string; contactInfo: { email: string; phone: string; address: string; hours: string } }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ClothingStore",
    name: SITE_NAME,
    description: SITE_DESCRIPTION,
    url: `${SITE_URL}/${locale}`,
    logo: `${SITE_URL}/icons/icon-512.png`,
    image: cdnUrl("allure-bridals-a1400-01.jpg"),
    telephone: contactInfo.phone,
    email: contactInfo.email,
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

  const [newProducts, moreProducts, contentMap, sc] = await Promise.all([
    fetchNewProductsForCards(12),
    fetchProductsForCards(12),
    getContentBlocks(
      [
        "homepage.hero",
        "homepage.trustbar",
        "homepage.editorial-band",
        "homepage.featured-collections",
        "homepage.appointment",
        "homepage.testimonials",
        "homepage.as-seen-in",
        "homepage.newsletter",
      ],
      locale
    ),
    getSiteConstants(),
  ]);
  const CONTACT_INFO = { email: sc.email, phone: sc.phone, address: sc.address, hours: sc.hours };

  return (
    <>
      <StructuredData locale={locale} contactInfo={CONTACT_INFO} />

      {/* 1. Hero */}
      <EditableSection sectionKey="homepage.hero" label="Hero">
        <EditorialBanner content={contentMap["homepage.hero"] as HeroContent | undefined} />
      </EditableSection>

      {/* 2. Trust Bar */}
      <EditableSection sectionKey="homepage.trustbar" label="Trust Bar">
        <TrustBar content={contentMap["homepage.trustbar"] as TrustBarContent | undefined} />
      </EditableSection>

      {/* 3. Curated for You — bento grid */}
      <ScrollReveal>
        <CuratedForYou products={newProducts} />
      </ScrollReveal>

      {/* 4. Editorial Image Band */}
      <EditableSection sectionKey="homepage.editorial-band" label="Editorial Band">
        <EditorialBand content={contentMap["homepage.editorial-band"] as EditorialBandContent | undefined} />
      </EditableSection>

      {/* 5. Shop by Category */}
      <ScrollReveal distance={50} duration={900}>
        <EditableSection sectionKey="homepage.featured-collections" label="Collections">
          <FeaturedCollections locale={locale} content={contentMap["homepage.featured-collections"] as FeaturedCollectionsContent | undefined} />
        </EditableSection>
      </ScrollReveal>

      {/* 6. Appointment — primary conversion for bridal */}
      <ScrollReveal direction="up" distance={40} duration={900}>
        <EditableSection sectionKey="homepage.appointment" label="Appointment">
          <Appointment content={contentMap["homepage.appointment"] as AppointmentContent | undefined} />
        </EditableSection>
      </ScrollReveal>

      {/* 7. More to Discover — horizontal carousel */}
      <ScrollReveal>
        <MoreToDiscover products={moreProducts} />
      </ScrollReveal>

      {/* 8–10. Unified dark section: Testimonials → Press → Newsletter */}
      <div className="bg-charcoal">
        <EditableSection sectionKey="homepage.testimonials" label="Testimonials">
          <Testimonials content={contentMap["homepage.testimonials"] as TestimonialsContent | undefined} />
        </EditableSection>
        <EditableSection sectionKey="homepage.as-seen-in" label="As Seen In">
          <AsSeenIn content={contentMap["homepage.as-seen-in"] as AsSeenInContent | undefined} />
        </EditableSection>
        <EditableSection sectionKey="homepage.newsletter" label="Newsletter">
          <Newsletter content={contentMap["homepage.newsletter"] as NewsletterContent | undefined} />
        </EditableSection>
      </div>
    </>
  );
}
