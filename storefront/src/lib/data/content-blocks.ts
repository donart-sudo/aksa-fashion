import { createServerSupabaseClient } from "@/lib/supabase-server";
import type { SectionKey, SectionContentMap, ContentBlockRow, TranslationOverrideContent, SiteConstantsContent } from "@/types/content-blocks";
import { SOCIAL_LINKS, CONTACT_INFO, SITE_NAME, SITE_DESCRIPTION, FREE_SHIPPING_THRESHOLD } from "@/lib/constants";
import { fetchStoreSettings } from "@/lib/data/supabase-products";

/**
 * Fetch a content block from Supabase. Returns null if not found or on error.
 * Used in server components / page.tsx files.
 */
export async function getContentBlock<K extends SectionKey>(
  sectionKey: K,
  locale: string
): Promise<SectionContentMap[K] | null> {
  try {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from("content_blocks")
      .select("content")
      .eq("section_key", sectionKey)
      .eq("locale", locale)
      .eq("published", true)
      .single();

    if (error) {
      if (error.message?.includes("schema cache") || error.message?.includes("does not exist")) {
        console.warn(`[content-blocks] Table not found — run: npx tsx scripts/setup-content-blocks.ts (section: ${sectionKey}, locale: ${locale})`);
      }
      return null;
    }
    if (!data) return null;
    return data.content as SectionContentMap[K];
  } catch {
    return null;
  }
}

/**
 * Fetch multiple content blocks in one query. Returns a map of section_key → content.
 */
export async function getContentBlocks(
  sectionKeys: SectionKey[],
  locale: string
): Promise<Partial<Record<SectionKey, unknown>>> {
  try {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from("content_blocks")
      .select("section_key, content")
      .in("section_key", sectionKeys)
      .eq("locale", locale)
      .eq("published", true);

    if (error) {
      if (error.message?.includes("schema cache") || error.message?.includes("does not exist")) {
        console.warn(`[content-blocks] Table not found — run: npx tsx scripts/setup-content-blocks.ts (keys: ${sectionKeys.join(", ")})`);
      }
      return {};
    }
    if (!data) return {};

    const result: Partial<Record<SectionKey, unknown>> = {};
    for (const row of data as Pick<ContentBlockRow, "section_key" | "content">[]) {
      result[row.section_key as SectionKey] = row.content;
    }
    return result;
  } catch {
    return {};
  }
}

/**
 * Fetch all i18n.* overrides for a locale. Returns a nested object
 * matching the shape of the messages JSON, e.g. { topBar: { ann1: "..." }, common: { ... } }.
 * Used in i18n/request.ts to merge overrides on top of static JSON.
 */
export async function getI18nOverrides(
  locale: string
): Promise<Record<string, Record<string, string>>> {
  try {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from("content_blocks")
      .select("section_key, content")
      .like("section_key", "i18n.%")
      .eq("locale", locale)
      .eq("published", true);

    if (error) {
      if (error.message?.includes("schema cache") || error.message?.includes("does not exist")) {
        console.warn(`[content-blocks] Table not found — run: npx tsx scripts/setup-content-blocks.ts (i18n overrides, locale: ${locale})`);
      }
      return {};
    }
    if (!data || data.length === 0) return {};

    const result: Record<string, Record<string, string>> = {};
    for (const row of data as Pick<ContentBlockRow, "section_key" | "content">[]) {
      // section_key is e.g. "i18n.topBar" → namespace is "topBar"
      const namespace = row.section_key.replace("i18n.", "");
      const content = row.content as unknown as TranslationOverrideContent;
      if (content?.overrides && Object.keys(content.overrides).length > 0) {
        result[namespace] = content.overrides;
      }
    }
    return result;
  } catch {
    return {};
  }
}

/** Default site constants built from the hardcoded constants.ts values */
const SITE_DEFAULTS: SiteConstantsContent = {
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

/**
 * Fetch site constants (social links, contact info, store settings) from Supabase.
 * Merges content_blocks overrides + store_settings.metadata from admin dashboard.
 * Falls back to hardcoded constants.ts if not saved or on error.
 */
export async function getSiteConstants(): Promise<SiteConstantsContent> {
  try {
    const [saved, storeSettings] = await Promise.all([
      getContentBlock("site.constants", "en").catch(() => null),
      fetchStoreSettings().catch(() => null),
    ]);

    let result = { ...SITE_DEFAULTS };

    // Merge content_blocks overrides (social links, contact info edited via CMS)
    if (saved) {
      result = { ...result, ...saved };
    }

    // Merge admin dashboard store_settings (these take priority for fields they manage)
    if (storeSettings) {
      result.freeShippingThreshold = storeSettings.freeShippingThreshold;
      result.standardShippingRate = storeSettings.standardRate;
      result.standardShippingDays = storeSettings.standardDays;
      result.expressShippingRate = storeSettings.expressRate;
      result.expressShippingDays = storeSettings.expressDays;
      result.processingTime = storeSettings.processingTime;
      result.taxEnabled = storeSettings.taxEnabled;
      result.taxRate = storeSettings.taxRate;
      result.taxIncludedInPrices = storeSettings.taxIncludedInPrices;
      result.requirePhone = storeSettings.requirePhone;
      result.orderNotes = storeSettings.orderNotes;
      result.logoUrl = storeSettings.logoUrl;
      result.paymentBankTransfer = storeSettings.paymentBankTransfer;
      result.paymentCashPickup = storeSettings.paymentCashPickup;
      result.paymentWesternUnion = storeSettings.paymentWesternUnion;
      result.paymentWhatsapp = storeSettings.paymentWhatsapp;
      // Override contact/social if admin has set them (non-empty)
      if (storeSettings.email) result.email = storeSettings.email;
      if (storeSettings.phone) result.phone = storeSettings.phone;
      if (storeSettings.address) result.address = storeSettings.address;
      if (storeSettings.socialInstagram) result.instagram = storeSettings.socialInstagram;
      if (storeSettings.socialFacebook) result.facebook = storeSettings.socialFacebook;
      if (storeSettings.socialTiktok) result.tiktok = storeSettings.socialTiktok;
      if (storeSettings.socialWhatsapp) result.whatsapp = storeSettings.socialWhatsapp;
    }

    return result;
  } catch {
    return SITE_DEFAULTS;
  }
}
