/* ── Content Block Types ─────────────────────────────────────────────────── */

/** Database row shape */
export interface ContentBlockRow {
  id: string;
  section_key: string;
  locale: string;
  content: Record<string, unknown>;
  version: number;
  published: boolean;
  updated_by: string | null;
  updated_at: string;
  created_at: string;
}

/* ── Homepage sections ─────────────────────────────────────────────────── */

export interface HeroSlide {
  image: string;
  alt: string;
  ctaLink: string;
  key: string;
  subtitle?: string;
  title1?: string;
  title2?: string;
  description?: string;
  ctaText?: string;
  buttonText?: string;
  buttonSecondaryText?: string;
  buttonSecondaryLink?: string;
}

export interface HeroContent {
  slides: HeroSlide[];
}

export interface TrustBarItem {
  iconKey: string; // 'sparkles' | 'measure' | 'globe' | 'chat'
  textKey: string; // i18n key for text (fallback)
  text?: string;   // direct display text (preferred)
}

export interface TrustBarContent {
  items: TrustBarItem[];
}

export interface EditorialBandContent {
  image: string;
  alt: string;
  topLabel?: string;
  heading?: string;
  tagline?: string;
  buttonText?: string;
  buttonLink?: string;
}

export interface FeaturedCollectionItem {
  key: string;
  image: string;
  href: string;
  title?: string; // direct display title (preferred over key lookup)
}

export interface FeaturedCollectionsContent {
  collections: FeaturedCollectionItem[];
  heading?: string;
  label?: string;
}

export interface AppointmentContent {
  image: string;
  location: string;
  whatsappUrl: string;
  heading?: string;
  subtitle?: string;
  buttonText?: string;
}

export interface TestimonialStory {
  id: string;
  name: string;
  location: string;
  text: string;
  rating: number;
  image: string;
  product: {
    name: string;
    handle: string;
    price: number;
    category: string;
  };
}

export interface TestimonialsContent {
  stories: TestimonialStory[];
  heading?: string;
  subtitle?: string;
}

export interface AsSeenInContent {
  names: string[];
  heading?: string;
}

export interface NewsletterImage {
  src: string;
  alt: string;
}

export interface NewsletterContent {
  marqueeImages: NewsletterImage[];
  heading?: string;
  subtitle?: string;
  buttonText?: string;
  placeholder?: string;
}

/* ── Static pages ──────────────────────────────────────────────────────── */

export interface FAQItem {
  q: string;
  a: string;
}

export interface FAQContent {
  subtitle: string;
  items: FAQItem[];
}

export interface LegalSection {
  title: string;
  body: string;
}

export interface LegalContent {
  sections: LegalSection[];
}

/* ── Layout ────────────────────────────────────────────────────────────── */

export interface AnnouncementsContent {
  messages: string[];
}

export interface FooterLink {
  label: string;
  href: string;
}

export interface FooterContent {
  aboutText: string;
  shopLinks: FooterLink[];
  helpLinks: FooterLink[];
}

export interface SiteConstantsContent {
  siteName: string;
  siteDescription: string;
  email: string;
  phone: string;
  address: string;
  hours: string;
  instagram: string;
  facebook: string;
  tiktok: string;
  whatsapp: string;
  // Store settings from admin dashboard (shipping, taxes, checkout, etc.)
  freeShippingThreshold: number;
  standardShippingRate: number;
  standardShippingDays: string;
  expressShippingRate: number;
  expressShippingDays: string;
  processingTime: string;
  taxEnabled: boolean;
  taxRate: number;
  taxIncludedInPrices: boolean;
  requirePhone: boolean;
  orderNotes: boolean;
  logoUrl: string;
  paymentBankTransfer: boolean;
  paymentCashPickup: boolean;
  paymentWesternUnion: boolean;
  paymentWhatsapp: boolean;
}

/* ── Translation overrides ─────────────────────────────────────────────── */

/** Flat key→value map for overriding i18n strings */
export interface TranslationOverrideContent {
  overrides: Record<string, string>;
}

/* ── Section key union ─────────────────────────────────────────────────── */

export type SectionKey =
  | "homepage.hero"
  | "homepage.trustbar"
  | "homepage.editorial-band"
  | "homepage.featured-collections"
  | "homepage.appointment"
  | "homepage.testimonials"
  | "homepage.as-seen-in"
  | "homepage.newsletter"
  | "page.faq"
  | "page.terms"
  | "page.privacy"
  | "layout.announcements"
  | "layout.footer"
  | "site.constants"
  | "i18n.topBar"
  | "i18n.common"
  | "i18n.nav"
  | "i18n.home"
  | "i18n.product"
  | "i18n.checkout"
  | "i18n.cart"
  | "i18n.footer"
  | "i18n.search"
  | "i18n.account"
  | "i18n.order"
  | "i18n.orderTracking";

/** Map section keys to their content types */
export interface SectionContentMap {
  "homepage.hero": HeroContent;
  "homepage.trustbar": TrustBarContent;
  "homepage.editorial-band": EditorialBandContent;
  "homepage.featured-collections": FeaturedCollectionsContent;
  "homepage.appointment": AppointmentContent;
  "homepage.testimonials": TestimonialsContent;
  "homepage.as-seen-in": AsSeenInContent;
  "homepage.newsletter": NewsletterContent;
  "page.faq": FAQContent;
  "page.terms": LegalContent;
  "page.privacy": LegalContent;
  "layout.announcements": AnnouncementsContent;
  "layout.footer": FooterContent;
  "site.constants": SiteConstantsContent;
  "i18n.topBar": TranslationOverrideContent;
  "i18n.common": TranslationOverrideContent;
  "i18n.nav": TranslationOverrideContent;
  "i18n.home": TranslationOverrideContent;
  "i18n.product": TranslationOverrideContent;
  "i18n.checkout": TranslationOverrideContent;
  "i18n.cart": TranslationOverrideContent;
  "i18n.footer": TranslationOverrideContent;
  "i18n.search": TranslationOverrideContent;
  "i18n.account": TranslationOverrideContent;
  "i18n.order": TranslationOverrideContent;
  "i18n.orderTracking": TranslationOverrideContent;
}
