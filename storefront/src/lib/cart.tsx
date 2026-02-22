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
import { getServerCart, syncCartToServer, clearServerCart } from "./data/supabase-cart";

export interface CartItem {
  id: string;
  productId: string;
  variantId: string;
  handle: string;
  title: string;
  thumbnail: string;
  price: number;
  quantity: number;
  size?: string;
  color?: string;
}

interface CartContextType {
  items: CartItem[];
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  addItem: (item: Omit<CartItem, "id">) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  itemCount: number;
  subtotal: number;
}

const STORAGE_KEY = "aksa_cart";

const CartContext = createContext<CartContextType | null>(null);

function loadCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    const items: CartItem[] = JSON.parse(stored);
    // Filter out items with stale localhost URLs from old backend
    return items.filter(item => !item.thumbnail?.includes("localhost:9000"));
  } catch {
    return [];
  }
}

function saveCart(items: CartItem[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // localStorage full or unavailable
  }
}

/** Merge local + server carts: union by variantId+size+color, sum quantities (cap 10) */
function mergeCarts(local: CartItem[], server: CartItem[]): CartItem[] {
  const merged = new Map<string, CartItem>();

  for (const item of local) {
    const key = `${item.variantId}|${item.size || ""}|${item.color || ""}`;
    merged.set(key, { ...item });
  }

  for (const item of server) {
    const key = `${item.variantId}|${item.size || ""}|${item.color || ""}`;
    const existing = merged.get(key);
    if (existing) {
      existing.quantity = Math.min(existing.quantity + item.quantity, 10);
    } else {
      merged.set(key, { ...item });
    }
  }

  return Array.from(merged.values());
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const { customer } = useAuth();
  const prevCustomerIdRef = useRef<string | null>(null);
  const syncingRef = useRef(false);

  // Hydrate from localStorage on mount
  useEffect(() => {
    setItems(loadCart());
    setHydrated(true);
  }, []);

  // Persist to localStorage on change (after hydration)
  useEffect(() => {
    if (hydrated) {
      saveCart(items);
    }
  }, [items, hydrated]);

  // Auth-aware: merge on login, sync on changes
  useEffect(() => {
    if (!hydrated) return;

    const prevId = prevCustomerIdRef.current;
    const newId = customer?.id || null;
    prevCustomerIdRef.current = newId;

    // Login detected: merge server cart with local cart (non-blocking)
    if (!prevId && newId) {
      getServerCart()
        .then((serverItems) => {
          setItems((localItems) => {
            const merged = mergeCarts(localItems, serverItems);
            syncCartToServer(merged).catch(() => {});
            return merged;
          });
        })
        .catch(() => {
          // Server cart unavailable — keep local
        });
    }
  }, [customer?.id, hydrated]);

  // Sync to server on cart changes (debounced, non-blocking)
  const syncTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!hydrated || !customer?.id || syncingRef.current) return;

    if (syncTimeoutRef.current) {
      clearTimeout(syncTimeoutRef.current);
    }

    syncTimeoutRef.current = setTimeout(() => {
      syncingRef.current = true;
      syncCartToServer(items)
        .catch(() => {})
        .finally(() => { syncingRef.current = false; });
    }, 1000);

    return () => {
      if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
    };
  }, [items, hydrated, customer?.id]);

  const openCart = useCallback(() => setIsOpen(true), []);
  const closeCart = useCallback(() => setIsOpen(false), []);
  const toggleCart = useCallback(() => setIsOpen((prev) => !prev), []);

  const addItem = useCallback(
    (newItem: Omit<CartItem, "id">) => {
      setItems((prev) => {
        const existing = prev.find(
          (item) =>
            item.variantId === newItem.variantId &&
            item.size === newItem.size &&
            item.color === newItem.color
        );
        if (existing) {
          return prev.map((item) =>
            item.id === existing.id
              ? { ...item, quantity: item.quantity + newItem.quantity }
              : item
          );
        }
        return [
          ...prev,
          { ...newItem, id: `cart_${Date.now()}_${Math.random().toString(36).slice(2)}` },
        ];
      });
      setIsOpen(true);
    },
    []
  );

  const removeItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const updateQuantity = useCallback((id: string, quantity: number) => {
    if (quantity < 1) return;
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, quantity } : item))
    );
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
    setIsOpen(false);
    // Also clear server cart if logged in
    if (customer?.id) {
      clearServerCart().catch(() => {});
    }
  }, [customer?.id]);

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        items,
        isOpen,
        openCart,
        closeCart,
        toggleCart,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        itemCount,
        subtotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

const CART_DEFAULTS: CartContextType = {
  items: [],
  isOpen: false,
  openCart: () => {},
  closeCart: () => {},
  toggleCart: () => {},
  addItem: () => {},
  removeItem: () => {},
  updateQuantity: () => {},
  clearCart: () => {},
  itemCount: 0,
  subtotal: 0,
};

export function useCart() {
  const context = useContext(CartContext);
  return context ?? CART_DEFAULTS;
}
