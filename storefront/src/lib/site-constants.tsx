"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { SiteConstantsContent } from "@/types/content-blocks";
import { SOCIAL_LINKS, CONTACT_INFO, SITE_NAME, SITE_DESCRIPTION, FREE_SHIPPING_THRESHOLD } from "@/lib/constants";

const FALLBACK: SiteConstantsContent = {
  siteName: SITE_NAME,
  siteDescription: SITE_DESCRIPTION,
  email: CONTACT_INFO.email,
  phone: CONTACT_INFO.phone,
  address: CONTACT_INFO.address,
  hours: CONTACT_INFO.hours,
  instagram: SOCIAL_LINKS.instagram,
  facebook: SOCIAL_LINKS.facebook,
  tiktok: SOCIAL_LINKS.tiktok,
  whatsapp: SOCIAL_LINKS.whatsapp,
  freeShippingThreshold: FREE_SHIPPING_THRESHOLD,
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

const SiteConstantsContext = createContext<SiteConstantsContent>(FALLBACK);

export function SiteConstantsProvider({
  value,
  children,
}: {
  value: SiteConstantsContent;
  children: ReactNode;
}) {
  return (
    <SiteConstantsContext.Provider value={value}>
      {children}
    </SiteConstantsContext.Provider>
  );
}

/** Read site constants (social links, contact info, etc.) from context */
export function useSiteConstants() {
  return useContext(SiteConstantsContext);
}
