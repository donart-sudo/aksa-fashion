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
import {
  XMarkIcon,
  MagnifyingGlassIcon,
  ClockIcon,
  ArrowTrendingUpIcon,
  ShoppingBagIcon,
  HeartIcon,
  SparklesIcon,
  TagIcon,
} from "@heroicons/react/24/outline";
import { HeartIcon as HeartIconSolid } from "@heroicons/react/24/solid";
import { useSearch } from "@/lib/search";
import { useCart } from "@/lib/cart";
import { useWishlist } from "@/lib/wishlist";
import { formatPrice } from "@/lib/utils";
import { products as staticProducts, type ScrapedProduct } from "@/lib/data/products";

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

const TRENDING_SEARCHES = [
  "Bridal",
  "Evening Dress",
  "Ball Gown",
  "Cape",
  "Royal",
  "Silhouette",
];

const QUICK_CATEGORIES: CollectionMatch[] = [
  { title: "Bridal Gowns", handle: "bridal", type: "category" },
  { title: "Evening Dresses", handle: "evening-dress", type: "category" },
  { title: "Ball Gowns", handle: "ball-gown", type: "category" },
  { title: "Cape & Train", handle: "cape-and-train-elegance", type: "category" },
  { title: "Royal Over Train", handle: "royal-over-train", type: "category" },
  { title: "Silhouette Whisper", handle: "silhouette-whisper", type: "category" },
  { title: "Ruffled Dream", handle: "ruffled-dream", type: "category" },
  { title: "New Collection", handle: "new", type: "collection" },
  { title: "Sale", handle: "sale", type: "collection" },
];

const CATEGORY_NAV_KEYS: Record<string, string> = {
  bridal: "bridalGowns",
  "evening-dress": "eveningDress",
  "ball-gown": "ballGown",
  "cape-and-train-elegance": "capeAndTrain",
  "royal-over-train": "royalOverTrain",
  "silhouette-whisper": "silhouetteWhisper",
  "ruffled-dream": "ruffledDream",
  new: "newCollection",
  sale: "saleItems",
};

// --- Pre-built search index for instant local results ---

interface IndexedProduct {
  product: ScrapedProduct;
  tokens: string; // pre-joined lowercase searchable text
}

const searchIndex: IndexedProduct[] = staticProducts.map((p) => ({
  product: p,
  tokens: [
    p.name,
    ...p.categories,
    ...p.colors,
    p.collection || "",
  ]
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
    badge: p.salePrice
      ? "sale"
      : p.id > 5000
      ? "new"
      : undefined,
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

    // All terms must match somewhere (AND logic)
    let allMatch = true;
    for (const term of terms) {
      if (!tokens.includes(term)) {
        allMatch = false;
        break;
      }
    }
    if (!allMatch && !tokens.includes(q)) continue;

    // Scoring
    if (nameLower === q) score += 20;
    else if (nameLower.startsWith(q)) score += 15;
    else if (nameLower.includes(q)) score += 10;

    for (const term of terms) {
      if (nameLower.includes(term)) score += 5;
      if (product.categories.some((c) => c.toLowerCase().includes(term)))
        score += 4;
      if (product.colors.some((c) => c.toLowerCase().includes(term))) score += 2;
    }

    if (score > 0) scored.push({ product, score });
  }

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, 16).map((s) => toSearchResult(s.product));
}

// --- API result cache ---

const apiCache = new Map<string, SearchResult[]>();

// --- Local storage helpers ---

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
    localStorage.setItem(RECENT_KEY, JSON.stringify(recent.slice(0, 8)));
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

// --- Highlight matched text ---

function highlightText(text: string, query: string): (string | { match: string })[] {
  if (!query.trim()) return [text];
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(`(${escaped})`, "gi");
  const parts = text.split(regex);
  return parts.map((part) =>
    regex.test(part) ? { match: part } : part
  );
}

const HighlightMatch = memo(function HighlightMatch({
  text,
  query,
}: {
  text: string;
  query: string;
}) {
  const parts = highlightText(text, query);
  return (
    <>
      {parts.map((part, i) =>
        typeof part === "string" ? (
          <span key={i}>{part}</span>
        ) : (
          <mark key={i} className="bg-gold/20 text-charcoal rounded-sm px-0.5">
            {part.match}
          </mark>
        )
      )}
    </>
  );
});

// --- Memoized result card ---

const ResultCard = memo(function ResultCard({
  product,
  locale,
  query,
  isActive,
  index,
  isWishlisted,
  onWishlist,
  onAddToCart,
  onClose,
  isFeatured,
}: {
  product: SearchResult;
  locale: string;
  query: string;
  isActive: boolean;
  index: number;
  isWishlisted: boolean;
  onWishlist: (e: React.MouseEvent) => void;
  onAddToCart: (e: React.MouseEvent) => void;
  onClose: () => void;
  isFeatured?: boolean;
}) {
  const tc = useTranslations("common");
  return (
    <Link
      href={`/${locale}/products/${product.handle}`}
      onClick={onClose}
      data-index={index}
      className={`group relative ${isFeatured ? "col-span-2 sm:col-span-1" : ""} ${
        isActive ? "ring-2 ring-gold ring-offset-2" : ""
      }`}
    >
      <div className="relative aspect-[3/4] overflow-hidden bg-soft-gray/30">
        {product.thumbnail && (
          <Image
            src={product.thumbnail}
            alt={product.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes={isFeatured ? "(max-width: 768px) 50vw, 25vw" : "(max-width: 768px) 25vw, 20vw"}
          />
        )}
        {product.badge && (
          <span
            className={`absolute top-2 left-2 px-1.5 py-0.5 text-[9px] tracking-wider uppercase font-medium ${
              product.badge === "sale"
                ? "bg-red-500 text-white"
                : "bg-charcoal text-white"
            }`}
          >
            {product.badge === "sale" && product.originalPrice
              ? `−${Math.round((1 - product.price / product.originalPrice) * 100)}%`
              : tc("newArrival")}
          </span>
        )}
        <div className="absolute top-2 right-2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={onWishlist}
            className="p-1.5 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-colors"
          >
            {isWishlisted ? (
              <HeartIconSolid className="w-3 h-3 text-red-500" />
            ) : (
              <HeartIcon className="w-3 h-3 text-charcoal" />
            )}
          </button>
          <button
            onClick={onAddToCart}
            className="p-1.5 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-colors"
          >
            <ShoppingBagIcon className="w-3 h-3 text-charcoal" />
          </button>
        </div>
      </div>
      <div className="mt-1.5">
        {product.category && (
          <p className="text-[9px] tracking-wider uppercase text-charcoal/25 mb-0.5 hidden sm:block">
            {product.category}
          </p>
        )}
        <h3 className="text-xs font-medium text-charcoal group-hover:text-gold transition-colors line-clamp-1">
          <HighlightMatch text={product.title} query={query} />
        </h3>
        <div className="flex items-center gap-1.5 mt-0.5">
          <span className="text-xs font-medium text-charcoal">
            {formatPrice(product.price)}
          </span>
          {product.originalPrice && (
            <span className="text-[10px] text-charcoal/35 line-through">
              {formatPrice(product.originalPrice)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
});

// --- Main Component ---

export default function SearchModal() {
  const t = useTranslations("search");
  const tc = useTranslations("common");
  const tn = useTranslations("nav");
  const locale = useLocale();
  const { isOpen, closeSearch } = useSearch();
  const { addItem: addToCart } = useCart();
  const { toggleItem, isWishlisted } = useWishlist();

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [apiLoading, setApiLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [showSpinner, setShowSpinner] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const apiDebounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const spinnerTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const resultsRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Deferred query for non-urgent collection matching
  const deferredQuery = useDeferredValue(query);

  // --- Collection matching ---
  const matchedCollections = useMemo<CollectionMatch[]>(() => {
    if (!deferredQuery.trim()) return [];
    const q = deferredQuery.toLowerCase();
    return QUICK_CATEGORIES.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        c.handle.replace(/-/g, " ").includes(q)
    );
  }, [deferredQuery]);

  // --- Open/close ---
  useEffect(() => {
    if (isOpen) {
      setRecentSearches(getRecentSearches());
      setActiveIndex(-1);
      // Focus immediately, no setTimeout delay
      requestAnimationFrame(() => inputRef.current?.focus());
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      setQuery("");
      setResults([]);
      setHasSearched(false);
      setActiveIndex(-1);
      setShowSpinner(false);
      // Abort any in-flight API request
      abortRef.current?.abort();
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // --- API search (background, debounced) ---
  const searchApi = useCallback(async (q: string) => {
    const trimmed = q.trim();
    if (!trimmed) return;

    // Check cache first
    const cached = apiCache.get(trimmed.toLowerCase());
    if (cached) {
      setResults(cached);
      setApiLoading(false);
      setShowSpinner(false);
      return;
    }

    // Abort previous request
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setApiLoading(true);

    try {
      const res = await fetch(
        `${BACKEND_URL}/store/products?q=${encodeURIComponent(trimmed)}&limit=16&fields=id,title,handle,thumbnail,metadata,created_at,*variants.prices,*categories`,
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
          variants?: { prices?: { amount: number; currency_code: string }[] }[];
          categories?: { name: string }[];
        }) => {
          const eurPrice =
            p.variants?.[0]?.prices?.find((pr) => pr.currency_code === "eur") ??
            p.variants?.[0]?.prices?.[0];
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

      // Cache the result
      apiCache.set(trimmed.toLowerCase(), mapped);
      // Only update if query hasn't changed
      setResults(mapped);
    } catch {
      // Aborted or failed — local results are already showing
    } finally {
      setApiLoading(false);
      setShowSpinner(false);
      if (spinnerTimerRef.current) {
        clearTimeout(spinnerTimerRef.current);
        spinnerTimerRef.current = undefined;
      }
    }
  }, []);

  // --- Instant local search + debounced API search ---
  useEffect(() => {
    setActiveIndex(-1);

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

    // 1. Instant local search — results appear immediately
    const localResults = searchLocal(trimmed);
    setResults(localResults);
    setHasSearched(true);

    // Save recent search for 2+ chars
    if (trimmed.length >= 2) saveRecentSearch(trimmed);

    // 2. Check API cache — if cached, use that immediately
    const cached = apiCache.get(trimmed.toLowerCase());
    if (cached) {
      setResults(cached);
      return;
    }

    // 3. Fire API search in background after short debounce
    if (apiDebounceRef.current) clearTimeout(apiDebounceRef.current);
    if (spinnerTimerRef.current) clearTimeout(spinnerTimerRef.current);

    // Only show spinner if API takes >400ms (avoids flash)
    spinnerTimerRef.current = setTimeout(() => {
      setShowSpinner(true);
    }, 400);

    apiDebounceRef.current = setTimeout(() => {
      searchApi(trimmed);
    }, 150);

    return () => {
      if (apiDebounceRef.current) clearTimeout(apiDebounceRef.current);
      if (spinnerTimerRef.current) clearTimeout(spinnerTimerRef.current);
    };
  }, [query, searchApi]);

  // --- Keyboard navigation ---
  useEffect(() => {
    if (!isOpen) return;

    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeSearch();
        return;
      }

      if (!hasSearched || results.length === 0) return;

      const totalItems = matchedCollections.length + results.length;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIndex((prev) => (prev + 1) % totalItems);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIndex((prev) => (prev - 1 + totalItems) % totalItems);
      } else if (e.key === "Enter" && activeIndex >= 0) {
        e.preventDefault();
        if (activeIndex < matchedCollections.length) {
          const col = matchedCollections[activeIndex];
          window.location.href = `/${locale}/collections/${col.handle}`;
          closeSearch();
        } else {
          const product = results[activeIndex - matchedCollections.length];
          if (product) {
            window.location.href = `/${locale}/products/${product.handle}`;
            closeSearch();
          }
        }
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, closeSearch, hasSearched, results, matchedCollections, activeIndex, locale]);

  // --- Scroll active item into view ---
  useEffect(() => {
    if (activeIndex < 0 || !resultsRef.current) return;
    const el = resultsRef.current.querySelector(`[data-index="${activeIndex}"]`);
    el?.scrollIntoView({ block: "nearest" });
  }, [activeIndex]);

  // --- Quick actions ---
  const handleQuickAddToCart = useCallback(
    (e: React.MouseEvent, product: SearchResult) => {
      e.preventDefault();
      e.stopPropagation();
      addToCart({
        productId: product.id,
        variantId: product.id,
        title: product.title,
        thumbnail: product.thumbnail,
        price: product.price,
        quantity: 1,
      });
    },
    [addToCart]
  );

  const handleQuickWishlist = useCallback(
    (e: React.MouseEvent, product: SearchResult) => {
      e.preventDefault();
      e.stopPropagation();
      toggleItem({
        id: product.id,
        title: product.title,
        handle: product.handle,
        price: product.price,
        originalPrice: product.originalPrice,
        thumbnail: product.thumbnail,
      });
    },
    [toggleItem]
  );

  const handleClearRecent = useCallback(() => {
    clearRecentSearches();
    setRecentSearches([]);
  }, []);

  if (!isOpen) return null;

  const hasResults = hasSearched && results.length > 0;
  const noResults = hasSearched && results.length === 0 && !apiLoading;

  return (
    <div className="fixed inset-0 z-[60] bg-cream/98 backdrop-blur-sm animate-in fade-in duration-100">
      <div className="max-w-4xl mx-auto px-4 pt-4 sm:pt-6 h-full flex flex-col">
        {/* Search input */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-charcoal/30" />
            <input
              ref={inputRef}
              type="search"
              placeholder={t("placeholder")}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-12 pr-10 py-3.5 bg-white border border-soft-gray/50 text-charcoal text-sm placeholder:text-charcoal/30 focus:outline-none focus:border-gold transition-colors"
              autoComplete="off"
              spellCheck={false}
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-charcoal/30 hover:text-charcoal transition-colors"
              >
                <XMarkIcon className="w-4 h-4" />
              </button>
            )}
            {/* Subtle loading indicator — no spinner flash */}
            {showSpinner && apiLoading && (
              <div className="absolute right-10 top-1/2 -translate-y-1/2">
                <div className="w-3.5 h-3.5 border border-gold/40 border-t-gold rounded-full animate-spin" />
              </div>
            )}
          </div>
          <button
            onClick={closeSearch}
            className="p-2 hover:text-gold transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center text-sm font-medium tracking-wider uppercase text-charcoal/60"
          >
            {tc("close")}
          </button>
        </div>

        {/* Scrollable content area */}
        <div className="flex-1 overflow-y-auto pb-8" ref={resultsRef}>
          {/* === EMPTY STATE: No query === */}
          {!query && (
            <div className="space-y-8">
              {/* Recent searches */}
              {recentSearches.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <ClockIcon className="w-4 h-4 text-charcoal/30" />
                      <p className="text-xs tracking-wider uppercase text-charcoal/40">
                        {t("recent")}
                      </p>
                    </div>
                    <button
                      onClick={handleClearRecent}
                      className="text-xs text-charcoal/30 hover:text-gold transition-colors"
                    >
                      {tc("clearAll")}
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {recentSearches.map((s) => (
                      <button
                        key={s}
                        onClick={() => setQuery(s)}
                        className="group flex items-center gap-1.5 px-3 py-2 bg-white border border-soft-gray/40 text-sm text-charcoal/60 hover:border-gold hover:text-gold transition-all"
                      >
                        <ClockIcon className="w-3.5 h-3.5 text-charcoal/20 group-hover:text-gold/50" />
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Trending */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <ArrowTrendingUpIcon className="w-4 h-4 text-charcoal/30" />
                  <p className="text-xs tracking-wider uppercase text-charcoal/40">
                    {t("trending")}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {TRENDING_SEARCHES.map((s) => (
                    <button
                      key={s}
                      onClick={() => setQuery(s)}
                      className="px-3 py-2 bg-white border border-soft-gray/40 text-sm text-charcoal/60 hover:border-gold hover:text-gold transition-all"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quick categories */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <SparklesIcon className="w-4 h-4 text-charcoal/30" />
                  <p className="text-xs tracking-wider uppercase text-charcoal/40">
                    {t("browseCollections")}
                  </p>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {QUICK_CATEGORIES.filter((c) => c.type === "category").map(
                    (cat) => (
                      <Link
                        key={cat.handle}
                        href={`/${locale}/collections/${cat.handle}`}
                        onClick={closeSearch}
                        className="flex items-center gap-2 px-4 py-3 bg-white border border-soft-gray/30 hover:border-gold hover:text-gold transition-all text-sm text-charcoal/70"
                      >
                        <TagIcon className="w-4 h-4 text-charcoal/20" />
                        {CATEGORY_NAV_KEYS[cat.handle] ? tn(CATEGORY_NAV_KEYS[cat.handle]) : cat.title}
                      </Link>
                    )
                  )}
                </div>
              </div>
            </div>
          )}

          {/* === RESULTS === */}
          {hasResults && (
            <div className="space-y-4">
              {/* Matched collections */}
              {matchedCollections.length > 0 && (
                <div>
                  <p className="text-xs tracking-wider uppercase text-charcoal/30 mb-2">
                    {tc("collections")}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {matchedCollections.map((col, i) => (
                      <Link
                        key={col.handle}
                        href={`/${locale}/collections/${col.handle}`}
                        onClick={closeSearch}
                        data-index={i}
                        className={`flex items-center gap-2 px-4 py-2.5 border text-sm transition-all ${
                          activeIndex === i
                            ? "border-gold bg-gold/5 text-gold"
                            : "border-soft-gray/40 text-charcoal/70 hover:border-gold hover:text-gold"
                        }`}
                      >
                        <TagIcon className="w-3.5 h-3.5" />
                        <HighlightMatch text={CATEGORY_NAV_KEYS[col.handle] ? tn(CATEGORY_NAV_KEYS[col.handle]) : col.title} query={deferredQuery} />
                        <span className="text-charcoal/20">→</span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Result count + "See all" */}
              <div className="flex items-center justify-between">
                <p className="text-xs tracking-wider uppercase text-charcoal/30">
                  {t("results", { count: results.length, query: deferredQuery })}
                </p>
                <Link
                  href={`/${locale}/search?q=${encodeURIComponent(query)}`}
                  onClick={closeSearch}
                  className="text-xs text-gold hover:underline transition-colors"
                >
                  {tc("viewAll")} →
                </Link>
              </div>

              {/* Product grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {results.map((product, i) => {
                  const globalIndex = matchedCollections.length + i;
                  return (
                    <ResultCard
                      key={product.id}
                      product={product}
                      locale={locale}
                      query={deferredQuery}
                      isActive={activeIndex === globalIndex}
                      index={globalIndex}
                      isWishlisted={isWishlisted(product.id)}
                      isFeatured={i === 0}
                      onWishlist={(e) => handleQuickWishlist(e, product)}
                      onAddToCart={(e) => handleQuickAddToCart(e, product)}
                      onClose={closeSearch}
                    />
                  );
                })}
              </div>
            </div>
          )}

          {/* === NO RESULTS === */}
          {noResults && (
            <div className="text-center py-16 space-y-6">
              <div>
                <MagnifyingGlassIcon className="w-12 h-12 text-soft-gray mx-auto mb-3" />
                <p className="text-charcoal/60 mb-1">
                  {t("noResults", { query })}
                </p>
                <p className="text-sm text-charcoal/30">
                  {t("noResultsSuggestion")}
                </p>
              </div>
              <div className="flex flex-wrap justify-center gap-2">
                {QUICK_CATEGORIES.slice(0, 4).map((cat) => (
                  <Link
                    key={cat.handle}
                    href={`/${locale}/collections/${cat.handle}`}
                    onClick={closeSearch}
                    className="px-4 py-2 border border-soft-gray/40 text-sm text-charcoal/60 hover:border-gold hover:text-gold transition-all"
                  >
                    {CATEGORY_NAV_KEYS[cat.handle] ? tn(CATEGORY_NAV_KEYS[cat.handle]) : cat.title}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Keyboard hint */}
        {hasResults && (
          <div className="hidden sm:flex items-center justify-center gap-4 py-3 border-t border-soft-gray/30 text-[10px] text-charcoal/25 tracking-wider">
            <span>
              <kbd className="px-1.5 py-0.5 bg-soft-gray/30 rounded text-[9px]">↑</kbd>{" "}
              <kbd className="px-1.5 py-0.5 bg-soft-gray/30 rounded text-[9px]">↓</kbd>{" "}
              navigate
            </span>
            <span>
              <kbd className="px-1.5 py-0.5 bg-soft-gray/30 rounded text-[9px]">Enter</kbd>{" "}
              select
            </span>
            <span>
              <kbd className="px-1.5 py-0.5 bg-soft-gray/30 rounded text-[9px]">Esc</kbd>{" "}
              close
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
