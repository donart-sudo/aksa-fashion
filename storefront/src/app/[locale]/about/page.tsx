import { useTranslations } from "next-intl";
import Image from "next/image";
import { PLACEHOLDER_IMAGES } from "@/lib/constants";

export default function AboutPage() {
  const t = useTranslations();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
        <div className="relative aspect-[4/5] overflow-hidden">
          <Image
            src={PLACEHOLDER_IMAGES.bridal}
            alt="Aksa Fashion Atelier"
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 50vw"
          />
        </div>
        <div>
          <p className="text-gold text-xs tracking-[0.4em] uppercase mb-4">
            {t("footer.aboutUs")}
          </p>
          <h1 className="font-serif text-4xl lg:text-5xl text-charcoal mb-6">
            Our Story
          </h1>
          <div className="space-y-4 text-charcoal/70 leading-relaxed">
            <p>
              Founded in the heart of Prishtina, Kosovo, Aksa Fashion has been
              the premier destination for luxury bridal gowns and evening wear
              for discerning women across the region.
            </p>
            <p>
              Our atelier brings together traditional craftsmanship with
              contemporary design, creating pieces that celebrate femininity,
              elegance, and individuality. Each gown is carefully selected or
              custom-designed to ensure our brides feel extraordinary on their
              most special day.
            </p>
            <p>
              We believe that every woman deserves to feel like royalty. Our
              team of dedicated stylists provides personalized consultations,
              guiding you through our curated collection to find the perfect
              dress that tells your unique story.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
