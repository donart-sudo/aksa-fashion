"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Input from "@/components/ui/Input";
import EditableSection from "@/components/editor/EditableSection";
import { useCart } from "@/lib/cart";
import { useAuth } from "@/lib/auth";
import { getAddresses, createAddress, type CustomerAddress } from "@/lib/data/supabase-customer";
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
  UserCircleIcon,
} from "@heroicons/react/24/outline";
import { CheckCircleIcon as CheckCircleSolidIcon } from "@heroicons/react/24/solid";

type Step = 1 | 2 | 3;

/* ─── Country configuration ─── */
interface CountryConfig {
  code: string;
  name: string;
  phone: string;
  postalLabel: string;
  postalPlaceholder: string;
  postalPattern?: RegExp;
  hasStates: boolean;
  stateLabel?: string;
  states?: { code: string; name: string }[];
  group: "popular" | "other";
}

const US_STATES = [
  { code: "AL", name: "Alabama" }, { code: "AK", name: "Alaska" }, { code: "AZ", name: "Arizona" },
  { code: "AR", name: "Arkansas" }, { code: "CA", name: "California" }, { code: "CO", name: "Colorado" },
  { code: "CT", name: "Connecticut" }, { code: "DE", name: "Delaware" }, { code: "FL", name: "Florida" },
  { code: "GA", name: "Georgia" }, { code: "HI", name: "Hawaii" }, { code: "ID", name: "Idaho" },
  { code: "IL", name: "Illinois" }, { code: "IN", name: "Indiana" }, { code: "IA", name: "Iowa" },
  { code: "KS", name: "Kansas" }, { code: "KY", name: "Kentucky" }, { code: "LA", name: "Louisiana" },
  { code: "ME", name: "Maine" }, { code: "MD", name: "Maryland" }, { code: "MA", name: "Massachusetts" },
  { code: "MI", name: "Michigan" }, { code: "MN", name: "Minnesota" }, { code: "MS", name: "Mississippi" },
  { code: "MO", name: "Missouri" }, { code: "MT", name: "Montana" }, { code: "NE", name: "Nebraska" },
  { code: "NV", name: "Nevada" }, { code: "NH", name: "New Hampshire" }, { code: "NJ", name: "New Jersey" },
  { code: "NM", name: "New Mexico" }, { code: "NY", name: "New York" }, { code: "NC", name: "North Carolina" },
  { code: "ND", name: "North Dakota" }, { code: "OH", name: "Ohio" }, { code: "OK", name: "Oklahoma" },
  { code: "OR", name: "Oregon" }, { code: "PA", name: "Pennsylvania" }, { code: "RI", name: "Rhode Island" },
  { code: "SC", name: "South Carolina" }, { code: "SD", name: "South Dakota" }, { code: "TN", name: "Tennessee" },
  { code: "TX", name: "Texas" }, { code: "UT", name: "Utah" }, { code: "VT", name: "Vermont" },
  { code: "VA", name: "Virginia" }, { code: "WA", name: "Washington" }, { code: "WV", name: "West Virginia" },
  { code: "WI", name: "Wisconsin" }, { code: "WY", name: "Wyoming" },
];

const CA_PROVINCES = [
  { code: "AB", name: "Alberta" }, { code: "BC", name: "British Columbia" }, { code: "MB", name: "Manitoba" },
  { code: "NB", name: "New Brunswick" }, { code: "NL", name: "Newfoundland and Labrador" },
  { code: "NS", name: "Nova Scotia" }, { code: "NT", name: "Northwest Territories" },
  { code: "NU", name: "Nunavut" }, { code: "ON", name: "Ontario" }, { code: "PE", name: "Prince Edward Island" },
  { code: "QC", name: "Quebec" }, { code: "SK", name: "Saskatchewan" }, { code: "YT", name: "Yukon" },
];

const COUNTRIES: CountryConfig[] = [
  // Popular — Balkan & EU (shown first)
  { code: "xk", name: "Kosovo", phone: "+383", postalLabel: "Postal Code", postalPlaceholder: "10000", hasStates: false, group: "popular" },
  { code: "al", name: "Albania", phone: "+355", postalLabel: "Postal Code", postalPlaceholder: "1001", hasStates: false, group: "popular" },
  { code: "mk", name: "North Macedonia", phone: "+389", postalLabel: "Postal Code", postalPlaceholder: "1000", hasStates: false, group: "popular" },
  { code: "me", name: "Montenegro", phone: "+382", postalLabel: "Postal Code", postalPlaceholder: "81000", hasStates: false, group: "popular" },
  { code: "rs", name: "Serbia", phone: "+381", postalLabel: "Postal Code", postalPlaceholder: "11000", hasStates: false, group: "popular" },
  { code: "de", name: "Germany", phone: "+49", postalLabel: "Postal Code", postalPlaceholder: "10115", hasStates: false, group: "popular" },
  { code: "at", name: "Austria", phone: "+43", postalLabel: "Postal Code", postalPlaceholder: "1010", hasStates: false, group: "popular" },
  { code: "ch", name: "Switzerland", phone: "+41", postalLabel: "Postal Code", postalPlaceholder: "8001", hasStates: false, group: "popular" },
  { code: "fr", name: "France", phone: "+33", postalLabel: "Postal Code", postalPlaceholder: "75001", hasStates: false, group: "popular" },
  { code: "it", name: "Italy", phone: "+39", postalLabel: "Postal Code", postalPlaceholder: "00100", hasStates: false, group: "popular" },
  { code: "nl", name: "Netherlands", phone: "+31", postalLabel: "Postal Code", postalPlaceholder: "1011 AB", hasStates: false, group: "popular" },
  { code: "be", name: "Belgium", phone: "+32", postalLabel: "Postal Code", postalPlaceholder: "1000", hasStates: false, group: "popular" },
  { code: "gb", name: "United Kingdom", phone: "+44", postalLabel: "Postcode", postalPlaceholder: "SW1A 1AA", postalPattern: /^[A-Z]{1,2}\d[A-Z\d]?\s?\d[A-Z]{2}$/i, hasStates: false, group: "popular" },
  // Other — Alphabetical
  { code: "au", name: "Australia", phone: "+61", postalLabel: "Postcode", postalPlaceholder: "2000", hasStates: true, stateLabel: "State", states: [
    { code: "ACT", name: "Australian Capital Territory" }, { code: "NSW", name: "New South Wales" },
    { code: "NT", name: "Northern Territory" }, { code: "QLD", name: "Queensland" },
    { code: "SA", name: "South Australia" }, { code: "TAS", name: "Tasmania" },
    { code: "VIC", name: "Victoria" }, { code: "WA", name: "Western Australia" },
  ], group: "other" },
  { code: "ba", name: "Bosnia and Herzegovina", phone: "+387", postalLabel: "Postal Code", postalPlaceholder: "71000", hasStates: false, group: "other" },
  { code: "br", name: "Brazil", phone: "+55", postalLabel: "Postal Code", postalPlaceholder: "01000-000", hasStates: false, group: "other" },
  { code: "bg", name: "Bulgaria", phone: "+359", postalLabel: "Postal Code", postalPlaceholder: "1000", hasStates: false, group: "other" },
  { code: "ca", name: "Canada", phone: "+1", postalLabel: "Postal Code", postalPlaceholder: "K1A 0B1", postalPattern: /^[A-Z]\d[A-Z]\s?\d[A-Z]\d$/i, hasStates: true, stateLabel: "Province", states: CA_PROVINCES, group: "other" },
  { code: "hr", name: "Croatia", phone: "+385", postalLabel: "Postal Code", postalPlaceholder: "10000", hasStates: false, group: "other" },
  { code: "cz", name: "Czech Republic", phone: "+420", postalLabel: "Postal Code", postalPlaceholder: "110 00", hasStates: false, group: "other" },
  { code: "dk", name: "Denmark", phone: "+45", postalLabel: "Postal Code", postalPlaceholder: "1000", hasStates: false, group: "other" },
  { code: "gr", name: "Greece", phone: "+30", postalLabel: "Postal Code", postalPlaceholder: "10431", hasStates: false, group: "other" },
  { code: "hu", name: "Hungary", phone: "+36", postalLabel: "Postal Code", postalPlaceholder: "1011", hasStates: false, group: "other" },
  { code: "ie", name: "Ireland", phone: "+353", postalLabel: "Eircode", postalPlaceholder: "D02 AF30", hasStates: false, group: "other" },
  { code: "no", name: "Norway", phone: "+47", postalLabel: "Postal Code", postalPlaceholder: "0001", hasStates: false, group: "other" },
  { code: "pl", name: "Poland", phone: "+48", postalLabel: "Postal Code", postalPlaceholder: "00-001", hasStates: false, group: "other" },
  { code: "pt", name: "Portugal", phone: "+351", postalLabel: "Postal Code", postalPlaceholder: "1000-001", hasStates: false, group: "other" },
  { code: "ro", name: "Romania", phone: "+40", postalLabel: "Postal Code", postalPlaceholder: "010011", hasStates: false, group: "other" },
  { code: "es", name: "Spain", phone: "+34", postalLabel: "Postal Code", postalPlaceholder: "28001", hasStates: false, group: "other" },
  { code: "se", name: "Sweden", phone: "+46", postalLabel: "Postal Code", postalPlaceholder: "111 22", hasStates: false, group: "other" },
  { code: "tr", name: "Turkey", phone: "+90", postalLabel: "Postal Code", postalPlaceholder: "34000", hasStates: false, group: "other" },
  { code: "ae", name: "United Arab Emirates", phone: "+971", postalLabel: "Postal Code", postalPlaceholder: "", hasStates: false, group: "other" },
  { code: "us", name: "United States", phone: "+1", postalLabel: "ZIP Code", postalPlaceholder: "10001", postalPattern: /^\d{5}(-\d{4})?$/, hasStates: true, stateLabel: "State", states: US_STATES, group: "other" },
];

const COUNTRY_MAP_BY_CODE = Object.fromEntries(COUNTRIES.map((c) => [c.code, c]));
const DEFAULT_COUNTRY = COUNTRIES[0]; // Kosovo

/* ─── Stripe-style field sanitizers ─── */
// Names/cities: letters (incl. Unicode for Albanian ë, Turkish ç/ş, Arabic), spaces, hyphens, apostrophes, dots
const NAME_CHARS = /[^a-zA-ZÀ-ÖØ-öø-ÿĀ-žÇçŞşĞğÜüÖöIıİ\u0600-\u06FF\s'\-.]/g;
const sanitizeName = (v: string) => v.replace(NAME_CHARS, "").slice(0, 50);
const sanitizeCity = (v: string) => v.replace(NAME_CHARS, "").slice(0, 100);
// Phone: digits, +, spaces, parens, dashes
const sanitizePhone = (v: string) => v.replace(/[^\d+\s()-]/g, "").slice(0, 20);
// Address: letters, digits, common address punctuation
const sanitizeAddress = (v: string) => v.replace(/[^\w\sÀ-ÖØ-öø-ÿĀ-žÇçŞşĞğÜüÖöIıİ\u0600-\u06FF.,#\-'/°()]/g, "").slice(0, 200);
// Postal: country-specific character sets
function sanitizePostal(v: string, country: CountryConfig): string {
  if (country.code === "us") return v.replace(/[^\d-]/g, "").slice(0, 10);
  if (country.code === "gb" || country.code === "ca") return v.replace(/[^a-zA-Z\d\s]/g, "").toUpperCase().slice(0, 8);
  return v.replace(/[^a-zA-Z\d\s-]/g, "").slice(0, 12);
}

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
  currentStep,
  tCo,
  t,
  tCart,
  expanded,
  setExpanded,
}: {
  items: ReturnType<typeof useCart>["items"];
  subtotal: number;
  shippingCost: number;
  currentStep: Step;
  tCo: (key: string) => string;
  t: (key: string) => string;
  tCart: (key: string) => string;
  expanded: boolean;
  setExpanded: (v: boolean) => void;
}) {
  const shippingResolved = currentStep >= 2;
  const total = subtotal + (shippingResolved ? shippingCost : 0);

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
              <span className={!shippingResolved ? "text-charcoal/40 text-xs italic" : ""}>
                {shippingResolved
                  ? shippingCost === 0
                    ? t("free")
                    : formatPrice(shippingCost)
                  : tCo("calculatedAtNextStep")}
              </span>
            </div>
          </div>
          <div className="flex justify-between text-lg font-semibold text-charcoal mt-4 pt-4 border-t border-soft-gray/40">
            <span>{t("total")}</span>
            <span>{shippingResolved ? formatPrice(total) : formatPrice(subtotal)}</span>
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
  const { customer } = useAuth();

  /* Form state */
  const [step, setStep] = useState<Step>(1);
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [address, setAddress] = useState("");
  const [apartment, setApartment] = useState("");
  const [city, setCity] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [countryCode, setCountryCode] = useState(DEFAULT_COUNTRY.code);
  const [stateProvince, setStateProvince] = useState("");
  const [phone, setPhone] = useState("");
  const [emailUpdates, setEmailUpdates] = useState(true);
  const [saveInfo, setSaveInfo] = useState(true);
  const [orderNote, setOrderNote] = useState("");
  const [summaryExpanded, setSummaryExpanded] = useState(false);

  /* Saved addresses state */
  const [savedAddresses, setSavedAddresses] = useState<CustomerAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>("new");
  const [addressesLoaded, setAddressesLoaded] = useState(false);

  /* Validation state — stores error messages (empty string = no error) */
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  /* Checkout flow state */
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");
  const [cartCreating, setCartCreating] = useState(false);

  /* Derived country config */
  const selectedCountry = useMemo(
    () => COUNTRY_MAP_BY_CODE[countryCode] || DEFAULT_COUNTRY,
    [countryCode]
  );

  const popularCountries = useMemo(() => COUNTRIES.filter((c) => c.group === "popular"), []);
  const otherCountries = useMemo(() => COUNTRIES.filter((c) => c.group === "other"), []);

  /* Country change handler */
  const handleCountryChange = useCallback(
    (newCode: string) => {
      const prevCountry = COUNTRY_MAP_BY_CODE[countryCode];
      const newCountry = COUNTRY_MAP_BY_CODE[newCode];
      if (!newCountry) return;

      setCountryCode(newCode);

      // Update phone prefix if empty or still has old prefix
      if (!phone || (prevCountry && phone === prevCountry.phone)) {
        setPhone(newCountry.phone);
      } else if (prevCountry && phone.startsWith(prevCountry.phone)) {
        setPhone(newCountry.phone + phone.slice(prevCountry.phone.length));
      }

      // Clear state if switching to country without states
      if (!newCountry.hasStates) {
        setStateProvince("");
      }

      // Clear field errors for fields that changed
      setFieldErrors((prev) => ({ ...prev, postalCode: "", stateProvince: "" }));
    },
    [countryCode, phone]
  );

  /* Fill form from a saved address */
  const fillFormFromAddress = useCallback((addr: CustomerAddress) => {
    setFirstName(addr.first_name || "");
    setLastName(addr.last_name || "");
    setAddress(addr.address_1 || "");
    setApartment(addr.address_2 || "");
    setCity(addr.city || "");
    setPostalCode(addr.postal_code || "");
    setStateProvince("");
    setFieldErrors({});
    if (addr.country_code && COUNTRY_MAP_BY_CODE[addr.country_code]) {
      setCountryCode(addr.country_code);
    }
    if (addr.phone) {
      setPhone(addr.phone);
    }
  }, []);

  /* Load saved addresses + pre-fill for logged-in customers */
  useEffect(() => {
    if (!customer || addressesLoaded) return;

    // Pre-fill email immediately
    setEmail(customer.email);

    (async () => {
      try {
        const addresses = await getAddresses();
        setSavedAddresses(addresses);
        setAddressesLoaded(true);

        if (addresses.length > 0) {
          // Use default shipping address, or first address
          const defaultAddr = addresses.find((a) => a.is_default_shipping) || addresses[0];
          setSelectedAddressId(defaultAddr.id);
          fillFormFromAddress(defaultAddr);
        }
      } catch {
        setAddressesLoaded(true);
      }
    })();
  }, [customer, addressesLoaded, fillFormFromAddress]);

  /* Handle address selector change */
  const handleAddressSelect = useCallback((addressId: string) => {
    setSelectedAddressId(addressId);
    if (addressId === "new") {
      // Clear form for new address entry
      setFirstName("");
      setLastName("");
      setAddress("");
      setApartment("");
      setCity("");
      setPostalCode("");
      setStateProvince("");
      setPhone("");
      setFieldErrors({});
      setCountryCode(DEFAULT_COUNTRY.code);
    } else {
      const addr = savedAddresses.find((a) => a.id === addressId);
      if (addr) fillFormFromAddress(addr);
    }
  }, [savedAddresses, fillFormFromAddress]);

  /* Shipping state */
  const [shippingOptions, setShippingOptions] = useState<MedusaShippingOption[]>([]);
  const [selectedShippingOption, setSelectedShippingOption] = useState<string | null>(null);
  const [shippingCostValue, setShippingCostValue] = useState<number | null>(null);

  const shippingCost = shippingCostValue ?? (subtotal >= 15000 ? 0 : 1500);

  const goToStep = useCallback((s: Step) => setStep(s), []);

  /* ── Stripe-style per-field validation (returns error message or "") ── */
  const validateField = useCallback((field: string, value: string): string => {
    switch (field) {
      case "email":
        if (!value) return "Enter your email address";
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return "Enter a valid email address";
        return "";
      case "firstName":
        if (!value.trim()) return "Enter your first name";
        if (value.trim().length < 2) return "First name is too short";
        return "";
      case "lastName":
        if (!value.trim()) return "Enter your last name";
        if (value.trim().length < 2) return "Last name is too short";
        return "";
      case "address":
        if (!value.trim()) return "Enter your street address";
        if (value.trim().length < 5) return "Please enter a complete address";
        if (!/[a-zA-ZÀ-ÖØ-öø-ÿ]/.test(value)) return "Enter a valid street address";
        return "";
      case "city":
        if (!value.trim()) return "Enter your city";
        if (value.trim().length < 2) return "City name is too short";
        return "";
      case "phone": {
        const digits = value.replace(/[^\d]/g, "");
        if (!value || digits.length < 7) return "Enter a valid phone number";
        if (digits.length > 15) return "Phone number is too long";
        return "";
      }
      case "postalCode":
        if (!value.trim()) return `Enter your ${selectedCountry.postalLabel.toLowerCase()}`;
        if (selectedCountry.postalPattern && !selectedCountry.postalPattern.test(value.trim()))
          return `Enter a valid ${selectedCountry.postalLabel.toLowerCase()}`;
        return "";
      case "stateProvince":
        if (selectedCountry.hasStates && !value)
          return `Select your ${(selectedCountry.stateLabel || "state").toLowerCase()}`;
        return "";
      default:
        return "";
    }
  }, [selectedCountry]);

  const handleBlur = useCallback((field: string, value: string) => {
    const error = validateField(field, value);
    setFieldErrors((p) => ({ ...p, [field]: error }));
  }, [validateField]);

  /* ── Validate step 1 fields ── */
  const validateStep1 = useCallback((): boolean => {
    const fields: Record<string, string> = { email, firstName, lastName, address, city, phone, postalCode, stateProvince };
    const errors: Record<string, string> = {};
    for (const [field, value] of Object.entries(fields)) {
      const error = validateField(field, value);
      if (error) errors[field] = error;
    }
    setFieldErrors(errors);
    setSubmitted(true);
    return Object.keys(errors).length === 0;
  }, [email, firstName, lastName, address, city, phone, postalCode, stateProvince, validateField]);

  /* ── Step 1 → Step 2: Fetch shipping options ── */
  const handleContinueToShipping = async () => {
    if (!validateStep1()) {
      setError(tCo("fillRequired"));
      return;
    }

    setError("");
    setCartCreating(true);

    try {
      // Save address if logged in, "save info" checked, and using a new address
      if (customer && saveInfo && selectedAddressId === "new") {
        createAddress({
          first_name: firstName,
          last_name: lastName,
          address_1: address,
          address_2: apartment || undefined,
          city,
          postal_code: postalCode,
          country_code: countryCode,
          phone: phone || undefined,
          is_default_shipping: savedAddresses.length === 0,
        }).catch(() => {});
      }

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
      // Still advance — fallback shipping options will show
      setStep(2);
      setShippingOptions([]);
      setSelectedShippingOption("standard");
      setShippingCostValue(subtotal >= 15000 ? 0 : 1500);
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
    // Prevent double-click / double-submit
    if (processing) return;

    setProcessing(true);
    setError("");

    try {
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
          province: stateProvince || undefined,
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
    <EditableSection sectionKey="i18n.checkout" label="Checkout Text">
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
                      {customer && (
                        <div className="flex items-center gap-2 px-3 py-2 bg-gold/5 border border-gold/15 rounded-lg mb-1">
                          <UserCircleIcon className="w-4 h-4 text-gold flex-shrink-0" />
                          <span className="text-xs text-charcoal/70">
                            Logged in as <span className="font-medium text-charcoal">{customer.email}</span>
                          </span>
                        </div>
                      )}
                      <Input
                        id="checkoutEmail"
                        label={tAccount("email")}
                        type="email"
                        inputMode="email"
                        autoComplete="email"
                        value={email}
                        onChange={(e) => { if (!customer) { setEmail(e.target.value); setFieldErrors((p) => ({ ...p, email: "" })); } }}
                        onBlur={() => handleBlur("email", email)}
                        placeholder="your@email.com"
                        error={fieldErrors.email || undefined}
                        required
                        disabled={!!customer}
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
                      {/* Saved address selector (logged-in customers with addresses) */}
                      {customer && savedAddresses.length > 0 && (
                        <div className="w-full">
                          <label htmlFor="savedAddress" className="block text-sm font-medium text-charcoal/70 mb-1.5">
                            {tCo("savedAddresses") || "Saved addresses"}
                          </label>
                          <div className="relative">
                            <select
                              id="savedAddress"
                              value={selectedAddressId}
                              onChange={(e) => handleAddressSelect(e.target.value)}
                              className="w-full px-4 py-3 bg-white border border-soft-gray rounded-none text-sm text-charcoal appearance-none cursor-pointer transition-colors duration-200 focus:outline-none focus:border-gold pr-10"
                            >
                              {savedAddresses.map((addr) => (
                                <option key={addr.id} value={addr.id}>
                                  {addr.first_name} {addr.last_name} — {addr.address_1}, {addr.city}{addr.is_default_shipping ? " (Default)" : ""}
                                </option>
                              ))}
                              <option value="new">{tCo("useNewAddress") || "Use a different address"}</option>
                            </select>
                            <ChevronDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal/40 pointer-events-none" />
                          </div>
                        </div>
                      )}
                      {/* Country dropdown (full width, first) */}
                      <div className="w-full">
                        <label htmlFor="country" className="block text-sm font-medium text-charcoal/70 mb-1.5">
                          {tCo("country")}
                        </label>
                        <div className="relative">
                          <select
                            id="country"
                            value={countryCode}
                            onChange={(e) => handleCountryChange(e.target.value)}
                            autoComplete="country"
                            className="w-full px-4 py-3 bg-white border border-soft-gray rounded-none text-sm text-charcoal appearance-none cursor-pointer transition-colors duration-200 focus:outline-none focus:border-gold pr-10"
                          >
                            <optgroup label="Popular">
                              {popularCountries.map((c) => (
                                <option key={c.code} value={c.code}>{c.name}</option>
                              ))}
                            </optgroup>
                            <optgroup label="───────────">
                              {otherCountries.map((c) => (
                                <option key={c.code} value={c.code}>{c.name}</option>
                              ))}
                            </optgroup>
                          </select>
                          <ChevronDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal/40 pointer-events-none" />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <Input
                          id="firstName"
                          label={tAccount("firstName")}
                          autoComplete="given-name"
                          value={firstName}
                          onChange={(e) => { setFirstName(sanitizeName(e.target.value)); setFieldErrors((p) => ({ ...p, firstName: "" })); }}
                          onBlur={() => handleBlur("firstName", firstName)}
                          placeholder="Elena"
                          error={fieldErrors.firstName || undefined}
                          maxLength={50}
                          required
                        />
                        <Input
                          id="lastName"
                          label={tAccount("lastName")}
                          autoComplete="family-name"
                          value={lastName}
                          onChange={(e) => { setLastName(sanitizeName(e.target.value)); setFieldErrors((p) => ({ ...p, lastName: "" })); }}
                          onBlur={() => handleBlur("lastName", lastName)}
                          placeholder="Krasniqi"
                          error={fieldErrors.lastName || undefined}
                          maxLength={50}
                          required
                        />
                      </div>
                      <Input
                        id="address"
                        label={tCo("address")}
                        autoComplete="address-line1"
                        value={address}
                        onChange={(e) => { setAddress(sanitizeAddress(e.target.value)); setFieldErrors((p) => ({ ...p, address: "" })); }}
                        onBlur={() => handleBlur("address", address)}
                        placeholder="123 Bulevardi Nënë Tereza"
                        error={fieldErrors.address || undefined}
                        maxLength={200}
                        required
                      />
                      <Input
                        id="apartment"
                        label={tCo("apartment")}
                        autoComplete="address-line2"
                        value={apartment}
                        onChange={(e) => setApartment(sanitizeAddress(e.target.value))}
                        placeholder={tCo("apartment")}
                        maxLength={100}
                      />
                      <div className={`grid gap-3 ${selectedCountry.hasStates ? "grid-cols-3" : "grid-cols-2"}`}>
                        <Input
                          id="city"
                          label={tCo("city")}
                          autoComplete="address-level2"
                          value={city}
                          onChange={(e) => { setCity(sanitizeCity(e.target.value)); setFieldErrors((p) => ({ ...p, city: "" })); }}
                          onBlur={() => handleBlur("city", city)}
                          placeholder="Prishtina"
                          error={fieldErrors.city || undefined}
                          maxLength={100}
                          required
                        />
                        {/* State/Province — only visible for countries with states */}
                        {selectedCountry.hasStates && (
                          <div className="w-full">
                            <label htmlFor="stateProvince" className="block text-sm font-medium text-charcoal/70 mb-1.5">
                              {selectedCountry.stateLabel || "State"}
                            </label>
                            <div className="relative">
                              <select
                                id="stateProvince"
                                value={stateProvince}
                                onChange={(e) => { setStateProvince(e.target.value); setFieldErrors((p) => ({ ...p, stateProvince: "" })); }}
                                autoComplete="address-level1"
                                className={`w-full px-4 py-3 bg-white border text-sm text-charcoal appearance-none cursor-pointer transition-colors duration-200 focus:outline-none focus:border-gold pr-10 rounded-none ${
                                  fieldErrors.stateProvince && fieldErrors.stateProvince !== "" ? "border-red-400" : "border-soft-gray"
                                }`}
                              >
                                <option value="">{tCo("selectState")}</option>
                                {(selectedCountry.states || []).map((s) => (
                                  <option key={s.code} value={s.code}>{s.name}</option>
                                ))}
                              </select>
                              <ChevronDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal/40 pointer-events-none" />
                            </div>
                            {fieldErrors.stateProvince && fieldErrors.stateProvince !== "" && (
                              <p className="mt-1 text-xs text-red-500">{fieldErrors.stateProvince}</p>
                            )}
                          </div>
                        )}
                        <Input
                          id="postalCode"
                          label={selectedCountry.postalLabel}
                          autoComplete="postal-code"
                          value={postalCode}
                          onChange={(e) => { setPostalCode(sanitizePostal(e.target.value, selectedCountry)); setFieldErrors((p) => ({ ...p, postalCode: "" })); }}
                          onBlur={() => handleBlur("postalCode", postalCode)}
                          placeholder={selectedCountry.postalPlaceholder}
                          error={fieldErrors.postalCode || undefined}
                          required
                        />
                      </div>
                      <Input
                        id="phone"
                        label={tCo("phone")}
                        type="tel"
                        inputMode="tel"
                        autoComplete="tel"
                        value={phone}
                        onChange={(e) => { setPhone(sanitizePhone(e.target.value)); setFieldErrors((p) => ({ ...p, phone: "" })); }}
                        onBlur={() => handleBlur("phone", phone)}
                        placeholder={`${selectedCountry.phone} 49 123 456`}
                        error={fieldErrors.phone || undefined}
                        required
                      />
                      {(!customer || selectedAddressId === "new") && (
                        <label className="flex items-center gap-2.5 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={saveInfo}
                            onChange={(e) => setSaveInfo(e.target.checked)}
                            className="w-4 h-4 rounded border-soft-gray text-gold focus:ring-gold accent-gold cursor-pointer"
                          />
                          <span className="text-sm text-charcoal/60">
                            {customer ? (tCo("saveAddress") || "Save this address to my account") : tCo("saveInfo")}
                          </span>
                        </label>
                      )}
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
                      {firstName} {lastName}, {address}{apartment ? `, ${apartment}` : ""}, {city}{stateProvince ? ` ${stateProvince}` : ""} {postalCode}, {selectedCountry.name}
                    </p>
                  </div>

                  {/* Shipping methods */}
                  <div className="mb-8">
                    <h2 className="font-serif text-xl text-charcoal mb-4">
                      {tCo("shippingMethod")}
                    </h2>
                    <div className="space-y-3">
                      {shippingOptions.length > 0 ? (
                        // Real shipping options from Supabase
                        shippingOptions.map((option) => {
                          const price = option.calculated_price?.calculated_amount ?? option.amount;
                          return (
                            <ShippingOptionRadio
                              key={option.id}
                              name={option.name}
                              description={option.estimated_days}
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
                      {firstName} {lastName}, {address}, {city}{stateProvince ? ` ${stateProvince}` : ""} {postalCode}, {selectedCountry.name}
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
                      disabled={processing}
                      className={`px-8 py-3.5 text-white text-sm font-medium rounded-lg transition-colors cursor-pointer flex items-center gap-2 shadow-lg shadow-gold/20 ${
                        processing ? "bg-gold/50 cursor-not-allowed" : "bg-gold hover:bg-gold/90"
                      }`}
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
              currentStep={step}
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
    </EditableSection>
  );
}
