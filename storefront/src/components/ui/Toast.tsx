"use client";

import { createContext, useContext, useState, useCallback, useRef } from "react";

/* ─── Types ─── */
interface Toast {
  id: number;
  message: string;
  icon?: "cart" | "wishlist" | "success" | "error";
}

interface ToastContextValue {
  toast: (message: string, icon?: Toast["icon"]) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

/* ─── Hook ─── */
export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}

/* ─── Icons ─── */
function ToastIcon({ type }: { type: Toast["icon"] }) {
  const cls = "w-4 h-4 flex-shrink-0";
  switch (type) {
    case "cart":
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
        </svg>
      );
    case "wishlist":
      return (
        <svg className={cls} fill="currentColor" viewBox="0 0 24 24">
          <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
        </svg>
      );
    case "error":
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
        </svg>
      );
    case "success":
    default:
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
  }
}

/* ─── Provider ─── */
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const idRef = useRef(0);

  const toast = useCallback((message: string, icon?: Toast["icon"]) => {
    const id = ++idRef.current;
    setToasts((prev) => [...prev.slice(-2), { id, message, icon }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 2800);
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}

      {/* Toast container — above bottom nav */}
      <div
        className="fixed left-0 right-0 z-[100] flex flex-col items-center gap-2 pointer-events-none px-4"
        style={{ bottom: "calc(80px + env(safe-area-inset-bottom, 0px))" }}
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            className="pointer-events-auto animate-toast-in flex items-center gap-2.5 px-5 py-3 bg-charcoal/95 backdrop-blur-md text-white text-sm font-medium rounded-full shadow-xl shadow-charcoal/20 max-w-xs"
          >
            <ToastIcon type={t.icon} />
            <span>{t.message}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
