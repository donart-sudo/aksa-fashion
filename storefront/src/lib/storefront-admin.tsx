"use client";

import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { createClient } from "@supabase/supabase-js";

interface StorefrontAdminState {
  isAdmin: boolean;
  editMode: boolean;
  setEditMode: (v: boolean) => void;
  token: string | null;
}

const Ctx = createContext<StorefrontAdminState>({
  isAdmin: false,
  editMode: false,
  setEditMode: () => {},
  token: null,
});

export function StorefrontAdminProvider({ children }: { children: ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [token, setToken] = useState<string | null>(null);

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

  return (
    <Ctx.Provider value={{ isAdmin, editMode, setEditMode, token }}>
      {children}
    </Ctx.Provider>
  );
}

export function useStorefrontAdmin() {
  return useContext(Ctx);
}
