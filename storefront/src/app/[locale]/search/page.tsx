"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";
import Image from "next/image";
import { MagnifyingGlassIcon, ClockIcon, ArrowTrendingUpIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { formatPrice } from "@/lib/utils";

interface SearchResult {
  id: string;
  title: string;
  handle: string;
  price: number;
  thumbnail: string;
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

const TRENDING_SEARCHES = [
  "Bridal Gown",
  "Evening Dress",
  "Ball Gown",
  "Cape & Train",
  "Ruffled Dream",
  "Silhouette",
];

const RECENT_SEARCHES_KEY = "aksa_recent_searches";
const MAX_RECENT = 5;

function getRecentSearches(): string[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(RECENT_SEARCHES_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveRecentSearch(q: string) {
  const trimmed = q.trim();
  if (!trimmed) return;
  const recent = getRecentSearches().filter((s) => s !== trimmed);
  recent.unshift(trimmed);
  localStorage.setItem(
    RECENT_SEARCHES_KEY,
    JSON.stringify(recent.slice(0, MAX_RECENT))
  );
}

function removeRecentSearch(q: string) {
  const recent = getRecentSearches().filter((s) => s !== q);
  localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(recent));
}

/* Skeleton card for loading state */
function SkeletonCard() {
  return (
    <div className="animate-pulse">
      <div className="aspect-[3/4] bg-soft-gray/40 mb-2" />
      <div className="h-3.5 bg-soft-gray/30 rounded w-3/4 mb-1.5" />
      <div className="h-3 bg-soft-gray/20 rounded w-1/3" />
    </div>
  );
}

export default function SearchPage() {
  const t = useTranslations("search");
  const locale = useLocale();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  /* Load recent searches on mount */
  useEffect(() => {
    setRecentSearches(getRecentSearches());
  }, []);

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
        `${SUPABASE_URL}/rest/v1/products?or=(title.ilike.%25${encodeURIComponent(q)}%25,description.ilike.%25${encodeURIComponent(q)}%25)&status=eq.published&select=id,title,handle,thumbnail,product_variants(price_amount),product_images(url,rank)&limit=24`,
        {
          headers: {
            "apikey": SUPABASE_KEY,
            "Authorization": `Bearer ${SUPABASE_KEY}`,
          },
        }
      );
      if (res.ok) {
        const data = await res.json();
        setResults(
          data.map(
            (p: { id: string; title: string; handle: string; thumbnail: string | null; product_variants?: { price_amount: number }[]; product_images?: { url: string }[] }) => {
              return {
                id: p.id,
                title: p.title,
                handle: p.handle,
                price: (p.product_variants?.[0]?.price_amount ?? 0) * 100,
                thumbnail: p.thumbnail || p.product_images?.[0]?.url || "",
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
      if (q.trim()) {
        saveRecentSearch(q.trim());
        setRecentSearches(getRecentSearches());
      }
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
            ref={inputRef}
            type="search"
            inputMode="search"
            placeholder={t("placeholder")}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            className="w-full pl-12 pr-4 py-3.5 bg-white border border-soft-gray/50 text-charcoal text-sm placeholder:text-charcoal/30 focus:outline-none focus:border-gold transition-colors"
          />
        </div>
      </div>

      {/* Recent & trending searches — shown when no query */}
      {!query.trim() && !searched && (
        <div className="max-w-xl mx-auto space-y-8">
          {/* Recent searches */}
          {recentSearches.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <ClockIcon className="w-4 h-4 text-charcoal/30" />
                <span className="text-[11px] tracking-[0.2em] uppercase text-charcoal/40 font-medium">
                  {t("recent")}
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {recentSearches.map((term) => (
                  <div
                    key={term}
                    className="flex items-center gap-1.5 pl-3.5 pr-1.5 py-2 border border-charcoal/10 text-[13px] text-charcoal/60 hover:border-charcoal/25 hover:text-charcoal transition-colors group"
                  >
                    <button
                      onClick={() => {
                        setQuery(term);
                        inputRef.current?.focus();
                      }}
                      className="min-h-[24px]"
                    >
                      {term}
                    </button>
                    <button
                      onClick={() => {
                        removeRecentSearch(term);
                        setRecentSearches(getRecentSearches());
                      }}
                      className="p-1 text-charcoal/20 hover:text-charcoal/50 transition-colors min-w-[24px] min-h-[24px] flex items-center justify-center"
                      aria-label="Remove"
                    >
                      <XMarkIcon className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Trending searches */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <ArrowTrendingUpIcon className="w-4 h-4 text-gold/60" />
              <span className="text-[11px] tracking-[0.2em] uppercase text-charcoal/40 font-medium">
                {t("trending")}
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {TRENDING_SEARCHES.map((term) => (
                <button
                  key={term}
                  onClick={() => {
                    setQuery(term);
                    inputRef.current?.focus();
                  }}
                  className="px-4 py-2 border border-charcoal/10 text-[13px] text-charcoal/50 hover:border-gold/40 hover:text-charcoal transition-colors min-h-[40px]"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Skeleton loading grid */}
      {loading && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 lg:gap-5">
          {Array.from({ length: 8 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
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
