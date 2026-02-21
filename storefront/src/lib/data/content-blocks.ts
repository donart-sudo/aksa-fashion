import { createServerSupabaseClient } from "@/lib/supabase-server";
import type { SectionKey, SectionContentMap, ContentBlockRow } from "@/types/content-blocks";

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
