"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { useAuth } from "@/lib/auth";
import {
  UserIcon,
  ArrowRightStartOnRectangleIcon,
} from "@heroicons/react/24/outline";

export default function AccountPage() {
  const t = useTranslations("account");
  const tc = useTranslations("common");
  const locale = useLocale();
  const { customer, isLoading, login, register, logout } = useAuth();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (isLoading) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <div className="w-6 h-6 border-2 border-gold/30 border-t-gold rounded-full animate-spin mx-auto" />
      </div>
    );
  }

  // Logged-in dashboard
  if (customer) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-14 h-14 rounded-full bg-gold/10 flex items-center justify-center">
            <UserIcon className="w-7 h-7 text-gold" />
          </div>
          <div>
            <h1 className="font-serif text-2xl text-charcoal">
              {customer.first_name} {customer.last_name}
            </h1>
            <p className="text-sm text-charcoal/50">{customer.email}</p>
          </div>
        </div>

        <div className="grid gap-3">
          <Link
            href={`/${locale}/account/orders`}
            className="flex items-center justify-between p-4 border border-soft-gray/50 hover:border-gold transition-colors"
          >
            <span className="text-sm font-medium text-charcoal">{t("myOrders")}</span>
            <span className="text-charcoal/30">→</span>
          </Link>
          <Link
            href={`/${locale}/wishlist`}
            className="flex items-center justify-between p-4 border border-soft-gray/50 hover:border-gold transition-colors"
          >
            <span className="text-sm font-medium text-charcoal">{tc("wishlist")}</span>
            <span className="text-charcoal/30">→</span>
          </Link>
        </div>

        <button
          onClick={logout}
          className="mt-8 flex items-center gap-2 text-sm text-charcoal/50 hover:text-red-500 transition-colors"
        >
          <ArrowRightStartOnRectangleIcon className="w-4 h-4" />
          {t("signOut")}
        </button>
      </div>
    );
  }

  // Login / Register forms
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    if (mode === "login") {
      const ok = await login(email, password);
      if (!ok) setError(t("loginError"));
    } else {
      const ok = await register({
        email,
        password,
        first_name: firstName,
        last_name: lastName,
      });
      if (!ok) setError(t("registerError"));
    }
    setSubmitting(false);
  };

  return (
    <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
      <h1 className="font-serif text-3xl lg:text-4xl text-charcoal mb-2 text-center">
        {mode === "login" ? t("signIn") : t("signUp")}
      </h1>
      <p className="text-charcoal/60 text-center mb-8">
        {mode === "login"
          ? t("welcomeBack")
          : t("createAccountSubtitle")}
      </p>

      <form className="space-y-4" onSubmit={handleSubmit}>
        {mode === "register" && (
          <div className="grid grid-cols-2 gap-4">
            <Input
              id="firstName"
              label={t("firstName")}
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder={t("firstName")}
              required
            />
            <Input
              id="lastName"
              label={t("lastName")}
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder={t("lastName")}
              required
            />
          </div>
        )}
        <Input
          id="email"
          label={t("email")}
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          required
        />
        <Input
          id="password"
          label={t("password")}
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          required
        />

        {error && (
          <p className="text-sm text-red-500">{error}</p>
        )}

        <Button
          variant="primary"
          className="w-full"
          disabled={submitting}
          type="submit"
        >
          {submitting ? tc("loading") : mode === "login" ? t("signIn") : t("signUp")}
        </Button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm text-charcoal/60">
          {mode === "login" ? (
            <>
              {t("noAccount")}{" "}
              <button
                onClick={() => { setMode("register"); setError(""); }}
                className="text-gold hover:text-gold-dark font-medium"
              >
                {t("signUp")}
              </button>
            </>
          ) : (
            <>
              {t("hasAccount")}{" "}
              <button
                onClick={() => { setMode("login"); setError(""); }}
                className="text-gold hover:text-gold-dark font-medium"
              >
                {t("signIn")}
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
