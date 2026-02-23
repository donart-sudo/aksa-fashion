import Link from "next/link";
import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { COLLECTION_COVERS } from "@/lib/cdn-image-urls";
import type { FeaturedCollectionsContent, FeaturedCollectionItem } from "@/types/content-blocks";

const defaultCollections: FeaturedCollectionItem[] = [
  { key: "bridal", image: COLLECTION_COVERS.bridal, href: "/collections/bridal" },
  { key: "evening", image: COLLECTION_COVERS.evening, href: "/collections/evening-dress" },
  { key: "cape-and-train", image: COLLECTION_COVERS["cape-and-train"], href: "/collections/cape-and-train-elegance" },
  { key: "ball-gown", image: COLLECTION_COVERS["ball-gown"], href: "/collections/ball-gown" },
  { key: "silhouette", image: COLLECTION_COVERS.silhouette, href: "/collections/silhouette-whisper" },
  { key: "ruffled-dream", image: COLLECTION_COVERS["ruffled-dream"], href: "/collections/ruffled-dream" },
];

export default async function FeaturedCollections({
  locale,
  content,
}: {
  locale: string;
  content?: FeaturedCollectionsContent;
}) {
  const collections = content?.collections ?? defaultCollections;
  const t = await getTranslations();

  const collectionLabels: Record<string, string> = {
    bridal: t("nav.bridalGowns"),
    evening: t("nav.eveningWear"),
    "cape-and-train": t("nav.capeAndTrain"),
    "ball-gown": t("nav.ballGown"),
    silhouette: t("nav.silhouetteWhisper"),
    "ruffled-dream": t("nav.ruffledDream"),
  };

  return (
    <section className="py-20 lg:py-28 bg-warm-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="mb-12 lg:mb-16">
          <div className="flex items-center gap-4 mb-6">
            <span className="block h-[1.5px] w-10 bg-gold" />
            <span className="text-[11px] tracking-[0.35em] uppercase text-gold font-medium">
              {content?.label || t("home.collectionsLabel")}
            </span>
          </div>

          <div className="flex items-end justify-between">
            <h2 className="font-serif text-[2rem] sm:text-[2.5rem] lg:text-[3.25rem] font-bold text-charcoal leading-[0.95]">
              {content?.heading || t("home.shopByCategory")}
            </h2>
            <Link
              href={`/${locale}/collections`}
              className="hidden sm:inline-flex items-center gap-2 group flex-shrink-0"
            >
              <span className="text-[11px] tracking-[0.2em] uppercase text-charcoal/50 group-hover:text-charcoal transition-colors duration-300 border-b border-charcoal/20 group-hover:border-charcoal pb-0.5">
                {t("common.viewAll")}
              </span>
              <svg
                className="w-3.5 h-3.5 text-charcoal/30 group-hover:text-charcoal group-hover:translate-x-0.5 transition-all duration-300"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                />
              </svg>
            </Link>
          </div>
        </div>

        {/* Desktop: 3-column grid, 2 rows */}
        <div className="hidden lg:grid grid-cols-3 gap-4">
          {collections.map((col, i) => (
            <CollectionCard
              key={col.key}
              collection={col}
              label={col.title || collectionLabels[col.key] || col.key}
              locale={locale}
              index={i}
            />
          ))}
        </div>

        {/* Tablet: 2-column grid */}
        <div className="hidden sm:grid lg:hidden grid-cols-2 gap-4">
          {collections.map((col, i) => (
            <CollectionCard
              key={col.key}
              collection={col}
              label={col.title || collectionLabels[col.key] || col.key}
              locale={locale}
              index={i}
            />
          ))}
        </div>

        {/* Mobile: horizontal scroll */}
        <div className="sm:hidden -mx-4">
          <div className="flex gap-3.5 overflow-x-auto overflow-y-hidden snap-x snap-mandatory scrollbar-hide px-4">
            {collections.map((col, i) => (
              <div
                key={col.key}
                className="flex-shrink-0 w-[72vw] snap-start"
              >
                <CollectionCard
                  collection={col}
                  label={col.title || collectionLabels[col.key] || col.key}
                  locale={locale}
                  index={i}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Mobile View All */}
        <div className="flex sm:hidden justify-center mt-8">
          <Link
            href={`/${locale}/collections`}
            className="inline-flex items-center gap-2 group"
          >
            <span className="text-[11px] tracking-[0.2em] uppercase text-charcoal/50 group-hover:text-charcoal transition-colors duration-300 border-b border-charcoal/20 group-hover:border-charcoal pb-0.5">
              {t("common.viewAll")}
            </span>
            <svg
              className="w-3.5 h-3.5 text-charcoal/30 group-hover:text-charcoal group-hover:translate-x-0.5 transition-all duration-300"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
              />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}

function CollectionCard({
  collection,
  label,
  locale,
  index,
}: {
  collection: FeaturedCollectionItem;
  label: string;
  locale: string;
  index: number;
}) {
  const num = String(index + 1).padStart(2, "0");

  return (
    <Link
      href={`/${locale}${collection.href}`}
      className="group block relative aspect-[3/4] overflow-hidden"
    >
      <Image
        src={collection.image}
        alt={label}
        fill
        className="object-cover object-top transition-transform duration-[1200ms] ease-out group-hover:scale-[1.06]"
        sizes="(max-width: 640px) 72vw, (max-width: 1024px) 50vw, 33vw"
      />

      {/* Gradient overlay — base + hover darkening layer */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/5 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 ease-out" />

      {/* Number — top left */}
      <span className="absolute top-5 left-5 text-[11px] font-medium tracking-[0.2em] text-white/30 z-10">
        {num}
      </span>

      {/* Gold top-left corner accent on hover */}
      <span className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-gold/0 group-hover:border-gold/50 transition-all duration-500 z-10" />

      {/* Content — bottom */}
      <div className="absolute bottom-0 inset-x-0 p-5 lg:p-6 z-10">
        <h3 className="font-serif text-xl lg:text-2xl font-bold text-white leading-tight mb-1.5">
          {label}
        </h3>
        <span className="inline-flex items-center gap-1.5 text-[10px] tracking-[0.15em] uppercase text-white/50 group-hover:text-gold transition-colors duration-300">
          Explore
          <svg
            className="w-3 h-3 group-hover:translate-x-1 transition-transform duration-300"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
            />
          </svg>
        </span>
      </div>
    </Link>
  );
}
