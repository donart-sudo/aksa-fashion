"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from "react";

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

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setItems(loadWishlist());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) {
      saveWishlist(items);
    }
  }, [items, hydrated]);

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
