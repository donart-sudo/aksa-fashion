"use client";

import { useState, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase";
import Input from "@/components/ui/Input";
import {
  CheckCircleIcon,
  EyeIcon,
  EyeSlashIcon,
  ExclamationTriangleIcon,
  LockClosedIcon,
} from "@heroicons/react/24/outline";

export default function ResetPasswordPage() {
  const t = useTranslations("account");
  const tc = useTranslations("common");
  const locale = useLocale();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [sessionReady, setSessionReady] = useState(false);
  const [sessionError, setSessionError] = useState(false);

  // On mount, check for session (user arrives here after callback route exchanged the code)
  useEffect(() => {
    const supabase = createClient();
    let settled = false;

    // Check for existing session first (callback route already established it)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (settled) return;
      if (session) {
        settled = true;
        setSessionReady(true);
        return;
      }

      // Also listen for auth events (in case session is being established)
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        (event) => {
          if (settled) return;
          if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") {
            settled = true;
            setSessionReady(true);
          }
        }
      );

      // Fallback: check session again after a short delay
      setTimeout(() => {
        if (settled) return;
        supabase.auth.getSession().then(({ data: { session: s } }) => {
          if (settled) return;
          if (s) {
            settled = true;
            setSessionReady(true);
          } else {
            settled = true;
            setSessionError(true);
          }
        });
      }, 3000);

      // Clean up subscription on unmount
      return () => { subscription.unsubscribe(); };
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (newPassword.length < 8) {
      setError(t("passwordMinLength") || "Password must be at least 8 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError(t("passwordMismatch") || "Passwords do not match");
      return;
    }

    setSaving(true);

    try {
      const supabase = createClient();
      const { error: updateErr } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateErr) {
        setError(updateErr.message);
        setSaving(false);
        return;
      }

      setSuccess(true);
    } catch {
      setError(t("passwordUpdateFailed") || "Failed to update password");
    } finally {
      setSaving(false);
    }
  };

  // Success state
  if (success) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-sm"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
            className="w-16 h-16 rounded-full bg-green-50 border-2 border-green-200 flex items-center justify-center mx-auto mb-6"
          >
            <CheckCircleIcon className="w-8 h-8 text-green-500" />
          </motion.div>
          <h1 className="font-serif text-2xl text-charcoal mb-2">
            {t("passwordUpdated") || "Password Updated"}
          </h1>
          <p className="text-sm text-charcoal/50 mb-8">
            Your password has been reset successfully. You can now sign in with your new password.
          </p>
          <Link
            href={`/${locale}/account`}
            className="inline-flex items-center gap-2 px-6 py-3 bg-charcoal text-white text-sm font-medium rounded-lg hover:bg-charcoal/90 transition-colors"
          >
            {t("signIn")}
          </Link>
        </motion.div>
      </div>
    );
  }

  // Invalid/expired link
  if (sessionError) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-sm"
        >
          <div className="w-16 h-16 rounded-full bg-red-50 border-2 border-red-200 flex items-center justify-center mx-auto mb-6">
            <ExclamationTriangleIcon className="w-8 h-8 text-red-400" />
          </div>
          <h1 className="font-serif text-2xl text-charcoal mb-2">
            Link Expired
          </h1>
          <p className="text-sm text-charcoal/50 mb-8">
            This password reset link has expired or is invalid. Please request a new one.
          </p>
          <Link
            href={`/${locale}/account`}
            className="inline-flex items-center gap-2 px-6 py-3 bg-charcoal text-white text-sm font-medium rounded-lg hover:bg-charcoal/90 transition-colors"
          >
            {t("backToSignIn") || "Back to Sign In"}
          </Link>
        </motion.div>
      </div>
    );
  }

  // Loading / waiting for session
  if (!sessionReady) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-2 border-gold/20 border-t-gold rounded-full"
        />
      </div>
    );
  }

  // Reset form
  return (
    <div className="min-h-screen bg-cream">
      <div className="max-w-md mx-auto px-4 sm:px-6 py-12 lg:py-20">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-gold/10 flex items-center justify-center mx-auto mb-4">
              <LockClosedIcon className="w-7 h-7 text-gold" />
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl text-charcoal mb-2">
              {t("resetPassword") || "Reset Password"}
            </h1>
            <p className="text-sm text-charcoal/50">
              Enter your new password below
            </p>
          </div>

          <div className="bg-white border border-soft-gray/30 rounded-xl p-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="relative">
                <Input
                  id="newPassword"
                  label={t("newPassword") || "New Password"}
                  type={showPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-9 text-charcoal/30 hover:text-charcoal/60 transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeSlashIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                </button>
                <p className="text-xs text-charcoal/30 mt-1">
                  {t("passwordHint") || "At least 8 characters"}
                </p>
              </div>

              <Input
                id="confirmPassword"
                label={t("confirmPassword") || "Confirm Password"}
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                required
              />

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

              <motion.button
                type="submit"
                disabled={saving}
                whileTap={{ scale: 0.98 }}
                className={`
                  w-full py-3.5 rounded-lg font-medium text-sm transition-all cursor-pointer
                  ${saving
                    ? "bg-gold/50 text-white cursor-not-allowed"
                    : "bg-charcoal text-white hover:bg-charcoal/90"
                  }
                `}
              >
                {saving ? (
                  <span className="flex items-center justify-center gap-2">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                    />
                    {tc("loading")}
                  </span>
                ) : (
                  t("resetPassword") || "Reset Password"
                )}
              </motion.button>
            </form>
          </div>

          <p className="text-center text-sm text-charcoal/40 mt-6">
            <Link
              href={`/${locale}/account`}
              className="text-gold hover:text-gold/80 font-medium transition-colors"
            >
              {t("backToSignIn") || "Back to Sign In"}
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
