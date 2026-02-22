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
import { createClient } from "./supabase";
import type { SupabaseClient } from "@supabase/supabase-js";

interface Customer {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
}

interface AuthContextType {
  customer: Customer | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: "invalid_credentials" | "no_customer" }>;
  register: (data: { email: string; password: string; first_name: string; last_name: string }) => Promise<{ success: boolean; needsConfirmation?: boolean; error?: string }>;
  logout: () => Promise<void>;
  requestPasswordReset: (email: string) => Promise<boolean>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<boolean>;
  signInWithOAuth: (provider: "google") => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

/** Small delay helper */
const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

export function AuthProvider({ children }: { children: ReactNode }) {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Single shared Supabase client for the entire auth provider
  const supabaseRef = useRef<SupabaseClient | null>(null);
  function getSupabase() {
    if (!supabaseRef.current) {
      supabaseRef.current = createClient();
    }
    return supabaseRef.current;
  }

  // Guard: when login/register is in progress, skip onAuthStateChange fetchCustomer
  const authActionInProgressRef = useRef(false);

  // Fetch customer record — single attempt with timeout per query
  const fetchCustomer = useCallback(async (authUserId: string, retries = 1): Promise<boolean> => {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const supabase = getSupabase();

        // Race the query against a 4s per-attempt timeout
        const result = await Promise.race([
          supabase
            .from("customers")
            .select("id, email, first_name, last_name")
            .eq("auth_user_id", authUserId)
            .single(),
          wait(4000).then(() => ({ data: null, error: { message: "timeout" } })),
        ]);

        const { data, error } = result as { data: Customer | null; error: { message: string } | null };

        if (data) {
          setCustomer(data);
          return true;
        }

        if (error) {
          console.warn(`[Auth] fetchCustomer attempt ${attempt}/${retries}:`, error.message);
        }
      } catch (err) {
        console.warn(`[Auth] fetchCustomer attempt ${attempt}/${retries} exception:`, err);
      }

      if (attempt < retries) {
        await wait(500);
      }
    }
    return false;
  }, []);

  // Check existing session on mount
  useEffect(() => {
    let cancelled = false;

    async function checkSession() {
      try {
        const supabase = getSupabase();
        const { data: { session }, error } = await supabase.auth.getSession();

        if (cancelled) return;

        if (error) {
          console.warn("[Auth] getSession error:", error.message);
        } else if (session) {
          await fetchCustomer(session.user.id, 2);
        }
      } catch (err) {
        console.warn("[Auth] checkSession exception:", err);
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }
    checkSession();

    // Safety net: force loading to false after 5 seconds
    const safetyTimeout = setTimeout(() => {
      if (!cancelled) setIsLoading(false);
    }, 5000);

    // Listen for auth state changes
    const supabase = getSupabase();
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === "SIGNED_IN" && session) {
          // Skip if login/register function is handling this
          if (!authActionInProgressRef.current) {
            await fetchCustomer(session.user.id, 2);
          }
        } else if (event === "SIGNED_OUT") {
          setCustomer(null);
        }
      }
    );

    return () => {
      cancelled = true;
      clearTimeout(safetyTimeout);
      subscription.unsubscribe();
    };
  }, [fetchCustomer]);

  const login = useCallback(async (email: string, password: string): Promise<{ success: boolean; error?: "invalid_credentials" | "no_customer" }> => {
    // Timeout wrapper — never hang longer than 8 seconds
    const timeout = new Promise<{ success: false; error: "invalid_credentials" }>((resolve) =>
      setTimeout(() => {
        console.error("[Auth] login: 8s timeout reached");
        resolve({ success: false, error: "invalid_credentials" });
      }, 8000)
    );

    const doLogin = async (): Promise<{ success: boolean; error?: "invalid_credentials" | "no_customer" }> => {
      try {
        authActionInProgressRef.current = true;
        const supabase = getSupabase();
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });

        if (error) {
          console.warn("[Auth] signInWithPassword error:", error.message);
          return { success: false, error: "invalid_credentials" };
        }
        if (!data.user) return { success: false, error: "invalid_credentials" };

        // Fetch customer with 2 retries
        const found = await fetchCustomer(data.user.id, 2);

        if (!found) {
          console.warn("[Auth] customer not found after login");
          await supabase.auth.signOut();
          return { success: false, error: "no_customer" };
        }

        return { success: true };
      } catch (err) {
        console.warn("[Auth] login exception:", err);
        return { success: false, error: "invalid_credentials" };
      } finally {
        authActionInProgressRef.current = false;
      }
    };

    return Promise.race([doLogin(), timeout]);
  }, [fetchCustomer]);

  const register = useCallback(async (regData: {
    email: string;
    password: string;
    first_name: string;
    last_name: string;
  }): Promise<{ success: boolean; needsConfirmation?: boolean; error?: string }> => {
    // Total timeout wrapper — never let the entire register flow exceed 10s
    const totalTimeout = new Promise<{ success: false; error: string }>((resolve) =>
      setTimeout(() => {
        console.error("[Auth] register: TOTAL 10s timeout reached — aborting");
        resolve({ success: false, error: "Registration timed out. Please try signing in." });
      }, 10000)
    );

    const doRegister = async (): Promise<{ success: boolean; needsConfirmation?: boolean; error?: string }> => {
      try {
        authActionInProgressRef.current = true;
        // Step 1: Call the server-side API route to create user + customer
        console.log("[Auth] register: Step 1 — calling /api/auth/register");
        const controller = new AbortController();
        const fetchTimeout = setTimeout(() => controller.abort(), 8000);

        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(regData),
          signal: controller.signal,
        });

        clearTimeout(fetchTimeout);
        const result = await res.json();
        console.log("[Auth] register: Step 1 done — API response:", res.status, result);

        if (!res.ok) {
          return { success: false, error: result.error };
        }

        // Step 2: If email confirmation is required, don't try to sign in yet
        if (result.needsConfirmation) {
          console.log("[Auth] register: Step 2 — email confirmation required, returning");
          return { success: true, needsConfirmation: true };
        }

        // Step 3: No confirmation needed — sign in directly to create browser session
        console.log("[Auth] register: Step 3 — signing in with password");
        try {
          const supabase = getSupabase();
          const { data, error } = await supabase.auth.signInWithPassword({
            email: regData.email,
            password: regData.password,
          });

          if (error || !data.user) {
            console.warn("[Auth] register: Step 3 — signInWithPassword failed:", error?.message || "no user");
            return { success: true, needsConfirmation: false };
          }

          console.log("[Auth] register: Step 3 done — signed in as", data.user.id);

          // Step 4: Fetch customer record with retry
          console.log("[Auth] register: Step 4 — fetching customer record");
          const found = await fetchCustomer(data.user.id, 3);
          if (found) {
            console.log("[Auth] register: Step 4 done — customer loaded");
          } else {
            console.warn("[Auth] register: Step 4 — customer not found after retries");
          }

          return { success: true };
        } catch (signInErr) {
          console.warn("[Auth] register: Step 3 — signIn exception:", signInErr);
          return { success: true, needsConfirmation: false };
        }
      } catch (err) {
        console.error("[Auth] register: outer exception:", err);
        return { success: false, error: "Registration failed" };
      } finally {
        authActionInProgressRef.current = false;
      }
    };

    return Promise.race([doRegister(), totalTimeout]);
  }, [fetchCustomer]);

  const logout = useCallback(async () => {
    try {
      const supabase = getSupabase();
      await supabase.auth.signOut();
    } catch {
      // ignore
    }
    setCustomer(null);
  }, []);

  const requestPasswordReset = useCallback(async (email: string): Promise<boolean> => {
    try {
      const pathParts = window.location.pathname.split("/");
      const locale = pathParts[1] || "en";
      const origin = window.location.origin;

      const supabase = getSupabase();
      // Route through callback API to handle PKCE code exchange, then redirect to reset page
      await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${origin}/api/auth/callback?next=/${locale}/account/reset-password`,
      });
      return true;
    } catch {
      return true;
    }
  }, []);

  const changePassword = useCallback(async (currentPassword: string, newPassword: string): Promise<boolean> => {
    try {
      const supabase = getSupabase();
      const email = customer?.email;
      if (!email) return false;
      const { error: signInErr } = await supabase.auth.signInWithPassword({ email, password: currentPassword });
      if (signInErr) return false;
      const { error: updateErr } = await supabase.auth.updateUser({ password: newPassword });
      return !updateErr;
    } catch {
      return false;
    }
  }, [customer?.email]);

  const signInWithOAuth = useCallback(async (provider: "google") => {
    try {
      const pathParts = window.location.pathname.split("/");
      const locale = pathParts[1] || "en";

      const supabase = getSupabase();
      await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/api/auth/callback?next=/${locale}/account`,
        },
      });
    } catch {
      // ignore
    }
  }, []);

  return (
    <AuthContext.Provider value={{ customer, isLoading, login, register, logout, requestPasswordReset, changePassword, signInWithOAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

const AUTH_DEFAULTS: AuthContextType = {
  customer: null,
  isLoading: false,
  login: async () => ({ success: false }),
  register: async () => ({ success: false }),
  logout: async () => {},
  requestPasswordReset: async () => false,
  changePassword: async () => false,
  signInWithOAuth: async () => {},
};

export function useAuth() {
  const context = useContext(AuthContext);
  return context ?? AUTH_DEFAULTS;
}
