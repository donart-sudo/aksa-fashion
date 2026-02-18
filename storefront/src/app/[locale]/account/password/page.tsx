"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";
import { motion } from "framer-motion";
import { useAuth, BACKEND_URL } from "@/lib/auth";
import Input from "@/components/ui/Input";
import {
  ChevronLeftIcon,
  CheckCircleIcon,
  EyeIcon,
  EyeSlashIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";

export default function PasswordPage() {
  const t = useTranslations("account");
  const tc = useTranslations("common");
  const locale = useLocale();
  const { customer, isLoading: authLoading } = useAuth();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSaved(false);

    // Client-side validation
    if (newPassword.length < 8) {
      setError(t("passwordMinLength"));
      return;
    }
    if (newPassword !== confirmPassword) {
      setError(t("passwordMismatch"));
      return;
    }

    setSaving(true);

    try {
      // Re-authenticate with current password, then update
      const authRes = await fetch(`${BACKEND_URL}/auth/customer/emailpass`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: customer?.email, password: currentPassword }),
      });

      if (!authRes.ok) {
        setError(t("currentPasswordWrong"));
        setSaving(false);
        return;
      }

      const authData = await authRes.json();
      const token = authData.token;

      // Update password
      const updateRes = await fetch(`${BACKEND_URL}/auth/customer/emailpass/update`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ password: newPassword }),
      });

      if (!updateRes.ok) {
        setError(t("passwordUpdateFailed"));
        setSaving(false);
        return;
      }

      setSaved(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => setSaved(false), 5000);
    } catch {
      setError(t("passwordUpdateFailed"));
    } finally {
      setSaving(false);
    }
  };

  if (authLoading) {
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

  if (!customer) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4">
        <p className="text-charcoal/50 mb-4">{t("signInRequired")}</p>
        <Link
          href={`/${locale}/account`}
          className="px-6 py-3 bg-charcoal text-white text-sm font-medium rounded-lg hover:bg-charcoal/90 transition-colors"
        >
          {t("signIn")}
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        {/* Back link */}
        <Link
          href={`/${locale}/account`}
          className="inline-flex items-center gap-1.5 text-sm text-gold hover:text-gold/80 font-medium transition-colors mb-6"
        >
          <ChevronLeftIcon className="w-4 h-4" />
          {t("dashboard")}
        </Link>

        <h1 className="font-serif text-2xl sm:text-3xl text-charcoal mb-8">{t("changePassword")}</h1>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-soft-gray/30 rounded-xl p-6"
        >
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Current password */}
            <div className="relative">
              <Input
                id="currentPassword"
                label={t("currentPassword")}
                type={showCurrent ? "text" : "password"}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                className="absolute right-3 top-9 text-charcoal/30 hover:text-charcoal/60 transition-colors cursor-pointer"
              >
                {showCurrent ? <EyeSlashIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
              </button>
            </div>

            {/* New password */}
            <div className="relative">
              <Input
                id="newPassword"
                label={t("newPassword")}
                type={showNew ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-3 top-9 text-charcoal/30 hover:text-charcoal/60 transition-colors cursor-pointer"
              >
                {showNew ? <EyeSlashIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
              </button>
              <p className="text-xs text-charcoal/30 mt-1">{t("passwordHint")}</p>
            </div>

            {/* Confirm password */}
            <Input
              id="confirmPassword"
              label={t("confirmPassword")}
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              required
            />

            {/* Error */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 p-3 bg-red-50 border border-red-100 rounded-lg"
              >
                <ExclamationTriangleIcon className="w-4 h-4 text-red-500 flex-shrink-0" />
                <p className="text-sm text-red-600">{error}</p>
              </motion.div>
            )}

            {/* Success */}
            {saved && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 p-3 bg-green-50 border border-green-100 rounded-lg"
              >
                <CheckCircleIcon className="w-4 h-4 text-green-500 flex-shrink-0" />
                <p className="text-sm text-green-600">{t("passwordUpdated")}</p>
              </motion.div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 bg-charcoal text-white text-sm font-medium rounded-lg hover:bg-charcoal/90 transition-colors cursor-pointer disabled:opacity-50"
            >
              {saving ? tc("loading") : t("changePassword")}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
