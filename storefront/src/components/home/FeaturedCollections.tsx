import Link from "next/link";
import Image from "next/image";
import { getTranslations } from "next-intl/server";

const collections = [
  {
    key: "bridal",
    image: "https://ariart.shop/wp-content/uploads/2026/01/Crystal-Bloom-1-scaled.jpg",
    href: "/collections/bridal",
  },
  {
    key: "cape-and-train",
    label: "Cape & Train",
    image: "https://ariart.shop/wp-content/uploads/2026/01/Ellea-scaled.jpg",
    href: "/collections/cape-and-train-elegance",
  },
  {
    key: "silhouette",
    label: "Silhouette",
    image: "https://ariart.shop/wp-content/uploads/2026/01/Midnight-Gold-scaled.jpg",
    href: "/collections/silhouette-whisper",
  },
  {
    key: "evening",
    image: "https://ariart.shop/wp-content/uploads/2024/12/10-4-scaled.jpg",
    href: "/collections/evening-dress",
  },
];

export default async function FeaturedCollections({ locale }: { locale: string }) {
  const t = await getTranslations();

  const collectionLabels: Record<string, string> = {
    bridal: t("nav.bridalGowns"),
    "cape-and-train": t("nav.capeAndTrain"),
    silhouette: t("nav.silhouetteWhisper"),
    evening: t("nav.eveningWear"),
  };

  return (
    <section className="py-16 lg:py-24 bg-warm-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-10 lg:mb-14">
          <span className="text-[11px] tracking-[0.3em] text-charcoal/20 block mb-3">03</span>
          <h2 className="text-[1.75rem] sm:text-[2.25rem] lg:text-[2.75rem] font-black uppercase tracking-tight text-charcoal leading-none">
            {t("home.featuredTitle")}
          </h2>
          <p className="text-xs sm:text-sm text-charcoal/35 tracking-wide mt-3">
            {t("home.featuredSubtitle")}
          </p>
        </div>

        {/* Asymmetric mosaic grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-5">
          {/* Left: tall bridal */}
          <div className="row-span-1 lg:row-span-2">
            <CollectionCard
              collection={collections[0]}
              label={collectionLabels[collections[0].key]}
              locale={locale}
              viewAllText={t("common.viewAll")}
              index={0}
              tall
            />
          </div>

          {/* Right: two stacked */}
          <div>
            <CollectionCard
              collection={collections[1]}
              label={collections[1].label || collectionLabels[collections[1].key]}
              locale={locale}
              viewAllText={t("common.viewAll")}
              index={1}
            />
          </div>
          <div>
            <CollectionCard
              collection={collections[2]}
              label={collections[2].label || collectionLabels[collections[2].key]}
              locale={locale}
              viewAllText={t("common.viewAll")}
              index={2}
            />
          </div>
        </div>

        {/* Full-width evening */}
        <div className="mt-4 lg:mt-5">
          <CollectionCard
            collection={collections[3]}
            label={collectionLabels[collections[3].key]}
            locale={locale}
            viewAllText={t("common.viewAll")}
            index={3}
            wide
          />
        </div>
      </div>
    </section>
  );
}

function CollectionCard({
  collection,
  label,
  locale,
  viewAllText,
  index,
  tall,
  wide,
}: {
  collection: (typeof collections)[number];
  label: string;
  locale: string;
  viewAllText: string;
  index: number;
  tall?: boolean;
  wide?: boolean;
}) {
  return (
    <Link
      href={`/${locale}${collection.href}`}
      className={`group block relative overflow-hidden ${
        tall
          ? "aspect-[3/4] lg:aspect-auto lg:h-full lg:min-h-[520px]"
          : wide
            ? "aspect-[16/9] sm:aspect-[21/9]"
            : "aspect-[4/3]"
      }`}
    >
      <Image
        src={collection.image}
        alt={label}
        fill
        className="object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-[1.06]"
        sizes={
          tall
            ? "(max-width: 1024px) 100vw, 50vw"
            : wide
              ? "100vw"
              : "(max-width: 1024px) 100vw, 50vw"
        }
      />

      {/* Gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent group-hover:from-black/70 transition-all duration-500" />

      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 p-4 lg:p-6">
        <h3 className={`font-black uppercase tracking-tight text-white leading-none mb-1.5 ${
          tall ? "text-xl lg:text-2xl" : wide ? "text-xl lg:text-2xl" : "text-base lg:text-xl"
        }`}>
          {label}
        </h3>
        <span className="text-[11px] text-white/35 group-hover:text-white transition-colors tracking-[0.15em] uppercase">
          {viewAllText} →
        </span>
      </div>
    </Link>
  );
}
