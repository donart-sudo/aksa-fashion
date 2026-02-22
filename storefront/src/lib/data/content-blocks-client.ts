import type { SectionKey, SectionContentMap } from "@/types/content-blocks";

function isTableMissingError(msg: string): boolean {
  return msg.includes("schema cache") || msg.includes("does not exist") || msg.includes("content_blocks");
}

/**
 * Save a content block via the admin DB proxy.
 * Client-safe — uses fetch, no server-only imports.
 */
export async function saveContentBlock<K extends SectionKey>(
  sectionKey: K,
  locale: string,
  content: SectionContentMap[K],
  token: string
): Promise<{ success: boolean; error?: string; tableMissing?: boolean }> {
  try {
    const res = await fetch("/api/admin/db", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        table: "content_blocks",
        operation: "upsert",
        data: {
          section_key: sectionKey,
          locale,
          content,
          published: true,
          updated_at: new Date().toISOString(),
        },
      }),
    });

    const json = await res.json();
    if (!res.ok) {
      const errorMsg = json.error || "Save failed";
      if (isTableMissingError(errorMsg)) {
        return { success: false, error: "The content_blocks table does not exist. Click \"Set Up Now\" to create it.", tableMissing: true };
      }
      return { success: false, error: errorMsg };
    }
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Save failed" };
  }
}
