"use client";

import { useState, useEffect, useCallback, useRef, useMemo, useDeferredValue } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { AnimatePresence, motion } from "framer-motion";
import {
  MagnifyingGlassIcon,
  ShoppingBagIcon,
  HeartIcon,
  UserIcon,
  Bars3Icon,
  XMarkIcon,
  ChevronDownIcon,
  ArrowRightIcon,
} from "@heroicons/react/24/outline";
import LanguageSwitcher from "./LanguageSwitcher";
import ProductCard, { type ProductCardData } from "@/components/product/ProductCard";
import InlineEditButton from "@/components/editor/InlineEditButton";
import { HEADER_IMAGES } from "@/lib/cdn-image-urls";
import { useCart } from "@/lib/cart";
import { useWishlist } from "@/lib/wishlist";
import { useSearch } from "@/lib/search";
import { useSiteConstants } from "@/lib/site-constants";

import {
  products as staticProducts,
  type ScrapedProduct,
} from "@/lib/data/products";

/* ── Navigation structure ── */
const PAGE_LINKS = [
  { key: "home", handle: "" },
  { key: "about", handle: "about" },
  { key: "contact", handle: "contact" },
] as const;

const COLLECTION_LINKS = [
  { key: "newCollection", handle: "collections/new" },
  { key: "bridalGowns", handle: "collections/bridal" },
  { key: "eveningDress", handle: "collections/evening-dress" },
  { key: "ballGown", handle: "collections/ball-gown" },
  { key: "capeAndTrain", handle: "collections/cape-and-train-elegance" },
  { key: "royalOverTrain", handle: "collections/royal-over-train" },
  { key: "silhouetteWhisper", handle: "collections/silhouette-whisper" },
  { key: "ruffledDream", handle: "collections/ruffled-dream" },
] as const;

const ANNOUNCEMENTS = ["ann1", "ann2", "ann3", "ann4"] as const;
const ANN_INTERVAL = 4000;
const TOPBAR_H = 44; // px — announcement bar height

/* ── Inline search engine ── */
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const RECENT_KEY = "aksa_recent_searches";

const QUICK_CATEGORIES = [
  { title: "Bridal Gowns", handle: "bridal" },
  { title: "Evening Dresses", handle: "evening-dress" },
  { title: "Ball Gowns", handle: "ball-gown" },
  { title: "Cape & Train", handle: "cape-and-train-elegance" },
  { title: "Royal Over Train", handle: "royal-over-train" },
  { title: "Silhouette Whisper", handle: "silhouette-whisper" },
  { title: "Ruffled Dream", handle: "ruffled-dream" },
];

const CAT_NAV_KEYS: Record<string, string> = {
  bridal: "bridalGowns", "evening-dress": "eveningDress",
  "ball-gown": "ballGown", "cape-and-train-elegance": "capeAndTrain",
  "royal-over-train": "royalOverTrain", "silhouette-whisper": "silhouetteWhisper",
  "ruffled-dream": "ruffledDream",
};

interface SearchResult {
  id: string; title: string; handle: string; price: number;
  originalPrice?: number; thumbnail: string; category?: string;
}

const searchIndex = staticProducts.map((p) => ({
  product: p,
  tokens: [p.name, ...p.categories, ...p.colors, p.collection || ""].join(" ").toLowerCase(),
}));

function toResult(p: ScrapedProduct): SearchResult {
  return {
    id: String(p.id), title: p.name, handle: p.slug,
    price: (p.salePrice ?? p.price) * 100,
    originalPrice: p.salePrice ? p.regularPrice * 100 : undefined,
    thumbnail: p.images[0] || "", category: p.categories[0],
  };
}

function searchLocal(query: string): SearchResult[] {
  const q = query.toLowerCase().trim();
  if (!q) return [];
  const terms = q.split(/\s+/);
  const scored: { product: ScrapedProduct; score: number }[] = [];
  for (const { product, tokens } of searchIndex) {
    let score = 0;
    const name = product.name.toLowerCase();
    let allMatch = true;
    for (const term of terms) { if (!tokens.includes(term)) { allMatch = false; break; } }
    if (!allMatch && !tokens.includes(q)) continue;
    if (name === q) score += 20;
    else if (name.startsWith(q)) score += 15;
    else if (name.includes(q)) score += 10;
    for (const term of terms) {
      if (name.includes(term)) score += 5;
      if (product.categories.some((c) => c.toLowerCase().includes(term))) score += 4;
    }
    if (score > 0) scored.push({ product, score });
  }
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, 8).map((s) => toResult(s.product));
}

function toProductCardData(r: SearchResult): ProductCardData {
  return {
    id: r.id,
    title: r.title,
    handle: r.handle,
    price: r.price,
    originalPrice: r.originalPrice,
    thumbnail: r.thumbnail,
    collection: r.category,
  };
}

const apiCache = new Map<string, SearchResult[]>();

function getRecentSearches(): string[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(RECENT_KEY) || "[]"); } catch { return []; }
}

function saveRecentSearch(query: string) {
  try {
    const r = getRecentSearches().filter((q) => q !== query);
    r.unshift(query);
    localStorage.setItem(RECENT_KEY, JSON.stringify(r.slice(0, 6)));
  } catch { /* ignore */ }
}

/* ── Social SVG icons (inline for performance) ── */
function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <circle cx="12" cy="12" r="5" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}
function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.34-6.34V9.18a8.16 8.16 0 004.77 1.52V7.25a4.82 4.82 0 01-1.01-.56z" />
    </svg>
  );
}
function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}
function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}
function MapPinIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0116 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}
function ClockIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

export default function Header() {
  const t = useTranslations();
  const locale = useLocale();
  const pathname = usePathname();
  const { openCart, itemCount } = useCart();
  const { itemCount: wishlistCount } = useWishlist();
  const sc = useSiteConstants();
  const SOCIAL_LINKS = { instagram: sc.instagram, facebook: sc.facebook, tiktok: sc.tiktok, whatsapp: sc.whatsapp };
  const CONTACT_INFO = { email: sc.email, phone: sc.phone, address: sc.address, hours: sc.hours };
  const { isOpen: searchOpen, openSearch, closeSearch } = useSearch();
  const [scrolled, setScrolled] = useState(false);
  const [showSuperSticky, setShowSuperSticky] = useState(false);
  const [pastHero, setPastHero] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [shopOpen, setShopOpen] = useState(false);
  const [mobileShopOpen, setMobileShopOpen] = useState(false);
  const [hoveredCollection, setHoveredCollection] = useState("bridalGowns");
  const [annIndex, setAnnIndex] = useState(0);
  const [topBarDismissed, setTopBarDismissed] = useState(false);
  const [mobileHeaderHidden, setMobileHeaderHidden] = useState(false);
  const scrollDelta = useRef(0);
  const lastScrollY = useRef(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const shopTimeout = useRef<ReturnType<typeof setTimeout>>(undefined);
  const shopRef = useRef<HTMLDivElement>(null);
  const superStickyShopRef = useRef<HTMLDivElement>(null);
  const searchFromStickyRef = useRef(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const apiDebounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const abortRef = useRef<AbortController | null>(null);

  // Transparent header on homepage
  const isHomePage = pathname === `/${locale}` || pathname === `/${locale}/`;
  const transparentMode = isHomePage && !pastHero;
  const showTopBar = !topBarDismissed;

  // Height offset for homepage absolute positioning
  const topBarOffset = showTopBar ? TOPBAR_H : 0;

  const collectionImages: Record<string, string> = {
    newCollection: HEADER_IMAGES["all-collections"],
    bridalGowns: HEADER_IMAGES.bridal,
    eveningDress: HEADER_IMAGES["evening-dress"],
    ballGown: HEADER_IMAGES["ball-gown"],
    capeAndTrain: HEADER_IMAGES["cape-and-train-elegance"],
    royalOverTrain: HEADER_IMAGES["royal-over-train"],
    silhouetteWhisper: HEADER_IMAGES["silhouette-whisper"],
    ruffledDream: HEADER_IMAGES["ruffled-dream"],
  };

  const isActive = useCallback(
    (handle: string) => {
      if (handle === "") {
        return pathname === `/${locale}` || pathname === `/${locale}/`;
      }
      const linkPath = `/${locale}/${handle}`;
      if (handle === "collections") {
        return pathname === linkPath || pathname === `${linkPath}/`;
      }
      return pathname.startsWith(linkPath);
    },
    [locale, pathname]
  );

  const isShopActive = useCallback(() => {
    return pathname.startsWith(`/${locale}/collections`);
  }, [locale, pathname]);

  /* Scroll handler */
  const handleScroll = useCallback(() => {
    const y = window.scrollY;
    setScrolled(y > 80);
    setShowSuperSticky(y > 100);
    setPastHero(y > window.innerHeight - 80);
    if (searchOpen) closeSearch();

    // Mobile: hide header on scroll down, show on scroll up
    if (window.innerWidth < 1024) {
      // Auto-dismiss announcement bar on mobile
      if (y > 150) setTopBarDismissed(true);

      if (y > 80) {
        const diff = y - lastScrollY.current;
        // Reset accumulator on direction change
        if ((diff > 0 && scrollDelta.current < 0) || (diff < 0 && scrollDelta.current > 0)) {
          scrollDelta.current = 0;
        }
        scrollDelta.current += diff;
        if (scrollDelta.current > 10) setMobileHeaderHidden(true);
        else if (scrollDelta.current < -5) setMobileHeaderHidden(false);
      }

      // Always show header near top of page
      if (y <= 10) {
        setMobileHeaderHidden(false);
        scrollDelta.current = 0;
      }
    }
    lastScrollY.current = y;
  }, [searchOpen, closeSearch]);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    lastScrollY.current = window.scrollY;
    setPastHero(window.scrollY > window.innerHeight - 80);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  // Reset mobile header hidden on desktop resize
  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 1024) {
        setMobileHeaderHidden(false);
        scrollDelta.current = 0;
      }
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  /* Keyboard shortcut for search */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        openSearch();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [openSearch]);

  /* Body scroll lock for mobile menu */
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [mobileMenuOpen]);

  /* Rotating announcements */
  useEffect(() => {
    if (!showTopBar) return;
    const timer = setInterval(() => {
      setAnnIndex((i) => (i + 1) % ANNOUNCEMENTS.length);
    }, ANN_INTERVAL);
    return () => clearInterval(timer);
  }, [showTopBar]);

  /* ── Inline search logic ── */
  const deferredQuery = useDeferredValue(searchQuery);
  const matchedCollections = useMemo(() => {
    if (!deferredQuery.trim()) return [];
    const q = deferredQuery.toLowerCase();
    return QUICK_CATEGORIES.filter((c) => c.title.toLowerCase().includes(q) || c.handle.replace(/-/g, " ").includes(q));
  }, [deferredQuery]);

  const searchApi = useCallback(async (q: string) => {
    const trimmed = q.trim();
    if (!trimmed) return;
    const cached = apiCache.get(trimmed.toLowerCase());
    if (cached) { setSearchResults(cached); setSearchLoading(false); return; }
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setSearchLoading(true);
    try {
      const res = await fetch(
        `${SUPABASE_URL}/rest/v1/products?or=(title.ilike.%25${encodeURIComponent(trimmed)}%25,description.ilike.%25${encodeURIComponent(trimmed)}%25)&status=eq.published&select=id,title,handle,thumbnail,metadata,created_at,product_variants(price_amount),product_categories(categories(name)),product_images(url,rank)&limit=8`,
        { headers: { "apikey": SUPABASE_KEY, "Authorization": `Bearer ${SUPABASE_KEY}` }, signal: controller.signal }
      );
      if (!res.ok) return;
      const data = await res.json();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mapped: SearchResult[] = data.map((p: any) => {
        const price = (p.product_variants?.[0]?.price_amount ?? 0) * 100;
        const salePrice = p.metadata?.sale_price ? Number(p.metadata.sale_price) * 100 : undefined;
        return {
          id: p.id, title: p.title, handle: p.handle,
          price: salePrice ?? price,
          originalPrice: salePrice ? (p.metadata?.regular_price ? Number(p.metadata.regular_price) * 100 : undefined) : undefined,
          thumbnail: p.thumbnail || p.product_images?.[0]?.url || "", category: p.product_categories?.[0]?.categories?.name,
        };
      });
      apiCache.set(trimmed.toLowerCase(), mapped);
      setSearchResults(mapped);
    } catch { /* ignore */ }
    finally { setSearchLoading(false); }
  }, []);

  // Run search on query change
  useEffect(() => {
    const trimmed = searchQuery.trim();
    if (!trimmed) { setSearchResults([]); setHasSearched(false); setSearchLoading(false); if (apiDebounceRef.current) clearTimeout(apiDebounceRef.current); return; }
    const localResults = searchLocal(trimmed);
    setSearchResults(localResults);
    setHasSearched(true);
    if (trimmed.length >= 2) saveRecentSearch(trimmed);
    const cached = apiCache.get(trimmed.toLowerCase());
    if (cached) { setSearchResults(cached); return; }
    if (apiDebounceRef.current) clearTimeout(apiDebounceRef.current);
    apiDebounceRef.current = setTimeout(() => searchApi(trimmed), 200);
    return () => { if (apiDebounceRef.current) clearTimeout(apiDebounceRef.current); };
  }, [searchQuery, searchApi]);

  // Focus input when search opens
  useEffect(() => {
    if (searchOpen) {
      requestAnimationFrame(() => searchInputRef.current?.focus());
    } else {
      setSearchQuery("");
      setSearchResults([]);
      setHasSearched(false);
      abortRef.current?.abort();
    }
  }, [searchOpen]);

  // Close search on click outside
  useEffect(() => {
    if (!searchOpen) return;
    function handleClick(e: MouseEvent) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        closeSearch();
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [searchOpen, closeSearch]);

  const hasResults = hasSearched && searchResults.length > 0;
  const noResults = hasSearched && searchResults.length === 0 && !searchLoading;

  /* Shop dropdown hover handlers */
  const openShopDropdown = useCallback(() => {
    if (shopTimeout.current) clearTimeout(shopTimeout.current);
    setShopOpen(true);
  }, []);

  const closeShopDropdown = useCallback(() => {
    shopTimeout.current = setTimeout(() => setShopOpen(false), 200);
  }, []);

  const getLabel = useCallback(
    (key: string) => {
      if (key === "home") return t("common.home");
      if (key === "shop") return t("common.shop");
      if (key === "about") return t("common.about");
      if (key === "contact") return t("common.contact");
      return t(`nav.${key}`);
    },
    [t]
  );

  /* ── Shared mega dropdown content (used in top nav + super sticky) ── */
  const renderMegaDropdown = () => (
    <div className="relative flex">
      <div className="flex-1 py-5 pr-0">
        <Link
          href={`/${locale}/collections`}
          onClick={() => setShopOpen(false)}
          className="flex items-center justify-between px-6 py-2 mb-1 group"
        >
          <span className={`text-[11px] tracking-[0.2em] uppercase font-semibold transition-colors ${
            isActive("collections") ? "text-gold" : "text-charcoal group-hover:text-gold"
          }`}>
            {t("common.allCollections")}
          </span>
          <svg className="w-3.5 h-3.5 text-charcoal/20 group-hover:text-gold group-hover:translate-x-0.5 transition-all duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
          </svg>
        </Link>
        <div className="mx-6 h-px bg-charcoal/[0.05] mb-2" />
        {COLLECTION_LINKS.map((link, i) => {
          const active = isActive(link.handle);
          return (
            <motion.div
              key={link.key}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.05 + i * 0.03, duration: 0.25 }}
            >
              <Link
                href={`/${locale}/${link.handle}`}
                onClick={() => setShopOpen(false)}
                onMouseEnter={() => setHoveredCollection(link.key)}
                className={`flex items-center gap-3 px-6 py-2.5 transition-all duration-200 group/item ${
                  active ? "text-gold" : "text-charcoal/55 hover:text-charcoal hover:bg-cream/60"
                }`}
              >
                <span className={`w-1 h-1 rounded-full transition-all duration-200 ${
                  active ? "bg-gold scale-125" : "bg-charcoal/15 group-hover/item:bg-gold group-hover/item:scale-125"
                }`} />
                <span className={`text-[12px] tracking-[0.05em] transition-colors duration-200 ${
                  active ? "font-medium" : ""
                }`}>
                  {getLabel(link.key)}
                </span>
                {link.key === "newCollection" && (
                  <span className="text-[8px] tracking-wider font-bold bg-gold/10 text-gold px-1.5 py-0.5 uppercase">
                    New
                  </span>
                )}
              </Link>
            </motion.div>
          );
        })}
      </div>
      <div className="w-[200px] m-4 ml-0 relative overflow-hidden bg-[#f0eeeb]">
        <motion.div
          key={hoveredCollection}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="absolute inset-0"
        >
          <Image
            src={collectionImages[hoveredCollection] || collectionImages.bridalGowns}
            alt=""
            fill
            className="object-cover object-top"
            sizes="200px"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        </motion.div>
        <div className="absolute bottom-3 left-3 right-3 z-10">
          <span className="text-[10px] tracking-[0.2em] uppercase text-white/70 font-medium">
            {getLabel(hoveredCollection)}
          </span>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* ═══════════════════════════════════════════════
          1. ANNOUNCEMENT / INFO BAR
          ═══════════════════════════════════════════════ */}
      {showTopBar && (
        <div
          className={`z-[71] transition-all duration-300 ${
            isHomePage
              ? "absolute top-0 left-0 right-0"
              : ""
          }`}
          style={{ height: TOPBAR_H }}
        >
          <div className={`h-full transition-colors duration-300 ${
            transparentMode
              ? "bg-black/30 backdrop-blur-md"
              : "bg-[#111111]"
          }`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
              <div className="flex items-center justify-between h-full gap-4">

                {/* Left — Location (desktop only) */}
                <div className="hidden lg:flex items-center gap-4 flex-shrink-0">
                  <a
                    href="https://maps.google.com/?q=Prishtina,Kosovo"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-white/70 hover:text-white transition-colors"
                  >
                    <MapPinIcon className="w-3.5 h-3.5" />
                    <span className="text-[11px] tracking-[0.06em]">{CONTACT_INFO.address}</span>
                  </a>
                </div>

                {/* Center — Rotating announcements */}
                <div className="flex-1 flex items-center justify-center overflow-hidden relative h-full">
                  <AnimatePresence mode="wait">
                    <motion.p
                      key={annIndex}
                      initial={{ y: 12, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: -12, opacity: 0 }}
                      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                      className="text-[11px] sm:text-[12px] tracking-[0.12em] uppercase text-center whitespace-nowrap text-white/80"
                    >
                      {t(`topBar.${ANNOUNCEMENTS[annIndex]}`)}
                    </motion.p>
                  </AnimatePresence>
                  <span className="absolute right-0 top-1/2 -translate-y-1/2">
                    <InlineEditButton sectionKey="i18n.topBar" label="Top Bar" />
                  </span>
                </div>

                {/* Right — Social icons + WhatsApp + Language (desktop) */}
                <div className="hidden lg:flex items-center gap-3 flex-shrink-0">
                  <div className="flex items-center gap-2.5">
                    <a
                      href={SOCIAL_LINKS.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-white/60 hover:text-white transition-colors"
                      aria-label="Instagram"
                    >
                      <InstagramIcon className="w-4 h-4" />
                    </a>
                    <a
                      href={SOCIAL_LINKS.tiktok}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-white/60 hover:text-white transition-colors"
                      aria-label="TikTok"
                    >
                      <TikTokIcon className="w-4 h-4" />
                    </a>
                    <a
                      href={SOCIAL_LINKS.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-white/60 hover:text-white transition-colors"
                      aria-label="Facebook"
                    >
                      <FacebookIcon className="w-3.5 h-3.5" />
                    </a>
                  </div>

                  <span className="w-px h-3.5 bg-white/20" />

                  {/* Language switcher */}
                  <LanguageSwitcher className="text-white/70 hover:text-white" />
                </div>

                {/* Mobile — Language + dismiss */}
                <div className="flex lg:hidden items-center gap-2 flex-shrink-0">
                  <LanguageSwitcher className="text-white/70 hover:text-white" />
                  <button
                    onClick={() => setTopBarDismissed(true)}
                    className="p-0.5 text-white/40 hover:text-white/70 transition-colors"
                    aria-label="Dismiss"
                  >
                    <XMarkIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════
          2. MAIN HEADER (nav + logo + icons in one bar)
          ═══════════════════════════════════════════════ */}
      <header
        data-main-header
        className={`z-[70] transition-all duration-300 ${
          isHomePage
            ? `fixed left-0 right-0 lg:absolute border-b ${
                pastHero
                  ? "bg-white/95 backdrop-blur-md border-charcoal/[0.08] lg:bg-transparent lg:backdrop-blur-none lg:border-transparent"
                  : "bg-transparent border-transparent"
              }`
            : `sticky top-0 lg:static border-b ${scrolled ? "bg-white/95 backdrop-blur-md border-charcoal/[0.08]" : "bg-cream border-soft-gray/60"}`
        }`}
        style={{
          ...(isHomePage ? { top: topBarOffset } : {}),
          ...(mobileHeaderHidden ? { transform: `translateY(calc(-100% - ${isHomePage ? topBarOffset : 0}px))` } : {}),
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative flex items-center justify-between h-14 lg:h-16">

            {/* ── Left: Mobile hamburger / Desktop nav links ── */}
            <div className="flex items-center flex-1 min-w-0">
              {/* Mobile: Hamburger */}
              <button
                onClick={() => setMobileMenuOpen(true)}
                className={`lg:hidden flex items-center gap-1.5 p-2 -ml-2 transition-colors ${
                  transparentMode ? "text-white/80 hover:text-white" : "text-charcoal/70 hover:text-charcoal"
                }`}
                aria-label="Menu"
              >
                <Bars3Icon className="w-6 h-6" />
                <span className="text-[11px] tracking-[0.12em] uppercase hidden sm:inline">Menu</span>
              </button>

              {/* Mobile: Search icon */}
              <button
                onClick={() => searchOpen ? closeSearch() : openSearch()}
                className={`lg:hidden flex items-center gap-2 px-3 py-2 transition-colors ${
                  transparentMode ? "text-white/80 hover:text-white" : "text-charcoal/70 hover:text-charcoal"
                }`}
                aria-label={t("common.search")}
              >
                <MagnifyingGlassIcon className="w-[22px] h-[22px]" />
              </button>

              {/* Desktop: Navigation links */}
              <nav className="hidden lg:flex items-center gap-0">
                <InlineEditButton sectionKey="i18n.nav" label="Nav" className="mr-2" />
                {PAGE_LINKS.filter((l) => l.key === "home").map((link) => {
                  const active = isActive(link.handle);
                  return (
                    <Link key={link.key} href={`/${locale}`}
                      className={`relative px-3 py-1.5 text-[11px] font-medium tracking-widest uppercase transition-colors duration-300 whitespace-nowrap group ${
                        active ? "text-gold" : transparentMode ? "text-white/60 hover:text-white" : "text-charcoal/50 hover:text-charcoal"
                      }`}
                    >
                      {getLabel(link.key)}
                      <span className={`absolute bottom-0 left-1/2 -translate-x-1/2 h-[1.5px] bg-gold transition-all duration-400 ${active ? "w-full" : "w-0 group-hover:w-full"}`} />
                    </Link>
                  );
                })}
                <span className={`mx-2 select-none ${transparentMode ? "text-white/15" : "text-charcoal/10"}`}>/</span>
                <div ref={shopRef} className="relative" onMouseEnter={openShopDropdown} onMouseLeave={closeShopDropdown}>
                  <Link href={`/${locale}/collections`}
                    className={`relative flex items-center gap-1 px-3 py-1.5 text-[11px] font-medium tracking-widest uppercase transition-colors duration-300 whitespace-nowrap group ${
                      isShopActive() ? "text-gold" : transparentMode ? "text-white/60 hover:text-white" : "text-charcoal/50 hover:text-charcoal"
                    }`}
                  >
                    {getLabel("shop")}
                    <ChevronDownIcon className={`w-3 h-3 transition-transform duration-200 ${shopOpen ? "rotate-180" : ""}`} />
                    <span className={`absolute bottom-0 left-1/2 -translate-x-1/2 h-[1.5px] bg-gold transition-all duration-400 ${isShopActive() ? "w-full" : "w-0 group-hover:w-full"}`} />
                  </Link>
                  <AnimatePresence>
                    {shopOpen && !showSuperSticky && (
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 6 }}
                        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                        className="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-[520px] bg-white shadow-[0_20px_60px_rgba(0,0,0,0.1)] border border-charcoal/[0.06] z-[80]"
                      >
                        <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-l border-t border-charcoal/[0.06] rotate-45" />
                        {renderMegaDropdown()}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                <span className={`mx-2 select-none ${transparentMode ? "text-white/15" : "text-charcoal/10"}`}>/</span>
                {PAGE_LINKS.filter((l) => l.key !== "home").map((link, i) => {
                  const active = isActive(link.handle);
                  return (
                    <span key={link.key} className="flex items-center flex-shrink-0">
                      {i > 0 && <span className={`mx-2 select-none ${transparentMode ? "text-white/15" : "text-charcoal/10"}`}>/</span>}
                      <Link href={`/${locale}/${link.handle}`}
                        className={`relative px-3 py-1.5 text-[11px] font-medium tracking-widest uppercase transition-colors duration-300 whitespace-nowrap group ${
                          active ? "text-gold" : transparentMode ? "text-white/60 hover:text-white" : "text-charcoal/50 hover:text-charcoal"
                        }`}
                      >
                        {getLabel(link.key)}
                        <span className={`absolute bottom-0 left-1/2 -translate-x-1/2 h-[1.5px] bg-gold transition-all duration-400 ${active ? "w-full" : "w-0 group-hover:w-full"}`} />
                      </Link>
                    </span>
                  );
                })}
              </nav>
            </div>

            {/* ── Center: Logo ── */}
            <Link
              href={`/${locale}`}
              className="flex-shrink-0 lg:absolute lg:left-1/2 lg:top-1/2 lg:-translate-x-1/2 lg:-translate-y-1/2"
              aria-label="Aksa Fashion — Home"
            >
              <span className={`leading-none block text-[26px] lg:text-[28px] transition-colors duration-300 ${
                transparentMode ? "text-white" : "text-charcoal"
              }`}>
                <span className="font-black tracking-tight">aksa</span>
                <span className="font-extralight tracking-tight">fashion</span>
              </span>
            </Link>

            {/* ── Right: Search + Icons ── */}
            <div className="flex items-center justify-end flex-1 min-w-0 gap-1" ref={searchContainerRef}>
              {/* Desktop: animated search pill → input */}
              <div className="hidden lg:block relative">
                <AnimatePresence mode="wait" initial={false}>
                  {searchOpen ? (
                    <motion.div
                      key="search-input"
                      initial={{ width: 130, opacity: 0 }}
                      animate={{ width: 280, opacity: 1 }}
                      exit={{ width: 130, opacity: 0 }}
                      transition={{ duration: 0.18, ease: [0.32, 0.72, 0, 1] }}
                      className="flex items-center gap-2 px-3 h-9 rounded-full border border-charcoal/15 bg-white overflow-hidden"
                    >
                      <MagnifyingGlassIcon className="w-4 h-4 text-charcoal/30 flex-shrink-0" />
                      <input
                        ref={searchInputRef}
                        type="search"
                        placeholder={t("search.placeholder")}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Escape") closeSearch();
                          if (e.key === "Enter" && searchQuery.trim()) {
                            closeSearch();
                            window.location.href = `/${locale}/search?q=${encodeURIComponent(searchQuery)}`;
                          }
                        }}
                        className="flex-1 min-w-0 text-[13px] text-charcoal placeholder:text-charcoal/30 bg-transparent border-none outline-none tracking-wide appearance-none"
                        autoComplete="off"
                        spellCheck={false}
                      />
                      {searchLoading && (
                        <div className="w-3.5 h-3.5 border-2 border-charcoal/10 border-t-charcoal/40 rounded-full animate-spin flex-shrink-0" />
                      )}
                      <button
                        onClick={() => { setSearchQuery(""); closeSearch(); }}
                        className="p-0.5 text-charcoal/25 hover:text-charcoal transition-colors flex-shrink-0"
                      >
                        <XMarkIcon className="w-4 h-4" />
                      </button>
                    </motion.div>
                  ) : (
                    <motion.button
                      key="search-pill"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.12 }}
                      onClick={() => { searchFromStickyRef.current = false; openSearch(); }}
                      className={`flex items-center gap-2 px-4 py-1.5 rounded-full border transition-all duration-200 cursor-pointer ${
                        transparentMode
                          ? "border-white/25 text-white/60 hover:border-white/50 hover:text-white hover:bg-white/10"
                          : "border-charcoal/10 text-charcoal/40 hover:border-charcoal/25 hover:text-charcoal hover:bg-charcoal/[0.03]"
                      }`}
                      aria-label={t("common.search")}
                    >
                      <MagnifyingGlassIcon className="w-4 h-4" />
                      <span className="text-[11px] tracking-[0.08em]">{t("common.search")}</span>
                      <kbd className={`text-[9px] tracking-wider px-1.5 py-0.5 rounded ${
                        transparentMode ? "bg-white/10 text-white/40" : "bg-charcoal/[0.05] text-charcoal/30"
                      }`}>⌘K</kbd>
                    </motion.button>
                  )}
                </AnimatePresence>
              </div>

              <Link href={`/${locale}/account`}
                className={`hidden lg:block p-2 transition-colors ${
                  transparentMode ? "text-white/80 hover:text-white" : "text-charcoal/50 hover:text-charcoal"
                }`}
                aria-label={t("common.account")}
              >
                <UserIcon className="w-[20px] h-[20px]" />
              </Link>

              <Link href={`/${locale}/wishlist`}
                className={`hidden lg:block p-2 transition-colors relative ${
                  transparentMode ? "text-white/80 hover:text-white" : "text-charcoal/50 hover:text-charcoal"
                }`}
                aria-label={t("common.wishlist")}
              >
                <HeartIcon className="w-[20px] h-[20px]" />
                {wishlistCount > 0 && (
                  <span className={`absolute top-0.5 right-0.5 text-[7px] font-bold rounded-full w-3.5 h-3.5 flex items-center justify-center ${
                    transparentMode ? "bg-white text-charcoal" : "bg-charcoal text-white"
                  }`}>{wishlistCount > 9 ? "9+" : wishlistCount}</span>
                )}
              </Link>

              <button onClick={openCart}
                className={`p-2 transition-colors relative cursor-pointer ${
                  transparentMode ? "text-white/80 hover:text-white" : "text-charcoal/50 hover:text-charcoal"
                }`}
                aria-label={t("common.cart")}
              >
                <ShoppingBagIcon className="w-[20px] h-[20px]" />
                {itemCount > 0 && (
                  <span className={`absolute top-0.5 right-0.5 text-[7px] font-bold rounded-full w-3.5 h-3.5 flex items-center justify-center ${
                    transparentMode ? "bg-white text-charcoal" : "bg-charcoal text-white"
                  }`}>{itemCount}</span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* ── Search dropdown (below header, only when typing) ── */}
        <AnimatePresence>
          {searchOpen && searchQuery.trim() && (
            <>
              {/* Overlay */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.1 }}
                className="fixed inset-0 z-[65] bg-black/15 hidden lg:block"
                style={{ top: 0 }}
                onClick={closeSearch}
              />
              {/* Dropdown panel */}
              <motion.div
                initial={{ opacity: 0, y: -3 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -3 }}
                transition={{ duration: 0.12 }}
                className="absolute left-0 right-0 top-full z-[66] bg-white shadow-[0_16px_48px_rgba(0,0,0,0.12)] border-t border-charcoal/[0.06] max-h-[70vh] overflow-y-auto hidden lg:block"
              >
                <div className="max-w-4xl mx-auto px-6 py-5">
                  {/* Results */}
                  {hasResults && (
                    <div>
                      {matchedCollections.length > 0 && (
                        <div className="mb-4 pb-3 border-b border-charcoal/[0.04]">
                          {matchedCollections.map((col) => (
                            <Link key={col.handle} href={`/${locale}/collections/${col.handle}`} onClick={closeSearch}
                              className="flex items-center justify-between px-2 py-2 hover:bg-cream/80 rounded transition-colors"
                            >
                              <span className="text-[13px] text-charcoal/55">{CAT_NAV_KEYS[col.handle] ? t(`nav.${CAT_NAV_KEYS[col.handle]}`) : col.title}</span>
                              <ArrowRightIcon className="w-3 h-3 text-charcoal/20" />
                            </Link>
                          ))}
                        </div>
                      )}

                      <div className="flex items-center justify-between mb-3">
                        <span className="text-[10px] tracking-[0.12em] uppercase text-charcoal/30">
                          {searchResults.length} {searchResults.length === 1 ? t("common.result") : t("common.results")}
                        </span>
                        <Link href={`/${locale}/search?q=${encodeURIComponent(searchQuery)}`} onClick={closeSearch}
                          className="text-[10px] tracking-[0.12em] uppercase text-charcoal/30 hover:text-charcoal transition-colors"
                        >
                          {t("common.viewAll")} &rarr;
                        </Link>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {searchResults.slice(0, 8).map((product) => (
                          <ProductCard key={product.id} product={toProductCardData(product)} />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* No results */}
                  {noResults && (
                    <div className="text-center py-8">
                      <p className="text-[14px] text-charcoal/40 mb-1">{t("search.noResults", { query: searchQuery })}</p>
                      <p className="text-[12px] text-charcoal/25 mb-5">{t("search.noResultsSuggestion")}</p>
                      <div className="flex flex-wrap justify-center gap-1.5">
                        {QUICK_CATEGORIES.slice(0, 4).map((cat) => (
                          <Link key={cat.handle} href={`/${locale}/collections/${cat.handle}`} onClick={closeSearch}
                            className="px-3 py-1.5 text-[12px] text-charcoal/40 border border-charcoal/[0.08] hover:border-charcoal/20 rounded-full transition-all"
                          >
                            {CAT_NAV_KEYS[cat.handle] ? t(`nav.${CAT_NAV_KEYS[cat.handle]}`) : cat.title}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </header>

      {/* ── Mobile search dropdown (below header, full width) ── */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2 }}
            className="lg:hidden fixed left-0 right-0 z-[69] bg-white shadow-lg border-t border-charcoal/[0.06]"
            style={{ top: "auto" }}
          >
            <div className="px-4 pt-3 pb-2">
              <div className="flex items-center gap-2 px-3 h-11 rounded-lg border border-charcoal/10 bg-charcoal/[0.02]">
                <MagnifyingGlassIcon className="w-5 h-5 text-charcoal/30 flex-shrink-0" />
                <input
                  type="search"
                  placeholder={t("search.placeholder")}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Escape") closeSearch();
                    if (e.key === "Enter" && searchQuery.trim()) {
                      closeSearch();
                      window.location.href = `/${locale}/search?q=${encodeURIComponent(searchQuery)}`;
                    }
                  }}
                  className="flex-1 text-[16px] text-charcoal placeholder:text-charcoal/30 bg-transparent border-none outline-none appearance-none"
                  autoComplete="off"
                  autoFocus
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery("")} className="p-1 text-charcoal/25 hover:text-charcoal">
                    <XMarkIcon className="w-5 h-5" />
                  </button>
                )}
                <button onClick={closeSearch} className="p-1 text-charcoal/30 hover:text-charcoal">
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="max-h-[60vh] overflow-y-auto px-4 pb-4">
              {/* Mobile: collection links */}
              {searchQuery.trim() && matchedCollections.length > 0 && (
                <div className="pt-1 pb-2 border-b border-charcoal/[0.04] mb-2">
                  {matchedCollections.map((col) => (
                    <Link key={col.handle} href={`/${locale}/collections/${col.handle}`} onClick={closeSearch}
                      className="flex items-center justify-between px-2 py-2 hover:bg-cream rounded transition-colors"
                    >
                      <span className="text-[13px] text-charcoal/55">{CAT_NAV_KEYS[col.handle] ? t(`nav.${CAT_NAV_KEYS[col.handle]}`) : col.title}</span>
                      <ArrowRightIcon className="w-3 h-3 text-charcoal/20" />
                    </Link>
                  ))}
                </div>
              )}
              {/* Mobile: results */}
              {hasResults && (
                <div className="pt-2">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] tracking-[0.12em] uppercase text-charcoal/30">
                      {searchResults.length} {t("common.results")}
                    </span>
                    <Link href={`/${locale}/search?q=${encodeURIComponent(searchQuery)}`} onClick={closeSearch}
                      className="text-[10px] tracking-[0.12em] uppercase text-charcoal/30 hover:text-charcoal"
                    >{t("common.viewAll")} &rarr;</Link>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {searchResults.slice(0, 6).map((product) => (
                      <ProductCard key={product.id} product={toProductCardData(product)} />
                    ))}
                  </div>
                </div>
              )}
              {noResults && (
                <div className="text-center py-6">
                  <p className="text-[13px] text-charcoal/40">{t("search.noResults", { query: searchQuery })}</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══════════════════════════════════════════════
          4. SUPER STICKY HEADER (desktop, scroll-triggered)
          ═══════════════════════════════════════════════ */}
      <div
        data-super-sticky
        className="fixed top-0 left-0 right-0 z-[75] hidden lg:block"
        style={{
          transform: showSuperSticky ? "translateY(0)" : "translateY(-100%)",
          transition: "transform 400ms cubic-bezier(0.22, 1, 0.36, 1)",
        }}
      >
        <div className="bg-white/95 backdrop-blur-md shadow-[0_2px_20px_rgba(0,0,0,0.08)] border-b border-charcoal/[0.06]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="relative flex items-center h-14">
              {/* Left: Nav links */}
              <nav className="flex items-center gap-0">
                {PAGE_LINKS.filter((l) => l.key === "home").map((link) => {
                  const active = isActive(link.handle);
                  return (
                    <Link
                      key={link.key}
                      href={`/${locale}`}
                      className={`relative px-3 py-1.5 text-[11px] font-medium tracking-widest uppercase transition-colors duration-300 whitespace-nowrap group ${
                        active ? "text-gold" : "text-charcoal/50 hover:text-charcoal"
                      }`}
                    >
                      {getLabel(link.key)}
                      <span className={`absolute bottom-0 left-1/2 -translate-x-1/2 h-[1.5px] bg-gold transition-all duration-400 ${
                        active ? "w-full" : "w-0 group-hover:w-full"
                      }`} />
                    </Link>
                  );
                })}

                <span className="text-charcoal/10 mx-2 select-none">/</span>

                <div
                  ref={superStickyShopRef}
                  className="relative"
                  onMouseEnter={openShopDropdown}
                  onMouseLeave={closeShopDropdown}
                >
                  <Link
                    href={`/${locale}/collections`}
                    className={`relative flex items-center gap-1 px-3 py-1.5 text-[11px] font-medium tracking-widest uppercase transition-colors duration-300 whitespace-nowrap group ${
                      isShopActive() ? "text-gold" : "text-charcoal/50 hover:text-charcoal"
                    }`}
                  >
                    {getLabel("shop")}
                    <ChevronDownIcon className={`w-3 h-3 transition-transform duration-200 ${shopOpen ? "rotate-180" : ""}`} />
                    <span className={`absolute bottom-0 left-1/2 -translate-x-1/2 h-[1.5px] bg-gold transition-all duration-400 ${
                      isShopActive() ? "w-full" : "w-0 group-hover:w-full"
                    }`} />
                  </Link>

                  <AnimatePresence>
                    {shopOpen && showSuperSticky && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 6 }}
                        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                        className="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-[520px] bg-white shadow-[0_20px_60px_rgba(0,0,0,0.1)] border border-charcoal/[0.06] z-[80]"
                      >
                        <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-l border-t border-charcoal/[0.06] rotate-45" />
                        {renderMegaDropdown()}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <span className="text-charcoal/10 mx-2 select-none">/</span>

                {PAGE_LINKS.filter((l) => l.key !== "home").map((link, i) => {
                  const active = isActive(link.handle);
                  return (
                    <span key={link.key} className="flex items-center flex-shrink-0">
                      {i > 0 && <span className="text-charcoal/10 mx-2 select-none">/</span>}
                      <Link
                        href={`/${locale}/${link.handle}`}
                        className={`relative px-3 py-1.5 text-[11px] font-medium tracking-widest uppercase transition-colors duration-300 whitespace-nowrap group ${
                          active ? "text-gold" : "text-charcoal/50 hover:text-charcoal"
                        }`}
                      >
                        {getLabel(link.key)}
                        <span className={`absolute bottom-0 left-1/2 -translate-x-1/2 h-[1.5px] bg-gold transition-all duration-400 ${
                          active ? "w-full" : "w-0 group-hover:w-full"
                        }`} />
                      </Link>
                    </span>
                  );
                })}
              </nav>

              {/* Center: Logo */}
              <Link
                href={`/${locale}`}
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
                aria-label="Aksa Fashion — Home"
              >
                <span className="text-charcoal leading-none block text-[22px]">
                  <span className="font-black tracking-tight">aksa</span>
                  <span className="font-extralight tracking-tight">fashion</span>
                </span>
              </Link>

              {/* Right: Search + Icons */}
              <div className="flex items-center gap-0.5 ml-auto">
                <div className="relative">
                  <AnimatePresence mode="wait" initial={false}>
                    {searchOpen ? (
                      <motion.div
                        key="sticky-search-input"
                        initial={{ width: 120, opacity: 0 }}
                        animate={{ width: 260, opacity: 1 }}
                        exit={{ width: 120, opacity: 0 }}
                        transition={{ duration: 0.18, ease: [0.32, 0.72, 0, 1] }}
                        className="flex items-center gap-2 px-3 h-8 rounded-full border border-charcoal/15 bg-white overflow-hidden"
                      >
                        <MagnifyingGlassIcon className="w-3.5 h-3.5 text-charcoal/30 flex-shrink-0" />
                        <input
                          type="search"
                          placeholder={t("search.placeholder")}
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Escape") closeSearch();
                            if (e.key === "Enter" && searchQuery.trim()) {
                              closeSearch();
                              window.location.href = `/${locale}/search?q=${encodeURIComponent(searchQuery)}`;
                            }
                          }}
                          className="flex-1 min-w-0 text-[12px] text-charcoal placeholder:text-charcoal/30 bg-transparent border-none outline-none tracking-wide appearance-none"
                          autoComplete="off"
                          spellCheck={false}
                          autoFocus
                        />
                        {searchLoading && (
                          <div className="w-3 h-3 border-2 border-charcoal/10 border-t-charcoal/40 rounded-full animate-spin flex-shrink-0" />
                        )}
                        <button
                          onClick={() => { setSearchQuery(""); closeSearch(); }}
                          className="p-0.5 text-charcoal/25 hover:text-charcoal transition-colors flex-shrink-0"
                        >
                          <XMarkIcon className="w-3.5 h-3.5" />
                        </button>
                      </motion.div>
                    ) : (
                      <motion.button
                        key="sticky-search-pill"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.12 }}
                        onClick={() => { searchFromStickyRef.current = true; openSearch(); }}
                        className="flex items-center gap-1.5 px-3 py-1 rounded-full border border-charcoal/10 text-charcoal/40 hover:border-charcoal/25 hover:text-charcoal hover:bg-charcoal/[0.03] transition-all duration-200 cursor-pointer"
                        aria-label={t("common.search")}
                      >
                        <MagnifyingGlassIcon className="w-3.5 h-3.5" />
                        <span className="text-[10px] tracking-[0.08em]">{t("common.search")}</span>
                        <kbd className="text-[8px] tracking-wider px-1 py-0.5 rounded bg-charcoal/[0.05] text-charcoal/30">⌘K</kbd>
                      </motion.button>
                    )}
                  </AnimatePresence>
                </div>
                <Link
                  href={`/${locale}/account`}
                  className="p-2 text-charcoal/50 hover:text-charcoal transition-colors"
                  aria-label={t("common.account")}
                >
                  <UserIcon className="w-[18px] h-[18px]" />
                </Link>
                <Link
                  href={`/${locale}/wishlist`}
                  className="p-2 text-charcoal/50 hover:text-charcoal transition-colors relative"
                  aria-label={t("common.wishlist")}
                >
                  <HeartIcon className="w-[18px] h-[18px]" />
                  {wishlistCount > 0 && (
                    <span className="absolute top-0.5 right-0.5 bg-gold text-white text-[7px] font-bold rounded-full w-3.5 h-3.5 flex items-center justify-center">
                      {wishlistCount > 9 ? "9+" : wishlistCount}
                    </span>
                  )}
                </Link>
                <button
                  onClick={openCart}
                  className="p-2 text-charcoal/50 hover:text-charcoal transition-colors relative cursor-pointer"
                  aria-label={t("common.cart")}
                >
                  <ShoppingBagIcon className="w-[18px] h-[18px]" />
                  {itemCount > 0 && (
                    <span className="absolute top-0.5 right-0.5 bg-gold text-white text-[7px] font-bold rounded-full w-3.5 h-3.5 flex items-center justify-center">
                      {itemCount}
                    </span>
                  )}
                </button>
                <div className="ml-1">
                  <LanguageSwitcher className="text-charcoal/50 hover:text-charcoal" />
                </div>
              </div>
            </div>
          </div>

          {/* ── Sticky search dropdown ── */}
          <AnimatePresence>
            {searchOpen && searchQuery.trim() && showSuperSticky && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.1 }}
                  className="fixed inset-0 z-[74] bg-black/15"
                  style={{ top: 0 }}
                  onClick={closeSearch}
                />
                <motion.div
                  initial={{ opacity: 0, y: -3 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -3 }}
                  transition={{ duration: 0.12 }}
                  className="absolute left-0 right-0 top-full z-[76] bg-white shadow-[0_16px_48px_rgba(0,0,0,0.12)] border-t border-charcoal/[0.06] max-h-[70vh] overflow-y-auto"
                >
                  <div className="max-w-4xl mx-auto px-6 py-5">
                    {hasResults && (
                      <div>
                        {matchedCollections.length > 0 && (
                          <div className="mb-4 pb-3 border-b border-charcoal/[0.04]">
                            {matchedCollections.map((col) => (
                              <Link key={col.handle} href={`/${locale}/collections/${col.handle}`} onClick={closeSearch}
                                className="flex items-center justify-between px-2 py-2 hover:bg-cream/80 rounded transition-colors"
                              >
                                <span className="text-[13px] text-charcoal/55">{CAT_NAV_KEYS[col.handle] ? t(`nav.${CAT_NAV_KEYS[col.handle]}`) : col.title}</span>
                                <ArrowRightIcon className="w-3 h-3 text-charcoal/20" />
                              </Link>
                            ))}
                          </div>
                        )}

                        <div className="flex items-center justify-between mb-3">
                          <span className="text-[10px] tracking-[0.12em] uppercase text-charcoal/30">
                            {searchResults.length} {searchResults.length === 1 ? t("common.result") : t("common.results")}
                          </span>
                          <Link href={`/${locale}/search?q=${encodeURIComponent(searchQuery)}`} onClick={closeSearch}
                            className="text-[10px] tracking-[0.12em] uppercase text-charcoal/30 hover:text-charcoal transition-colors"
                          >
                            {t("common.viewAll")} &rarr;
                          </Link>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                          {searchResults.slice(0, 8).map((product) => (
                            <ProductCard key={product.id} product={toProductCardData(product)} />
                          ))}
                        </div>
                      </div>
                    )}

                    {noResults && (
                      <div className="text-center py-8">
                        <p className="text-[14px] text-charcoal/40 mb-1">{t("search.noResults", { query: searchQuery })}</p>
                        <p className="text-[12px] text-charcoal/25 mb-5">{t("search.noResultsSuggestion")}</p>
                        <div className="flex flex-wrap justify-center gap-1.5">
                          {QUICK_CATEGORIES.slice(0, 4).map((cat) => (
                            <Link key={cat.handle} href={`/${locale}/collections/${cat.handle}`} onClick={closeSearch}
                              className="px-3 py-1.5 text-[12px] text-charcoal/40 border border-charcoal/[0.08] hover:border-charcoal/20 rounded-full transition-all"
                            >
                              {CAT_NAV_KEYS[cat.handle] ? t(`nav.${CAT_NAV_KEYS[cat.handle]}`) : cat.title}
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════
          5. MOBILE SLIDE-OUT MENU
          ═══════════════════════════════════════════════ */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="fixed inset-0 z-[60] bg-black/30 backdrop-blur-[2px]"
              onClick={() => setMobileMenuOpen(false)}
            />

            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed top-0 left-0 bottom-0 z-[61] w-[85%] max-w-[380px] bg-cream flex flex-col"
            >
              {/* Menu header */}
              <div className="flex items-center justify-between px-6 sm:px-7 h-[64px] sm:h-[72px] flex-shrink-0">
                <Link
                  href={`/${locale}`}
                  onClick={() => setMobileMenuOpen(false)}
                  className="font-serif text-[20px] sm:text-[22px] tracking-[0.3em] text-charcoal"
                >
                  AKSA
                </Link>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 -mr-2 text-charcoal/50 hover:text-charcoal transition-colors"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>

              {/* Navigation */}
              <nav className="flex-1 overflow-y-auto overscroll-contain">
                <div className="px-6 sm:px-7 pt-2 pb-4">
                  <p className="text-[9px] sm:text-[10px] tracking-[0.2em] uppercase text-charcoal/30 mb-2">
                    Pages
                  </p>
                  {PAGE_LINKS.map((link, i) => {
                    const active = isActive(link.handle);
                    return (
                      <motion.div
                        key={link.key}
                        initial={{ opacity: 0, x: -12 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 + i * 0.04, duration: 0.3 }}
                      >
                        <Link
                          href={link.handle ? `/${locale}/${link.handle}` : `/${locale}`}
                          onClick={() => setMobileMenuOpen(false)}
                          className={`block py-3 sm:py-3.5 text-[16px] sm:text-[18px] tracking-[0.06em] transition-colors border-b border-charcoal/[0.06] ${
                            active ? "text-gold font-medium" : "text-charcoal hover:text-gold"
                          }`}
                        >
                          {getLabel(link.key)}
                        </Link>
                      </motion.div>
                    );
                  })}
                </div>

                <div className="px-6 sm:px-7 pb-4">
                  <motion.div
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.22, duration: 0.3 }}
                  >
                    <button
                      onClick={() => setMobileShopOpen(!mobileShopOpen)}
                      className={`flex items-center justify-between w-full py-3 sm:py-3.5 text-[16px] sm:text-[18px] tracking-[0.06em] transition-colors border-b border-charcoal/[0.06] ${
                        isShopActive() ? "text-gold font-medium" : "text-charcoal"
                      }`}
                    >
                      {getLabel("shop")}
                      <ChevronDownIcon className={`w-4 h-4 text-charcoal/30 transition-transform duration-300 ${mobileShopOpen ? "rotate-180" : ""}`} />
                    </button>
                  </motion.div>

                  <AnimatePresence>
                    {mobileShopOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                        className="overflow-hidden"
                      >
                        <div className="pt-1 pb-2 pl-3 sm:pl-4">
                          <Link
                            href={`/${locale}/collections`}
                            onClick={() => setMobileMenuOpen(false)}
                            className={`block py-2 sm:py-2.5 text-[13px] sm:text-[14px] transition-colors border-l-2 pl-3 ${
                              isActive("collections")
                                ? "text-gold border-gold font-medium"
                                : "text-charcoal/50 border-charcoal/[0.08] hover:text-charcoal hover:border-charcoal/20"
                            }`}
                          >
                            {t("common.allCollections")}
                          </Link>
                          {COLLECTION_LINKS.map((link) => {
                            const active = isActive(link.handle);
                            return (
                              <Link
                                key={link.key}
                                href={`/${locale}/${link.handle}`}
                                onClick={() => setMobileMenuOpen(false)}
                                className={`block py-2 sm:py-2.5 text-[13px] sm:text-[14px] transition-colors border-l-2 pl-3 ${
                                  active
                                    ? "text-gold border-gold font-medium"
                                    : "text-charcoal/50 border-charcoal/[0.08] hover:text-charcoal hover:border-charcoal/20"
                                }`}
                              >
                                {getLabel(link.key)}
                              </Link>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </nav>

              {/* Footer actions — social + account */}
              <div className="border-t border-charcoal/[0.06] px-6 sm:px-7 py-4 sm:py-5 flex-shrink-0 bg-white/50">
                {/* Social row */}
                <div className="flex items-center gap-3 mb-3 pb-3 border-b border-charcoal/[0.06]">
                  <a href={SOCIAL_LINKS.instagram} target="_blank" rel="noopener noreferrer" className="p-1.5 text-charcoal/40 hover:text-charcoal transition-colors" aria-label="Instagram">
                    <InstagramIcon className="w-[18px] h-[18px]" />
                  </a>
                  <a href={SOCIAL_LINKS.tiktok} target="_blank" rel="noopener noreferrer" className="p-1.5 text-charcoal/40 hover:text-charcoal transition-colors" aria-label="TikTok">
                    <TikTokIcon className="w-[18px] h-[18px]" />
                  </a>
                  <a href={SOCIAL_LINKS.facebook} target="_blank" rel="noopener noreferrer" className="p-1.5 text-charcoal/40 hover:text-charcoal transition-colors" aria-label="Facebook">
                    <FacebookIcon className="w-[16px] h-[16px]" />
                  </a>
                  <span className="flex-1" />
                  <a
                    href={SOCIAL_LINKS.whatsapp}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-[#25D366]/10 text-[#25D366] rounded-full text-[11px] tracking-[0.05em] font-medium hover:bg-[#25D366]/20 transition-colors"
                  >
                    <WhatsAppIcon className="w-3.5 h-3.5" />
                    {t("nav.chatWithUs")}
                  </a>
                </div>

                <div className="flex items-center justify-between">
                  <LanguageSwitcher />
                  <div className="flex items-center gap-1">
                    <Link
                      href={`/${locale}/account`}
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 text-charcoal/50 hover:text-charcoal transition-colors"
                    >
                      <UserIcon className="w-5 h-5" />
                      <span className="text-[11px] tracking-[0.1em] uppercase">
                        {t("common.account")}
                      </span>
                    </Link>
                    <Link
                      href={`/${locale}/wishlist`}
                      onClick={() => setMobileMenuOpen(false)}
                      className="p-2 text-charcoal/50 hover:text-charcoal transition-colors relative"
                    >
                      <HeartIcon className="w-5 h-5" />
                      {wishlistCount > 0 && (
                        <span className="absolute -top-0.5 -right-0.5 bg-charcoal text-white text-[8px] rounded-full w-4 h-4 flex items-center justify-center">
                          {wishlistCount > 9 ? "9+" : wishlistCount}
                        </span>
                      )}
                    </Link>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
