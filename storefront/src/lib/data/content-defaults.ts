/**
 * Default content for all editable sections.
 * These match the current hardcoded values so the site renders identically
 * when no content_blocks rows exist in Supabase.
 */

import {
  HERO_IMAGES,
  EDITORIAL_BAND_IMAGE,
  COLLECTION_COVERS,
  TESTIMONIAL_IMAGES,
  APPOINTMENT_IMAGE,
  NEWSLETTER_IMAGES,
} from "@/lib/cdn-image-urls";
import { SOCIAL_LINKS } from "@/lib/constants";
import type {
  HeroContent,
  TrustBarContent,
  EditorialBandContent,
  FeaturedCollectionsContent,
  AppointmentContent,
  TestimonialsContent,
  AsSeenInContent,
  NewsletterContent,
  FAQContent,
  LegalContent,
  AnnouncementsContent,
  FooterContent,
  SiteConstantsContent,
} from "@/types/content-blocks";

/* ── Homepage ──────────────────────────────────────────────────────────── */

export const DEFAULT_HERO: HeroContent = {
  slides: HERO_IMAGES.map((s) => ({
    image: s.image,
    alt: s.alt,
    ctaLink: s.ctaLink,
    key: s.key,
    subtitle: "",
    title1: "",
    title2: "",
    description: "",
    ctaText: "",
    buttonText: "Shop Collection",
    buttonSecondaryText: "View Bridal",
    buttonSecondaryLink: "collections/bridal",
  })),
};

export const DEFAULT_TRUSTBAR: TrustBarContent = {
  items: [
    { iconKey: "sparkles", textKey: "trustHandcrafted", text: "Handcrafted Quality" },
    { iconKey: "measure", textKey: "trustMeasure", text: "Made to Measure" },
    { iconKey: "globe", textKey: "trustShipping", text: "Worldwide Shipping" },
    { iconKey: "chat", textKey: "trustStyling", text: "Personal Styling" },
  ],
};

export const DEFAULT_EDITORIAL_BAND: EditorialBandContent = {
  image: EDITORIAL_BAND_IMAGE,
  alt: "Aksa Fashion cape and train bridal gown handcrafted in Prishtina atelier",
  topLabel: "",
  heading: "",
  tagline: "",
  buttonText: "",
  buttonLink: "",
};

export const DEFAULT_FEATURED_COLLECTIONS: FeaturedCollectionsContent = {
  heading: "",
  label: "",
  collections: [
    { key: "bridal", title: "Bridal Gowns", image: COLLECTION_COVERS.bridal, href: "/collections/bridal" },
    { key: "evening", title: "Evening Wear", image: COLLECTION_COVERS.evening, href: "/collections/evening-dress" },
    { key: "cape-and-train", title: "Cape & Train", image: COLLECTION_COVERS["cape-and-train"], href: "/collections/cape-and-train-elegance" },
    { key: "ball-gown", title: "Ball Gown", image: COLLECTION_COVERS["ball-gown"], href: "/collections/ball-gown" },
    { key: "silhouette", title: "Silhouette Whisper", image: COLLECTION_COVERS.silhouette, href: "/collections/silhouette-whisper" },
    { key: "ruffled-dream", title: "Ruffled Dream", image: COLLECTION_COVERS["ruffled-dream"], href: "/collections/ruffled-dream" },
  ],
};

export const DEFAULT_APPOINTMENT: AppointmentContent = {
  image: APPOINTMENT_IMAGE,
  location: "Prishtina, Kosovo",
  whatsappUrl: SOCIAL_LINKS.whatsapp,
  heading: "",
  subtitle: "",
  buttonText: "",
};

export const DEFAULT_TESTIMONIALS: TestimonialsContent = {
  heading: "",
  subtitle: "",
  stories: [
    {
      id: "1",
      name: "Elona K.",
      location: "Prishtina, Kosovo",
      text: "It's even more beautiful in person, it's perfect!",
      rating: 5,
      image: TESTIMONIAL_IMAGES[0],
      product: { name: "Crystal Bloom", handle: "crystal-bloom", price: 1250, category: "Bridal" },
    },
    {
      id: "2",
      name: "Arjeta M.",
      location: "Tirana, Albania",
      text: "The whole process was so smooth with you. Fast shipping and amazing quality.",
      rating: 5,
      image: TESTIMONIAL_IMAGES[1],
      product: { name: "Snow", handle: "snow", price: 1470, category: "Bridal" },
    },
    {
      id: "3",
      name: "Dafina S.",
      location: "Zurich, Switzerland",
      text: "From the first message to receiving my dress, everything was handled with such care. The attention to detail is incredible.",
      rating: 5,
      image: TESTIMONIAL_IMAGES[2],
      product: { name: "Verdant Grace", handle: "verdant-grace", price: 980, category: "Cape & Train" },
    },
    {
      id: "4",
      name: "Liridona B.",
      location: "Munich, Germany",
      text: "I couldn't believe how perfectly it fit. The custom measurements made all the difference.",
      rating: 5,
      image: TESTIMONIAL_IMAGES[3],
      product: { name: "Golden Dawn", handle: "golden-dawn", price: 960, category: "Cape & Train" },
    },
    {
      id: "5",
      name: "Fjolla H.",
      location: "London, United Kingdom",
      text: "My wedding dress exceeded every expectation. The craftsmanship is outstanding.",
      rating: 5,
      image: TESTIMONIAL_IMAGES[4],
      product: { name: "Ellea", handle: "ellea", price: 950, category: "Evening" },
    },
  ],
};

export const DEFAULT_AS_SEEN_IN: AsSeenInContent = {
  heading: "",
  names: [
    "Vogue Sposa",
    "Brides Magazine",
    "Kosovo Fashion Week",
    "Elle Bridal",
    "Harper's Bazaar",
  ],
};

export const DEFAULT_NEWSLETTER: NewsletterContent = {
  marqueeImages: NEWSLETTER_IMAGES.map((img) => ({ src: img.src, alt: img.alt })),
  heading: "",
  subtitle: "",
  buttonText: "",
  placeholder: "",
};

/* ── Static pages ──────────────────────────────────────────────────────── */

export const DEFAULT_FAQ: FAQContent = {
  subtitle: "Everything you need to know about shopping with us",
  items: [
    {
      q: "How do I book a fitting appointment?",
      a: "You can book an appointment through our contact page, by calling us, or via WhatsApp. We recommend booking at least one week in advance for weekend appointments.",
    },
    {
      q: "Do you offer custom-made dresses?",
      a: "Yes! We offer bespoke bridal and evening wear services. Our skilled seamstresses can create a custom gown based on your vision, measurements, and preferences.",
    },
    {
      q: "What is your return policy?",
      a: "Due to the custom, made-to-order nature of our gowns, all sales are final. We do not offer refunds or returns. However, we offer exchanges and alterations to ensure your dress is perfect. If you receive a defective item, contact us within 7 days.",
    },
    {
      q: "Do you ship internationally?",
      a: "Yes, we ship throughout Europe and select international destinations. Shipping times and costs vary by location. Free shipping on orders over \u20AC150 within Kosovo.",
    },
    {
      q: "How long does it take to receive my order?",
      a: "Standard orders are processed within 2-3 business days. Delivery takes 3-5 days within Kosovo, 7-14 days for international orders. Custom orders take 4-8 weeks.",
    },
    {
      q: "Do you offer alterations?",
      a: "Yes, we provide professional alteration services for all dresses purchased from Aksa Fashion. Minor alterations are complimentary for bridal gowns.",
    },
  ],
};

/* ── Layout ────────────────────────────────────────────────────────────── */

export const DEFAULT_ANNOUNCEMENTS: AnnouncementsContent = {
  messages: [
    "Free shipping on orders over \u20AC150",
    "New Collection 2025 \u2014 Now Available",
    "Book your bridal appointment today",
    "Made to order \u2014 2\u20135 business days",
  ],
};

export const DEFAULT_FOOTER: FooterContent = {
  aboutText: "Luxury bridal and evening wear, handcrafted in Prishtina.",
  shopLinks: [
    { label: "New Arrivals", href: "/collections" },
    { label: "Bridal", href: "/collections/bridal" },
    { label: "Evening", href: "/collections/evening-dress" },
    { label: "All Collections", href: "/collections" },
  ],
  helpLinks: [
    { label: "FAQ", href: "/faq" },
    { label: "Contact", href: "/contact" },
    { label: "Terms", href: "/terms" },
    { label: "Privacy", href: "/privacy" },
  ],
};

export const DEFAULT_SITE_CONSTANTS: SiteConstantsContent = {
  siteName: "Aksa Fashion",
  siteDescription: "Luxury bridal gowns and evening wear from Prishtina, Kosovo. Handcrafted elegance for your most precious moments.",
  email: "info@aksafashion.com",
  phone: "+383 49 000 000",
  address: "Prishtina, Kosovo",
  hours: "Mon-Sat: 10:00 - 20:00",
  instagram: "https://instagram.com/aksafashion",
  facebook: "https://facebook.com/aksafashion",
  tiktok: "https://tiktok.com/@aksafashion",
  whatsapp: "https://wa.me/38349000000",
  freeShippingThreshold: 15000,
  standardShippingRate: 1500,
  standardShippingDays: "3-5",
  expressShippingRate: 3000,
  expressShippingDays: "1-2",
  processingTime: "2-5 business days",
  taxEnabled: true,
  taxRate: 18,
  taxIncludedInPrices: true,
  requirePhone: true,
  orderNotes: true,
  logoUrl: "",
  paymentBankTransfer: true,
  paymentCashPickup: true,
  paymentWesternUnion: false,
  paymentWhatsapp: true,
};
