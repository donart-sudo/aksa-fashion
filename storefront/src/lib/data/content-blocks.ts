import { createServerSupabaseClient } from "@/lib/supabase-server";
import type { SectionKey, SectionContentMap, ContentBlockRow, TranslationOverrideContent, SiteConstantsContent } from "@/types/content-blocks";
import { SOCIAL_LINKS, CONTACT_INFO, SITE_NAME, SITE_DESCRIPTION } from "@/lib/constants";

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

    if (error || !data) return null;
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

    if (error || !data) return {};

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

    if (error || !data || data.length === 0) return {};

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
};

/**
 * Fetch site constants (social links, contact info) from Supabase.
 * Falls back to hardcoded constants.ts if not saved or on error.
 * Locale-independent — always fetches "en" row.
 */
export async function getSiteConstants(): Promise<SiteConstantsContent> {
  try {
    const saved = await getContentBlock("site.constants", "en");
    if (!saved) return SITE_DEFAULTS;
    return { ...SITE_DEFAULTS, ...saved };
  } catch {
    return SITE_DEFAULTS;
  }
}
