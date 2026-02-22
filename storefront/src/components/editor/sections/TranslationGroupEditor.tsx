"use client";

import { useState, useMemo } from "react";
import type { TranslationOverrideContent } from "@/types/content-blocks";

// Static defaults imported at build time
import enMessages from "@/i18n/messages/en.json";

const ALL_NAMESPACES: Record<string, Record<string, string>> = enMessages as Record<
  string,
  Record<string, string>
>;

/**
 * Explicit friendly labels for keys where auto-generated names aren't clear.
 * Format: "namespace.key" → "Friendly Label"
 */
const FRIENDLY_LABELS: Record<string, string> = {
  // Top Bar
  "topBar.ann1": "Banner Text 1",
  "topBar.ann2": "Banner Text 2",
  "topBar.ann3": "Banner Text 3",
  "topBar.ann4": "Banner Text 4",
  // Nav
  "nav.chatWithUs": "WhatsApp Chat Button",
  // Common
  "common.brandName": "Store Name",
  "common.tagline": "Store Tagline",
  "common.addToCart": "Add to Bag Button",
  "common.buyNow": "Buy Now Button",
  "common.continueShopping": "Continue Shopping Link",
  "common.outOfStock": "Out of Stock Label",
  "common.inStock": "In Stock Label",
  "common.free": "Free Shipping Label",
  "common.viewAll": "View All Link",
  "common.sizeGuide": "Size Guide Title",
  "common.sizeGuideSubtitle": "Size Guide Subtitle",
  "common.sizeGuideDescription": "Size Guide Description",
  "common.sizeGuideBust": "Size Chart — Bust",
  "common.sizeGuideWaist": "Size Chart — Waist",
  "common.sizeGuideHips": "Size Chart — Hips",
  "common.sizeGuideLength": "Size Chart — Length",
  "common.sizeGuideNote": "Size Guide Help Note",
  "common.sizeGuideNeedHelp": "Size Guide CTA Title",
  "common.sizeGuideContact": "Size Guide CTA Text",
  "common.wishlistEmpty1": "Empty Wishlist Title",
  "common.wishlistEmpty2": "Empty Wishlist Message",
  "common.wishlistSubtitle": "Wishlist Page Subtitle",
  "common.moveToCart": "Move to Bag Button",
  "common.movedToBag": "Moved to Bag Confirmation",
  "common.exploreCollections": "Explore Collections Button",
  // Nav
  "nav.shop": "Shop Link",
  "nav.collections": "Collections Link",
  "nav.newArrivals": "New Arrivals Link",
  "nav.about": "About Link",
  "nav.contact": "Contact Link",
  // Footer
  "footer.about": "About Section Title",
  "footer.aboutText": "About Description",
  "footer.quickLinks": "Quick Links Title",
  "footer.customerCare": "Customer Care Title",
  "footer.contactUs": "Contact Us Title",
  "footer.copyright": "Copyright Text",
  "footer.madeWithLove": "Made with Love Text",
  // Checkout
  "checkout.contactInfo": "Contact Section Title",
  "checkout.shippingAddress": "Shipping Address Title",
  "checkout.shippingMethod": "Shipping Method Title",
  "checkout.paymentMethod": "Payment Method Title",
  "checkout.placeOrder": "Place Order Button",
  "checkout.continueToShipping": "Continue to Shipping Button",
  "checkout.continueToPayment": "Continue to Payment Button",
  "checkout.returnToCart": "Return to Cart Link",
  "checkout.returnToInformation": "Return to Info Link",
  "checkout.returnToShipping": "Return to Shipping Link",
  "checkout.securePayment": "Secure Payment Badge",
  "checkout.emailUpdates": "Email Updates Checkbox",
  "checkout.saveInfo": "Save Info Checkbox",
  "checkout.orderNote": "Order Note Title",
  "checkout.orderNotePlaceholder": "Order Note Placeholder",
  "checkout.manualPaymentTitle": "Payment Arrangement Title",
  "checkout.manualPaymentDesc": "Payment Arrangement Description",
  "checkout.whatsappPayment": "WhatsApp Payment Button",
  "checkout.whatsappMessage": "WhatsApp Pre-filled Message",
  "checkout.fillRequired": "Validation Error Message",
  "checkout.orderError": "Order Error Message",
  "checkout.processing": "Processing Title",
  "checkout.processingDesc": "Processing Description",
  "checkout.calculatedAtNextStep": "Shipping Calculated Label",
  "checkout.standardShipping": "Standard Shipping Name",
  "checkout.standardDays": "Standard Shipping Time",
  "checkout.expressShipping": "Express Shipping Name",
  "checkout.expressDays": "Express Shipping Time",
  "checkout.bankTransfer": "Bank Transfer Option",
  "checkout.westernUnion": "Western Union Option",
  "checkout.cashOnPickup": "Cash on Pickup Option",
  "checkout.savedAddresses": "Saved Addresses Dropdown",
  "checkout.useNewAddress": "New Address Option",
  "checkout.saveAddress": "Save Address Checkbox",
  // Cart
  "cart.title": "Cart Page Title",
  "cart.empty": "Empty Cart Title",
  "cart.emptySubtext": "Empty Cart Message",
  "cart.orderSummary": "Order Summary Title",
  "cart.remove": "Remove Item Button",
  // Search
  "search.placeholder": "Search Placeholder",
  "search.noResults": "No Results Message",
  "search.results": "Results Count Text",
  "search.recent": "Recent Searches Title",
  "search.trending": "Trending Searches Title",
  // Account
  "account.signIn": "Sign In Button",
  "account.signUp": "Sign Up Button",
  "account.signOut": "Sign Out Button",
  "account.welcomeBack": "Welcome Back Title",
  "account.welcomeSubtitle": "Welcome Subtitle",
  "account.createAccountSubtitle": "Create Account Subtitle",
  "account.forgotPassword": "Forgot Password Link",
  "account.myOrders": "My Orders Link",
  "account.savedAddresses": "Saved Addresses Link",
  "account.editProfile": "Edit Profile Link",
  "account.personalInfo": "Personal Info Title",
  "account.quickLinks": "Quick Links Title",
  "account.needHelp": "Need Help Title",
  "account.contactSupport": "Support Description",
  "account.chatOnWhatsApp": "WhatsApp Button",
  // Product
  "product.addedToBag": "Added to Bag Toast",
  "product.selectSize": "Select Size Prompt",
  "product.whatsappOrder": "WhatsApp Order Button",
  "product.relatedProducts": "Related Products Title",
};

/**
 * Get a human-friendly label for a translation key.
 * Uses explicit map first, then falls back to auto-humanizing camelCase.
 */
function humanize(key: string, namespace: string): string {
  const fullKey = `${namespace}.${key}`;
  if (FRIENDLY_LABELS[fullKey]) return FRIENDLY_LABELS[fullKey];

  // Numbered announcements fallback: ann1 → Banner Text 1
  const annMatch = key.match(/^ann(\d+)$/);
  if (annMatch) return `Banner Text ${annMatch[1]}`;

  // Split camelCase: "chatWithUs" → ["chat", "With", "Us"]
  const words = key
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2")
    .replace(/[_.-]/g, " ")
    .split(/\s+/)
    .filter(Boolean);

  return words
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

interface TranslationGroupEditorProps {
  namespace: string;
  content: TranslationOverrideContent;
  onChange: (content: TranslationOverrideContent) => void;
}

export default function TranslationGroupEditor({
  namespace,
  content,
  onChange,
}: TranslationGroupEditorProps) {
  const [search, setSearch] = useState("");

  const defaults = ALL_NAMESPACES[namespace] || {};
  const keys = useMemo(() => {
    const allKeys = Object.keys(defaults);
    if (!search.trim()) return allKeys;
    const q = search.toLowerCase();
    return allKeys.filter(
      (k) =>
        k.toLowerCase().includes(q) ||
        humanize(k, namespace).toLowerCase().includes(q) ||
        (defaults[k] || "").toLowerCase().includes(q) ||
        (content.overrides[k] || "").toLowerCase().includes(q)
    );
  }, [defaults, search, content.overrides]);

  const overrideCount = Object.keys(content.overrides).filter(
    (k) => content.overrides[k] !== defaults[k]
  ).length;

  const handleChange = (key: string, value: string) => {
    const newOverrides = { ...content.overrides };
    // If the value matches the default, remove the override
    if (value === defaults[key] || value === "") {
      delete newOverrides[key];
    } else {
      newOverrides[key] = value;
    }
    onChange({ overrides: newOverrides });
  };

  const handleReset = (key: string) => {
    const newOverrides = { ...content.overrides };
    delete newOverrides[key];
    onChange({ overrides: newOverrides });
  };

  if (Object.keys(defaults).length === 0) {
    return (
      <p className="text-sm text-charcoal/50 py-4">
        No translation keys found for namespace &quot;{namespace}&quot;.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-charcoal/50">
          {keys.length} {keys.length === 1 ? "field" : "fields"}{overrideCount > 0 && <span className="text-gold font-medium"> &middot; {overrideCount} customized</span>}
        </p>
      </div>

      {/* Search */}
      {Object.keys(defaults).length > 6 && (
        <div className="relative">
          <svg
            className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-charcoal/30"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
            />
          </svg>
          <input
            type="text"
            placeholder="Search fields..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-2 text-sm border border-soft-gray/50 rounded-lg bg-white text-charcoal focus:outline-none focus:border-gold/50 transition-colors placeholder:text-charcoal/30"
          />
        </div>
      )}

      {/* Keys */}
      <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
        {keys.map((key) => {
          const defaultValue = defaults[key] || "";
          const currentValue = content.overrides[key] ?? "";
          const isEdited = currentValue !== "" && currentValue !== defaultValue;
          const friendlyLabel = humanize(key, namespace);

          return (
            <div
              key={key}
              className={`p-3.5 rounded-lg border transition-colors ${
                isEdited
                  ? "border-gold/40 bg-gold/[0.04]"
                  : "border-soft-gray/40 bg-white"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <label className="text-[13px] font-medium text-charcoal">
                  {friendlyLabel}
                </label>
                {isEdited && (
                  <button
                    onClick={() => handleReset(key)}
                    className="text-[10px] text-charcoal/40 hover:text-red-500 font-medium tracking-wide uppercase transition-colors cursor-pointer"
                  >
                    Reset
                  </button>
                )}
              </div>
              {defaultValue.length > 80 ? (
                <textarea
                  value={currentValue || ""}
                  onChange={(e) => handleChange(key, e.target.value)}
                  placeholder={defaultValue}
                  rows={2}
                  className="w-full px-3 py-2 text-sm border border-soft-gray/40 rounded-lg bg-cream/30 text-charcoal focus:outline-none focus:border-gold/50 focus:bg-white transition-colors resize-y placeholder:text-charcoal/30"
                />
              ) : (
                <input
                  type="text"
                  value={currentValue || ""}
                  onChange={(e) => handleChange(key, e.target.value)}
                  placeholder={defaultValue}
                  className="w-full px-3 py-2 text-sm border border-soft-gray/40 rounded-lg bg-cream/30 text-charcoal focus:outline-none focus:border-gold/50 focus:bg-white transition-colors placeholder:text-charcoal/30"
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
