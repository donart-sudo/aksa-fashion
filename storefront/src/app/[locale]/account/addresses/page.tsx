"use client";

import { useState, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/lib/auth";
import Input from "@/components/ui/Input";
import {
  getAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
  type CustomerAddress,
} from "@/lib/data/medusa-customer";
import {
  MapPinIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  ChevronLeftIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

const EMPTY_FORM = {
  first_name: "",
  last_name: "",
  address_1: "",
  address_2: "",
  city: "",
  postal_code: "",
  country_code: "xk",
  phone: "",
};

export default function AddressesPage() {
  const t = useTranslations("account");
  const tc = useTranslations("common");
  const locale = useLocale();
  const { customer, isLoading: authLoading } = useAuth();

  const [addresses, setAddresses] = useState<CustomerAddress[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    if (!customer) return;

    async function fetchAddresses() {
      const data = await getAddresses();
      setAddresses(data);
      setLoading(false);
    }
    fetchAddresses();
  }, [customer]);

  const openNewForm = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setShowForm(true);
  };

  const openEditForm = (addr: CustomerAddress) => {
    setEditingId(addr.id);
    setForm({
      first_name: addr.first_name || "",
      last_name: addr.last_name || "",
      address_1: addr.address_1 || "",
      address_2: addr.address_2 || "",
      city: addr.city || "",
      postal_code: addr.postal_code || "",
      country_code: addr.country_code || "xk",
      phone: addr.phone || "",
    });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.first_name || !form.last_name || !form.address_1 || !form.city) return;

    setSaving(true);

    if (editingId) {
      const updated = await updateAddress(editingId, form);
      if (updated) {
        setAddresses((prev) => prev.map((a) => (a.id === editingId ? { ...a, ...form } : a)));
      }
    } else {
      const created = await createAddress(form);
      if (created) {
        setAddresses((prev) => [...prev, created]);
      }
    }

    setSaving(false);
    setShowForm(false);
    setEditingId(null);
    setForm(EMPTY_FORM);
  };

  const handleDelete = async (id: string) => {
    setDeleting(id);
    const ok = await deleteAddress(id);
    if (ok) {
      setAddresses((prev) => prev.filter((a) => a.id !== id));
    }
    setDeleting(null);
  };

  const updateField = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  if (authLoading || loading) {
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
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        {/* Back link */}
        <Link
          href={`/${locale}/account`}
          className="inline-flex items-center gap-1.5 text-sm text-gold hover:text-gold/80 font-medium transition-colors mb-6"
        >
          <ChevronLeftIcon className="w-4 h-4" />
          {t("dashboard")}
        </Link>

        <div className="flex items-center justify-between mb-8">
          <h1 className="font-serif text-2xl sm:text-3xl text-charcoal">{t("savedAddresses")}</h1>
          {!showForm && (
            <button
              onClick={openNewForm}
              className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-gold border border-gold/30 rounded-lg hover:bg-gold/5 transition-colors cursor-pointer"
            >
              <PlusIcon className="w-4 h-4" />
              {t("addAddress")}
            </button>
          )}
        </div>

        {/* Form */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden mb-8"
            >
              <div className="bg-white border border-soft-gray/30 rounded-xl p-6">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="font-serif text-lg text-charcoal">
                    {editingId ? t("editAddress") : t("addAddress")}
                  </h2>
                  <button
                    onClick={() => { setShowForm(false); setEditingId(null); }}
                    className="text-charcoal/30 hover:text-charcoal transition-colors cursor-pointer"
                  >
                    <XMarkIcon className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      id="addrFirstName"
                      label={t("firstName")}
                      value={form.first_name}
                      onChange={(e) => updateField("first_name", e.target.value)}
                      required
                    />
                    <Input
                      id="addrLastName"
                      label={t("lastName")}
                      value={form.last_name}
                      onChange={(e) => updateField("last_name", e.target.value)}
                      required
                    />
                  </div>
                  <Input
                    id="addrAddress1"
                    label={t("addressLine1")}
                    value={form.address_1}
                    onChange={(e) => updateField("address_1", e.target.value)}
                    required
                  />
                  <Input
                    id="addrAddress2"
                    label={t("addressLine2")}
                    value={form.address_2}
                    onChange={(e) => updateField("address_2", e.target.value)}
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      id="addrCity"
                      label={t("city")}
                      value={form.city}
                      onChange={(e) => updateField("city", e.target.value)}
                      required
                    />
                    <Input
                      id="addrPostal"
                      label={t("postalCode")}
                      value={form.postal_code}
                      onChange={(e) => updateField("postal_code", e.target.value)}
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      id="addrCountry"
                      label={t("countryCode")}
                      value={form.country_code}
                      onChange={(e) => updateField("country_code", e.target.value)}
                      placeholder="xk"
                      required
                    />
                    <Input
                      id="addrPhone"
                      label={t("phone")}
                      type="tel"
                      value={form.phone}
                      onChange={(e) => updateField("phone", e.target.value)}
                    />
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="px-6 py-2.5 bg-charcoal text-white text-sm font-medium rounded-lg hover:bg-charcoal/90 transition-colors cursor-pointer disabled:opacity-50"
                    >
                      {saving ? tc("loading") : tc("save")}
                    </button>
                    <button
                      onClick={() => { setShowForm(false); setEditingId(null); }}
                      className="px-6 py-2.5 text-sm text-charcoal/60 border border-soft-gray/40 rounded-lg hover:border-charcoal/30 transition-colors cursor-pointer"
                    >
                      {tc("close")}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Address cards */}
        {addresses.length === 0 && !showForm ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <div className="w-20 h-20 rounded-full bg-soft-gray/30 flex items-center justify-center mx-auto mb-6">
              <MapPinIcon className="w-8 h-8 text-charcoal/25" />
            </div>
            <h2 className="font-serif text-xl text-charcoal mb-2">{t("noAddresses")}</h2>
            <p className="text-charcoal/50 text-sm mb-8">{t("addAddressDesc")}</p>
            <button
              onClick={openNewForm}
              className="inline-flex items-center gap-2 px-6 py-3 bg-charcoal text-white text-sm font-medium rounded-lg hover:bg-charcoal/90 transition-colors cursor-pointer"
            >
              <PlusIcon className="w-4 h-4" />
              {t("addAddress")}
            </button>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {addresses.map((addr, i) => (
              <motion.div
                key={addr.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-white border border-soft-gray/40 rounded-xl p-5"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <p className="text-sm font-medium text-charcoal">
                        {addr.first_name} {addr.last_name}
                      </p>
                      {addr.is_default_shipping && (
                        <span className="px-2 py-0.5 bg-gold/10 text-gold text-[10px] font-medium rounded-full">
                          {t("defaultAddress")}
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-charcoal/60 space-y-0.5">
                      <p>{addr.address_1}</p>
                      {addr.address_2 && <p>{addr.address_2}</p>}
                      <p>{addr.city} {addr.postal_code}</p>
                      <p>{addr.country_code?.toUpperCase()}</p>
                      {addr.phone && <p>{addr.phone}</p>}
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditForm(addr)}
                      className="w-8 h-8 flex items-center justify-center text-charcoal/30 hover:text-gold transition-colors cursor-pointer"
                    >
                      <PencilIcon className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(addr.id)}
                      disabled={deleting === addr.id}
                      className="w-8 h-8 flex items-center justify-center text-charcoal/30 hover:text-red-500 transition-colors cursor-pointer disabled:opacity-50"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
