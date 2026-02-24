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
  ABOUT_IMAGES,
  cdnUrl,
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
  AboutHeroContent,
  AboutCraftContent,
  AboutCtaContent,
  ContactHeroContent,
  ContactFormContent,
  ContactSidebarContent,
  ContactCtaContent,
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

/* ── About page ───────────────────────────────────────────────────────── */

export const DEFAULT_ABOUT_HERO: AboutHeroContent = {
  heroImage: ABOUT_IMAGES.aboutHero,
  heroAlt: "Aksa Fashion — Elegant bridal gown",
  tagline: "Our Story",
  heading: "Born in Prishtina,",
  headingAccent: "Worn Around the World",
  introParagraph: "Aksa Fashion crafts gowns for women who refuse to blend in — each piece made with intention, artistry, and a deep love for the craft.",
  brandLabel: "The Beginning",
  brandHeading: "Where Tradition Meets",
  brandHeadingAccent: "Haute Couture",
  brandParagraphs: [
    "Founded in the heart of Prishtina, Kosovo, Aksa Fashion was born from a simple belief: every woman deserves to feel extraordinary. What began as a small atelier with a handful of gowns has grown into a destination for brides and fashion-forward women across the Balkans, Europe, and beyond.",
    "Our designs bridge the gap between timeless European elegance and the bold, warm spirit of Kosovar craftsmanship. Each gown is more than fabric and thread — it's a piece of art that carries a story, your story.",
    "We don't follow trends. We create gowns that make you feel something — the moment you see it, you know it's the one.",
  ],
  brandImage: ABOUT_IMAGES.aboutBride,
  brandImageAlt: "Bride in handcrafted gown",
  yearBadge: "2024",
  yearBadgeLabel: "Est. in Prishtina",
  stats: [
    { number: "2,000+", label: "Gowns Crafted" },
    { number: "35+", label: "Countries Shipped" },
    { number: "2024", label: "Founded in Prishtina" },
    { number: "100%", label: "Made to Order" },
  ],
};

export const DEFAULT_ABOUT_CRAFT: AboutCraftContent = {
  craftLabel: "The Craft",
  craftHeading: "Every Detail,",
  craftHeadingAccent: "By Hand",
  craftDescription: "A gown is not sewn — it is composed. Four stages, one promise: perfection.",
  craftSteps: [
    { num: "01", title: "Select", desc: "European silks, satins & laces — chosen for drape and light" },
    { num: "02", title: "Measure", desc: "Cut from your exact body measurements — no standard sizes" },
    { num: "03", title: "Stitch", desc: "40+ hours of handwork — beading, embroidery, appliqué" },
    { num: "04", title: "Perfect", desc: "Final pressing, inspection & packaging — ready to wear" },
  ],
  valuesLabel: "What We Stand For",
  valuesHeading: "The Aksa Difference",
  values: [
    { number: "01", title: "Handcrafted with Intention", description: "Every stitch, every bead, every fold is placed by hand in our Prishtina atelier. We don't mass-produce — we create.", iconKey: "sparkles" },
    { number: "02", title: "Made to Your Measure", description: "No two women are the same, and neither are our gowns. Every dress is built from your exact measurements for a flawless fit.", iconKey: "person" },
    { number: "03", title: "European Fabrics", description: "We source only the finest silks, satins, tulles, and laces from trusted European mills — materials that drape, shimmer, and last.", iconKey: "heart" },
    { number: "04", title: "Personal Styling", description: "From first WhatsApp message to final fitting, our stylists guide you through every detail. This is your dress, your way.", iconKey: "chat" },
  ],
};

export const DEFAULT_ABOUT_CTA: AboutCtaContent = {
  atelierLabel: "The Atelier",
  atelierHeading: "Where Every Gown",
  atelierHeadingAccent: "Comes to Life",
  atelierParagraphs: [
    "Our Prishtina atelier is where fabric meets imagination. It's a space of quiet focus — where our seamstresses bring decades of expertise to every garment, and where you're invited to see your dress take shape.",
    "Book a private appointment to visit, try on samples, and work with our team to design something truly yours.",
  ],
  atelierImage: cdnUrl("allure-women-w550-01.jpg"),
  atelierImageAlt: "Inside our Prishtina atelier — Maison gown",
  promiseLabel: "Our Promise",
  promiseHeading: "You Deserve to Feel",
  promiseHeadingAccent: "Extraordinary",
  promiseParagraph: "Whether it's your wedding day, a gala, or a moment you want to remember forever — we're here to make sure you feel like the most beautiful woman in the room.",
  ctaPrimaryText: "Explore Collections",
  ctaPrimaryLink: "/collections",
  ctaSecondaryText: "Book Appointment",
  ctaSecondaryLink: "",
};

/* ── Contact page ─────────────────────────────────────────────────────── */

export const DEFAULT_CONTACT_HERO: ContactHeroContent = {
  heroImage: cdnUrl("abella-e552-browne-01.jpg"),
  heroAlt: "Aksa Fashion — Contact us",
  tagline: "Get in Touch",
  heading: "Let's Create Something",
  headingAccent: "Beautiful Together",
  introParagraph: "Whether you have a vision or need guidance, our team is here to help you find the perfect gown.",
};

export const DEFAULT_CONTACT_FORM: ContactFormContent = {
  formLabel: "Send a Message",
  formHeading: "Tell Us About Your",
  formHeadingAccent: "Vision",
  formSubtitle: "Share your ideas and we'll get back to you within 24 hours with a personalized response.",
  inquiryTypes: [
    "Bridal Consultation",
    "Evening Wear Inquiry",
    "Custom Design",
    "Order Status",
    "Collaboration",
    "Other",
  ],
  submitButtonText: "Send Message",
  successHeading: "Message Sent",
  successMessage: "Thank you! We'll be in touch within 24 hours.",
};

export const DEFAULT_CONTACT_SIDEBAR: ContactSidebarContent = {
  atelierLabel: "The Atelier",
  atelierHeading: "Visit Us in",
  atelierHeadingAccent: "Prishtina",
  closedDayText: "Sunday: Closed",
  appointmentLine1: "Private fittings available by appointment.",
  appointmentLine2: "Walk-ins welcome during business hours.",
  followUsLabel: "Follow Us",
  brandQuote: "The dress should wear the occasion, and you should wear the dress.",
};

export const DEFAULT_CONTACT_CTA: ContactCtaContent = {
  whatsappBadge: "Preferred by 90% of our clients",
  whatsappHeading: "Prefer WhatsApp?",
  whatsappHeadingAccent: "So do we.",
  whatsappDescription: "Most of our brides start their journey with a simple WhatsApp message. Share your inspiration photos, get instant advice, and book your fitting — all from your phone.",
  whatsappButtonText: "Start a Chat",
  exploreLabel: "While You're Here",
  exploreHeading: "Explore Our",
  exploreHeadingAccent: "Collections",
  exploreDescription: "Browse our latest gowns for inspiration before your consultation.",
  explorePrimaryText: "View Collections",
  explorePrimaryLink: "/collections",
  exploreSecondaryText: "Our Story",
  exploreSecondaryLink: "/about",
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
