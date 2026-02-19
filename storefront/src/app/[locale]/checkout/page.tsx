"use client";

import { useState, useCallback } from "react";
import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Input from "@/components/ui/Input";
import { useCart } from "@/lib/cart";
import { formatPrice } from "@/lib/utils";
import { SOCIAL_LINKS } from "@/lib/constants";
import {
  getShippingOptions,
  placeOrder,
  resolveCountryCode,
  type MedusaShippingOption,
} from "@/lib/data/supabase-checkout";
import {
  LockClosedIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CheckCircleIcon,
  ChevronDownIcon,
  ShoppingBagIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import { CheckCircleIcon as CheckCircleSolidIcon } from "@heroicons/react/24/solid";

type Step = 1 | 2 | 3;

/* ─── Mobile progress bar (3 segments) ─── */
function MobileProgressBar({ currentStep }: { currentStep: Step }) {
  return (
    <div className="flex gap-1.5 mb-6 sm:hidden">
      {[1, 2, 3].map((s) => (
        <div
          key={s}
          className={`h-[3px] flex-1 rounded-full transition-colors duration-500 ${
            s <= currentStep ? "bg-gold" : "bg-charcoal/[0.08]"
          }`}
        />
      ))}
    </div>
  );
}

/* ─── Step indicator breadcrumb ─── */
function StepBreadcrumb({
  currentStep,
  goToStep,
  tCo,
}: {
  currentStep: Step;
  goToStep: (s: Step) => void;
  tCo: (key: string) => string;
}) {
  const steps = [
    { num: 1, label: tCo("step1") },
    { num: 2, label: tCo("step2") },
    { num: 3, label: tCo("step3") },
  ] as const;

  return (
    <nav className="flex items-center gap-2 mb-8">
      {steps.map((step, i) => (
        <div key={step.num} className="flex items-center gap-2">
          <button
            onClick={() => step.num < currentStep && goToStep(step.num as Step)}
            disabled={step.num > currentStep}
            className={`
              flex items-center gap-1.5 text-sm transition-all cursor-pointer
              ${step.num === currentStep
                ? "text-charcoal font-semibold"
                : step.num < currentStep
                  ? "text-gold hover:text-gold/80"
                  : "text-charcoal/25 cursor-not-allowed"
              }
            `}
          >
            {step.num < currentStep ? (
              <CheckCircleSolidIcon className="w-4 h-4 text-gold" />
            ) : (
              <span
                className={`
                  w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold border
                  ${step.num === currentStep
                    ? "border-charcoal text-charcoal"
                    : "border-charcoal/15 text-charcoal/25"
                  }
                `}
              >
                {step.num}
              </span>
            )}
            <span className="hidden sm:inline">{step.label}</span>
          </button>
          {i < steps.length - 1 && (
            <ChevronRightIcon className="w-3 h-3 text-charcoal/15 mx-1" />
          )}
        </div>
      ))}
    </nav>
  );
}

/* ─── Order summary sidebar ─── */
function OrderSummary({
  items,
  subtotal,
  shippingCost,
  tCo,
  t,
  tCart,
  expanded,
  setExpanded,
}: {
  items: ReturnType<typeof useCart>["items"];
  subtotal: number;
  shippingCost: number;
  tCo: (key: string) => string;
  t: (key: string) => string;
  tCart: (key: string) => string;
  expanded: boolean;
  setExpanded: (v: boolean) => void;
}) {
  const total = subtotal + shippingCost;

  return (
    <div className="lg:sticky lg:top-24">
      {/* Mobile toggle */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="lg:hidden flex items-center justify-between w-full p-4 bg-warm-white border border-soft-gray/40 rounded-lg mb-4 cursor-pointer"
      >
        <div className="flex items-center gap-2">
          <ShoppingBagIcon className="w-5 h-5 text-gold" />
          <span className="text-sm font-medium text-charcoal">
            {tCart("orderSummary")}
          </span>
          <ChevronDownIcon
            className={`w-4 h-4 text-charcoal/40 transition-transform ${expanded ? "rotate-180" : ""}`}
          />
        </div>
        <span className="font-semibold text-charcoal">
          {formatPrice(total)}
        </span>
      </button>

      {/* Summary content */}
      <div className={`${expanded ? "block" : "hidden"} lg:block`}>
        <div className="bg-warm-white border border-soft-gray/30 rounded-xl p-6">
          {/* Items */}
          <div className="space-y-4 mb-6 max-h-[280px] overflow-y-auto pr-1 scrollbar-thin">
            {items.map((item) => (
              <div key={item.id} className="flex gap-3">
                <div className="relative w-16 h-20 bg-soft-gray/20 rounded-lg overflow-hidden flex-shrink-0">
                  <Image
                    src={item.thumbnail}
                    alt={item.title}
                    fill
                    className="object-cover"
                    sizes="64px"
                  />
                  <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-charcoal text-white text-[10px] flex items-center justify-center rounded-full font-medium">
                    {item.quantity}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-charcoal font-medium line-clamp-1">{item.title}</p>
                  {(item.size || item.color) && (
                    <p className="text-xs text-charcoal/40 mt-0.5">
                      {[item.color, item.size].filter(Boolean).join(" / ")}
                    </p>
                  )}
                </div>
                <span className="text-sm font-medium text-charcoal flex-shrink-0">
                  {formatPrice(item.price * item.quantity)}
                </span>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="space-y-3 text-sm border-t border-soft-gray/40 pt-4">
            <div className="flex justify-between text-charcoal/60">
              <span>{t("subtotal")}</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between text-charcoal/60">
              <span>{t("shipping")}</span>
              <span>{shippingCost === 0 ? t("free") : formatPrice(shippingCost)}</span>
            </div>
          </div>
          <div className="flex justify-between text-lg font-semibold text-charcoal mt-4 pt-4 border-t border-soft-gray/40">
            <span>{t("total")}</span>
            <span>{formatPrice(total)}</span>
          </div>
        </div>

        {/* Trust badges */}
        <div className="flex items-center justify-center gap-4 mt-4 text-charcoal/30">
          <LockClosedIcon className="w-4 h-4" />
          <span className="text-xs">{tCo("securePayment")}</span>
        </div>
      </div>
    </div>
  );
}

/* ─── Shipping option radio ─── */
function ShippingOptionRadio({
  name,
  description,
  price,
  selected,
  onSelect,
}: {
  name: string;
  description?: string;
  price: string;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`
        w-full flex items-center gap-4 p-4 border rounded-xl transition-all cursor-pointer
        ${selected
          ? "border-gold bg-gold/5 shadow-sm"
          : "border-soft-gray/40 hover:border-gold/30"
        }
      `}
    >
      <div
        className={`
          w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors
          ${selected ? "border-gold" : "border-charcoal/20"}
        `}
      >
        {selected && <div className="w-2.5 h-2.5 rounded-full bg-gold" />}
      </div>
      <div className="flex-1 text-left">
        <p className="text-sm font-medium text-charcoal">{name}</p>
        {description && (
          <p className="text-xs text-charcoal/50 mt-0.5">{description}</p>
        )}
      </div>
      <span className="text-sm font-semibold text-charcoal">{price}</span>
    </button>
  );
}

/* ─── WhatsApp icon SVG ─── */
function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
      <path d="M12 0C5.373 0 0 5.373 0 12c0 2.625.846 5.059 2.284 7.034L.789 23.492a.5.5 0 00.61.609l4.458-1.495A11.952 11.952 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-2.336 0-4.512-.68-6.354-1.845l-.244-.156-3.662 1.228 1.228-3.662-.156-.244A9.937 9.937 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" />
    </svg>
  );
}

/* ─── Main Checkout Page ─── */
export default function CheckoutPage() {
  const t = useTranslations("common");
  const tCo = useTranslations("checkout");
  const tCart = useTranslations("cart");
  const tAccount = useTranslations("account");
  const locale = useLocale();
  const router = useRouter();
  const { items, subtotal, itemCount, clearCart } = useCart();

  /* Form state */
  const [step, setStep] = useState<Step>(1);
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [address, setAddress] = useState("");
  const [apartment, setApartment] = useState("");
  const [city, setCity] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [country, setCountry] = useState("Kosovo");
  const [phone, setPhone] = useState("");
  const [emailUpdates, setEmailUpdates] = useState(true);
  const [saveInfo, setSaveInfo] = useState(true);
  const [orderNote, setOrderNote] = useState("");
  const [summaryExpanded, setSummaryExpanded] = useState(false);

  /* Checkout flow state */
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");
  const [cartCreating, setCartCreating] = useState(false);

  /* Shipping state */
  const [shippingOptions, setShippingOptions] = useState<MedusaShippingOption[]>([]);
  const [selectedShippingOption, setSelectedShippingOption] = useState<string | null>(null);
  const [shippingCostValue, setShippingCostValue] = useState<number | null>(null);

  const shippingCost = shippingCostValue ?? (subtotal >= 15000 ? 0 : 1500);

  const goToStep = useCallback((s: Step) => setStep(s), []);

  /* ── Step 1 → Step 2: Fetch shipping options ── */
  const handleContinueToShipping = async () => {
    if (!email || !firstName || !lastName || !address || !city || !country) {
      setError(tCo("fillRequired"));
      return;
    }

    setError("");
    setCartCreating(true);

    try {
      // Fetch shipping options based on subtotal
      const options = await getShippingOptions(subtotal);
      setShippingOptions(options);
      if (options.length > 0) {
        setSelectedShippingOption(options[0].id);
        const price = options[0].calculated_price?.calculated_amount ?? options[0].amount;
        setShippingCostValue(price);
      }

      setStep(2);
    } catch (err) {
      console.error("Checkout step 1 error:", err);
      setStep(2);
    } finally {
      setCartCreating(false);
    }
  };

  /* ── Step 2 → Step 3: Select shipping method ── */
  const handleContinueToPayment = async () => {
    setError("");
    setStep(3);
  };

  /* ── Handle shipping option selection ── */
  const handleSelectShipping = (optionId: string) => {
    setSelectedShippingOption(optionId);
    const option = shippingOptions.find((o) => o.id === optionId);
    if (option) {
      const price = option.calculated_price?.calculated_amount ?? option.amount;
      setShippingCostValue(price);
    }
  };

  /* ── Place order handler ── */
  const handlePlaceOrder = async () => {
    setProcessing(true);
    setError("");

    try {
      const countryCode = resolveCountryCode(country);

      const order = await placeOrder({
        email,
        items: items.map((item) => ({
          productId: item.productId || item.id,
          handle: item.handle,
          title: item.title,
          thumbnail: item.thumbnail,
          quantity: item.quantity,
          price: item.price,
          size: item.size,
          color: item.color,
        })),
        shippingAddress: {
          first_name: firstName,
          last_name: lastName,
          address_1: address,
          address_2: apartment || undefined,
          city,
          postal_code: postalCode,
          country_code: countryCode,
          phone: phone || undefined,
        },
        shippingOptionId: selectedShippingOption || "standard",
        shippingCost,
        orderNote: orderNote || undefined,
      });

      if (!order) throw new Error("Failed to place order");

      clearCart();
      try {
        localStorage.setItem("aksa_last_order_id", order.id);
        localStorage.setItem("aksa_last_order_display_id", String(order.display_id || ""));
      } catch { /* ignore */ }

      router.push(`/${locale}/checkout/confirmation?order_id=${order.id}`);
    } catch (err) {
      console.error("Place order error:", err);
      setError(tCo("orderError"));
      setProcessing(false);
    }
  };

  /* Empty cart redirect */
  if (itemCount === 0 && !processing) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center"
        >
          <div className="w-20 h-20 rounded-full bg-soft-gray/30 flex items-center justify-center mx-auto mb-6">
            <ShoppingBagIcon className="w-8 h-8 text-charcoal/25" />
          </div>
          <h1 className="font-serif text-2xl text-charcoal mb-2">{tCart("empty")}</h1>
          <p className="text-charcoal/50 text-sm mb-8">{tCart("emptySubtext")}</p>
          <Link
            href={`/${locale}/collections`}
            className="inline-flex items-center gap-2 px-6 py-3 bg-charcoal text-white text-sm font-medium rounded-lg hover:bg-charcoal/90 transition-colors"
          >
            {t("continueShopping")}
          </Link>
        </motion.div>
      </div>
    );
  }

  /* Processing overlay */
  if (processing) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
            className="w-12 h-12 border-2 border-gold/20 border-t-gold rounded-full mx-auto mb-6"
          />
          <h2 className="font-serif text-xl text-charcoal mb-2">
            {tCo("processing")}
          </h2>
          <p className="text-sm text-charcoal/50">{tCo("processingDesc")}</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Link href={`/${locale}`} className="font-serif text-xl text-charcoal tracking-wide">
            Aksa Fashion
          </Link>
          <div className="flex items-center gap-1.5 text-charcoal/40">
            <LockClosedIcon className="w-3.5 h-3.5" />
            <span className="text-xs font-medium">{tCo("securePayment")}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Left: Form area */}
          <div className="lg:col-span-7">
            <MobileProgressBar currentStep={step} />
            <StepBreadcrumb currentStep={step} goToStep={goToStep} tCo={tCo} />

            {/* Error banner */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex items-center gap-2 p-4 mb-6 bg-red-50 border border-red-100 rounded-xl"
                >
                  <ExclamationTriangleIcon className="w-5 h-5 text-red-500 flex-shrink-0" />
                  <p className="text-sm text-red-600">{error}</p>
                  <button onClick={() => setError("")} className="ml-auto text-red-400 hover:text-red-600 text-xs font-medium cursor-pointer">
                    {t("close")}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence mode="wait">
              {/* ─── STEP 1: Information ─── */}
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.25 }}
                >
                  {/* Contact */}
                  <div className="mb-8">
                    <h2 className="font-serif text-xl text-charcoal mb-4">
                      {tCo("contactInfo")}
                    </h2>
                    <div className="bg-white border border-soft-gray/30 rounded-xl p-5 space-y-4">
                      <Input
                        id="checkoutEmail"
                        label={tAccount("email")}
                        type="email"
                        inputMode="email"
                        autoComplete="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="your@email.com"
                        required
                      />
                      <label className="flex items-center gap-2.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={emailUpdates}
                          onChange={(e) => setEmailUpdates(e.target.checked)}
                          className="w-4 h-4 rounded border-soft-gray text-gold focus:ring-gold accent-gold cursor-pointer"
                        />
                        <span className="text-sm text-charcoal/60">{tCo("emailUpdates")}</span>
                      </label>
                    </div>
                  </div>

                  {/* Shipping address */}
                  <div className="mb-8">
                    <h2 className="font-serif text-xl text-charcoal mb-4">
                      {tCo("shippingAddress")}
                    </h2>
                    <div className="bg-white border border-soft-gray/30 rounded-xl p-5 space-y-4">
                      <div className="grid grid-cols-2 gap-3">
                        <Input
                          id="firstName"
                          label={tAccount("firstName")}
                          autoComplete="given-name"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          placeholder="Elena"
                          required
                        />
                        <Input
                          id="lastName"
                          label={tAccount("lastName")}
                          autoComplete="family-name"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          placeholder="Krasniqi"
                          required
                        />
                      </div>
                      <Input
                        id="address"
                        label={tCo("address")}
                        autoComplete="address-line1"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="123 Bulevardi Nënë Tereza"
                        required
                      />
                      <Input
                        id="apartment"
                        label={tCo("apartment")}
                        autoComplete="address-line2"
                        value={apartment}
                        onChange={(e) => setApartment(e.target.value)}
                        placeholder={tCo("apartment")}
                      />
                      <div className="grid grid-cols-2 gap-3">
                        <Input
                          id="city"
                          label={tCo("city")}
                          autoComplete="address-level2"
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          placeholder="Prishtina"
                          required
                        />
                        <Input
                          id="postalCode"
                          label={tCo("postalCode")}
                          inputMode="numeric"
                          autoComplete="postal-code"
                          value={postalCode}
                          onChange={(e) => setPostalCode(e.target.value)}
                          placeholder="10000"
                          required
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <Input
                          id="country"
                          label={tCo("country")}
                          autoComplete="country-name"
                          value={country}
                          onChange={(e) => setCountry(e.target.value)}
                          placeholder="Kosovo"
                          required
                        />
                        <Input
                          id="phone"
                          label={tCo("phone")}
                          type="tel"
                          inputMode="tel"
                          autoComplete="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="+383 49 123 456"
                          required
                        />
                      </div>
                      <label className="flex items-center gap-2.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={saveInfo}
                          onChange={(e) => setSaveInfo(e.target.checked)}
                          className="w-4 h-4 rounded border-soft-gray text-gold focus:ring-gold accent-gold cursor-pointer"
                        />
                        <span className="text-sm text-charcoal/60">{tCo("saveInfo")}</span>
                      </label>
                    </div>
                  </div>

                  {/* Navigation */}
                  <div className="flex items-center justify-between">
                    <Link
                      href={`/${locale}/cart`}
                      className="flex items-center gap-1.5 text-sm text-gold hover:text-gold/80 font-medium transition-colors"
                    >
                      <ChevronLeftIcon className="w-4 h-4" />
                      {tCo("returnToCart")}
                    </Link>
                    <motion.button
                      whileTap={{ scale: 0.98 }}
                      onClick={handleContinueToShipping}
                      disabled={cartCreating}
                      className={`px-8 py-3.5 text-white text-sm font-medium rounded-lg transition-colors cursor-pointer flex items-center gap-2 ${
                        cartCreating ? "bg-charcoal/50" : "bg-charcoal hover:bg-charcoal/90"
                      }`}
                    >
                      {cartCreating ? (
                        <>
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                          />
                          {t("loading")}
                        </>
                      ) : (
                        <>
                          {tCo("continueToShipping")}
                          <ChevronRightIcon className="w-4 h-4" />
                        </>
                      )}
                    </motion.button>
                  </div>
                </motion.div>
              )}

              {/* ─── STEP 2: Shipping ─── */}
              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.25 }}
                >
                  {/* Address summary */}
                  <div className="bg-white border border-soft-gray/30 rounded-xl p-5 mb-8">
                    <div className="flex items-center justify-between text-sm mb-3">
                      <span className="text-charcoal/50">{tCo("contactInfo")}</span>
                      <button
                        onClick={() => setStep(1)}
                        className="text-gold text-xs font-medium hover:text-gold/80 transition-colors cursor-pointer"
                      >
                        {tAccount("editProfile")}
                      </button>
                    </div>
                    <p className="text-sm text-charcoal mb-3">{email}</p>
                    <div className="h-px bg-soft-gray/30 my-3" />
                    <div className="flex items-center justify-between text-sm mb-3">
                      <span className="text-charcoal/50">{tCo("shippingAddress")}</span>
                      <button
                        onClick={() => setStep(1)}
                        className="text-gold text-xs font-medium hover:text-gold/80 transition-colors cursor-pointer"
                      >
                        {tAccount("editProfile")}
                      </button>
                    </div>
                    <p className="text-sm text-charcoal">
                      {firstName} {lastName}, {address}{apartment ? `, ${apartment}` : ""}, {city} {postalCode}, {country}
                    </p>
                  </div>

                  {/* Shipping methods */}
                  <div className="mb-8">
                    <h2 className="font-serif text-xl text-charcoal mb-4">
                      {tCo("shippingMethod")}
                    </h2>
                    <div className="space-y-3">
                      {shippingOptions.length > 0 ? (
                        // Real shipping options from Medusa
                        shippingOptions.map((option) => {
                          const price = option.calculated_price?.calculated_amount ?? option.amount;
                          return (
                            <ShippingOptionRadio
                              key={option.id}
                              name={option.name}
                              price={price === 0 ? t("free") : formatPrice(price)}
                              selected={selectedShippingOption === option.id}
                              onSelect={() => handleSelectShipping(option.id)}
                            />
                          );
                        })
                      ) : (
                        // Fallback shipping options
                        <>
                          <ShippingOptionRadio
                            name={tCo("standardShipping")}
                            description={tCo("standardDays")}
                            price={subtotal >= 15000 ? t("free") : "€15.00"}
                            selected={!selectedShippingOption || selectedShippingOption === "standard"}
                            onSelect={() => {
                              setSelectedShippingOption("standard");
                              setShippingCostValue(subtotal >= 15000 ? 0 : 1500);
                            }}
                          />
                          <ShippingOptionRadio
                            name={tCo("expressShipping")}
                            description={tCo("expressDays")}
                            price="€30.00"
                            selected={selectedShippingOption === "express"}
                            onSelect={() => {
                              setSelectedShippingOption("express");
                              setShippingCostValue(3000);
                            }}
                          />
                        </>
                      )}
                    </div>
                  </div>

                  {/* Order note */}
                  <div className="mb-8">
                    <h2 className="text-sm font-medium text-charcoal mb-2">
                      {tCo("orderNote")}
                    </h2>
                    <textarea
                      value={orderNote}
                      onChange={(e) => setOrderNote(e.target.value)}
                      placeholder={tCo("orderNotePlaceholder")}
                      rows={3}
                      className="w-full px-4 py-3 text-sm border border-soft-gray/50 rounded-xl bg-white placeholder:text-charcoal/30 focus:border-gold focus:outline-none transition-colors resize-none"
                    />
                  </div>

                  {/* Navigation */}
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => setStep(1)}
                      className="flex items-center gap-1.5 text-sm text-gold hover:text-gold/80 font-medium transition-colors cursor-pointer"
                    >
                      <ChevronLeftIcon className="w-4 h-4" />
                      {tCo("returnToInformation")}
                    </button>
                    <motion.button
                      whileTap={{ scale: 0.98 }}
                      onClick={handleContinueToPayment}
                      className="px-8 py-3.5 bg-charcoal text-white text-sm font-medium rounded-lg hover:bg-charcoal/90 transition-colors cursor-pointer flex items-center gap-2"
                    >
                      {tCo("continueToPayment")}
                      <ChevronRightIcon className="w-4 h-4" />
                    </motion.button>
                  </div>
                </motion.div>
              )}

              {/* ─── STEP 3: Payment (Manual) ─── */}
              {step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.25 }}
                >
                  {/* Summary of previous steps */}
                  <div className="bg-white border border-soft-gray/30 rounded-xl p-5 mb-8">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-charcoal/50">{tCo("contactInfo")}</span>
                      <button
                        onClick={() => setStep(1)}
                        className="text-gold text-xs font-medium hover:text-gold/80 transition-colors cursor-pointer"
                      >
                        {tAccount("editProfile")}
                      </button>
                    </div>
                    <p className="text-sm text-charcoal mb-3">{email}</p>
                    <div className="h-px bg-soft-gray/30 my-3" />
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-charcoal/50">{tCo("shippingAddress")}</span>
                      <button
                        onClick={() => setStep(1)}
                        className="text-gold text-xs font-medium hover:text-gold/80 transition-colors cursor-pointer"
                      >
                        {tAccount("editProfile")}
                      </button>
                    </div>
                    <p className="text-sm text-charcoal mb-3">
                      {firstName} {lastName}, {address}, {city} {postalCode}, {country}
                    </p>
                    <div className="h-px bg-soft-gray/30 my-3" />
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-charcoal/50">{tCo("shippingMethod")}</span>
                      <button
                        onClick={() => setStep(2)}
                        className="text-gold text-xs font-medium hover:text-gold/80 transition-colors cursor-pointer"
                      >
                        {tAccount("editProfile")}
                      </button>
                    </div>
                    <p className="text-sm text-charcoal">
                      {shippingOptions.length > 0
                        ? shippingOptions.find((o) => o.id === selectedShippingOption)?.name || tCo("standardShipping")
                        : selectedShippingOption === "express"
                          ? tCo("expressShipping")
                          : tCo("standardShipping")}
                    </p>
                  </div>

                  {/* Payment arrangement panel */}
                  <div className="mb-8">
                    <h2 className="font-serif text-xl text-charcoal mb-4">
                      {tCo("paymentMethod")}
                    </h2>

                    <div className="bg-white border border-soft-gray/30 rounded-xl p-6">
                      {/* Header */}
                      <div className="flex items-center gap-3 mb-5">
                        <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center">
                          <svg className="w-5 h-5 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
                          </svg>
                        </div>
                        <div>
                          <h3 className="font-medium text-charcoal text-sm">
                            {tCo("manualPaymentTitle")}
                          </h3>
                          <p className="text-xs text-charcoal/50 mt-0.5">
                            {tCo("manualPaymentDesc")}
                          </p>
                        </div>
                      </div>

                      {/* Payment methods */}
                      <div className="space-y-2.5 mb-5">
                        {[
                          { icon: "🏦", label: tCo("bankTransfer") },
                          { icon: "💸", label: tCo("westernUnion") },
                          { icon: "🏪", label: tCo("cashOnPickup") },
                        ].map((method) => (
                          <div
                            key={method.label}
                            className="flex items-center gap-3 px-4 py-3 bg-cream/60 rounded-lg"
                          >
                            <span className="text-lg">{method.icon}</span>
                            <span className="text-sm text-charcoal/70">{method.label}</span>
                          </div>
                        ))}
                      </div>

                      {/* WhatsApp CTA */}
                      <a
                        href={`${SOCIAL_LINKS.whatsapp}?text=${encodeURIComponent(tCo("whatsappMessage"))}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 w-full py-3 bg-[#25D366]/10 text-[#25D366] text-sm font-medium rounded-lg hover:bg-[#25D366]/20 transition-colors"
                      >
                        <WhatsAppIcon className="w-4 h-4" />
                        {tCo("whatsappPayment")}
                      </a>
                    </div>
                  </div>

                  {/* Navigation */}
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => setStep(2)}
                      className="flex items-center gap-1.5 text-sm text-gold hover:text-gold/80 font-medium transition-colors cursor-pointer"
                    >
                      <ChevronLeftIcon className="w-4 h-4" />
                      {tCo("returnToShipping")}
                    </button>
                    <motion.button
                      whileTap={{ scale: 0.98 }}
                      onClick={handlePlaceOrder}
                      className="px-8 py-3.5 bg-gold text-white text-sm font-medium rounded-lg hover:bg-gold/90 transition-colors cursor-pointer flex items-center gap-2 shadow-lg shadow-gold/20"
                    >
                      <CheckCircleIcon className="w-4 h-4" />
                      {tCo("placeOrder")} · {formatPrice(subtotal + shippingCost)}
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right: Order summary */}
          <div className="lg:col-span-5">
            <OrderSummary
              items={items}
              subtotal={subtotal}
              shippingCost={shippingCost}
              tCo={tCo}
              t={t}
              tCart={tCart}
              expanded={summaryExpanded}
              setExpanded={setSummaryExpanded}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
