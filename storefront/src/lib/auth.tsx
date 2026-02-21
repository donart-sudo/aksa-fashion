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

  // Fetch customer record — uses the shared client so session/RLS works
  const fetchCustomer = useCallback(async (authUserId: string): Promise<boolean> => {
    try {
      const supabase = getSupabase();
      const { data, error } = await supabase
        .from("customers")
        .select("id, email, first_name, last_name")
        .eq("auth_user_id", authUserId)
        .single();

      if (error) {
        console.warn("[Auth] fetchCustomer query error:", error.message);
        return false;
      }

      if (data) {
        setCustomer(data);
        return true;
      }
    } catch (err) {
      console.warn("[Auth] fetchCustomer exception:", err);
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
          await fetchCustomer(session.user.id);
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

    // Safety net: force loading to false after 6 seconds
    const safetyTimeout = setTimeout(() => {
      if (!cancelled) setIsLoading(false);
    }, 6000);

    // Listen for auth state changes
    const supabase = getSupabase();
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === "SIGNED_IN" && session) {
          await fetchCustomer(session.user.id);
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
    try {
      const supabase = getSupabase();
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) {
        console.warn("[Auth] signInWithPassword error:", error.message);
        return { success: false, error: "invalid_credentials" };
      }
      if (!data.user) return { success: false, error: "invalid_credentials" };

      // Use the same client — session is already set on it
      const { data: customerData, error: customerError } = await supabase
        .from("customers")
        .select("id, email, first_name, last_name")
        .eq("auth_user_id", data.user.id)
        .single();

      if (customerError || !customerData) {
        console.warn("[Auth] customer fetch after login error:", customerError?.message || "no row");
        // Sign out since there's no customer profile for this auth user
        await supabase.auth.signOut();
        return { success: false, error: "no_customer" };
      }

      setCustomer(customerData);
      return { success: true };
    } catch (err) {
      console.warn("[Auth] login exception:", err);
      return { success: false, error: "invalid_credentials" };
    }
  }, []);

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
            // Registration succeeded on the server, but auto-login failed.
            // Return success and let the user sign in manually.
            return { success: true, needsConfirmation: false };
          }

          console.log("[Auth] register: Step 3 done — signed in as", data.user.id);

          // Step 4: Fetch customer record
          console.log("[Auth] register: Step 4 — fetching customer record");
          try {
            const { data: customerData } = await supabase
              .from("customers")
              .select("id, email, first_name, last_name")
              .eq("auth_user_id", data.user.id)
              .single();

            if (customerData) {
              console.log("[Auth] register: Step 4 done — customer loaded:", customerData.id);
              setCustomer(customerData);
            } else {
              console.warn("[Auth] register: Step 4 — no customer record found");
            }
          } catch (custErr) {
            console.warn("[Auth] register: Step 4 — customer fetch exception:", custErr);
            // Don't fail — user is signed in, customer will load on next page visit
          }

          return { success: true };
        } catch (signInErr) {
          console.warn("[Auth] register: Step 3 — signIn exception:", signInErr);
          // Registration succeeded, but auto-login errored. Let user sign in manually.
          return { success: true, needsConfirmation: false };
        }
      } catch (err) {
        console.error("[Auth] register: outer exception:", err);
        return { success: false, error: "Registration failed" };
      }
    };

    return Promise.race([doRegister(), totalTimeout]);
  }, []);

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
      const supabase = getSupabase();
      await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/account/reset-password`,
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
