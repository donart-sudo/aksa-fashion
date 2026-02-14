"use client";

import { useTranslations, useLocale } from "next-intl";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";

// Use real product images as featured collection covers
const collections = [
  {
    key: "bridal",
    image:
      "https://ariart.shop/wp-content/uploads/2026/01/Crystal-Bloom-1-scaled.jpg",
    href: "/collections/bridal",
  },
  {
    key: "cape-and-train",
    label: "Cape & Train",
    image:
      "https://ariart.shop/wp-content/uploads/2026/01/Ellea-scaled.jpg",
    href: "/collections/cape-and-train-elegance",
  },
  {
    key: "silhouette",
    label: "Silhouette Whisper",
    image:
      "https://ariart.shop/wp-content/uploads/2026/01/Midnight-Gold-scaled.jpg",
    href: "/collections/silhouette-whisper",
  },
  {
    key: "new",
    image:
      "https://ariart.shop/wp-content/uploads/2026/01/Lumi-scaled.jpg",
    href: "/collections/new",
  },
];

export default function FeaturedCollections() {
  const t = useTranslations();
  const locale = useLocale();

  const collectionLabels: Record<string, string> = {
    bridal: t("nav.bridalGowns"),
    "cape-and-train": "Cape & Train Elegance",
    silhouette: "Silhouette Whisper",
    new: t("nav.newCollection"),
  };

  return (
    <section className="py-20 lg:py-28 bg-warm-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 lg:mb-16"
        >
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-charcoal mb-4">
            {t("home.featuredTitle")}
          </h2>
          <p className="text-charcoal/60 max-w-md mx-auto">
            {t("home.featuredSubtitle")}
          </p>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {collections.map((collection, i) => (
            <motion.div
              key={collection.key}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
            >
              <Link
                href={`/${locale}${collection.href}`}
                className="group block relative aspect-[3/4] overflow-hidden"
              >
                <Image
                  src={collection.image}
                  alt={
                    collection.label ||
                    collectionLabels[collection.key]
                  }
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  sizes="(max-width: 768px) 50vw, 25vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-charcoal/60 via-transparent to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4 lg:p-6">
                  <h3 className="font-serif text-lg lg:text-xl text-white">
                    {collection.label ||
                      collectionLabels[collection.key]}
                  </h3>
                  <span className="text-xs text-white/70 tracking-wider uppercase mt-1 inline-block group-hover:text-gold transition-colors">
                    {t("common.viewAll")} →
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
