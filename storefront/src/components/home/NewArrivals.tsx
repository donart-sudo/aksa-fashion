"use client";

import { useTranslations, useLocale } from "next-intl";
import { motion } from "framer-motion";
import Link from "next/link";
import ProductCard from "@/components/product/ProductCard";

interface NewArrivalsProps {
  products: {
    id: string;
    title: string;
    handle: string;
    price: number;
    originalPrice?: number;
    thumbnail: string;
    hoverImage?: string;
    badge?: "new" | "sale" | "bestseller";
  }[];
}

export default function NewArrivals({ products }: NewArrivalsProps) {
  const t = useTranslations("home");
  const tCommon = useTranslations("common");
  const locale = useLocale();

  return (
    <section className="py-20 lg:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex items-end justify-between mb-12"
        >
          <div>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-charcoal mb-2">
              {t("newArrivalsTitle")}
            </h2>
            <p className="text-charcoal/60">{t("newArrivalsSubtitle")}</p>
          </div>
          <Link
            href={`/${locale}/collections/new`}
            className="hidden sm:inline-block text-sm text-gold hover:text-gold-dark tracking-wider uppercase transition-colors"
          >
            {tCommon("viewAll")} →
          </Link>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {products.map((product, i) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
            >
              <ProductCard product={product} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
