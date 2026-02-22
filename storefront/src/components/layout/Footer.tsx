"use client";

import { useState } from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { SOCIAL_LINKS, CONTACT_INFO } from "@/lib/constants";
import InlineEditButton from "@/components/editor/InlineEditButton";

/* ── Payment card SVG icons (simplified brand marks) ── */

function VisaIcon() {
  return (
    <svg className="h-6 w-auto" viewBox="0 0 48 32" fill="none">
      <rect width="48" height="32" rx="4" fill="#fff" fillOpacity={0.08} />
      <path d="M19.5 21h-3l1.87-11.5h3L19.5 21zm12.14-11.22c-.6-.23-1.53-.48-2.7-.48-2.97 0-5.07 1.58-5.08 3.83-.02 1.67 1.49 2.6 2.62 3.15 1.17.57 1.56.93 1.56 1.44-.01.78-.94 1.13-1.8 1.13-1.2 0-1.84-.18-2.83-.61l-.39-.18-.42 2.6c.7.32 2 .6 3.35.62 3.16 0 5.21-1.56 5.23-3.96.01-1.32-.79-2.33-2.52-3.16-.95-.54-1.54-.9-1.53-1.44 0-.48.49-1 1.55-1 .89-.01 1.53.19 2.03.4l.24.12.37-2.46zM36.3 9.5h-2.32c-.72 0-1.26.21-1.57.96L28 21h3.16s.52-1.43.63-1.74h3.86c.09.41.37 1.74.37 1.74H39L36.3 9.5zm-3.7 8.27c.25-.67 1.2-3.27 1.2-3.27-.02.03.25-.67.4-1.11l.2 1s.58 2.78.7 3.37h-2.5zM15.6 9.5l-2.95 7.84-.31-1.61c-.55-1.86-2.27-3.88-4.19-4.89l2.69 10.15h3.18L18.8 9.5h-3.2z" fill="#fff" fillOpacity={0.5} />
      <path d="M10.34 9.5H5.53l-.05.27c3.76.96 6.25 3.28 7.28 6.07l-1.05-5.33c-.18-.73-.71-.97-1.37-1z" fill="#fff" fillOpacity={0.35} />
    </svg>
  );
}

function MastercardIcon() {
  return (
    <svg className="h-6 w-auto" viewBox="0 0 48 32" fill="none">
      <rect width="48" height="32" rx="4" fill="#fff" fillOpacity={0.08} />
      <circle cx="19" cy="16" r="8" fill="#fff" fillOpacity={0.25} />
      <circle cx="29" cy="16" r="8" fill="#fff" fillOpacity={0.2} />
      <path d="M24 9.87a7.97 7.97 0 010 12.26 7.97 7.97 0 000-12.26z" fill="#fff" fillOpacity={0.35} />
    </svg>
  );
}

function AmexIcon() {
  return (
    <svg className="h-6 w-auto" viewBox="0 0 48 32" fill="none">
      <rect width="48" height="32" rx="4" fill="#fff" fillOpacity={0.08} />
      <text x="24" y="18.5" textAnchor="middle" fill="white" fillOpacity={0.4} fontSize="8" fontWeight="bold" fontFamily="system-ui">AMEX</text>
    </svg>
  );
}

function PaypalIcon() {
  return (
    <svg className="h-6 w-auto" viewBox="0 0 48 32" fill="none">
      <rect width="48" height="32" rx="4" fill="#fff" fillOpacity={0.08} />
      <path d="M20.1 8h5.4c2.7 0 4.6 1.4 4.3 4.2-.4 3.5-2.7 5.3-5.8 5.3h-1.4c-.4 0-.8.3-.9.8l-.7 4.2c-.1.4-.4.7-.9.7h-2.7c-.3 0-.6-.3-.5-.7L19 8.7c.1-.4.5-.7 1.1-.7z" fill="#fff" fillOpacity={0.35} />
      <path d="M22.2 10.5h3.2c1.7 0 2.8.9 2.6 2.6-.3 2.2-1.7 3.3-3.6 3.3h-1c-.3 0-.5.2-.5.5l-.5 2.6c0 .3-.3.5-.5.5h-1.5c-.2 0-.4-.2-.3-.4l1.6-8.7c0-.3.3-.4.5-.4z" fill="#fff" fillOpacity={0.25} />
    </svg>
  );
}

function ApplePayIcon() {
  return (
    <svg className="h-6 w-auto" viewBox="0 0 48 32" fill="none">
      <rect width="48" height="32" rx="4" fill="#fff" fillOpacity={0.08} />
      <text x="24" y="18.5" textAnchor="middle" fill="white" fillOpacity={0.4} fontSize="7.5" fontWeight="500" fontFamily="system-ui">Pay</text>
      <path d="M16 12.5c.5-.6.8-1.4.7-2.2-.7 0-1.6.5-2.1 1.1-.4.5-.8 1.4-.7 2.2.8.1 1.6-.4 2.1-1.1zm.7.6c-1.2-.1-2.2.7-2.7.7-.5 0-1.4-.6-2.3-.6-1.2 0-2.3.7-2.9 1.8-1.2 2.1-.3 5.3.9 7 .6.9 1.3 1.8 2.2 1.8.9 0 1.2-.6 2.3-.6 1 0 1.3.6 2.3.6.9 0 1.5-.8 2.1-1.7.7-.9.9-1.8.9-1.9-.1 0-1.8-.7-1.8-2.7 0-1.7 1.4-2.5 1.4-2.5-.8-1.1-2-1.2-2.4-1.2z" fill="#fff" fillOpacity={0.4} />
    </svg>
  );
}

function StripeIcon() {
  return (
    <svg className="h-6 w-auto" viewBox="0 0 48 32" fill="none">
      <rect width="48" height="32" rx="4" fill="#fff" fillOpacity={0.08} />
      <path d="M22.5 13.3c0-.7.6-1 1.5-1 1.3 0 3 .4 4.3 1.1V9.6c-1.4-.6-2.9-.8-4.3-.8-3.5 0-5.9 1.8-5.9 4.9 0 4.8 6.5 4 6.5 6.1 0 .8-.7 1.1-1.7 1.1-1.5 0-3.4-.6-4.9-1.4v3.8c1.7.7 3.3 1 4.9 1 3.6 0 6.1-1.8 6.1-4.9 0-5.2-6.5-4.3-6.5-6.1z" fill="#fff" fillOpacity={0.4} />
    </svg>
  );
}

/* ── Accordion section for mobile footer ── */
function FooterAccordion({
  title,
  children,
  isOpen,
  onToggle,
}: {
  title: string;
  children: React.ReactNode;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="lg:contents">
      {/* Mobile: accordion header */}
      <button
        onClick={onToggle}
        className="flex items-center justify-between w-full py-3.5 lg:hidden cursor-pointer"
        aria-expanded={isOpen}
      >
        <h4 className="text-[11px] font-bold tracking-[0.2em] uppercase text-white">
          {title}
        </h4>
        <svg
          className={`w-4 h-4 text-white/30 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
      </button>
      {/* Desktop: static heading */}
      <h4 className="hidden lg:block text-[11px] font-bold tracking-[0.2em] uppercase text-white mb-5">
        {title}
      </h4>
      {/* Content: always visible on desktop, collapsible on mobile */}
      <div
        className={`overflow-hidden transition-all duration-300 lg:!max-h-none lg:!opacity-100 ${
          isOpen ? "max-h-60 opacity-100 pb-2" : "max-h-0 opacity-0"
        }`}
      >
        {children}
      </div>
      {/* Mobile divider */}
      <div className="h-px bg-white/[0.06] lg:hidden" />
    </div>
  );
}

export default function Footer() {
  const t = useTranslations();
  const locale = useLocale();
  const year = new Date().getFullYear();
  const [openSections, setOpenSections] = useState<Set<string>>(new Set());

  const toggleSection = (key: string) => {
    setOpenSections((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  return (
    <footer className="bg-[#1a1a1a] text-white/70 pb-24 md:pb-0">
      {/* Trust bar */}
      <div className="border-b border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-7">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-8">
            {[
              {
                icon: (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
                  </svg>
                ),
                label: t("footer.freeShipping"),
              },
              {
                icon: (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5M9 11.25v1.5M12 9v3.75m3-6v6" />
                  </svg>
                ),
                label: t("footer.madeToOrder"),
              },
              {
                icon: (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                  </svg>
                ),
                label: t("footer.secureCheckout"),
              },
              {
                icon: (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
                  </svg>
                ),
                label: t("footer.handcrafted"),
              },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="text-gold/50">{item.icon}</span>
                <span className="text-[13px] sm:text-[14px] text-white/55 leading-tight">
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <span className="absolute top-4 right-6 z-10">
          <InlineEditButton sectionKey="i18n.footer" label="Footer Text" />
        </span>
        <div className="pt-12 sm:pt-14 lg:pt-16 pb-10 sm:pb-12 grid grid-cols-2 lg:grid-cols-12 gap-x-6 gap-y-10 lg:gap-8">
          {/* Brand column */}
          <div className="col-span-2 lg:col-span-3">
            <div className="mb-4">
              <span className="text-[1.5rem] font-black uppercase tracking-tight text-white leading-none">
                AKSA
              </span>
              <span className="text-[10px] tracking-[0.35em] text-gold uppercase ml-2">
                Fashion
              </span>
            </div>
            <p className="text-[14px] leading-relaxed text-white/50 max-w-xs mb-6">
              {t("footer.aboutDescription")}
            </p>

            {/* Social */}
            <div className="flex items-center gap-2.5">
              {[
                { href: SOCIAL_LINKS.instagram, label: "Instagram", path: "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" },
                { href: SOCIAL_LINKS.facebook, label: "Facebook", path: "M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385h-3.047v-3.47h3.047v-2.642c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953h-1.513c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385c5.737-.9 10.125-5.864 10.125-11.854z" },
                { href: SOCIAL_LINKS.tiktok, label: "TikTok", path: "M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" },
                { href: SOCIAL_LINKS.whatsapp, label: "WhatsApp", path: "M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" },
              ].map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 flex items-center justify-center border border-white/8 hover:border-gold/40 hover:text-gold text-white/40 transition-all duration-300"
                  aria-label={social.label}
                >
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                    <path d={social.path} />
                  </svg>
                </a>
              ))}
            </div>
          </div>

          {/* Shop column */}
          <div className="col-span-2 lg:col-span-2">
            <FooterAccordion
              title={t("common.shop")}
              isOpen={openSections.has("shop")}
              onToggle={() => toggleSection("shop")}
            >
              <ul className="space-y-2.5">
                {[
                  { href: "/collections/new", label: t("nav.newCollection") },
                  { href: "/collections/bridal", label: t("nav.bridalGowns") },
                  { href: "/collections/evening-dress", label: t("nav.eveningWear") },
                  { href: "/collections", label: t("common.collections") },
                  { href: "/collections/sale", label: t("nav.saleItems") },
                ].map((link) => (
                  <li key={link.href}>
                    <Link
                      href={`/${locale}${link.href}`}
                      className="text-[14px] text-white/55 hover:text-gold transition-colors duration-300"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </FooterAccordion>
          </div>

          {/* Help column */}
          <div className="col-span-2 lg:col-span-2">
            <FooterAccordion
              title={t("footer.customerService")}
              isOpen={openSections.has("help")}
              onToggle={() => toggleSection("help")}
            >
              <ul className="space-y-2.5">
                {[
                  { href: "/about", label: t("footer.aboutUs") },
                  { href: "/faq", label: t("common.faq") },
                  { href: "/shipping", label: t("footer.shippingInfo") },
                  { href: "/size-guide", label: t("common.sizeGuide") },
                  { href: "/contact", label: t("common.contact") },
                ].map((link) => (
                  <li key={link.href}>
                    <Link
                      href={`/${locale}${link.href}`}
                      className="text-[14px] text-white/55 hover:text-gold transition-colors duration-300"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </FooterAccordion>
          </div>

          {/* Account column */}
          <div className="col-span-2 lg:col-span-2">
            <FooterAccordion
              title={t("footer.account")}
              isOpen={openSections.has("account")}
              onToggle={() => toggleSection("account")}
            >
              <ul className="space-y-2.5">
                {[
                  { href: "/account", label: t("account.myProfile") },
                  { href: "/account/orders", label: t("account.myOrders") },
                  { href: "/wishlist", label: t("common.wishlist") },
                  { href: "/account/addresses", label: t("account.myAddresses") },
                ].map((link) => (
                  <li key={link.href}>
                    <Link
                      href={`/${locale}${link.href}`}
                      className="text-[14px] text-white/55 hover:text-gold transition-colors duration-300"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </FooterAccordion>
          </div>

          {/* Contact column */}
          <div className="col-span-2 sm:col-span-1 lg:col-span-3">
            <h4 className="text-[11px] font-bold tracking-[0.2em] uppercase text-white mb-5">
              {t("footer.visitAtelier")}
            </h4>
            <ul className="space-y-2.5 text-[14px] text-white/55">
              <li className="flex items-start gap-2.5">
                <svg className="w-4 h-4 text-gold/40 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                </svg>
                <span>{CONTACT_INFO.address}</span>
              </li>
              <li className="flex items-start gap-2.5">
                <svg className="w-4 h-4 text-gold/40 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                </svg>
                <a href={`tel:${CONTACT_INFO.phone.replace(/\s/g, "")}`} className="hover:text-gold transition-colors duration-300">
                  {CONTACT_INFO.phone}
                </a>
              </li>
              <li className="flex items-start gap-2.5">
                <svg className="w-4 h-4 text-gold/40 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                </svg>
                <a href={`mailto:${CONTACT_INFO.email}`} className="hover:text-gold transition-colors duration-300">
                  {CONTACT_INFO.email}
                </a>
              </li>
              <li className="flex items-start gap-2.5">
                <svg className="w-4 h-4 text-gold/40 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{CONTACT_INFO.hours}</span>
              </li>
            </ul>

            <Link
              href={`/${locale}/contact`}
              className="inline-flex items-center gap-2 mt-5 group"
            >
              <span className="text-[11px] tracking-[0.15em] uppercase text-gold/60 group-hover:text-gold transition-colors duration-300 border-b border-gold/25 group-hover:border-gold pb-0.5">
                {t("home.appointmentCta")}
              </span>
              <span className="text-gold/40 group-hover:text-gold group-hover:translate-x-1 transition-all duration-300 text-xs">
                &rarr;
              </span>
            </Link>
          </div>
        </div>

        {/* Divider */}
        <div className="h-[1px] bg-white/[0.06]" />

        {/* Bottom bar */}
        <div className="py-6 flex flex-col gap-5 sm:gap-0 sm:flex-row sm:items-center sm:justify-between">
          {/* Left: copyright + legal */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-5">
            <p className="text-[12px] text-white/35">
              {t("footer.copyright", { year })}
            </p>
            <div className="flex items-center gap-3 text-[12px] text-white/30">
              <Link href={`/${locale}/privacy`} className="hover:text-white/40 transition-colors duration-300">
                {t("footer.privacyPolicy")}
              </Link>
              <span className="text-white/8">|</span>
              <Link href={`/${locale}/terms`} className="hover:text-white/40 transition-colors duration-300">
                {t("footer.termsConditions")}
              </Link>
            </div>
          </div>

          {/* Right: payment icons */}
          <div className="flex items-center gap-2">
            <VisaIcon />
            <MastercardIcon />
            <AmexIcon />
            <PaypalIcon />
            <ApplePayIcon />
            <StripeIcon />
          </div>
        </div>
      </div>
    </footer>
  );
}
