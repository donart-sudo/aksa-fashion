"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useAuth } from "@/lib/auth";
import { motion } from "framer-motion";
import Link from "next/link";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";

function CallbackHandler() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("account");
  const { loginWithToken } = useAuth();
  const [error, setError] = useState(false);

  useEffect(() => {
    const token = searchParams.get("token");
    if (token) {
      loginWithToken(token).then((ok) => {
        if (ok) {
          router.replace(`/${locale}/account`);
        } else {
          setError(true);
        }
      });
    } else {
      setError(true);
    }
  }, [searchParams, loginWithToken, router, locale]);

  if (error) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-sm"
        >
          <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-5">
            <ExclamationTriangleIcon className="w-8 h-8 text-red-400" />
          </div>
          <h2 className="font-serif text-xl text-charcoal mb-2">{t("authFailed")}</h2>
          <p className="text-sm text-charcoal/50 mb-6">{t("authFailedDesc")}</p>
          <Link
            href={`/${locale}/account`}
            className="inline-flex px-6 py-3 bg-charcoal text-white text-sm font-medium rounded-lg hover:bg-charcoal/90 transition-colors"
          >
            {t("backToSignIn")}
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        className="w-8 h-8 border-2 border-gold/20 border-t-gold rounded-full"
      />
      <p className="text-sm text-charcoal/50 mt-4">{t("signingIn")}</p>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-gold/20 border-t-gold rounded-full animate-spin" />
        </div>
      }
    >
      <CallbackHandler />
    </Suspense>
  );
}
