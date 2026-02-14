"use client";

import { useTranslations } from "next-intl";
import ProductCard from "@/components/product/ProductCard";
import type { ProductCardData } from "@/components/product/ProductCard";

interface RelatedProductsProps {
  products: ProductCardData[];
}

export default function RelatedProducts({ products }: RelatedProductsProps) {
  const t = useTranslations("product");

  if (products.length === 0) return null;

  return (
    <section className="py-12 lg:py-16 border-t border-soft-gray/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="font-serif text-2xl sm:text-3xl text-charcoal mb-8">
          {t("relatedProducts")}
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-5">
          {products.slice(0, 4).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
