"use client";

import { useTranslations } from "next-intl";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

export default function AccountPage() {
  const t = useTranslations("account");

  return (
    <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
      <h1 className="font-serif text-3xl lg:text-4xl text-charcoal mb-2 text-center">
        {t("signIn")}
      </h1>
      <p className="text-charcoal/60 text-center mb-8">
        Welcome back to Aksa Fashion
      </p>

      <form className="space-y-4">
        <Input
          id="email"
          label="Email"
          type="email"
          placeholder="your@email.com"
        />
        <Input
          id="password"
          label="Password"
          type="password"
          placeholder="••••••••"
        />
        <Button variant="primary" className="w-full">
          {t("signIn")}
        </Button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm text-charcoal/60">
          Don&apos;t have an account?{" "}
          <button className="text-gold hover:text-gold-dark font-medium">
            {t("signUp")}
          </button>
        </p>
      </div>
    </div>
  );
}
