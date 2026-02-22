"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
  type ReactNode,
} from "react";
import { useAuth } from "./auth";
import { getServerWishlist, syncWishlistToServer } from "./data/supabase-wishlist";

export interface WishlistItem {
  id: string;
  title: string;
  handle: string;
  price: number;
  originalPrice?: number;
  thumbnail: string;
  hoverImage?: string;
  badge?: "new" | "sale" | "bestseller";
}

interface WishlistContextType {
  items: WishlistItem[];
  toggleItem: (item: WishlistItem) => void;
  removeItem: (id: string) => void;
  isWishlisted: (id: string) => boolean;
  itemCount: number;
}

const STORAGE_KEY = "aksa_wishlist";

const WishlistContext = createContext<WishlistContextType | null>(null);

function loadWishlist(): WishlistItem[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveWishlist(items: WishlistItem[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // localStorage full or unavailable
  }
}

/** Merge local + server wishlists: union by product ID */
function mergeWishlists(local: WishlistItem[], server: WishlistItem[]): WishlistItem[] {
  const merged = new Map<string, WishlistItem>();

  for (const item of local) {
    merged.set(item.id, item);
  }

  for (const item of server) {
    if (!merged.has(item.id)) {
      merged.set(item.id, item);
    }
  }

  return Array.from(merged.values());
}

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const { customer } = useAuth();
  const prevCustomerIdRef = useRef<string | null>(null);
  const syncingRef = useRef(false);

  useEffect(() => {
    setItems(loadWishlist());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) {
      saveWishlist(items);
    }
  }, [items, hydrated]);

  // Auth-aware: merge on login (non-blocking)
  useEffect(() => {
    if (!hydrated) return;

    const prevId = prevCustomerIdRef.current;
    const newId = customer?.id || null;
    prevCustomerIdRef.current = newId;

    if (!prevId && newId) {
      getServerWishlist()
        .then((serverItems) => {
          setItems((localItems) => {
            const merged = mergeWishlists(localItems, serverItems);
            syncWishlistToServer(merged).catch(() => {});
            return merged;
          });
        })
        .catch(() => {
          // Server wishlist unavailable — keep local
        });
    }
  }, [customer?.id, hydrated]);

  // Sync to server on changes (debounced, non-blocking)
  const syncTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!hydrated || !customer?.id || syncingRef.current) return;

    if (syncTimeoutRef.current) {
      clearTimeout(syncTimeoutRef.current);
    }

    syncTimeoutRef.current = setTimeout(() => {
      syncingRef.current = true;
      syncWishlistToServer(items)
        .catch(() => {})
        .finally(() => { syncingRef.current = false; });
    }, 1000);

    return () => {
      if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
    };
  }, [items, hydrated, customer?.id]);

  const toggleItem = useCallback((item: WishlistItem) => {
    setItems((prev) => {
      const exists = prev.find((i) => i.id === item.id);
      if (exists) {
        return prev.filter((i) => i.id !== item.id);
      }
      return [...prev, item];
    });
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const isWishlisted = useCallback(
    (id: string) => items.some((i) => i.id === id),
    [items]
  );

  const itemCount = items.length;

  return (
    <WishlistContext.Provider
      value={{ items, toggleItem, removeItem, isWishlisted, itemCount }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

const WISHLIST_DEFAULTS: WishlistContextType = {
  items: [],
  toggleItem: () => {},
  removeItem: () => {},
  isWishlisted: () => false,
  itemCount: 0,
};

export function useWishlist() {
  const context = useContext(WishlistContext);
  return context ?? WISHLIST_DEFAULTS;
}
