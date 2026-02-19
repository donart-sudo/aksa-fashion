"use client";

import { useState, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";
import { motion } from "framer-motion";
import { useAuth } from "@/lib/auth";
import Input from "@/components/ui/Input";
import { updateProfile } from "@/lib/data/supabase-customer";
import {
  ChevronLeftIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";

export default function ProfilePage() {
  const t = useTranslations("account");
  const tc = useTranslations("common");
  const locale = useLocale();
  const { customer, isLoading: authLoading } = useAuth();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (customer) {
      setFirstName(customer.first_name || "");
      setLastName(customer.last_name || "");
    }
  }, [customer]);

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);

    const result = await updateProfile({
      first_name: firstName,
      last_name: lastName,
    });

    setSaving(false);
    if (result) {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
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

        <h1 className="font-serif text-2xl sm:text-3xl text-charcoal mb-8">{t("editProfile")}</h1>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-soft-gray/30 rounded-xl p-6"
        >
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-3">
              <Input
                id="profileFirstName"
                label={t("firstName")}
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
              <Input
                id="profileLastName"
                label={t("lastName")}
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </div>

            {/* Email (display only) */}
            <div>
              <label className="block text-sm font-medium text-charcoal/70 mb-1.5">
                {t("email")}
              </label>
              <div className="px-4 py-3 bg-soft-gray/20 border border-soft-gray/30 rounded-none text-sm text-charcoal/50">
                {customer.email}
              </div>
              <p className="text-xs text-charcoal/30 mt-1">{t("emailReadOnly")}</p>
            </div>

            {/* Save button */}
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-6 py-2.5 bg-charcoal text-white text-sm font-medium rounded-lg hover:bg-charcoal/90 transition-colors cursor-pointer disabled:opacity-50"
              >
                {saving ? tc("loading") : tc("save")}
              </button>

              {saved && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-1.5 text-green-600 text-sm"
                >
                  <CheckCircleIcon className="w-4 h-4" />
                  {t("profileSaved")}
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
