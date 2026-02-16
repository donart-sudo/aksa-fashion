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
import {
  ShieldCheckIcon,
  LockClosedIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  TruckIcon,
  CheckCircleIcon,
  CreditCardIcon,
  InformationCircleIcon,
  TagIcon,
  ChevronDownIcon,
  ShoppingBagIcon,
} from "@heroicons/react/24/outline";
import { CheckCircleIcon as CheckCircleSolidIcon } from "@heroicons/react/24/solid";

type Step = 1 | 2 | 3;

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
  discountCode,
  setDiscountCode,
  tCo,
  t,
  tCart,
  expanded,
  setExpanded,
}: {
  items: ReturnType<typeof useCart>["items"];
  subtotal: number;
  shippingCost: number;
  discountCode: string;
  setDiscountCode: (v: string) => void;
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

          {/* Discount code */}
          <div className="flex gap-2 mb-6">
            <div className="flex-1 relative">
              <TagIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal/25" />
              <input
                type="text"
                value={discountCode}
                onChange={(e) => setDiscountCode(e.target.value)}
                placeholder={tCo("discountCode")}
                className="w-full pl-9 pr-3 py-2.5 text-sm border border-soft-gray/50 rounded-lg bg-white placeholder:text-charcoal/30 focus:border-gold focus:outline-none transition-colors"
              />
            </div>
            <button className="px-4 py-2.5 text-sm font-medium text-gold border border-gold/30 rounded-lg hover:bg-gold/5 transition-colors cursor-pointer">
              {tCo("applyDiscount")}
            </button>
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
          <ShieldCheckIcon className="w-5 h-5" />
          <span className="text-xs">{tCo("securePayment")}</span>
          <LockClosedIcon className="w-4 h-4" />
        </div>
      </div>
    </div>
  );
}

/* ─── Shipping option radio ─── */
function ShippingOption({
  name,
  days,
  price,
  selected,
  onSelect,
  icon: Icon,
}: {
  name: string;
  days: string;
  price: string;
  selected: boolean;
  onSelect: () => void;
  icon?: React.ComponentType<{ className?: string }>;
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
        <p className="text-xs text-charcoal/50 mt-0.5">{days}</p>
      </div>
      <span className="text-sm font-semibold text-charcoal">{price}</span>
    </button>
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
  const [shippingMethod, setShippingMethod] = useState<"standard" | "express">("standard");
  const [cardNumber, setCardNumber] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");
  const [nameOnCard, setNameOnCard] = useState("");
  const [billingType, setBillingType] = useState<"same" | "different">("same");
  const [discountCode, setDiscountCode] = useState("");
  const [emailUpdates, setEmailUpdates] = useState(true);
  const [saveInfo, setSaveInfo] = useState(true);
  const [orderNote, setOrderNote] = useState("");
  const [processing, setProcessing] = useState(false);
  const [summaryExpanded, setSummaryExpanded] = useState(false);

  const shippingCost = shippingMethod === "express" ? 3000 : (subtotal >= 15000 ? 0 : 1500);

  const goToStep = useCallback((s: Step) => setStep(s), []);

  /* Format card number with spaces */
  const handleCardChange = (val: string) => {
    const digits = val.replace(/\D/g, "").slice(0, 16);
    const formatted = digits.replace(/(\d{4})(?=\d)/g, "$1 ");
    setCardNumber(formatted);
  };

  /* Format expiry MM/YY */
  const handleExpiryChange = (val: string) => {
    const digits = val.replace(/\D/g, "").slice(0, 4);
    if (digits.length > 2) {
      setExpiryDate(`${digits.slice(0, 2)}/${digits.slice(2)}`);
    } else {
      setExpiryDate(digits);
    }
  };

  /* Place order handler */
  const handlePlaceOrder = async () => {
    setProcessing(true);
    // Simulate order processing
    await new Promise((r) => setTimeout(r, 2500));
    clearCart();
    router.push(`/${locale}/checkout/confirmation`);
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
          <p className="text-sm text-charcoal/50">{tCo("securePayment")}</p>
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
            <StepBreadcrumb currentStep={step} goToStep={goToStep} tCo={tCo} />

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
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          placeholder="Elena"
                          required
                        />
                        <Input
                          id="lastName"
                          label={tAccount("lastName")}
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          placeholder="Krasniqi"
                          required
                        />
                      </div>
                      <Input
                        id="address"
                        label={tCo("address")}
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="123 Bulevardi Nënë Tereza"
                        required
                      />
                      <Input
                        id="apartment"
                        label={tCo("apartment")}
                        value={apartment}
                        onChange={(e) => setApartment(e.target.value)}
                        placeholder={tCo("apartment")}
                      />
                      <div className="grid grid-cols-2 gap-3">
                        <Input
                          id="city"
                          label={tCo("city")}
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          placeholder="Prishtina"
                          required
                        />
                        <Input
                          id="postalCode"
                          label={tCo("postalCode")}
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
                          value={country}
                          onChange={(e) => setCountry(e.target.value)}
                          placeholder="Kosovo"
                          required
                        />
                        <Input
                          id="phone"
                          label={tCo("phone")}
                          type="tel"
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
                      onClick={() => setStep(2)}
                      className="px-8 py-3.5 bg-charcoal text-white text-sm font-medium rounded-lg hover:bg-charcoal/90 transition-colors cursor-pointer flex items-center gap-2"
                    >
                      {tCo("continueToShipping")}
                      <ChevronRightIcon className="w-4 h-4" />
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
                      <ShippingOption
                        name={tCo("standardShipping")}
                        days={tCo("standardDays")}
                        price={subtotal >= 15000 ? tCo("standardPrice") : "€15.00"}
                        selected={shippingMethod === "standard"}
                        onSelect={() => setShippingMethod("standard")}
                      />
                      <ShippingOption
                        name={tCo("expressShipping")}
                        days={tCo("expressDays")}
                        price={tCo("expressPrice")}
                        selected={shippingMethod === "express"}
                        onSelect={() => setShippingMethod("express")}
                      />
                    </div>
                    {subtotal >= 15000 && shippingMethod === "standard" && (
                      <motion.p
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-1.5 text-xs text-green-600 mt-3"
                      >
                        <CheckCircleIcon className="w-3.5 h-3.5" />
                        {tCart("freeShippingUnlocked")}
                      </motion.p>
                    )}
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
                      onClick={() => setStep(3)}
                      className="px-8 py-3.5 bg-charcoal text-white text-sm font-medium rounded-lg hover:bg-charcoal/90 transition-colors cursor-pointer flex items-center gap-2"
                    >
                      {tCo("continueToPayment")}
                      <ChevronRightIcon className="w-4 h-4" />
                    </motion.button>
                  </div>
                </motion.div>
              )}

              {/* ─── STEP 3: Payment ─── */}
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
                      {shippingMethod === "standard" ? tCo("standardShipping") : tCo("expressShipping")}
                      {" · "}
                      {shippingMethod === "standard" ? tCo("standardDays") : tCo("expressDays")}
                    </p>
                  </div>

                  {/* Payment method */}
                  <div className="mb-8">
                    <h2 className="font-serif text-xl text-charcoal mb-4">
                      {tCo("paymentMethod")}
                    </h2>

                    {/* Card form */}
                    <div className="bg-white border border-soft-gray/30 rounded-xl p-5">
                      {/* Card type indicator */}
                      <div className="flex items-center gap-2 mb-5">
                        <CreditCardIcon className="w-5 h-5 text-charcoal/40" />
                        <span className="text-sm font-medium text-charcoal">Credit / Debit Card</span>
                        <div className="flex items-center gap-1.5 ml-auto">
                          <div className="w-8 h-5 bg-[#1A1F71] rounded flex items-center justify-center">
                            <span className="text-white text-[7px] font-bold italic">VISA</span>
                          </div>
                          <div className="w-8 h-5 bg-[#EB001B] rounded-r-full relative overflow-hidden flex items-center justify-center">
                            <div className="absolute left-0 w-4 h-5 bg-[#F79E1B] rounded-r-full opacity-80" />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <Input
                          id="cardNumber"
                          label={tCo("cardNumber")}
                          value={cardNumber}
                          onChange={(e) => handleCardChange(e.target.value)}
                          placeholder="4242 4242 4242 4242"
                          required
                        />
                        <Input
                          id="nameOnCard"
                          label={tCo("nameOnCard")}
                          value={nameOnCard}
                          onChange={(e) => setNameOnCard(e.target.value)}
                          placeholder="ELENA KRASNIQI"
                          required
                        />
                        <div className="grid grid-cols-2 gap-3">
                          <Input
                            id="expiryDate"
                            label={tCo("expiryDate")}
                            value={expiryDate}
                            onChange={(e) => handleExpiryChange(e.target.value)}
                            placeholder="MM/YY"
                            required
                          />
                          <Input
                            id="cvv"
                            label={tCo("cvv")}
                            value={cvv}
                            onChange={(e) => setCvv(e.target.value.replace(/\D/g, "").slice(0, 4))}
                            placeholder="123"
                            required
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Billing address */}
                  <div className="mb-8">
                    <h2 className="text-sm font-medium text-charcoal mb-3">
                      {tCo("billingAddress")}
                    </h2>
                    <div className="space-y-2">
                      <label className="flex items-center gap-3 p-3 border border-soft-gray/30 rounded-lg cursor-pointer hover:border-gold/30 transition-colors">
                        <input
                          type="radio"
                          name="billing"
                          checked={billingType === "same"}
                          onChange={() => setBillingType("same")}
                          className="accent-gold cursor-pointer"
                        />
                        <span className="text-sm text-charcoal">{tCo("sameAsShipping")}</span>
                      </label>
                      <label className="flex items-center gap-3 p-3 border border-soft-gray/30 rounded-lg cursor-pointer hover:border-gold/30 transition-colors">
                        <input
                          type="radio"
                          name="billing"
                          checked={billingType === "different"}
                          onChange={() => setBillingType("different")}
                          className="accent-gold cursor-pointer"
                        />
                        <span className="text-sm text-charcoal">{tCo("differentBilling")}</span>
                      </label>
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
                      <LockClosedIcon className="w-4 h-4" />
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
              discountCode={discountCode}
              setDiscountCode={setDiscountCode}
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
