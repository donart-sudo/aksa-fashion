"use client";

import { useState, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { useAuth, BACKEND_URL } from "@/lib/auth";
import { useWishlist } from "@/lib/wishlist";
import {
  UserIcon,
  ArrowRightStartOnRectangleIcon,
  HeartIcon,
  ShoppingBagIcon,
  MapPinIcon,
  ChevronRightIcon,
  SparklesIcon,
  TruckIcon,
  ClockIcon,
  StarIcon,
  EyeIcon,
  EyeSlashIcon,
  EnvelopeIcon,
  LockClosedIcon,
  PhoneIcon,
  ArrowLeftIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";
import { HeartIcon as HeartSolidIcon } from "@heroicons/react/24/solid";

/* ─── Animated background orb ─── */
function FloatingOrb({ delay, size, x, y }: { delay: number; size: number; x: string; y: string }) {
  return (
    <motion.div
      className="absolute rounded-full bg-gold/5 blur-3xl pointer-events-none"
      style={{ width: size, height: size, left: x, top: y }}
      animate={{
        y: [0, -30, 0],
        opacity: [0.3, 0.6, 0.3],
      }}
      transition={{
        duration: 6,
        repeat: Infinity,
        delay,
        ease: "easeInOut",
      }}
    />
  );
}

/* ─── Benefits showcase for auth page ─── */
function BenefitsPanel({ t }: { t: (key: string) => string }) {
  const benefits = [
    { icon: HeartSolidIcon, titleKey: "benefit1Title", descKey: "benefit1Desc", color: "text-rose-400" },
    { icon: TruckIcon, titleKey: "benefit2Title", descKey: "benefit2Desc", color: "text-gold" },
    { icon: SparklesIcon, titleKey: "benefit3Title", descKey: "benefit3Desc", color: "text-amber-500" },
    { icon: StarIcon, titleKey: "benefit4Title", descKey: "benefit4Desc", color: "text-gold" },
  ];

  return (
    <div className="hidden lg:flex relative flex-col justify-center items-center bg-charcoal overflow-hidden">
      {/* Decorative image overlay */}
      <div className="absolute inset-0">
        <Image
          src="http://localhost:9000/static/1771434665088-Lumi-scaled.jpg"
          alt="Luxury bridal gown"
          fill
          className="object-cover opacity-20"
          sizes="50vw"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-charcoal/80 via-charcoal/60 to-charcoal/90" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-md px-12 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="font-serif text-3xl xl:text-4xl text-white mb-3">
            Join the Aksa Fashion Family
          </h2>
          <p className="text-white/60 mb-10 leading-relaxed">
            Create your account and unlock a world of luxury bridal and evening wear.
          </p>
        </motion.div>

        <div className="space-y-6">
          {benefits.map((b, i) => (
            <motion.div
              key={b.titleKey}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 + i * 0.1 }}
              className="flex gap-4 items-start"
            >
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                <b.icon className={`w-5 h-5 ${b.color}`} />
              </div>
              <div>
                <p className="text-white font-medium text-sm">{t(b.titleKey)}</p>
                <p className="text-white/50 text-sm mt-0.5">{t(b.descKey)}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Trust badge */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-12 pt-8 border-t border-white/10"
        >
          <div className="flex items-center gap-3">
            <div className="flex -space-x-2">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="w-8 h-8 rounded-full bg-gold/20 border-2 border-charcoal flex items-center justify-center"
                >
                  <span className="text-[10px] text-gold font-medium">
                    {["AK", "LM", "SR", "DJ"][i - 1]}
                  </span>
                </div>
              ))}
            </div>
            <p className="text-white/50 text-xs">
              Trusted by 2,000+ brides across Europe
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

/* ─── Social login button ─── */
function SocialButton({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border border-soft-gray/60 rounded-lg hover:border-gold/40 hover:bg-gold/5 transition-all duration-200 cursor-pointer group"
    >
      {icon}
      <span className="text-sm font-medium text-charcoal/70 group-hover:text-charcoal transition-colors">
        {label}
      </span>
    </button>
  );
}

/* ─── Quick link card for dashboard ─── */
function QuickLinkCard({
  href,
  icon: Icon,
  label,
  description,
  badge,
}: {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  description: string;
  badge?: number;
}) {
  return (
    <Link href={href}>
      <motion.div
        whileHover={{ y: -2 }}
        whileTap={{ scale: 0.98 }}
        className="group relative p-5 bg-white border border-soft-gray/40 rounded-xl hover:border-gold/40 hover:shadow-lg hover:shadow-gold/5 transition-all duration-300 cursor-pointer"
      >
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <div className="w-11 h-11 rounded-xl bg-gold/8 flex items-center justify-center group-hover:bg-gold/15 transition-colors">
              <Icon className="w-5 h-5 text-gold" />
            </div>
            <div>
              <p className="font-medium text-charcoal text-sm">{label}</p>
              <p className="text-charcoal/50 text-xs mt-0.5">{description}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {badge !== undefined && badge > 0 && (
              <span className="px-2 py-0.5 bg-gold/10 text-gold text-xs font-semibold rounded-full">
                {badge}
              </span>
            )}
            <ChevronRightIcon className="w-4 h-4 text-charcoal/20 group-hover:text-gold group-hover:translate-x-0.5 transition-all" />
          </div>
        </div>
      </motion.div>
    </Link>
  );
}

/* ─── Main Account Page ─── */
export default function AccountPage() {
  const t = useTranslations("account");
  const tc = useTranslations("common");
  const locale = useLocale();
  const { customer, isLoading, login, register, logout, requestPasswordReset } = useAuth();
  const { items: wishlistItems } = useWishlist();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [mounted, setMounted] = useState(false);

  /* Forgot password state */
  const [forgotMode, setForgotMode] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetSent, setResetSent] = useState(false);
  const [resetSubmitting, setResetSubmitting] = useState(false);

  useEffect(() => setMounted(true), []);

  /* ─── Social login handlers ─── */
  const handleGoogleLogin = () => {
    const callbackUrl = `${window.location.origin}/${locale}/account/auth/callback`;
    window.location.href = `${BACKEND_URL}/auth/customer/google?callback_url=${encodeURIComponent(callbackUrl)}`;
  };

  const handleAppleLogin = () => {
    const callbackUrl = `${window.location.origin}/${locale}/account/auth/callback`;
    window.location.href = `${BACKEND_URL}/auth/customer/apple?callback_url=${encodeURIComponent(callbackUrl)}`;
  };

  /* ─── Forgot password handler ─── */
  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetSubmitting(true);
    await requestPasswordReset(resetEmail);
    setResetSubmitting(false);
    setResetSent(true);
  };

  /* ─── Loading state ─── */
  if (isLoading || !mounted) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-2 border-gold/20 border-t-gold rounded-full"
        />
      </div>
    );
  }

  /* ═══════════════════════════════════════════
     LOGGED-IN DASHBOARD
     ═══════════════════════════════════════════ */
  if (customer) {
    const initials = `${customer.first_name?.[0] || ""}${customer.last_name?.[0] || ""}`.toUpperCase();

    return (
      <div className="min-h-screen bg-cream">
        {/* Hero header */}
        <div className="relative bg-charcoal overflow-hidden">
          <FloatingOrb delay={0} size={300} x="10%" y="-20%" />
          <FloatingOrb delay={2} size={200} x="70%" y="10%" />

          <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col sm:flex-row items-start sm:items-center gap-5"
            >
              {/* Avatar */}
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-gold to-rose flex items-center justify-center shadow-lg shadow-gold/20"
              >
                <span className="text-white font-serif text-xl sm:text-2xl">{initials}</span>
              </motion.div>

              <div className="flex-1">
                <motion.h1
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="font-serif text-2xl sm:text-3xl text-white"
                >
                  {customer.first_name} {customer.last_name}
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-white/50 text-sm mt-1"
                >
                  {customer.email}
                </motion.p>
              </div>

              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                onClick={logout}
                className="flex items-center gap-2 px-4 py-2 text-sm text-white/50 hover:text-white border border-white/10 hover:border-white/30 rounded-lg transition-all cursor-pointer"
              >
                <ArrowRightStartOnRectangleIcon className="w-4 h-4" />
                {t("signOut")}
              </motion.button>
            </motion.div>
          </div>
        </div>

        {/* Dashboard content */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
          {/* Quick links grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h2 className="font-serif text-lg text-charcoal mb-4">{t("quickLinks")}</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              <QuickLinkCard
                href={`/${locale}/account/orders`}
                icon={ShoppingBagIcon}
                label={t("myOrders")}
                description={t("noOrdersDesc")}
              />
              <QuickLinkCard
                href={`/${locale}/wishlist`}
                icon={HeartIcon}
                label={tc("wishlist")}
                description={t("benefit1Desc")}
                badge={wishlistItems.length}
              />
              <QuickLinkCard
                href={`/${locale}/account/addresses`}
                icon={MapPinIcon}
                label={t("savedAddresses")}
                description={t("noAddresses")}
              />
              <QuickLinkCard
                href={`/${locale}/account/profile`}
                icon={UserIcon}
                label={t("editProfile")}
                description={t("accountDetails")}
              />
            </div>
          </motion.div>

          {/* Personal info card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-8"
          >
            <h2 className="font-serif text-lg text-charcoal mb-4">{t("personalInfo")}</h2>
            <div className="bg-white border border-soft-gray/40 rounded-xl p-6">
              <div className="grid sm:grid-cols-2 gap-6">
                <div>
                  <p className="text-xs font-medium text-charcoal/40 uppercase tracking-wider mb-1">
                    {t("firstName")}
                  </p>
                  <p className="text-charcoal font-medium">{customer.first_name}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-charcoal/40 uppercase tracking-wider mb-1">
                    {t("lastName")}
                  </p>
                  <p className="text-charcoal font-medium">{customer.last_name}</p>
                </div>
                <div className="sm:col-span-2">
                  <p className="text-xs font-medium text-charcoal/40 uppercase tracking-wider mb-1">
                    {t("email")}
                  </p>
                  <p className="text-charcoal font-medium">{customer.email}</p>
                </div>
              </div>

              <div className="mt-6 pt-5 border-t border-soft-gray/30 flex flex-wrap gap-3">
                <Link
                  href={`/${locale}/account/profile`}
                  className="px-4 py-2 text-sm font-medium text-gold border border-gold/30 rounded-lg hover:bg-gold/5 transition-colors"
                >
                  {t("editProfile")}
                </Link>
                <Link
                  href={`/${locale}/account/password`}
                  className="px-4 py-2 text-sm font-medium text-charcoal/60 border border-soft-gray/40 rounded-lg hover:border-charcoal/30 transition-colors"
                >
                  {t("changePassword")}
                </Link>
              </div>
            </div>
          </motion.div>

          {/* Help card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-8"
          >
            <div className="bg-gradient-to-r from-gold/5 to-rose/5 border border-gold/10 rounded-xl p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gold/10 flex items-center justify-center flex-shrink-0">
                <PhoneIcon className="w-6 h-6 text-gold" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-charcoal">{t("needHelp")}</h3>
                <p className="text-sm text-charcoal/50 mt-0.5">{t("contactSupport")}</p>
              </div>
              <a
                href="https://wa.me/38349123456"
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-2.5 bg-[#25D366] text-white text-sm font-medium rounded-lg hover:bg-[#22c55e] transition-colors flex items-center gap-2 cursor-pointer"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                  <path d="M12 0C5.373 0 0 5.373 0 12c0 2.625.846 5.059 2.284 7.034L.789 23.492a.5.5 0 00.61.609l4.458-1.495A11.952 11.952 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-2.336 0-4.512-.68-6.354-1.845l-.244-.156-3.662 1.228 1.228-3.662-.156-.244A9.937 9.937 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" />
                </svg>
                {t("chatOnWhatsApp")}
              </a>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  /* ═══════════════════════════════════════════
     AUTH FORMS (Login / Register)
     ═══════════════════════════════════════════ */
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
    <div className="min-h-screen bg-cream lg:grid lg:grid-cols-2">
      {/* Left: Benefits panel (desktop only) */}
      <BenefitsPanel t={t} />

      {/* Right: Auth form */}
      <div className="flex flex-col justify-center px-4 sm:px-8 lg:px-12 xl:px-20 py-12 lg:py-8 relative overflow-hidden">
        <FloatingOrb delay={0} size={200} x="80%" y="10%" />
        <FloatingOrb delay={3} size={150} x="5%" y="70%" />

        <div className="relative z-10 max-w-md mx-auto w-full">
          {/* Logo / Brand */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 lg:mb-10"
          >
            <Link href={`/${locale}`} className="inline-block">
              <h1 className="font-serif text-2xl text-charcoal tracking-wide">
                Aksa Fashion
              </h1>
            </Link>
          </motion.div>

          <AnimatePresence mode="wait">
            {/* ═══ FORGOT PASSWORD VIEW ═══ */}
            {forgotMode ? (
              <motion.div
                key="forgot"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
              >
                {resetSent ? (
                  /* Success state */
                  <div className="text-center py-8">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 200 }}
                      className="w-16 h-16 rounded-full bg-green-50 border-2 border-green-200 flex items-center justify-center mx-auto mb-6"
                    >
                      <CheckCircleIcon className="w-8 h-8 text-green-500" />
                    </motion.div>
                    <h2 className="font-serif text-2xl text-charcoal mb-2">
                      {t("resetSent")}
                    </h2>
                    <p className="text-sm text-charcoal/50 mb-8 max-w-xs mx-auto">
                      {t("resetSentDesc")}
                    </p>
                    <button
                      onClick={() => {
                        setForgotMode(false);
                        setResetSent(false);
                        setResetEmail("");
                      }}
                      className="inline-flex items-center gap-2 text-sm text-gold hover:text-gold/80 font-semibold transition-colors cursor-pointer"
                    >
                      <ArrowLeftIcon className="w-4 h-4" />
                      {t("backToSignIn")}
                    </button>
                  </div>
                ) : (
                  /* Reset form */
                  <>
                    <button
                      onClick={() => { setForgotMode(false); setResetEmail(""); }}
                      className="flex items-center gap-1.5 text-sm text-gold hover:text-gold/80 font-medium mb-6 transition-colors cursor-pointer"
                    >
                      <ArrowLeftIcon className="w-4 h-4" />
                      {t("backToSignIn")}
                    </button>

                    <h2 className="font-serif text-2xl lg:text-3xl text-charcoal mb-2">
                      {t("forgotPassword")}
                    </h2>
                    <p className="text-charcoal/50 text-sm mb-8">
                      {t("enterEmailDesc")}
                    </p>

                    <form onSubmit={handleForgotSubmit} className="space-y-4">
                      <div className="relative">
                        <Input
                          id="resetEmail"
                          label={t("email")}
                          type="email"
                          value={resetEmail}
                          onChange={(e) => setResetEmail(e.target.value)}
                          placeholder="your@email.com"
                          required
                        />
                        <EnvelopeIcon className="absolute right-3 top-9 w-4.5 h-4.5 text-charcoal/20 pointer-events-none" />
                      </div>

                      <motion.button
                        type="submit"
                        disabled={resetSubmitting}
                        whileTap={{ scale: 0.98 }}
                        className={`
                          w-full py-3.5 rounded-lg font-medium text-sm transition-all cursor-pointer
                          ${resetSubmitting
                            ? "bg-gold/50 text-white cursor-not-allowed"
                            : "bg-charcoal text-white hover:bg-charcoal/90 active:bg-charcoal"
                          }
                        `}
                      >
                        {resetSubmitting ? (
                          <span className="flex items-center justify-center gap-2">
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                              className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                            />
                            {tc("loading")}
                          </span>
                        ) : (
                          t("sendResetLink")
                        )}
                      </motion.button>
                    </form>
                  </>
                )}
              </motion.div>
            ) : (
              /* ═══ LOGIN / REGISTER VIEW ═══ */
              <motion.div
                key="auth"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.25 }}
              >
                {/* Mobile benefits scroll strip */}
                <div className="lg:hidden -mx-4 sm:-mx-8 px-4 sm:px-8 mb-6 overflow-x-auto scrollbar-hide">
                  <div className="flex gap-4 w-max py-1">
                    {[
                      { icon: HeartSolidIcon, key: "benefit1Title", color: "text-rose-400" },
                      { icon: TruckIcon, key: "benefit2Title", color: "text-gold" },
                      { icon: SparklesIcon, key: "benefit3Title", color: "text-amber-500" },
                      { icon: StarIcon, key: "benefit4Title", color: "text-gold" },
                    ].map((b) => (
                      <div key={b.key} className="flex items-center gap-2 px-3 py-2 bg-soft-gray/20 rounded-full flex-shrink-0">
                        <b.icon className={`w-3.5 h-3.5 ${b.color}`} />
                        <span className="text-[11px] text-charcoal/60 whitespace-nowrap">{t(b.key)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Mode toggle */}
                <div className="mb-8">
                  <div className="flex gap-1 p-1 bg-soft-gray/30 rounded-xl">
                    {(["login", "register"] as const).map((tab) => (
                      <button
                        key={tab}
                        onClick={() => { setMode(tab); setError(""); }}
                        className={`
                          relative flex-1 py-2.5 text-sm font-medium rounded-lg transition-all cursor-pointer
                          ${mode === tab
                            ? "text-charcoal"
                            : "text-charcoal/40 hover:text-charcoal/60"
                          }
                        `}
                      >
                        {mode === tab && (
                          <motion.div
                            layoutId="authTab"
                            className="absolute inset-0 bg-white rounded-lg shadow-sm"
                            transition={{ type: "spring", stiffness: 400, damping: 30 }}
                          />
                        )}
                        <span className="relative z-10">
                          {tab === "login" ? t("signIn") : t("signUp")}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Form heading */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={mode}
                    initial={{ opacity: 0, x: mode === "login" ? -10 : 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: mode === "login" ? 10 : -10 }}
                    transition={{ duration: 0.2 }}
                    className="mb-6"
                  >
                    <h2 className="font-serif text-2xl lg:text-3xl text-charcoal">
                      {mode === "login" ? t("welcomeBack") : t("signUp")}
                    </h2>
                    <p className="text-charcoal/50 text-sm mt-1.5">
                      {mode === "login"
                        ? t("welcomeSubtitle")
                        : t("createAccountSubtitle")}
                    </p>
                  </motion.div>
                </AnimatePresence>

                {/* Social logins - functional! */}
                <div className="flex flex-col sm:flex-row gap-3 mb-6">
                  <SocialButton
                    icon={
                      <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                      </svg>
                    }
                    label="Google"
                    onClick={handleGoogleLogin}
                  />
                  <SocialButton
                    icon={
                      <svg className="w-5 h-5 text-charcoal" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                      </svg>
                    }
                    label="Apple"
                    onClick={handleAppleLogin}
                  />
                </div>

                {/* Divider */}
                <div className="flex items-center gap-4 mb-6">
                  <div className="flex-1 h-px bg-soft-gray/50" />
                  <span className="text-xs text-charcoal/30 uppercase tracking-widest">
                    {t("orContinueWith")}
                  </span>
                  <div className="flex-1 h-px bg-soft-gray/50" />
                </div>

                {/* Form */}
                <form className="space-y-4" onSubmit={handleSubmit}>
                  <AnimatePresence mode="wait">
                    {mode === "register" && (
                      <motion.div
                        key="nameFields"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <div className="grid grid-cols-2 gap-3 pb-4">
                          <div className="relative">
                            <Input
                              id="firstName"
                              label={t("firstName")}
                              value={firstName}
                              onChange={(e) => setFirstName(e.target.value)}
                              placeholder="Elena"
                              required
                            />
                          </div>
                          <div className="relative">
                            <Input
                              id="lastName"
                              label={t("lastName")}
                              value={lastName}
                              onChange={(e) => setLastName(e.target.value)}
                              placeholder="Krasniqi"
                              required
                            />
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Email with icon */}
                  <div className="relative">
                    <Input
                      id="email"
                      label={t("email")}
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      required
                    />
                    <EnvelopeIcon className="absolute right-3 top-9 w-4.5 h-4.5 text-charcoal/20 pointer-events-none" />
                  </div>

                  {/* Password with toggle */}
                  <div className="relative">
                    <Input
                      id="password"
                      label={t("password")}
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-9 text-charcoal/30 hover:text-charcoal/60 transition-colors cursor-pointer"
                    >
                      {showPassword ? (
                        <EyeSlashIcon className="w-4.5 h-4.5" />
                      ) : (
                        <EyeIcon className="w-4.5 h-4.5" />
                      )}
                    </button>
                  </div>

                  {/* Forgot password (login only) - now functional */}
                  {mode === "login" && (
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={() => { setForgotMode(true); setResetEmail(email); }}
                        className="text-xs text-gold hover:text-gold/80 font-medium transition-colors cursor-pointer"
                      >
                        {t("forgotPassword")}
                      </button>
                    </div>
                  )}

                  {/* Error */}
                  <AnimatePresence>
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        className="flex items-center gap-2 p-3 bg-red-50 border border-red-100 rounded-lg"
                      >
                        <div className="w-1.5 h-1.5 bg-red-400 rounded-full flex-shrink-0" />
                        <p className="text-sm text-red-600">{error}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Submit */}
                  <motion.button
                    type="submit"
                    disabled={submitting}
                    whileTap={{ scale: 0.98 }}
                    className={`
                      w-full py-3.5 rounded-lg font-medium text-sm transition-all cursor-pointer
                      ${submitting
                        ? "bg-gold/50 text-white cursor-not-allowed"
                        : "bg-charcoal text-white hover:bg-charcoal/90 active:bg-charcoal"
                      }
                    `}
                  >
                    {submitting ? (
                      <span className="flex items-center justify-center gap-2">
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                        />
                        {tc("loading")}
                      </span>
                    ) : (
                      mode === "login" ? t("signIn") : t("signUp")
                    )}
                  </motion.button>
                </form>

                {/* Toggle mode link */}
                <p className="text-center text-sm text-charcoal/50 mt-6">
                  {mode === "login" ? t("noAccount") : t("hasAccount")}{" "}
                  <button
                    onClick={() => { setMode(mode === "login" ? "register" : "login"); setError(""); }}
                    className="text-gold hover:text-gold/80 font-semibold transition-colors cursor-pointer"
                  >
                    {mode === "login" ? t("signUp") : t("signIn")}
                  </button>
                </p>

              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
