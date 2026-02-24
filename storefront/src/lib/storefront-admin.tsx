"use client";

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { createClient } from "@supabase/supabase-js";

interface StorefrontAdminState {
  isAdmin: boolean;
  editMode: boolean;
  setEditMode: (v: boolean) => void;
  token: string | null;
  /** Live content overrides from the editor — keyed by sectionKey */
  liveContent: Record<string, unknown>;
  setLiveContent: (sectionKey: string, content: unknown) => void;
  clearLiveContent: (sectionKey: string) => void;
  /** Currently highlighted section key (scroll-to + outline) */
  highlightedSection: string | null;
  setHighlightedSection: (key: string | null) => void;
}

const Ctx = createContext<StorefrontAdminState>({
  isAdmin: false,
  editMode: false,
  setEditMode: () => {},
  token: null,
  liveContent: {},
  setLiveContent: () => {},
  clearLiveContent: () => {},
  highlightedSection: null,
  setHighlightedSection: () => {},
});

export function StorefrontAdminProvider({ children }: { children: ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [liveContent, setLiveContentState] = useState<Record<string, unknown>>({});
  const [highlightedSection, setHighlightedSection] = useState<string | null>(null);

  useEffect(() => {
    async function check() {
      try {
        const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
        const supabase = createClient(url, key);
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        setToken(session.access_token);

        // Verify user is admin
        const { data } = await supabase
          .from("admin_users")
          .select("id")
          .eq("auth_user_id", session.user.id)
          .single();

        if (data) setIsAdmin(true);
      } catch {
        // Not admin or no session — no-op
      }
    }
    check();
  }, []);

  const setLiveContent = useCallback((sectionKey: string, content: unknown) => {
    setLiveContentState((prev) => ({ ...prev, [sectionKey]: content }));
  }, []);

  const clearLiveContent = useCallback((sectionKey: string) => {
    setLiveContentState((prev) => {
      const next = { ...prev };
      delete next[sectionKey];
      return next;
    });
  }, []);

  return (
    <Ctx.Provider value={{ isAdmin, editMode, setEditMode, token, liveContent, setLiveContent, clearLiveContent, highlightedSection, setHighlightedSection }}>
      {children}
    </Ctx.Provider>
  );
}

export function useStorefrontAdmin() {
  return useContext(Ctx);
}
