"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { SiteConstantsContent } from "@/types/content-blocks";
import { SOCIAL_LINKS, CONTACT_INFO, SITE_NAME, SITE_DESCRIPTION } from "@/lib/constants";

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
