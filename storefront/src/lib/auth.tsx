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
  register: (data: { email: string; password: string; first_name: string; last_name: string }) => Promise<boolean>;
  logout: () => Promise<void>;
  loginWithToken: (token: string) => Promise<boolean>;
  requestPasswordReset: (email: string) => Promise<boolean>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<boolean>;
  signInWithOAuth: (provider: "google" | "apple", redirectTo: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function checkSession() {
      try {
        const supabase = createClient();
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          const { data } = await supabase
            .from("customers")
            .select("id, email, first_name, last_name")
            .eq("auth_user_id", session.user.id)
            .single();

          if (data) {
            setCustomer(data);
          }
        }
      } catch {
        // No active session
      } finally {
        setIsLoading(false);
      }
    }
    checkSession();
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error || !data.user) return false;

      const { data: customerData } = await supabase
        .from("customers")
        .select("id, email, first_name, last_name")
        .eq("auth_user_id", data.user.id)
        .single();

      if (customerData) {
        setCustomer(customerData);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }, []);

  const register = useCallback(async (regData: {
    email: string;
    password: string;
    first_name: string;
    last_name: string;
  }): Promise<boolean> => {
    try {
      const supabase = createClient();

      const { data, error } = await supabase.auth.signUp({
        email: regData.email,
        password: regData.password,
      });
      if (error || !data.user) return false;

      const { data: customerData, error: customerError } = await supabase
        .from("customers")
        .insert({
          auth_user_id: data.user.id,
          email: regData.email,
          first_name: regData.first_name,
          last_name: regData.last_name,
        })
        .select("id, email, first_name, last_name")
        .single();

      if (customerError || !customerData) return false;

      setCustomer(customerData);
      return true;
    } catch {
      return false;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
    } catch {
      // ignore
    }
    setCustomer(null);
  }, []);

  const loginWithToken = useCallback(async (_token: string): Promise<boolean> => {
    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return false;

      const { data } = await supabase
        .from("customers")
        .select("id, email, first_name, last_name")
        .eq("auth_user_id", session.user.id)
        .single();

      if (data) {
        setCustomer(data);
        return true;
      }
      return false;
    } catch {
      return false;
    }
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
      // Verify current password by re-authenticating
      const email = customer?.email;
      if (!email) return false;
      const { error: signInErr } = await supabase.auth.signInWithPassword({ email, password: currentPassword });
      if (signInErr) return false;
      // Update to new password
      const { error: updateErr } = await supabase.auth.updateUser({ password: newPassword });
      return !updateErr;
    } catch {
      return false;
    }
  }, [customer?.email]);

  const signInWithOAuth = useCallback(async (provider: "google" | "apple", redirectTo: string) => {
    try {
      const supabase = createClient();
      await supabase.auth.signInWithOAuth({
        provider,
        options: { redirectTo },
      });
    } catch {
      // ignore
    }
  }, []);

  return (
    <AuthContext.Provider value={{ customer, isLoading, login, register, logout, loginWithToken, requestPasswordReset, changePassword, signInWithOAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

const AUTH_DEFAULTS: AuthContextType = {
  customer: null,
  isLoading: false,
  login: async () => false,
  register: async () => false,
  logout: async () => {},
  loginWithToken: async () => false,
  requestPasswordReset: async () => false,
  changePassword: async () => false,
  signInWithOAuth: async () => {},
};

export function useAuth() {
  const context = useContext(AuthContext);
  return context ?? AUTH_DEFAULTS;
}
