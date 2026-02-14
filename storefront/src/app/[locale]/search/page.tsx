"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";
import Image from "next/image";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { formatPrice } from "@/lib/utils";

interface SearchResult {
  id: string;
  title: string;
  handle: string;
  price: number;
  thumbnail: string;
}

const BACKEND_URL =
  process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000";
const API_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || "";

export default function SearchPage() {
  const t = useTranslations("search");
  const locale = useLocale();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const searchProducts = useCallback(async (q: string) => {
    if (!q.trim()) {
      setResults([]);
      setSearched(false);
      return;
    }
    setLoading(true);
    setSearched(true);
    try {
      const res = await fetch(
        `${BACKEND_URL}/store/products?q=${encodeURIComponent(q)}&limit=24&fields=id,title,handle,thumbnail,*variants.prices`,
        {
          headers: {
            "x-publishable-api-key": API_KEY,
            "Content-Type": "application/json",
          },
        }
      );
      if (res.ok) {
        const data = await res.json();
        setResults(
          data.products.map(
            (p: { id: string; title: string; handle: string; thumbnail: string; variants?: { prices?: { amount: number; currency_code: string }[] }[] }) => {
              const eurPrice =
                p.variants?.[0]?.prices?.find((pr) => pr.currency_code === "eur") ??
                p.variants?.[0]?.prices?.[0];
              return {
                id: p.id,
                title: p.title,
                handle: p.handle,
                price: (eurPrice?.amount ?? 0) * 100,
                thumbnail: p.thumbnail || "",
              };
            }
          )
        );
      }
    } catch {
      // Fallback to static data
      const { products } = await import("@/lib/data/products");
      setResults(
        products
          .filter((p) => p.name.toLowerCase().includes(q.toLowerCase()))
          .slice(0, 24)
          .map((p) => ({
            id: String(p.id),
            title: p.name,
            handle: p.slug,
            price: p.price * 100,
            thumbnail: p.images[0] || "",
          }))
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => searchProducts(query), 300);
    return () => clearTimeout(timeout);
  }, [query, searchProducts]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
      <h1 className="font-serif text-3xl lg:text-4xl text-charcoal mb-6 text-center">
        {t("placeholder").replace("...", "")}
      </h1>

      <div className="max-w-xl mx-auto mb-8">
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-charcoal/30" />
          <input
            type="search"
            placeholder={t("placeholder")}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            className="w-full pl-12 pr-4 py-3.5 bg-white border border-soft-gray/50 text-charcoal text-sm placeholder:text-charcoal/30 focus:outline-none focus:border-gold transition-colors"
          />
        </div>
      </div>

      {loading && (
        <div className="flex justify-center py-12">
          <div className="w-6 h-6 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
        </div>
      )}

      {!loading && searched && results.length > 0 && (
        <>
          <p className="text-xs tracking-wider uppercase text-charcoal/40 mb-4">
            {t("results", { count: results.length, query })}
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 lg:gap-5">
            {results.map((product) => (
              <Link
                key={product.id}
                href={`/${locale}/products/${product.handle}`}
                className="group"
              >
                <div className="relative aspect-[3/4] overflow-hidden bg-soft-gray/30 mb-2">
                  {product.thumbnail && (
                    <Image
                      src={product.thumbnail}
                      alt={product.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes="(max-width: 768px) 50vw, 25vw"
                    />
                  )}
                </div>
                <h3 className="text-sm font-medium text-charcoal group-hover:text-gold transition-colors line-clamp-1">
                  {product.title}
                </h3>
                <p className="text-sm text-charcoal/60">
                  {formatPrice(product.price)}
                </p>
              </Link>
            ))}
          </div>
        </>
      )}

      {!loading && searched && results.length === 0 && (
        <p className="text-center text-charcoal/60 py-12">
          {t("noResults", { query })}
        </p>
      )}
    </div>
  );
}
