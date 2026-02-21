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
  HeartIcon,
  ShoppingBagIcon,
} from "@heroicons/react/24/outline";
import { HeartIcon as HeartIconSolid, CheckIcon } from "@heroicons/react/24/solid";
import { useSearch } from "@/lib/search";
import { useCart } from "@/lib/cart";
import { useWishlist } from "@/lib/wishlist";
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
  sizes?: string[];
}

interface CollectionMatch {
  title: string;
  handle: string;
  type: "category" | "collection";
}

// --- Constants ---

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
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
    sizes: p.sizes && p.sizes.length > 0 ? p.sizes : undefined,
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

// --- Search Product Card ---

function SearchProductCard({
  product,
  locale,
  closeSearch,
}: {
  product: SearchResult;
  locale: string;
  closeSearch: () => void;
}) {
  const tc = useTranslations("common");
  const { addItem } = useCart();
  const { toggleItem, isWishlisted } = useWishlist();
  const [hovered, setHovered] = useState(false);
  const [added, setAdded] = useState(false);
  const [showSizes, setShowSizes] = useState(false);

  const wishlisted = isWishlisted(product.id);
  const hasSizes = product.sizes && product.sizes.length > 0;

  const discount = product.originalPrice
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : 0;

  const addToCartDirect = useCallback(() => {
    addItem({
      productId: product.id,
      variantId: product.id,
      handle: product.handle,
      title: product.title,
      thumbnail: product.thumbnail,
      price: product.price,
      quantity: 1,
    });
    setAdded(true);
    setShowSizes(false);
    setTimeout(() => setAdded(false), 1800);
  }, [addItem, product]);

  const addToCartWithSize = useCallback(
    (e: React.MouseEvent, size: string) => {
      e.preventDefault();
      e.stopPropagation();
      addItem({
        productId: product.id,
        variantId: `${product.id}-${size}`,
        handle: product.handle,
        title: product.title,
        thumbnail: product.thumbnail,
        price: product.price,
        quantity: 1,
        size,
      });
      setAdded(true);
      setShowSizes(false);
      setTimeout(() => setAdded(false), 1800);
    },
    [addItem, product]
  );

  const handleAddToCart = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (added) return;
      if (hasSizes) {
        setShowSizes(true);
        return;
      }
      addToCartDirect();
    },
    [added, hasSizes, addToCartDirect]
  );

  const handleCloseSizes = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setShowSizes(false);
    },
    []
  );

  const handleToggleWishlist = useCallback(
    (e: React.MouseEvent) => {
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
    [toggleItem, product]
  );

  return (
    <div
      className="group relative"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setShowSizes(false); }}
    >
      <Link
        href={`/${locale}/products/${product.handle}`}
        onClick={closeSearch}
        className="block relative aspect-[3/4] overflow-hidden bg-[#f0eeeb]"
      >
        {product.thumbnail && (
          <Image
            src={product.thumbnail}
            alt={product.title}
            fill
            className={`object-cover object-top transition-transform duration-700 ease-out ${
              hovered ? "scale-[1.05]" : "scale-100"
            }`}
            sizes="(max-width: 640px) 45vw, (max-width: 1024px) 25vw, 170px"
          />
        )}

        {/* Badge */}
        {product.badge && (
          <span className="absolute top-2 left-2 z-10 inline-block px-2 py-0.5 text-[8px] font-bold tracking-[0.15em] uppercase bg-charcoal text-white">
            {product.badge === "sale"
              ? <>&minus;{discount}%</>
              : tc("newArrival")}
          </span>
        )}

        {/* Wishlist */}
        <button
          onClick={handleToggleWishlist}
          className="absolute top-2 right-2 z-10 w-7 h-7 flex items-center justify-center min-w-[28px] min-h-[28px]"
          aria-label={wishlisted ? tc("removeFromWishlist") : tc("addToWishlist")}
        >
          {wishlisted ? (
            <HeartIconSolid className="w-[18px] h-[18px] text-red-500 drop-shadow-md" />
          ) : (
            <HeartIcon className="w-[18px] h-[18px] text-white drop-shadow-md" />
          )}
        </button>

        {/* Size picker overlay */}
        {showSizes && hasSizes && (
          <div
            className="absolute inset-0 z-20 bg-white/95 backdrop-blur-sm flex flex-col items-center justify-center p-2.5"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
          >
            <button
              onClick={handleCloseSizes}
              className="absolute top-2 right-2 w-6 h-6 flex items-center justify-center text-charcoal/30 hover:text-charcoal transition-colors"
              aria-label={tc("close")}
            >
              <XMarkIcon className="w-4 h-4" />
            </button>

            <p className="text-[9px] tracking-[0.2em] uppercase text-charcoal/40 mb-2.5">
              {tc("selectSize")}
            </p>

            <div className="flex flex-wrap justify-center gap-1.5 max-w-full">
              {product.sizes!.map((size) => (
                <button
                  key={size}
                  onClick={(e) => addToCartWithSize(e, size)}
                  className="min-w-[32px] min-h-[30px] px-2 py-1 border border-charcoal/[0.1] text-[10px] font-medium text-charcoal hover:bg-charcoal hover:text-white transition-all duration-200"
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Quick add — desktop hover slide-up */}
        {!showSizes && (
          <div
            className={`absolute bottom-0 inset-x-0 z-10 p-1.5 transition-all duration-300 ease-out hidden sm:block ${
              hovered ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"
            }`}
          >
            <button
              onClick={handleAddToCart}
              className={`w-full flex items-center justify-center gap-1.5 py-2 text-[9px] font-bold tracking-[0.15em] uppercase transition-all duration-200 cursor-pointer ${
                added
                  ? "bg-charcoal text-white"
                  : "bg-white/95 backdrop-blur-sm text-charcoal hover:bg-charcoal hover:text-white"
              }`}
            >
              {added ? (
                <>
                  <CheckIcon className="w-3 h-3" />
                  {tc("added")}
                </>
              ) : (
                <>
                  <ShoppingBagIcon className="w-3 h-3" />
                  {tc("addToCart")}
                </>
              )}
            </button>
          </div>
        )}

        {/* Quick add — mobile bag icon */}
        {!showSizes && (
          <button
            onClick={handleAddToCart}
            className={`absolute bottom-2 right-2 z-10 sm:hidden w-7 h-7 min-w-[28px] min-h-[28px] flex items-center justify-center rounded-full shadow-md transition-all duration-200 cursor-pointer ${
              added
                ? "bg-charcoal text-white scale-110"
                : "bg-white/90 backdrop-blur-sm text-charcoal active:scale-95"
            }`}
            aria-label={added ? tc("added") : tc("addToCart")}
          >
            {added ? (
              <CheckIcon className="w-3.5 h-3.5" />
            ) : (
              <ShoppingBagIcon className="w-3.5 h-3.5" />
            )}
          </button>
        )}
      </Link>

      {/* Info */}
      <div className="mt-2 pb-0.5">
        <Link
          href={`/${locale}/products/${product.handle}`}
          onClick={closeSearch}
        >
          <h3 className="font-serif text-[14px] sm:text-[15px] font-medium text-charcoal leading-snug group-hover:underline decoration-charcoal/30 underline-offset-2 transition-all duration-300 line-clamp-1">
            {product.title}
          </h3>
        </Link>

        <div className="flex items-baseline gap-1.5 mt-1">
          <span className="text-[13px] text-gold font-semibold">
            {formatPrice(product.price)}
          </span>
          {product.originalPrice && (
            <>
              <span className="text-[10px] text-charcoal/30 line-through">
                {formatPrice(product.originalPrice)}
              </span>
              <span className="text-[9px] font-bold text-red-500">
                Save {discount}%
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

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
      // Check if super sticky header is visible (translated to Y=0)
      const superSticky = document.querySelector("[data-super-sticky]") as HTMLElement | null;
      const header = document.querySelector("header");

      if (superSticky && superSticky.getBoundingClientRect().top >= 0) {
        // Super sticky is visible — position below it
        setHeaderHeight(superSticky.getBoundingClientRect().bottom);
      } else if (header) {
        setHeaderHeight(header.getBoundingClientRect().bottom);
      }
      requestAnimationFrame(() => inputRef.current?.focus());
    } else {
      setQuery("");
      setResults([]);
      setHasSearched(false);
      setShowSpinner(false);
      abortRef.current?.abort();
    }
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
      // Use Supabase REST API for server-side search
      const res = await fetch(
        `${SUPABASE_URL}/rest/v1/products?or=(title.ilike.%25${encodeURIComponent(trimmed)}%25,description.ilike.%25${encodeURIComponent(trimmed)}%25)&status=eq.published&select=id,title,handle,thumbnail,metadata,created_at,product_images(url,rank),product_variants(title,price_amount),product_categories(categories(name))&limit=12`,
        {
          headers: {
            "apikey": SUPABASE_KEY,
            "Authorization": `Bearer ${SUPABASE_KEY}`,
          },
          signal: controller.signal,
        }
      );

      if (!res.ok) return;
      const data = await res.json();
      const mapped: SearchResult[] = data.map(
        (p: {
          id: string;
          title: string;
          handle: string;
          thumbnail: string | null;
          metadata?: { sale_price?: string; regular_price?: string };
          created_at: string;
          product_variants?: { title?: string; price_amount: number }[];
          product_categories?: { categories: { name: string } }[];
          product_images?: { url: string; rank: number }[];
        }) => {
          const price = (p.product_variants?.[0]?.price_amount ?? 0) * 100;
          const salePrice = p.metadata?.sale_price
            ? Number(p.metadata.sale_price) * 100
            : undefined;
          const regularPrice = p.metadata?.regular_price
            ? Number(p.metadata.regular_price) * 100
            : undefined;
          const isNew =
            new Date(p.created_at) >
            new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);

          const thumbUrl = p.thumbnail || p.product_images?.[0]?.url || "";

          return {
            id: p.id,
            title: p.title,
            handle: p.handle,
            price: salePrice ?? price,
            originalPrice: salePrice ? regularPrice : undefined,
            thumbnail: thumbUrl,
            category: p.product_categories?.[0]?.categories?.name,
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
          {/* Overlay — starts below header */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-x-0 bottom-0 z-[80] bg-black/20"
            style={{ top: headerHeight }}
            onClick={closeSearch}
          />

          {/* Panel — positioned below the header */}
          <motion.div
            ref={panelRef}
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -10, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="fixed inset-x-0 z-[80] bg-cream shadow-[0_12px_50px_rgba(0,0,0,0.1)] flex flex-col"
            style={{
              top: headerHeight,
              maxHeight: `calc(85vh - ${headerHeight}px)`,
            }}
          >
            {/* Input bar */}
            <div className="flex-shrink-0 px-5 sm:px-8 pt-5 pb-2">
              <div className="max-w-3xl mx-auto">
                <div className="flex items-center gap-3 h-12 px-4 rounded-lg border border-charcoal/10 bg-charcoal/[0.02] transition-all">
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
                <div className="flex items-center justify-end mt-1.5">
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
              <div className="max-w-3xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
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

                    {/* Product grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                      {results.slice(0, 8).map((product) => (
                        <SearchProductCard
                          key={product.id}
                          product={product}
                          locale={locale}
                          closeSearch={closeSearch}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* === SEARCHING (no local results, API still loading) === */}
                {hasSearched && results.length === 0 && apiLoading && (
                  <div className="text-center py-8">
                    <div className="w-5 h-5 border-2 border-charcoal/10 border-t-charcoal/40 rounded-full animate-spin mx-auto mb-3" />
                    <p className="text-[14px] text-charcoal/40">
                      {t("searching") || "Searching..."}
                    </p>
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
