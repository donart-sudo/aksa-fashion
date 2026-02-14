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
        <div className="flex items-center gap-6 mb-10 lg:mb-14">
          <div className="h-px flex-1 bg-soft-gray/50" />
          <div className="text-center">
            <span className="block text-xs font-medium tracking-[0.4em] uppercase text-gold mb-2">
              {t("home.collectionsLabel")}
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl text-charcoal leading-tight">
              {t("home.featuredTitle")}
            </h2>
          </div>
          <div className="h-px flex-1 bg-soft-gray/50" />
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
      <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/15 to-transparent group-hover:from-black/75 transition-all duration-500" />

      {/* Ghost number */}
      <span className="absolute top-4 right-5 lg:top-6 lg:right-7 font-serif text-[3rem] lg:text-[4.5rem] leading-none text-white/[0.08] select-none tabular-nums">
        {String(index + 1).padStart(2, "0")}
      </span>

      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 p-5 lg:p-8">
        <div className="flex items-end justify-between gap-4">
          <div>
            <span className="block h-[2px] w-6 bg-gold mb-3 group-hover:w-10 transition-all duration-500" />
            <h3 className="font-serif text-xl lg:text-2xl xl:text-[1.75rem] text-white leading-tight mb-1.5">
              {label}
            </h3>
            <span className="text-xs tracking-widest uppercase text-white/60 group-hover:text-gold font-medium transition-colors duration-300">
              {viewAllText} →
            </span>
          </div>

          {/* Arrow circle */}
          <span className="flex-shrink-0 w-10 h-10 rounded-full border border-white/30 flex items-center justify-center group-hover:border-gold group-hover:bg-gold/20 transition-all duration-300">
            <svg
              className="w-4 h-4 text-white/70 group-hover:text-white group-hover:translate-x-0.5 transition-all duration-300"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </span>
        </div>
      </div>
    </Link>
  );
}
