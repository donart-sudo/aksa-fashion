"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from "react";

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
}

const BACKEND_URL =
  process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000";

export { BACKEND_URL };

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    async function checkSession() {
      try {
        const res = await fetch(`${BACKEND_URL}/store/customers/me`, {
          credentials: "include",
          headers: {
            "x-publishable-api-key": process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || "",
          },
        });
        if (res.ok) {
          const data = await res.json();
          setCustomer(data.customer);
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
      const tokenRes = await fetch(`${BACKEND_URL}/auth/customer/emailpass`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!tokenRes.ok) return false;

      const tokenData = await tokenRes.json();
      const token = tokenData.token;
      if (!token) return false;

      // Create session (sets session cookie)
      const sessionRes = await fetch(`${BACKEND_URL}/auth/session`, {
        method: "POST",
        credentials: "include",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!sessionRes.ok) return false;

      const meRes = await fetch(`${BACKEND_URL}/store/customers/me`, {
        credentials: "include",
        headers: {
          "x-publishable-api-key": process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || "",
        },
      });
      if (meRes.ok) {
        const data = await meRes.json();
        setCustomer(data.customer);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }, []);

  const register = useCallback(async (data: {
    email: string;
    password: string;
    first_name: string;
    last_name: string;
  }): Promise<boolean> => {
    try {
      // Step 1: Create auth identity
      const authRes = await fetch(`${BACKEND_URL}/auth/customer/emailpass/register`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: data.email, password: data.password }),
      });
      if (!authRes.ok) return false;

      const authData = await authRes.json();
      const token = authData.token;
      if (!token) return false;

      // Step 2: Create session from token (sets session cookie)
      const sessionRes = await fetch(`${BACKEND_URL}/auth/session`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (!sessionRes.ok) return false;

      // Step 3: Create customer profile using session
      const customerRes = await fetch(`${BACKEND_URL}/store/customers`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "x-publishable-api-key": process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || "",
        },
        body: JSON.stringify({
          email: data.email,
          first_name: data.first_name,
          last_name: data.last_name,
        }),
      });
      if (!customerRes.ok) return false;

      const customerData = await customerRes.json();
      setCustomer(customerData.customer);
      return true;
    } catch {
      return false;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await fetch(`${BACKEND_URL}/auth/session`, {
        method: "DELETE",
        credentials: "include",
      });
    } catch {
      // ignore
    }
    setCustomer(null);
  }, []);

  const loginWithToken = useCallback(async (token: string): Promise<boolean> => {
    try {
      // Create session with the OAuth token
      const sessionRes = await fetch(`${BACKEND_URL}/auth/session`, {
        method: "POST",
        credentials: "include",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!sessionRes.ok) return false;

      // Fetch customer data
      const meRes = await fetch(`${BACKEND_URL}/store/customers/me`, {
        credentials: "include",
        headers: {
          "x-publishable-api-key": process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || "",
        },
      });
      if (meRes.ok) {
        const data = await meRes.json();
        setCustomer(data.customer);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }, []);

  const requestPasswordReset = useCallback(async (email: string): Promise<boolean> => {
    try {
      await fetch(`${BACKEND_URL}/store/customers/password-token`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-publishable-api-key": process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || "",
        },
        body: JSON.stringify({ email }),
      });
      // Always return true so we don't reveal whether the email exists
      return true;
    } catch {
      return true;
    }
  }, []);

  return (
    <AuthContext.Provider value={{ customer, isLoading, login, register, logout, loginWithToken, requestPasswordReset }}>
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
};

export function useAuth() {
  const context = useContext(AuthContext);
  return context ?? AUTH_DEFAULTS;
}
