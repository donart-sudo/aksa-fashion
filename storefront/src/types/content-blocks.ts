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
}

export interface HeroContent {
  slides: HeroSlide[];
}

export interface TrustBarItem {
  iconKey: string; // 'sparkles' | 'measure' | 'globe' | 'chat'
  textKey: string; // i18n key for text
}

export interface TrustBarContent {
  items: TrustBarItem[];
}

export interface EditorialBandContent {
  image: string;
  alt: string;
}

export interface FeaturedCollectionItem {
  key: string;
  image: string;
  href: string;
}

export interface FeaturedCollectionsContent {
  collections: FeaturedCollectionItem[];
}

export interface AppointmentContent {
  image: string;
  location: string;
  whatsappUrl: string;
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
}

export interface AsSeenInContent {
  names: string[];
}

export interface NewsletterImage {
  src: string;
  alt: string;
}

export interface NewsletterContent {
  marqueeImages: NewsletterImage[];
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
  | "site.constants";

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
}
