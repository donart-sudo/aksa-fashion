"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from "react";
import { createClient } from "./supabase";

interface Customer {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
}

interface AuthContextType {
  customer: Customer | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (data: { email: string; password: string; first_name: string; last_name: string }) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  requestPasswordReset: (email: string) => Promise<boolean>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<boolean>;
  signInWithOAuth: (provider: "google") => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch customer record for the current auth user
  const fetchCustomer = useCallback(async (authUserId: string) => {
    const supabase = createClient();
    const { data } = await supabase
      .from("customers")
      .select("id, email, first_name, last_name")
      .eq("auth_user_id", authUserId)
      .single();

    if (data) {
      setCustomer(data);
      return true;
    }
    return false;
  }, []);

  useEffect(() => {
    async function checkSession() {
      try {
        const supabase = createClient();
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          await fetchCustomer(session.user.id);
        }
      } catch {
        // No active session
      } finally {
        setIsLoading(false);
      }
    }
    checkSession();

    // Listen for auth state changes (handles OAuth redirect session pickup)
    const supabase = createClient();
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === "SIGNED_IN" && session) {
          await fetchCustomer(session.user.id);
        } else if (event === "SIGNED_OUT") {
          setCustomer(null);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [fetchCustomer]);

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error || !data.user) return false;

      return await fetchCustomer(data.user.id);
    } catch {
      return false;
    }
  }, [fetchCustomer]);

  const register = useCallback(async (regData: {
    email: string;
    password: string;
    first_name: string;
    last_name: string;
  }): Promise<{ success: boolean; error?: string }> => {
    try {
      // Use the server-side API route to create user + customer (bypasses RLS)
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(regData),
      });

      const result = await res.json();

      if (!res.ok) {
        return { success: false, error: result.error };
      }

      // Sign in immediately after registration
      const supabase = createClient();
      const { data, error } = await supabase.auth.signInWithPassword({
        email: regData.email,
        password: regData.password,
      });

      if (error || !data.user) {
        return { success: false, error: "Account created but sign-in failed. Please sign in manually." };
      }

      await fetchCustomer(data.user.id);
      return { success: true };
    } catch {
      return { success: false, error: "Registration failed" };
    }
  }, [fetchCustomer]);

  const logout = useCallback(async () => {
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
    } catch {
      // ignore
    }
    setCustomer(null);
  }, []);

  const requestPasswordReset = useCallback(async (email: string): Promise<boolean> => {
    try {
      const supabase = createClient();
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
      const supabase = createClient();
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
      // Detect current locale from URL
      const pathParts = window.location.pathname.split("/");
      const locale = pathParts[1] || "en";

      const supabase = createClient();
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
  login: async () => false,
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
