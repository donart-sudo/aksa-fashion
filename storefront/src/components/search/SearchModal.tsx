"use client";

import {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
  memo,
  useDeferredValue,
} from "react";
import Link from "next/link";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { AnimatePresence, motion } from "framer-motion";
import {
  XMarkIcon,
  MagnifyingGlassIcon,
  ArrowTrendingUpIcon,
  ArrowRightIcon,
} from "@heroicons/react/24/outline";
import { useSearch } from "@/lib/search";
import { formatPrice } from "@/lib/utils";
import {
  products as staticProducts,
  type ScrapedProduct,
} from "@/lib/data/products";

// --- Types ---

interface SearchResult {
  id: string;
  title: string;
  handle: string;
  price: number;
  originalPrice?: number;
  thumbnail: string;
  category?: string;
  badge?: "new" | "sale";
}

interface CollectionMatch {
  title: string;
  handle: string;
  type: "category" | "collection";
}

// --- Constants ---

const BACKEND_URL =
  process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000";
const API_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || "";
const RECENT_KEY = "aksa_recent_searches";

const POPULAR_SUGGESTIONS = [
  "Bridal gowns",
  "Evening dress",
  "Ball gown",
  "White wedding dress",
  "Cape dress",
  "Royal train",
];

const QUICK_CATEGORIES: CollectionMatch[] = [
  { title: "Bridal Gowns", handle: "bridal", type: "category" },
  { title: "Evening Dresses", handle: "evening-dress", type: "category" },
  { title: "Ball Gowns", handle: "ball-gown", type: "category" },
  { title: "Cape & Train", handle: "cape-and-train-elegance", type: "category" },
  { title: "Royal Over Train", handle: "royal-over-train", type: "category" },
  { title: "Silhouette Whisper", handle: "silhouette-whisper", type: "category" },
  { title: "Ruffled Dream", handle: "ruffled-dream", type: "category" },
];

const CATEGORY_NAV_KEYS: Record<string, string> = {
  bridal: "bridalGowns",
  "evening-dress": "eveningDress",
  "ball-gown": "ballGown",
  "cape-and-train-elegance": "capeAndTrain",
  "royal-over-train": "royalOverTrain",
  "silhouette-whisper": "silhouetteWhisper",
  "ruffled-dream": "ruffledDream",
};

// --- Search index ---

interface IndexedProduct {
  product: ScrapedProduct;
  tokens: string;
}

const searchIndex: IndexedProduct[] = staticProducts.map((p) => ({
  product: p,
  tokens: [p.name, ...p.categories, ...p.colors, p.collection || ""]
    .join(" ")
    .toLowerCase(),
}));

function toSearchResult(p: ScrapedProduct): SearchResult {
  return {
    id: String(p.id),
    title: p.name,
    handle: p.slug,
    price: (p.salePrice ?? p.price) * 100,
    originalPrice: p.salePrice ? p.regularPrice * 100 : undefined,
    thumbnail: p.images[0] || "",
    category: p.categories[0],
    badge: p.salePrice ? "sale" : p.id > 5000 ? "new" : undefined,
  };
}

function searchLocal(query: string): SearchResult[] {
  const q = query.toLowerCase().trim();
  if (!q) return [];
  const terms = q.split(/\s+/);
  const scored: { product: ScrapedProduct; score: number }[] = [];

  for (let i = 0; i < searchIndex.length; i++) {
    const { product, tokens } = searchIndex[i];
    let score = 0;
    const nameLower = product.name.toLowerCase();

    let allMatch = true;
    for (const term of terms) {
      if (!tokens.includes(term)) {
        allMatch = false;
        break;
      }
    }
    if (!allMatch && !tokens.includes(q)) continue;

    if (nameLower === q) score += 20;
    else if (nameLower.startsWith(q)) score += 15;
    else if (nameLower.includes(q)) score += 10;

    for (const term of terms) {
      if (nameLower.includes(term)) score += 5;
      if (product.categories.some((c) => c.toLowerCase().includes(term)))
        score += 4;
      if (product.colors.some((c) => c.toLowerCase().includes(term)))
        score += 2;
    }

    if (score > 0) scored.push({ product, score });
  }

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, 12).map((s) => toSearchResult(s.product));
}

// --- Autocomplete ---

function getAutocompleteSuggestions(query: string): string[] {
  if (!query.trim() || query.trim().length < 2) return [];
  const q = query.toLowerCase().trim();
  const suggestions = new Set<string>();

  for (const s of POPULAR_SUGGESTIONS) {
    if (s.toLowerCase().includes(q)) suggestions.add(s);
  }
  for (const cat of QUICK_CATEGORIES) {
    if (cat.title.toLowerCase().includes(q)) suggestions.add(cat.title);
  }
  for (const { product } of searchIndex) {
    if (suggestions.size >= 5) break;
    if (product.name.toLowerCase().includes(q)) suggestions.add(product.name);
  }

  return Array.from(suggestions).slice(0, 5);
}

// --- API cache ---
const apiCache = new Map<string, SearchResult[]>();

// --- Local storage ---

function getRecentSearches(): string[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(RECENT_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveRecentSearch(query: string) {
  try {
    const recent = getRecentSearches().filter((q) => q !== query);
    recent.unshift(query);
    localStorage.setItem(RECENT_KEY, JSON.stringify(recent.slice(0, 6)));
  } catch {
    // ignore
  }
}

function clearRecentSearches() {
  try {
    localStorage.removeItem(RECENT_KEY);
  } catch {
    // ignore
  }
}

// --- Highlight ---

const HighlightMatch = memo(function HighlightMatch({
  text,
  query,
}: {
  text: string;
  query: string;
}) {
  if (!query.trim()) return <>{text}</>;
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(`(${escaped})`, "gi");
  const parts = text.split(regex);
  return (
    <>
      {parts.map((part, i) =>
        regex.test(part) ? (
          <span key={i} className="font-medium text-charcoal">
            {part}
          </span>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  );
});

// --- Main ---

export default function SearchModal() {
  const t = useTranslations("search");
  const tc = useTranslations("common");
  const tn = useTranslations("nav");
  const locale = useLocale();
  const { isOpen, closeSearch } = useSearch();

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [apiLoading, setApiLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [showSpinner, setShowSpinner] = useState(false);
  const [headerHeight, setHeaderHeight] = useState(0);

  const inputRef = useRef<HTMLInputElement>(null);
  const apiDebounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const spinnerTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const panelRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const deferredQuery = useDeferredValue(query);

  const suggestions = useMemo(
    () => getAutocompleteSuggestions(deferredQuery),
    [deferredQuery]
  );

  const matchedCollections = useMemo<CollectionMatch[]>(() => {
    if (!deferredQuery.trim()) return [];
    const q = deferredQuery.toLowerCase();
    return QUICK_CATEGORIES.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        c.handle.replace(/-/g, " ").includes(q)
    );
  }, [deferredQuery]);

  // Measure header bottom so panel sits right below it
  useEffect(() => {
    if (isOpen) {
      const header = document.querySelector("header");
      if (header) {
        setHeaderHeight(header.getBoundingClientRect().bottom);
      }
      requestAnimationFrame(() => inputRef.current?.focus());
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      setQuery("");
      setResults([]);
      setHasSearched(false);
      setShowSpinner(false);
      abortRef.current?.abort();
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Escape to close
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeSearch();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, closeSearch]);

  // API search
  const searchApi = useCallback(async (q: string) => {
    const trimmed = q.trim();
    if (!trimmed) return;

    const cached = apiCache.get(trimmed.toLowerCase());
    if (cached) {
      setResults(cached);
      setApiLoading(false);
      setShowSpinner(false);
      return;
    }

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setApiLoading(true);

    try {
      const res = await fetch(
        `${BACKEND_URL}/store/products?q=${encodeURIComponent(
          trimmed
        )}&limit=12&fields=id,title,handle,thumbnail,metadata,created_at,*variants.prices,*categories`,
        {
          headers: {
            "x-publishable-api-key": API_KEY,
            "Content-Type": "application/json",
          },
          signal: controller.signal,
        }
      );

      if (!res.ok) return;
      const data = await res.json();
      const mapped: SearchResult[] = data.products.map(
        (p: {
          id: string;
          title: string;
          handle: string;
          thumbnail: string;
          metadata?: { sale_price?: string; regular_price?: string };
          created_at: string;
          variants?: {
            prices?: { amount: number; currency_code: string }[];
          }[];
          categories?: { name: string }[];
        }) => {
          const eurPrice =
            p.variants?.[0]?.prices?.find(
              (pr) => pr.currency_code === "eur"
            ) ?? p.variants?.[0]?.prices?.[0];
          const price = (eurPrice?.amount ?? 0) * 100;
          const salePrice = p.metadata?.sale_price
            ? Number(p.metadata.sale_price) * 100
            : undefined;
          const regularPrice = p.metadata?.regular_price
            ? Number(p.metadata.regular_price) * 100
            : undefined;
          const isNew =
            new Date(p.created_at) >
            new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);

          return {
            id: p.id,
            title: p.title,
            handle: p.handle,
            price: salePrice ?? price,
            originalPrice: salePrice ? regularPrice : undefined,
            thumbnail: p.thumbnail || "",
            category: p.categories?.[0]?.name,
            badge: salePrice
              ? ("sale" as const)
              : isNew
              ? ("new" as const)
              : undefined,
          };
        }
      );

      apiCache.set(trimmed.toLowerCase(), mapped);
      setResults(mapped);
    } catch {
      // ignore
    } finally {
      setApiLoading(false);
      setShowSpinner(false);
      if (spinnerTimerRef.current) {
        clearTimeout(spinnerTimerRef.current);
        spinnerTimerRef.current = undefined;
      }
    }
  }, []);

  // Local + API search
  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      setResults([]);
      setHasSearched(false);
      setShowSpinner(false);
      setApiLoading(false);
      if (apiDebounceRef.current) clearTimeout(apiDebounceRef.current);
      if (spinnerTimerRef.current) clearTimeout(spinnerTimerRef.current);
      return;
    }

    const localResults = searchLocal(trimmed);
    setResults(localResults);
    setHasSearched(true);

    if (trimmed.length >= 2) saveRecentSearch(trimmed);

    const cached = apiCache.get(trimmed.toLowerCase());
    if (cached) {
      setResults(cached);
      return;
    }

    if (apiDebounceRef.current) clearTimeout(apiDebounceRef.current);
    if (spinnerTimerRef.current) clearTimeout(spinnerTimerRef.current);

    spinnerTimerRef.current = setTimeout(() => setShowSpinner(true), 400);
    apiDebounceRef.current = setTimeout(() => searchApi(trimmed), 150);

    return () => {
      if (apiDebounceRef.current) clearTimeout(apiDebounceRef.current);
      if (spinnerTimerRef.current) clearTimeout(spinnerTimerRef.current);
    };
  }, [query, searchApi]);

  const hasResults = hasSearched && results.length > 0;
  const noResults = hasSearched && results.length === 0 && !apiLoading;

  // Show suggestions when typing but no product results yet
  const showSuggestions =
    query.trim().length >= 2 && suggestions.length > 0 && !hasResults;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-[60] bg-black/20"
            onClick={closeSearch}
          />

          {/* Panel — positioned below the header */}
          <motion.div
            ref={panelRef}
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -10, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="fixed inset-x-0 z-[65] bg-cream shadow-[0_12px_50px_rgba(0,0,0,0.1)] flex flex-col"
            style={{
              top: headerHeight,
              height: `calc(85vh - ${headerHeight}px)`,
            }}
          >
            {/* Input bar */}
            <div className="flex-shrink-0 px-5 sm:px-8 pt-5 pb-4">
              <div className="max-w-3xl mx-auto">
                <div className="flex items-center gap-4 h-14 px-5 rounded-lg border border-charcoal/10 bg-charcoal/[0.02] transition-all">
                  <MagnifyingGlassIcon className="w-5 h-5 text-charcoal/30 flex-shrink-0" />

                  <input
                    ref={inputRef}
                    type="search"
                    placeholder={t("placeholder")}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="flex-1 text-[16px] sm:text-[17px] text-charcoal placeholder:text-charcoal/30 bg-transparent border-none outline-none ring-0 focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0 tracking-wide appearance-none [&]:focus-visible:outline-none"
                    style={{ outline: "none" }}
                    autoComplete="off"
                    spellCheck={false}
                  />

                  {showSpinner && apiLoading && (
                    <div className="w-4 h-4 border-2 border-charcoal/10 border-t-charcoal/40 rounded-full animate-spin flex-shrink-0" />
                  )}

                  {query && (
                    <button
                      onClick={() => setQuery("")}
                      className="p-1.5 text-charcoal/25 hover:text-charcoal transition-colors flex-shrink-0"
                    >
                      <XMarkIcon className="w-5 h-5" />
                    </button>
                  )}

                </div>
                <div className="flex items-center justify-end mt-2.5">
                  <button
                    onClick={closeSearch}
                    className="text-[11px] tracking-[0.12em] uppercase text-charcoal/30 hover:text-charcoal transition-colors"
                  >
                    <span className="hidden sm:inline">esc to close</span>
                    <span className="sm:hidden">{tc("close")}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto overscroll-contain">
              <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4 sm:py-5">
                {/* === EMPTY STATE === */}
                {!query && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                    {/* Trending */}
                    <div>
                      <span className="text-[11px] tracking-[0.12em] uppercase text-charcoal/30 font-medium block mb-3">
                        {t("trending")}
                      </span>
                      <div className="space-y-0.5">
                        {POPULAR_SUGGESTIONS.map((s) => (
                          <button
                            key={s}
                            onClick={() => setQuery(s)}
                            className="flex items-center gap-2.5 w-full text-left px-2 py-2 hover:bg-charcoal/[0.03] rounded transition-colors"
                          >
                            <ArrowTrendingUpIcon className="w-3.5 h-3.5 text-charcoal/15 flex-shrink-0" />
                            <span className="text-[14px] text-charcoal/50">
                              {s}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Categories */}
                    <div>
                      <span className="text-[11px] tracking-[0.12em] uppercase text-charcoal/30 font-medium block mb-3">
                        {t("browseCollections")}
                      </span>
                      <div className="space-y-0.5">
                        {QUICK_CATEGORIES.map((cat) => (
                          <Link
                            key={cat.handle}
                            href={`/${locale}/collections/${cat.handle}`}
                            onClick={closeSearch}
                            className="flex items-center gap-2.5 w-full px-2 py-2 text-[14px] text-charcoal/50 hover:text-charcoal hover:bg-charcoal/[0.03] rounded transition-all"
                          >
                            {CATEGORY_NAV_KEYS[cat.handle]
                              ? tn(CATEGORY_NAV_KEYS[cat.handle])
                              : cat.title}
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* === SUGGESTIONS (typing, no results yet) === */}
                {showSuggestions && (
                  <div className="space-y-px">
                    {suggestions.map((s) => (
                      <button
                        key={s}
                        onClick={() => setQuery(s)}
                        className="flex items-center gap-2.5 w-full text-left px-2 py-2 hover:bg-charcoal/[0.02] rounded transition-colors"
                      >
                        <MagnifyingGlassIcon className="w-3.5 h-3.5 text-charcoal/15 flex-shrink-0" />
                        <span className="text-[13px] text-charcoal/50">
                          <HighlightMatch text={s} query={query} />
                        </span>
                      </button>
                    ))}
                  </div>
                )}

                {/* === RESULTS === */}
                {hasResults && (
                  <div>
                    {/* Collection matches */}
                    {matchedCollections.length > 0 && (
                      <div className="mb-4 pb-3 border-b border-charcoal/[0.04]">
                        {matchedCollections.map((col) => (
                          <Link
                            key={col.handle}
                            href={`/${locale}/collections/${col.handle}`}
                            onClick={closeSearch}
                            className="flex items-center justify-between px-2 py-1.5 hover:bg-charcoal/[0.02] rounded transition-colors"
                          >
                            <span className="text-[13px] text-charcoal/55">
                              <HighlightMatch
                                text={
                                  CATEGORY_NAV_KEYS[col.handle]
                                    ? tn(CATEGORY_NAV_KEYS[col.handle])
                                    : col.title
                                }
                                query={deferredQuery}
                              />
                            </span>
                            <ArrowRightIcon className="w-3 h-3 text-charcoal/20" />
                          </Link>
                        ))}
                      </div>
                    )}

                    {/* Product count + view all */}
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[11px] tracking-[0.1em] uppercase text-charcoal/30">
                        {results.length}{" "}
                        {results.length === 1 ? tc("result") : tc("results")}
                      </span>
                      <Link
                        href={`/${locale}/search?q=${encodeURIComponent(query)}`}
                        onClick={closeSearch}
                        className="text-[11px] tracking-[0.1em] uppercase text-charcoal/30 hover:text-charcoal transition-colors"
                      >
                        {tc("viewAll")} &rarr;
                      </Link>
                    </div>

                    {/* Product grid — compact */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
                      {results.slice(0, 8).map((product) => (
                        <Link
                          key={product.id}
                          href={`/${locale}/products/${product.handle}`}
                          onClick={closeSearch}
                          className="group"
                        >
                          <div className="relative aspect-[3/4] overflow-hidden bg-[#f3f1ee]">
                            {product.thumbnail && (
                              <Image
                                src={product.thumbnail}
                                alt={product.title}
                                fill
                                className="object-cover group-hover:scale-105 transition-transform duration-500"
                                sizes="(max-width: 640px) 45vw, (max-width: 1024px) 25vw, 170px"
                              />
                            )}
                            {product.badge && (
                              <span
                                className={`absolute top-1.5 left-1.5 px-1.5 py-0.5 text-[9px] tracking-wider uppercase ${
                                  product.badge === "sale"
                                    ? "bg-charcoal text-white"
                                    : "bg-white text-charcoal"
                                }`}
                              >
                                {product.badge === "sale" ? "Sale" : "New"}
                              </span>
                            )}
                          </div>
                          <div className="mt-1.5">
                            <h3 className="text-[12px] text-charcoal/55 group-hover:text-charcoal line-clamp-1 transition-colors">
                              {product.title}
                            </h3>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className="text-[12px] font-medium text-charcoal">
                                {formatPrice(product.price)}
                              </span>
                              {product.originalPrice && (
                                <span className="text-[10px] text-charcoal/30 line-through">
                                  {formatPrice(product.originalPrice)}
                                </span>
                              )}
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* === NO RESULTS === */}
                {noResults && (
                  <div className="text-center py-8">
                    <p className="text-[14px] text-charcoal/40 mb-1">
                      {t("noResults", { query })}
                    </p>
                    <p className="text-[12px] text-charcoal/25 mb-5">
                      {t("noResultsSuggestion")}
                    </p>
                    <div className="flex flex-wrap justify-center gap-1.5">
                      {QUICK_CATEGORIES.slice(0, 4).map((cat) => (
                        <Link
                          key={cat.handle}
                          href={`/${locale}/collections/${cat.handle}`}
                          onClick={closeSearch}
                          className="px-3 py-1.5 text-[12px] text-charcoal/40 border border-charcoal/[0.08] hover:border-charcoal/20 rounded-full transition-all"
                        >
                          {CATEGORY_NAV_KEYS[cat.handle]
                            ? tn(CATEGORY_NAV_KEYS[cat.handle])
                            : cat.title}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
