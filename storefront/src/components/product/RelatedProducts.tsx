"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import ProductCard from "@/components/product/ProductCard";
import type { ProductCardData } from "@/components/product/ProductCard";

interface RelatedProductsProps {
  products: ProductCardData[];
}

export default function RelatedProducts({ products }: RelatedProductsProps) {
  const t = useTranslations("product");

  if (products.length === 0) return null;

  return (
    <section className="py-12 sm:py-16 md:py-20 lg:py-24 border-t border-soft-gray/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="mb-8 sm:mb-10 md:mb-12"
        >
          <div className="flex items-center gap-3 mb-3 sm:mb-4">
            <span className="h-px w-8 sm:w-10 bg-gold/30" />
            <span className="text-gold/50 text-[9px] sm:text-[10px] tracking-[0.35em] uppercase">
              Curated
            </span>
          </div>
          <h2 className="font-serif text-[1.4rem] sm:text-[1.65rem] md:text-3xl text-charcoal">
            {t("relatedProducts")}
          </h2>
        </motion.div>

        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3 md:gap-4 lg:gap-5">
          {products.slice(0, 4).map((product, i) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{
                delay: i * 0.06,
                duration: 0.5,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              <ProductCard product={product} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
